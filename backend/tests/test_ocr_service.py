"""
GhostGuard AI - OCR Service & File Validation Tests
Tests native PDF extraction, Tesseract image OCR, file validation, and error edge cases.
"""

import io
import pytest
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfWriter
from backend.services.file_validation_service import FileValidationService, FileValidationError
from backend.services.ocr_service import OCRService, OCRError, TesseractUnavailableError

def create_test_image(text: str = "CASE-402 CONFIRMED") -> bytes:
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw simple clean text
    draw.text((10, 35), text, fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def create_text_pdf(text: str = "CASE-319 DELETION NOTICE CONFIRMED PURGED") -> bytes:
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, text)
    c.save()
    return buf.getvalue()

def create_test_jpg(text: str = "CASE-402 PURGE NOTICE") -> bytes:
    img = Image.new("RGB", (500, 150), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((30, 50), text, fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def create_scanned_pdf(text: str = "CASE-402 SCANNED DOC") -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader
    img = Image.new("RGB", (400, 120), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 40), text, fill=(0, 0, 0))
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawImage(ImageReader(img), 50, 650, 400, 120)
    c.save()
    return buf.getvalue()

def test_file_validation_empty_file():
    with pytest.raises(FileValidationError, match="0 bytes"):
        FileValidationService.validate_file("empty.pdf", b"")

def test_file_validation_oversized_file():
    # 26 MB of zeroes
    huge_bytes = b"%PDF-" + b"0" * (26 * 1024 * 1024)
    with pytest.raises(FileValidationError, match="exceeds maximum limit"):
        FileValidationService.validate_file("huge.pdf", huge_bytes)

def test_file_validation_unsupported_extension():
    with pytest.raises(FileValidationError, match="Unsupported file extension"):
        FileValidationService.validate_file("malicious.exe", b"%PDF-fake")

def test_file_validation_magic_bytes_mismatch():
    with pytest.raises(FileValidationError, match="File signature mismatch"):
        FileValidationService.validate_file("fake.png", b"NOT_A_PNG_HEADER")

def test_file_validation_valid_image():
    png_bytes = create_test_image("TEST EVIDENCE")
    name, ext, mime = FileValidationService.validate_file("test_evidence.png", png_bytes)
    assert ext == ".png"
    assert mime == "image/png"
    assert name == "test_evidence.png"

def test_file_validation_path_traversal_sanitization():
    png_bytes = create_test_image("TEST")
    name, ext, mime = FileValidationService.validate_file("../../../etc/passwd.png", png_bytes)
    assert "/" not in name
    assert ".." not in name
    assert name.endswith(".png")

def test_ocr_service_image_extraction_live():
    """
    Executes live image OCR when the external Tesseract binary is available on the host.
    If Tesseract is not installed, gracefully skips and explains the missing external binary.
    If Tesseract IS installed, any extraction failure will trigger a genuine test failure.
    """
    is_avail, version, path = OCRService.check_tesseract_availability()
    if not is_avail:
        pytest.skip(
            "External Tesseract OCR binary is not installed on this host environment. "
            "Skipping live image OCR test to distinguish external dependency from code defect."
        )

    png_bytes = create_test_image("CASE-402")
    res = OCRService.process_document(png_bytes, mime_type="image/png")
    assert res["page_count"] == 1
    assert res["extraction_method"] == "TESSERACT_OCR"
    assert "case-402" in res["extracted_text"].lower().replace(" ", "")
    assert res["average_confidence"] > 0.0

def test_ocr_service_image_extraction_missing_dependency_error(monkeypatch):
    """
    Verifies that when the external Tesseract binary is absent, OCRService
    specifically raises TesseractUnavailableError rather than an unexpected unhandled exception.
    """
    monkeypatch.setattr(OCRService, "check_tesseract_availability", classmethod(lambda cls: (False, None, None)))
    png_bytes = create_test_image("CASE-402")
    with pytest.raises(TesseractUnavailableError, match="Tesseract OCR is not installed"):
        OCRService.process_document(png_bytes, mime_type="image/png")

def test_ocr_service_image_extraction_pipeline_mocked(monkeypatch):
    """
    Validates image preprocessing, confidence parsing, and response assembly
    when Tesseract produces text output, verifying the OCR pipeline implementation.
    """
    import pytesseract
    monkeypatch.setattr(OCRService, "check_tesseract_availability", classmethod(lambda cls: (True, "5.3.0", "/bin/tesseract")))
    monkeypatch.setattr(pytesseract, "image_to_string", lambda img, lang="eng": "CASE-402 CONFIRMED PURGED")
    monkeypatch.setattr(pytesseract, "image_to_data", lambda img, lang="eng", output_type=None: {"conf": ["95", "92", "88"]})

    png_bytes = create_test_image("CASE-402")
    res = OCRService.process_document(png_bytes, mime_type="image/png")
    assert res["page_count"] == 1
    assert res["extraction_method"] == "TESSERACT_OCR"
    assert "CASE-402" in res["extracted_text"]
    assert res["average_confidence"] == pytest.approx(91.67, abs=0.1)

def test_ocr_service_corrupted_image_handling():
    """
    Verifies that a genuinely corrupted image payload raises OCRError (genuine implementation failure).
    """
    corrupted_image = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRcorrupted_garbage_bytes_here"
    with pytest.raises(OCRError, match="Failed to process image"):
        OCRService.process_document(corrupted_image, mime_type="image/png")

def test_ocr_service_native_pdf_extraction():
    pdf_bytes = create_text_pdf("CASE-319 AUDIT NOTICE")
    res = OCRService.process_document(pdf_bytes, mime_type="application/pdf")
    assert res["page_count"] >= 1
    assert res["extraction_method"] == "NATIVE_PDF"
    assert "CASE-319" in res["extracted_text"]
    assert res["average_confidence"] == 100.0

def test_ocr_service_corrupted_pdf_handling():
    corrupted = b"%PDF-1.4 completely corrupted garbage header trailing"
    with pytest.raises(OCRError, match="Corrupted or invalid PDF"):
        OCRService.process_document(corrupted, mime_type="application/pdf")

def test_ocr_service_jpg_image_extraction_live():
    """
    Tests live OCR on a real readable JPG image.
    """
    is_avail, _, _ = OCRService.check_tesseract_availability()
    if not is_avail:
        pytest.skip("Tesseract OCR not installed on host.")

    jpg_bytes = create_test_jpg("CASE-402 PURGE EVIDENCE")
    res = OCRService.process_document(jpg_bytes, mime_type="image/jpeg")
    assert res["page_count"] == 1
    assert res["extraction_method"] == "TESSERACT_OCR"
    assert "case" in res["extracted_text"].lower()

def test_ocr_service_scanned_pdf_extraction():
    """
    Tests OCR extraction on a scanned PDF containing an embedded image with no native text layer.
    """
    is_avail, _, _ = OCRService.check_tesseract_availability()
    if not is_avail:
        pytest.skip("Tesseract OCR not installed on host.")

    pdf_bytes = create_scanned_pdf("CASE-402 SCANNED KYC")
    res = OCRService.process_document(pdf_bytes, mime_type="application/pdf")
    assert res["page_count"] >= 1
    assert res["extraction_method"] in ["TESSERACT_OCR", "HYBRID (Native + OCR)"]
    assert "case" in res["extracted_text"].lower()
