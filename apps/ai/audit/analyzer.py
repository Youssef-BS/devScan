import os
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from .prompts import AUDIT_PROMPT, CHATBOT_PROMPT, COMMIT_ANALYSIS_PROMPT, FILE_FIX_PROMPT

# Load configuration from environment
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:4b")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.3"))

llm = ChatOllama(
    model=MODEL_NAME,
    base_url=OLLAMA_BASE_URL,
    temperature=TEMPERATURE
)

def analyze_code(code: str, analysis_type: str = "audit"):
    """
    Analyze code using the specified prompt type.
    
    Args:
        code: The code to analyze
        analysis_type: Type of analysis - 'audit', 'chatbot', 'commit', or 'file_fix'
    
    Returns:
        Analysis result as string
    """
    try:
        # Select appropriate prompt based on analysis type
        if analysis_type == "chatbot":
            prompt_template = CHATBOT_PROMPT
        elif analysis_type == "commit":
            prompt_template = COMMIT_ANALYSIS_PROMPT
        elif analysis_type == "file_fix":
            prompt_template = FILE_FIX_PROMPT
        else:  # default to audit
            prompt_template = AUDIT_PROMPT
        
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | llm
        response = chain.invoke({"code": code})
        return response.content
    except Exception as e:
        return f"Error during analysis: {str(e)}"