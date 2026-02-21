# DevScan - Quick Setup & Test Guide

## ✅ Changes Made

### 1. **Fixed Port Mismatch** ✓
- **Issue**: API was looking for AI service on port 8000, but it runs on 8003
- **Fix**: Updated `Commit.controller.ts` to use `http://localhost:8003`
- **Status**: FIXED

### 2. **Added Chatbot Prompts** ✓
- **Created**: Enhanced prompts in `prompts.py`
  - `AUDIT_PROMPT`: Security and performance analysis
  - `CHATBOT_PROMPT`: Conversational assistance (for chatbot)
  - `COMMIT_ANALYSIS_PROMPT`: Analyze Git commits
- **Status**: ADDED

### 3. **Configuration Files** ✓
- **Created**: `.env` file for AI service with proper settings
- **Updated**: API `.env` to include `AI_SERVICE_URL=http://localhost:8003`
- **Created**: `requirements.txt` for Python dependencies
- **Updated**: `package.json` with proper dev/start scripts
- **Status**: CONFIGURED

### 4. **Enhanced AI Service** ✓
- **Updated**: `main.py` to support multiple analysis types
- **Updated**: `analyzer.py` to load config from environment variables
- **Added**: `/health` endpoint for monitoring
- **Added**: CORS middleware for client requests
- **Status**: ENHANCED

### 5. **Improved Chatbot Component** ✓
- **Updated**: `AIChatbot.tsx` to pass `analysisType: "chatbot"`
- **Status**: UPDATED

## 🚀 How to Run Everything

### Step 1: Install Ollama (One-time)
```bash
# Download from: https://ollama.ai/
# Or use Windows Store

# Start Ollama service
ollama serve

# In another terminal, pull the model (one-time only)
ollama pull gemma3:4b
```

### Step 2: Start Database & API with Docker
```bash
cd c:\Users\LENOVO\Desktop\devScan

# Start PostgreSQL, API, and Client
docker-compose up

# View logs
docker-compose logs -f api
docker-compose logs -f client
docker-compose logs -f postgres
```

### Step 3: Setup & Start AI Service
```bash
# Navigate to AI service
cd c:\Users\LENOVO\Desktop\devScan\apps\ai

# Setup virtual environment (first time only)
npm run setup
# or manually:
# python -m venv venv
# venv\Scripts\pip install -r requirements.txt

# Start the AI service
npm run dev

# You should see:
# ✓ Uvicorn running on http://127.0.0.1:8003
# ✓ Listening for code changes
```

### Step 4: Access the Application
```
Open your browser: http://localhost:3000
```

## ✅ Verification Checklist

After starting all services, verify each component:

### 1. PostgreSQL (Port 5432)
```bash
# Test connection
psql -U devscan -h localhost -d devscan_db -c "SELECT 1"
# Expected: (1 row) with value 1
```

### 2. API Server (Port 4000)
```bash
# Test health endpoint
curl http://localhost:4000/health
# Expected JSON response
```

### 3. AI Service (Port 8003)
```bash
# Test health endpoint
curl http://localhost:8003/health
# Expected: {"status": "ok", "service": "DevScan AI Service", ...}
```

### 4. Test Chatbot End-to-End
```bash
# Test full pipeline
curl -X POST http://localhost:4000/commit/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "analysisType": "chatbot"
  }'

# Expected: Analysis response from Ollama model
```

### 5. Web Client (Port 3000)
```
1. Open http://localhost:3000
2. Look for AI Chatbot button (bottom right)
3. Click to open chatbot
4. Type a question about code
5. Should get AI response
```

## 📊 Service Status Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                   SERVICE STATUS                        │
├──────────────────────┬─────────────────────────────────┤
│ Service              │ Status & Port                   │
├──────────────────────┼─────────────────────────────────┤
│ PostgreSQL           │ ✓ Running on 5432               │
│ API (Express)        │ ✓ Running on 4000               │
│ Client (Next.js)     │ ✓ Running on 3000               │
│ AI Service (FastAPI) │ ✓ Running on 8003               │
│ Ollama LLM           │ ✓ Running on 11434              │
└──────────────────────┴─────────────────────────────────┘
```

## 🔧 Troubleshooting

### ❌ "AI service not responding"
```bash
# 1. Check if AI service is running
curl http://localhost:8003/health

# 2. Ensure Ollama is running
ollama serve

# 3. Check if model is available
ollama list

# 4. Check port 8003 is not in use
netstat -ano | findstr :8003
```

### ❌ "Cannot connect to database"
```bash
# 1. Verify Docker container is running
docker ps | grep devscan_postgres

# 2. Check if PostgreSQL is accepting connections
pg_isready -h localhost -p 5432

# 3. Restart Docker services
docker-compose down
docker-compose up
```

### ❌ "Chatbot returns error"
```bash
# 1. Check API logs
docker-compose logs api

# 2. Check AI service logs (terminal where npm run dev is running)

# 3. Verify .env files are configured correctly

# 4. Ensure all three services are running:
#    - API on 4000
#    - Client on 3000
#    - AI Service on 8003
```

## 📚 Project Structure

```
devScan/
├── docker-compose.yml         # Database & container config
├── PORTS_AND_SERVICES.md      # Detailed port documentation
├── apps/
│   ├── api/                   # Express.js backend (port 4000)
│   │   ├── src/
│   │   │   └── controllers/
│   │   │       └── Commit.controller.ts  # ✓ FIXED
│   │   └── .env                           # ✓ UPDATED
│   ├── client/                # Next.js frontend (port 3000)
│   │   ├── src/
│   │   │   └── components/
│   │   │       └── AIChatbot.tsx          # ✓ UPDATED
│   │   └── .env
│   └── ai/                    # FastAPI service (port 8003)
│       ├── main.py                        # ✓ ENHANCED
│       ├── .env                           # ✓ CREATED
│       ├── requirements.txt                # ✓ CREATED
│       ├── package.json                   # ✓ UPDATED
│       └── audit/
│           ├── analyzer.py                # ✓ ENHANCED
│           └── prompts.py                 # ✓ ENHANCED
```

## 🎯 Next Steps

After verification:

1. **Test the chatbot**: Open http://localhost:3000 and use the AI assistant
2. **Monitor logs**: Watch the API and AI service logs for requests
3. **Explore features**: Try different code analysis types
4. **Deploy**: Use Docker Compose for production deployment

## 📞 Support

For issues, check:
1. [PORTS_AND_SERVICES.md](./PORTS_AND_SERVICES.md) - Detailed configuration
2. Service health endpoints
3. Docker logs: `docker-compose logs [service]`
4. Application logs in terminal windows
