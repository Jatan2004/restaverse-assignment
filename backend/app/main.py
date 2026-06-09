from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers import employee
from app.config import settings

# Initialize FastAPI with descriptive metadata
app = FastAPI(
    title="Employee Search System API",
    description="Backend service for searching and managing company employees",
    version="1.0.0"
)

# Configure CORS so our frontend application can access this API
# Allow all origins or specify the default Vite dev server URL (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the employee routes directly under root (e.g. /employees)
app.include_router(employee.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Employee Search System API",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    # Start the server when main.py is run directly
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
