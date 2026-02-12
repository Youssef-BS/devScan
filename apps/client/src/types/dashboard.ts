export interface Repo {
  id: string
  name: string
  private: boolean
  language: string | null
  auto_audit: boolean
  lastScan: string
}

export interface IssueSeverity {
  critical: number
  high: number
  medium: number
  low: number
}

export interface IssueType {
  security: number
  performance: number
  codeQuality: number
  bestPractices: number
}

export interface Vulnerability {
  name: string
  count: number
  severity: 'critical' | 'high' | 'medium'
}

export interface LanguageIssue {
  language: string
  issues: number
  securityScore: number
}

export interface Scan {
  repo: string
  issuesFound: number
  timestamp: string
  status: string
}

export interface AutoFixStats {
  totalAutoFixes: number
  successfulFixes: number
  failedFixes: number
  successRate: number
}

export interface IssuesData {
  issuesBySeverity: IssueSeverity
  issuesByType: IssueType
  weeklyTrend: number[]
  commonVulnerabilities: Vulnerability[]
  topLanguagesWithIssues: LanguageIssue[]
  recentScans: Scan[]
  autoFixStats: AutoFixStats
}

export interface AdvancedMetrics extends IssuesData {
  totalRepos: number
  privateRepos: number
  publicRepos: number
  autoAuditEnabled: number
  languageStats: Map<string, { count: number; percentage: number; issues?: number; securityScore?: number }>
  sortedLanguages: [string, { count: number; percentage: number; issues?: number; securityScore?: number }][]
  auditCoverage: number
  averageHealthScore: number
  highRiskRepos: number
  mediumRiskRepos: number
  lowRiskRepos: number
  recentActivity: number
  staleRepos: number
  healthScores: number[]
  topLanguages: string[]
  totalIssues: number
  criticalIssues: number
  securityScore: number
  complianceScore: number
}

export interface TrendData {
  date: string
  repos: number
  audits: number
  issues: number
  autoFixes: number
}