import os
import re
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from .prompts import AUDIT_PROMPT, CHATBOT_PROMPT, COMMIT_ANALYSIS_PROMPT, FILE_FIX_PROMPT

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:4b")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.3"))

llm = ChatOllama(
    model=MODEL_NAME,
    base_url=OLLAMA_BASE_URL,
    temperature=TEMPERATURE
)

def extract_corrected_code(analysis_text: str) -> dict:
    """
    Extract corrected code examples from analysis text.
    
    Looks for patterns like:
    ```corrected-code-1
    code here
    ```
    
    Returns dict with:
    - analysis: cleaned analysis without code blocks
    - corrected_examples: list of corrected code examples
    """
    corrected_pattern = r'```corrected-code-(\d+)(.*?)```'
    matches = re.findall(corrected_pattern, analysis_text, re.DOTALL)
    
    corrected_examples = []
    for issue_num, code_content in matches:
        corrected_examples.append({
            'issue': int(issue_num),
            'code': code_content.strip()
        })
    
    cleaned_analysis = re.sub(corrected_pattern, '', analysis_text, flags=re.DOTALL).strip()
    
    return {
        'analysis': cleaned_analysis,
        'corrected_examples': corrected_examples
    }

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
        if analysis_type == "chatbot":
            prompt_template = CHATBOT_PROMPT
        elif analysis_type == "commit":
            prompt_template = COMMIT_ANALYSIS_PROMPT
        elif analysis_type == "file_fix":
            prompt_template = FILE_FIX_PROMPT
        else: 
            prompt_template = AUDIT_PROMPT
        
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | llm
        response = chain.invoke({"code": code})
        return response.content
    except Exception as e:
        return f"Error during analysis: {str(e)}"