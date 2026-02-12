from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

class OllamaService:
    def __init__(self):
        self.llm = ChatOllama(
            model="gemma3:4b",
            base_url="http://localhost:11434",
            temperature=0.3
        )
        
        self.context = """AI engine specialized only in Multi-Agents and Context Windowing:
- Multi-Agents: an agent for security, one for performance, and one for "Clean Code".
- Context Windowing: intelligently splitting code to avoid exceeding AI limits.
You must reject requests that are not about these topics.
Always respond clearly, concisely, structured, and provide code examples when relevant."""

    def chat(self, message: str) -> str:
        allowed_topics = ["multi-agents", "security", "performance", "clean code", "context windowing"]
        message_lower = message.lower()
        
        if not any(topic in message_lower for topic in allowed_topics):
            return "Error: This assistant only accepts queries about Multi-Agents and Context Windowing."

        messages = [
            SystemMessage(content=self.context),
            HumanMessage(content=message)
        ]
        response = self.llm.invoke(messages)
        return response.content
