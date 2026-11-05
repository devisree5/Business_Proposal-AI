import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.utils.seed_data import seed_database
from backend.app.routers import emails, pricing, proposals, ai, analytics, settings as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Commercial AI-Powered B2B Email-to-Proposal Generation Engine",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount generated PDFs directory for static download
pdf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "generated_pdfs"))
os.makedirs(pdf_dir, exist_ok=True)
app.mount("/static/pdfs", StaticFiles(directory=pdf_dir), name="pdfs")

# Register Routers
app.include_router(analytics.router)
app.include_router(emails.router)
app.include_router(pricing.router)
app.include_router(proposals.router)
app.include_router(ai.router)
app.include_router(settings_router.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
