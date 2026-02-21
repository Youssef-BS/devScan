# DevScan - Chatbot & Port Configuration Summary

## 📋 Overview of Changes

This document summarizes all modifications made to enable the chatbot functionality and fix port configuration issues in the DevScan project.

## 🔧 Changes Made

### 1. **Port Configuration Fix** 
**File**: [apps/api/src/controllers/Commit.controller.ts](apps/api/src/controllers/Commit.controller.ts#L5)

**Change**: Fixed AI service URL from port 8000 to 8003
```typescript
// Before:
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// After:
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8003";
```

**Reason**: AI service package.json runs on port 8003, not 8000

---

### 2. **API Environment Configuration**
**File**: [apps/api/.env](apps/api/.env)

**Added**:
```dotenv
AI_SERVICE_URL=http://localhost:8003
```

**Purpose**: Allows easy configuration of AI service URL without code changes

---

### 3. **AI Service Environment Configuration**
**File**: [apps/ai/.env](apps/ai/.env) (NEW)

**Content**:
```dotenv
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=gemma3:4b
TEMPERATURE=0.3
PORT=8003
DEBUG=True
```

**Purpose**: Centralized configuration for the AI service

---

### 4. **AI Service Requirements**
**File**: [apps/ai/requirements.txt](apps/ai/requirements.txt) (NEW)

**Content**: Python dependencies
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
langchain==0.1.0
langchain-ollama==0.1.0
langchain-core==0.1.0
requests==2.31.0
```

**Purpose**: Easy installation of AI service dependencies

---

### 5. **Enhanced Chatbot Prompt**
**File**: [apps/ai/audit/prompts.py](apps/ai/audit/prompts.py)

**Changes**:
- Added `CHATBOT_PROMPT`: Specialized prompt for conversational assistance
- Added `COMMIT_ANALYSIS_PROMPT`: For analyzing Git commits
- Enhanced `AUDIT_PROMPT`: More detailed security analysis instructions

**Example**:
```python
CHATBOT_PROMPT = """
You are an AI code assistant for devScan...
When answering questions:
1. Be concise but thorough
2. Provide code examples when relevant
3. Explain security implications clearly
...
"""
```

---

### 6. **Enhanced AI Analyzer**
**File**: [apps/ai/audit/analyzer.py](apps/ai/audit/analyzer.py)

**Changes**:
- Added environment variable support for configuration
- Added `analysis_type` parameter to support different prompt types
- Added error handling and configuration logging
- Made the analyzer more flexible for different analysis modes

```python
def analyze_code(code: str, analysis_type: str = "audit"):
    """
    Analyze code using the specified prompt type.
    
    Args:
        code: The code to analyze
        analysis_type: Type of analysis - 'audit', 'chatbot', or 'commit'
    """
```

---

### 7. **Enhanced FastAPI Application**
**File**: [apps/ai/main.py](apps/ai/main.py)

**Changes**:
- Added CORS middleware for client requests
- Added `/health` endpoint for service monitoring
- Added support for `analysis_type` parameter in requests
- Added environment-based configuration
- Added proper application metadata

```python
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "DevScan AI Service",
        "model": os.getenv("MODEL_NAME", "gemma3:4b")
    }
```

---

### 8. **Updated AI Service Package Configuration**
**File**: [apps/ai/package.json](apps/ai/package.json)

**Changes**:
```json
"scripts": {
  "dev": "venv\\Scripts\\python -m uvicorn main:app --reload --port 8003 --host 0.0.0.0",
  "setup": "python -m venv venv && venv\\Scripts\\pip install -r requirements.txt",
  "install": "venv\\Scripts\\pip install -r requirements.txt",
  "start": "venv\\Scripts\\python -m uvicorn main:app --port 8003 --host 0.0.0.0"
}
```

---

### 9. **Enhanced Chatbot Component**
**File**: [apps/client/src/components/AIChatbot.tsx](apps/client/src/components/AIChatbot.tsx#L65)

**Change**: Pass analysis type to backend
```typescript
// Before:
body: JSON.stringify({ code: fullPrompt })

// After:
body: JSON.stringify({
  code: fullPrompt,
  analysisType: "chatbot"
})
```

---

### 10. **Updated Commit Analysis Controller**
**File**: [apps/api/src/controllers/Commit.controller.ts](apps/api/src/controllers/Commit.controller.ts#L319)

**Changes**:
- Added support for `analysisType` parameter
- Enhanced error reporting to include service URL
- Added proper request logging

```typescript
export const analyzeCommitWithAI = async (req: Request, res: Response) => {
  const { code, sha, analysisType = "chatbot" } = req.body;
  // ...
  const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
    code: code,
    analysis_type: analysisType
  }, { timeout: 30000 });
```

---

## 📊 Port Configuration

| Service | Port | URL | Status |
|---------|------|-----|--------|
| PostgreSQL | 5432 | localhost:5432 | ✓ Verified |
| API | 4000 | localhost:4000 | ✓ Verified |
| Client | 3000 | localhost:3000 | ✓ Verified |
| AI Service | 8003 | localhost:8003 | ✓ **FIXED** |
| Ollama | 11434 | localhost:11434 | ✓ Verified |

---

## 🚀 How to Use the New Chatbot

### Setup
```bash
# 1. Start all services (see CHATBOT_SETUP_GUIDE.md)

# 2. Start AI service
cd apps/ai
npm run setup
npm run dev
```

### Using the Chatbot
1. Open http://localhost:3000
2. Click the AI Chatbot button (bottom right)
3. Ask questions about code
4. Get instant AI analysis powered by Ollama

### Analysis Types Supported
- `audit`: Security and performance analysis
- `chatbot`: Conversational code assistance (default for UI)
- `commit`: Analyze Git commit changes

---

## ✅ Verification

### Test Each Service
```bash
# PostgreSQL
psql -U devscan -h localhost -d devscan_db -c "SELECT 1"

# API Health
curl http://localhost:4000/health

# AI Service Health
curl http://localhost:8003/health

# Full Pipeline
curl -X POST http://localhost:4000/commit/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "const x = 1;", "analysisType": "chatbot"}'
```

---

## 📄 Documentation Files

Two new documentation files were created:

1. **[PORTS_AND_SERVICES.md](PORTS_AND_SERVICES.md)**
   - Detailed port configuration
   - Service descriptions
   - Complete startup instructions
   - Troubleshooting guide

2. **[CHATBOT_SETUP_GUIDE.md](CHATBOT_SETUP_GUIDE.md)**
   - Quick setup instructions
   - Verification checklist
   - Step-by-step test procedures

---

## 🎯 Result

✅ All port conflicts resolved
✅ Chatbot prompts implemented
✅ Environment configuration centralized
✅ Error handling improved
✅ Services properly documented
✅ End-to-end testing verified

The chatbot is now fully functional and ready to analyze code!
