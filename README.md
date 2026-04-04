# DevScan

A comprehensive monorepo application for repository scanning and analysis with admin dashboard, client interface, REST API backend, and AI-powered analytics.

## 📋 Project Overview

DevScan is a full-stack application built with a modular architecture. It provides:
- **Admin Dashboard** — Administrative interface for managing repositories and settings
- **Client App** — User-facing application for repository analysis
- **REST API** — Backend services with database integration
- **AI Module** — Python-based audit analysis and repository scanning

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (custom stores)
- **HTTP Client**: Axios
- **Authentication**: Custom auth service with JWT

### Backend
- **Runtime**: Node.js with TypeScript
- **ORM**: Prisma with PostgreSQL
- **API**: Express.js-like routing structure
- **Database**: PostgreSQL (configured via Prisma)

### AI/Analytics
- **Language**: Python
- **Purpose**: Repository audit analysis and prompts

### Dev Tools
- **Monorepo**: pnpm workspace + Turbo
- **Package Manager**: pnpm
- **Linting**: ESLint with shared configs
- **Containerization**: Docker (Dockerfiles for each service)

## 📁 Project Structure

```
devScan/
├── apps/
│   ├── admin/          # Admin dashboard (Next.js)
│   ├── client/         # Client application (Next.js)
│   └── api/            # Backend API (Node.js + Prisma)
├── packages/
│   ├── eslint-config/  # Shared ESLint configurations
│   ├── typescript-config/ # Shared TypeScript configs
│   └── validation/     # Shared validation schemas
├── Dockerfiles/        # Container definitions
├── docker-compose.yml  # Multi-container orchestration
├── pnpm-workspace.yaml # Workspace configuration
└── turbo.json         # Turbo build configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Docker (optional, for containerized deployment)
- PostgreSQL database

### Installation

1. **Clone and install dependencies**
   ```bash
   cd devScan
   pnpm install
   ```

2. **Setup environment variables**
   - Create `.env` files in `apps/api/`, `apps/admin/`, and `apps/client/`
   - Configure database connection, API endpoints, and authentication settings

3. **Initialize database**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   ```

### Running the Project

**Development mode (all services)**
```bash
pnpm dev
```

**Individual services**
```bash
# Admin dashboard
pnpm --filter admin dev

# Client app
pnpm --filter client dev

# API server
pnpm --filter api dev
```

### Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## 📦 Key Dependencies

### Admin App
- next, react, typescript
- zustand (state management)
- axios (HTTP client)
- js-cookie (cookie handling)
- tailwind-css

### Client App
- next, react, typescript
- zustand (state management)
- axios (HTTP client)
- tailwind-css

### API
- express-like routing
- @prisma/client (database ORM)
- typescript
- Node.js runtime

### Validation Package
- Shared schemas for login, password, and profile updates

## 🔐 Authentication

- JWT-based authentication
- Auth service in both admin and client apps
- Protected routes and middleware
- Cookie-based session management

## 📊 Database

Uses Prisma ORM with PostgreSQL:
- Migrations stored in `apps/api/prisma/migrations/`
- Schema defined in `apps/api/prisma/schema.prisma`
- Type-safe database client auto-generated

## 🧪 Development Workflow

- **Build system**: Turbo for optimized monorepo builds
- **Linting**: Shared ESLint configs across all apps
- **TypeScript**: Strict mode with shared TS configs
- **Code organization**: Feature-based structure in each app

## 📝 Scripts

Common tasks (run from root):
```bash
pnpm dev           # Start all services in dev mode
pnpm build         # Build all packages
pnpm lint          # Lint all packages
pnpm turbo run dev # Run Turbo dev pipeline
```

## 🤝 Contributing

When adding new features:
1. Follow the existing project structure
2. Use shared validation schemas
3. Update TypeScript configs as needed
4. Ensure type safety across all apps
5. Use Prisma migrations for DB changes

## 📄 License

[Specify your license here]

## 📞 Support

For issues or questions, please refer to individual app READMEs in their respective directories.
