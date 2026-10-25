"""
GhostGuard AI - FastAPI Application Factory
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import engine, Base
from backend.db_models import Evidence, EvidencePage, EvidenceAuditLog
from backend.api.evidence_routes import router as evidence_router
from backend.api.audit_routes import router as audit_router
from backend.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create SQLite/PostgreSQL database tables on startup
    Base.metadata.create_all(bind=engine)
    # Ensure evidence storage directory exists
    settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GhostGuard AI - OCR Evidence Intelligence & Case Linking Service for 'Ghost Data Still Exists'",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(evidence_router, prefix="/api")
app.include_router(audit_router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health/ocr"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=False)
