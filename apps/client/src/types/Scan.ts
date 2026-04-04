export type ScanStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type IssueType = "BUG" | "VULNERABILITY" | "CODE_SMELL";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "OPEN" | "CONFIRMED" | "FIXED" | "IGNORED";
export type AgentType = "security" | "performance" | "clean_code" | "bug";

export interface Scan {
  id: number;
  status: ScanStatus;
  score?: number;
  grade?: string;
  repoId: number;
  commitId: number;
  createdAt: string;
  updatedAt: string;
  issues?: Issue[];
  Repo?: {
    id: number;
    name: string;
    fullName: string;
  };
  Commit?: {
    id: number;
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  _count?: {
    issues: number;
  };
}

export interface Issue {
  id: number;
  title: string;
  message?: string;
  type: IssueType;
  severity: Severity;
  status: IssueStatus;
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  effort?: string;
  tags: string[];
  agent: AgentType;
  confidence?: number;
  fixedCode?: string;
  rawAI?: any;
  isFalsePositive: boolean;
  scanId: number;
  commitId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueStats {
  total: number;
  bySeverity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  byType: {
    BUG: number;
    VULNERABILITY: number;
    CODE_SMELL: number;
  };
  byStatus: {
    OPEN: number;
    CONFIRMED: number;
    FIXED: number;
    IGNORED: number;
  };
}

export interface AnalysisResult {
  status: string;
  analysis: {
    security?: Record<string, any>;
    performance?: Record<string, any>;
    clean_code?: Record<string, any>;
    synthesis?: Record<string, any>;
  };
  agents_executed?: string[];
}
