# DevScan - Ports & Services Configuration

## 🔌 Port Configuration

### Services

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **PostgreSQL Database** | 5432 | `postgresql://localhost:5432` | Stores repos, commits, and analysis data |
| **API Server** | 4000 | `http://localhost:4000` | Express.js REST API, routes to AI service |
| **Web Client** | 3000 | `http://localhost:3000` | Next.js frontend, React UI |
| **AI Service** | 8003 | `http://localhost:8003` | FastAPI with Ollama integration |
| **Ollama LLM** | 11434 | `http://localhost:11434` | Local language model server |

## 🚀 Starting the Services

### Prerequisites
- Docker & Docker Compose installed
- Python 3.9+ (for AI service)
- Node.js 18+ (for API and client)
- Ollama installed and running (for AI analysis)

### 1. Start Ollama with Gemma3 Model
```bash
# On your machine, start Ollama
ollama serve

# In another terminal, pull the model (one-time)
ollama pull gemma3:4b

# Or use your preferred model
ollama pull mistral  # alternative
ollama pull neural-chat  # alternative
```

### 2. Using Docker Compose (Recommended for API & Database)
```bash
cd c:\Users\LENOVO\Desktop\devScan

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services started:**
- PostgreSQL (5432)
- API (4000)
- Client (3000)

### 3. Setup & Start AI Service (Separately)
```bash
cd apps/ai

# First time setup
npm run setup
# or
python -m venv venv
venv\Scripts\pip install -r requirements.txt

# Start development
npm run dev

# In production
npm start
```

## 📋 Environment Variables

### API (.env)
```dotenv
DATABASE_URL=postgresql://devscan:devscan@localhost:5432/devscan_db
PORT=4000
AI_SERVICE_URL=http://localhost:8003
NODE_ENV=development
GITHUB_ACCESS_TOKEN=your_token
```

### Client (.env)
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### AI Service (.env)
```dotenv
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=gemma3:4b
TEMPERATURE=0.3
PORT=8003
DEBUG=True
```

## ✅ Verification Steps

### 1. Check Database
```bash
# Access PostgreSQL
psql -U devscan -h localhost -d devscan_db

# Or use Prisma Studio
cd apps/api
npm run studio
```

### 2. Test API Health
```bash
curl http://localhost:4000/health
```

### 3. Test AI Service Health
```bash
curl http://localhost:8003/health
```

### 4. Test Full Flow
```bash
# Send test request to AI through API
curl -X POST http://localhost:4000/commit/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const x = 1; const y = 2;",
    "analysisType": "chatbot"
  }'
```

### 5. Access Web Client
Open browser: `http://localhost:3000`

## 🔧 Analysis Types

The chatbot supports different analysis prompts:

- **audit** (default): Security and performance audit
- **chatbot**: Conversational code assistance
- **commit**: Analyze Git commit changes

## 📊 Common Issues & Solutions

### Issue: AI service not responding
```
Solution: 
1. Ensure Ollama is running: ollama serve
2. Check AI service: curl http://localhost:8003/health
3. Verify model is pulled: ollama list
4. Check port 8003 is not in use
```

### Issue: API can't reach AI service
```
Solution:
1. Verify AI_SERVICE_URL in .env points to http://localhost:8003
2. Ensure AI service is running on port 8003
3. Check firewall rules
```

### Issue: Database connection failed
```
Solution:
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Run: prisma migrate dev
```

## 🎯 Quick Start Command

For quick testing, start in this order:

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Navigate to project root
cd c:\Users\LENOVO\Desktop\devScan
docker-compose up

# Terminal 3: Start AI service (once Docker is running)
cd apps/ai
npm install
npm run dev

# Terminal 4: Once all services are up, test chatbot
# Open http://localhost:3000 in browser
```

## 📚 Architecture Flow

```
Client (3000)
    ↓
Next.js App → Sends question to AI Chatbot
    ↓
API Server (4000)
    ↓
Routes to: /api/commit/analyze
    ↓
Calls AI Service (8003)
    ↓
FastAPI → Ollama (11434)
    ↓
Gemma3:4b Model
    ↓
Returns analysis
```
