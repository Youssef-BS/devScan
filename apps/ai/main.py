from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage

app = FastAPI()

llm = ChatOllama(
    model="gemma3:4b",
    base_url="http://localhost:11434",
    temperature=0.3
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    response = llm.invoke([HumanMessage(content=req.message)])
    return {"response": response.content}
