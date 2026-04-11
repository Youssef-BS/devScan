export interface ScanIssue {
  id: number;
  title: string;
  message?: string;
  type: "BUG" | "VULNERABILITY" | "CODE_SMELL";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "CONFIRMED" | "FIXED" | "IGNORED";
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  agent: "security" | "performance" | "clean_code" | "bug";
  fixedCode?: string;
  confidence?: number;
  tags: string[];
  isFalsePositive: boolean;
  scanId: number;
  commitId: number;
}

export interface ScanResult {
  id: number;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  score?: number;
  grade?: string;
  repoId: number;
  commitId: number;
  createdAt: string;
  updatedAt: string;
  issues?: ScanIssue[];
}

export interface AnalysisResult {
  /** Raw combined analysis text from the AI service */
  analysis: string;
  /** Corrected code snippets returned by the AI service */
  correctedExamples: Array<{ issue: number; code: string }>;
  analysisType: string;
  /** Persisted scan record from the database */
  scan?: ScanResult;
  /** Convenience copies hoisted from scan */
  score?: number;
  grade?: string;
  issuesCount?: number;
  /** Agent breakdown counts */
  agent_breakdown?: {
    security: number;
    performance: number;
    clean_code: number;
  };
  timestamp?: string;
  message?: string;
  error?: string;
}
