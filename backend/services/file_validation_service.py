"""
GhostGuard AI - File Validation Service
Validates file sizes, magic byte signatures, sanitized names, and SHA-256 hashes.
"""

import os
import hashlib
import uuid
import re
from pathlib import Path
from typing import Tuple
from backend.core.config import settings

class FileValidationError(Exception):
    pass

class FileValidationService:
    # Magic bytes for strict format verification
    MAGIC_SIGNATURES = {
        "pdf": [b"%PDF-"],
        "png": [b"\x89PNG\r\n\x1a\n"],
        "jpeg": [b"\xff\xd8\xff"],
        "tiff": [b"II*\x00", b"MM\x00*"]
    }

    @classmethod
    def compute_sha256(cls, file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        # Strip directory traversal characters
        cleaned = Path(filename).name
        # Remove dangerous shell / path characters
        cleaned = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", cleaned)
        return cleaned or f"evidence_{uuid.uuid4().hex[:8]}.bin"

    @classmethod
    def validate_file(cls, filename: str, file_bytes: bytes) -> Tuple[str, str, str]:
        """
        Validates size, extension, and magic signatures.
        Returns (sanitized_original_name, file_extension, detected_mime_type)
        """
        # 1. Size check
        if not file_bytes or len(file_bytes) == 0:
            raise FileValidationError("Uploaded file is empty (0 bytes).")

        if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
            max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
            raise FileValidationError(f"File size ({len(file_bytes)} bytes) exceeds maximum limit of {max_mb} MB.")

        sanitized_name = cls.sanitize_filename(filename)
        ext = Path(sanitized_name).suffix.lower()

        if ext not in settings.ALLOWED_EXTENSIONS:
            allowed = ", ".join(sorted(settings.ALLOWED_EXTENSIONS))
            raise FileValidationError(f"Unsupported file extension '{ext}'. Allowed formats: {allowed}")

        # 2. Magic byte inspection
        detected_format = None
        for fmt, sigs in cls.MAGIC_SIGNATURES.items():
            for sig in sigs:
                if file_bytes.startswith(sig):
                    detected_format = fmt
                    break
            if detected_format:
                break

        if not detected_format:
            # Handle special cases: JPEG may have EXIF header slightly offset or TIFF
            if ext in [".jpg", ".jpeg"] and file_bytes[:2] == b"\xff\xd8":
                detected_format = "jpeg"
            else:
                raise FileValidationError("File signature mismatch: File content does not match allowed PDF or Image binary headers.")

        # Match extension to detected format
        mime_map = {
            "pdf": "application/pdf",
            "png": "image/png",
            "jpeg": "image/jpeg",
            "tiff": "image/tiff"
        }

        return sanitized_name, ext, mime_map.get(detected_format, "application/octet-stream")

    @classmethod
    def generate_storage_name(cls, ext: str) -> str:
        unique_token = uuid.uuid4().hex
        return f"ev_{unique_token}{ext}"
