import type { Repo } from "@/types/Repo";

export const mockRepos: Repo[] = [
  {
    name: "devscan-backend",
    description:
      "FastAPI backend service for AI-powered code analysis using LangChain and GPT-4",
    language: "Python",
    state: "public",
    issues: 12,
    lastScan: "2 hours ago",
    auto_audit: true,
  },
  {
    name: "nextjs-dashboard",
    description: "Modern dashboard built with Next.js and Tailwind CSS",
    language: "TypeScript",
    state: "private",
    issues: 5,
    lastScan: "1 day ago",
    auto_audit: false,
  },
  {
    name: "spring-boot-api",
    description: "RESTful API with Spring Boot",
    language: "Java",
    state: "public",
    issues: 16,
    lastScan: "2 weeks ago",
    auto_audit: false,
  },
]
