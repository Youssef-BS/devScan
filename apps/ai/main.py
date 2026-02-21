import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from audit.analyzer import analyze_code

app = FastAPI(
    title="DevScan AI Service",
    description="AI-powered code analysis service for DevScan",
    version="1.0.0"
)

# Enable CORS for client and API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    analysis_type: str = "audit"  # Default to audit, can be 'audit', 'chatbot', or 'commit'

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "DevScan AI Service",
        "model": os.getenv("MODEL_NAME", "gemma3:4b")
    }

@app.post("/analyze")
async def analyze(request: CodeRequest):
    """
    Analyze code using specified prompt template.
    
    - analysis_type: 'audit' (default), 'chatbot', or 'commit'
    """
    result = analyze_code(request.code, analysis_type=request.analysis_type)
    return {
        "analysis": result,
        "analysis_type": request.analysis_type
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8003"))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
        env_file=".env"
    )