"""
GhostGuard AI - OCR Extraction Service
Native PDF parsing via pypdf and Optical Character Recognition via Tesseract 5.3 & Pillow.
"""

import os
import io
import time
import shutil
import logging
from typing import List, Dict, Any, Tuple, Optional
from PIL import Image, ImageOps, ImageFilter
import pytesseract
from pypdf import PdfReader
from backend.core.config import settings

logger = logging.getLogger("ghostguard.ocr")

class OCRError(Exception):
    pass

class TesseractUnavailableError(OCRError):
    pass

class OCRService:
    @classmethod
    def check_tesseract_availability(cls) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Verifies if the Tesseract binary is installed and executable.
        Preserves environment-variable configuration (TESSERACT_CMD) and Linux compatibility,
        while also discovering standard Windows installation paths.
        Returns (is_available, version_str, binary_path)
        """
        candidate_paths: List[str] = []
        if settings.TESSERACT_CMD:
            candidate_paths.append(settings.TESSERACT_CMD)
        candidate_paths.append("tesseract")

        if os.name == "nt":
            candidate_paths.extend([
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
                os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
            ])
        else:
            candidate_paths.extend([
                "/usr/bin/tesseract",
                "/usr/local/bin/tesseract",
                "/opt/homebrew/bin/tesseract",
            ])

        for candidate in candidate_paths:
            if not candidate:
                continue
            resolved = shutil.which(candidate)
            if not resolved and os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                resolved = candidate

            if resolved:
                pytesseract.pytesseract.tesseract_cmd = resolved
                try:
                    version = pytesseract.get_tesseract_version()
                    return True, str(version), resolved
                except Exception as e:
                    logger.warning(f"Tesseract candidate at '{resolved}' failed execution: {e}")
                    continue

        return False, None, None

    @classmethod
    def preprocess_image(cls, img: Image.Image) -> Image.Image:
        """
        Applies grayscale conversion, contrast auto-balancing, and sharpening.
        """
        try:
            # Convert to Grayscale
            gray = ImageOps.grayscale(img)
            # Auto-contrast to enhance text edges
            balanced = ImageOps.autocontrast(gray, cutoff=2)
            # Mild unsharp mask for clearer character contours
            sharpened = balanced.filter(ImageFilter.UnsharpMask(radius=1.5, percent=150, threshold=3))
            return sharpened
        except Exception as e:
            logger.warning(f"Preprocessing fallback to raw image: {e}")
            return img

    @classmethod
    def extract_image_text_and_confidence(cls, img: Image.Image, language: str = "eng") -> Tuple[str, float]:
        """
        Runs Tesseract on an image and calculates average word-level confidence.
        """
        is_avail, ver, path = cls.check_tesseract_availability()
        if not is_avail:
            raise TesseractUnavailableError(
                "Tesseract OCR is not installed or configured on the host. "
                "Install via 'sudo apt-get install tesseract-ocr' (Linux) or set TESSERACT_CMD in environment."
            )

        processed = cls.preprocess_image(img)
        
        # 1. Full text extraction
        text = pytesseract.image_to_string(processed, lang=language).strip()
        
        # 2. Confidence metrics extraction via image_to_data
        confidence = 0.0
        try:
            data = pytesseract.image_to_data(processed, lang=language, output_type=pytesseract.Output.DICT)
            confs = [float(c) for c in data.get("conf", []) if str(c).replace("-1", "").strip()]
            if confs:
                confidence = sum(confs) / len(confs)
        except Exception:
            confidence = 85.0 if text else 0.0

        return text, confidence

    @classmethod
    def process_document(cls, file_bytes: bytes, mime_type: str, language: str = "eng") -> Dict[str, Any]:
        """
        Main extraction orchestrator:
        - Detects text-based vs scanned PDF pages
        - Runs OCR on images
        - Records page count, confidence, warnings, and extraction method
        """
        start_time = time.time()
        pages_result: List[Dict[str, Any]] = []
        overall_text_parts: List[str] = []
        confidences: List[float] = []
        warnings: List[str] = []
        extraction_method = "UNKNOWN"

        if mime_type == "application/pdf":
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                num_pages = len(reader.pages)
                if num_pages == 0:
                    raise OCRError("PDF contains zero pages.")

                if num_pages > settings.MAX_PAGE_COUNT:
                    warnings.append(f"Document truncated to first {settings.MAX_PAGE_COUNT} of {num_pages} pages.")
                    pages_to_process = reader.pages[:settings.MAX_PAGE_COUNT]
                else:
                    pages_to_process = reader.pages

                has_native = False
                has_scanned = False

                for page_num, page in enumerate(pages_to_process, start=1):
                    page_text = page.extract_text() or ""
                    clean_text = page_text.strip()

                    if len(clean_text) >= 10:
                        # Page has embedded digital text
                        has_native = True
                        pages_result.append({
                            "page_number": page_num,
                            "extracted_text": clean_text,
                            "ocr_confidence": 100.0,
                            "extraction_method": "NATIVE_PDF",
                            "warnings": None
                        })
                        overall_text_parts.append(clean_text)
                        confidences.append(100.0)
                    else:
                        # Page is scanned or empty; attempt OCR on embedded images
                        has_scanned = True
                        scanned_page_text = ""
                        scanned_conf = 0.0
                        img_count = len(page.images)

                        if img_count > 0:
                            page_img_texts = []
                            for img_file in page.images:
                                try:
                                    img = Image.open(io.BytesIO(img_file.data))
                                    t, c = cls.extract_image_text_and_confidence(img, language=language)
                                    if t:
                                        page_img_texts.append(t)
                                        confidences.append(c)
                                except Exception as img_err:
                                    warnings.append(f"Page {page_num} image OCR warning: {img_err}")

                            scanned_page_text = "\n".join(page_img_texts).strip()
                            scanned_conf = sum(confidences[-img_count:]) / max(1, img_count) if confidences else 0.0

                        if not scanned_page_text:
                            warnings.append(f"Page {page_num} contained no extractable text or embedded images.")

                        pages_result.append({
                            "page_number": page_num,
                            "extracted_text": scanned_page_text,
                            "ocr_confidence": round(scanned_conf, 2),
                            "extraction_method": "TESSERACT_OCR" if scanned_page_text else "EMPTY_PAGE",
                            "warnings": f"Scanned page ({img_count} images)" if img_count else "Empty text layer"
                        })
                        if scanned_page_text:
                            overall_text_parts.append(scanned_page_text)

                if has_native and has_scanned:
                    extraction_method = "HYBRID (Native + OCR)"
                elif has_native:
                    extraction_method = "NATIVE_PDF"
                elif has_scanned:
                    extraction_method = "TESSERACT_OCR"
                else:
                    extraction_method = "EMPTY_DOCUMENT"

            except Exception as e:
                logger.error(f"Failed to parse PDF document: {e}")
                raise OCRError(f"Corrupted or invalid PDF document: {str(e)}")

        else:
            # Standalone image (PNG, JPG, TIFF)
            try:
                img = Image.open(io.BytesIO(file_bytes))
                text, conf = cls.extract_image_text_and_confidence(img, language=language)
                overall_text_parts.append(text)
                confidences.append(conf)
                extraction_method = "TESSERACT_OCR"

                pages_result.append({
                    "page_number": 1,
                    "extracted_text": text,
                    "ocr_confidence": round(conf, 2),
                    "extraction_method": "TESSERACT_OCR",
                    "warnings": None if text else "Image contained no recognizable text"
                })
            except TesseractUnavailableError:
                raise
            except Exception as e:
                logger.error(f"Failed to process image with OCR: {e}")
                raise OCRError(f"Failed to process image: {str(e)}")

        full_extracted_text = "\n\n".join(overall_text_parts).strip()
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.0
        elapsed_sec = round(time.time() - start_time, 2)

        return {
            "extracted_text": full_extracted_text,
            "page_count": len(pages_result),
            "pages": pages_result,
            "average_confidence": avg_confidence,
            "extraction_method": extraction_method,
            "duration_seconds": elapsed_sec,
            "warnings": warnings
        }
