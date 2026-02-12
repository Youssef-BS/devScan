from fastapi import APIRouter
from pydantic import BaseModel
from services.ollama_service import OllamaService

router = APIRouter()
ollama = OllamaService()

class MessageRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_endpoint(req: MessageRequest):
    return {"response": ollama.chat(req.message)}
