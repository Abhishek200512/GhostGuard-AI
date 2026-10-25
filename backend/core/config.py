"""
GhostGuard AI - Core Configuration & Settings
"""

import os
from pathlib import Path

class Settings:
    PROJECT_NAME: str = "GhostGuard AI - OCR Evidence Intelligence"
    VERSION: str = "2.8.1-ocr"
    API_PREFIX: str = "/api"
    
    # Base directory
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    # Storage settings
    STORAGE_DIR: Path = BASE_DIR / "storage" / "evidence"
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_MB", "25")) * 1024 * 1024  # 25 MB default
    MAX_PAGE_COUNT: int = int(os.getenv("MAX_PAGE_COUNT", "50"))
    PROCESSING_TIMEOUT_SECONDS: int = int(os.getenv("PROCESSING_TIMEOUT_SECONDS", "60"))
    
    # Allowed MIME types and extensions
    ALLOWED_EXTENSIONS: set = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif"}
    ALLOWED_MIME_TYPES: set = {
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/tiff"
    }
    
    # Server settings
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8010"))

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/storage/ghostguard.db")
    
    # OCR settings
    _default_tess = ""
    if os.name == "nt":
        if os.path.isfile(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
            _default_tess = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    else:
        _default_tess = "/usr/bin/tesseract"
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", _default_tess)
    OCR_DEFAULT_LANGUAGE: str = os.getenv("OCR_LANGUAGE", "eng")
    DESKEW_ENABLED: bool = True
    DENOISE_ENABLED: bool = True

settings = Settings()

# Ensure storage directory exists
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
