import { useMemo } from "react"
import { Repo, AdvancedMetrics, IssuesData } from "@/types/dashboard"

const DUMMY_ISSUES_DATA: IssuesData = {
  issuesBySeverity: {
    critical: 12,
    high: 28,
    medium: 45,
    low: 67
  },
  issuesByType: {
    security: 58,
    performance: 34,
    codeQuality: 89,
    bestPractices: 42
  },
  weeklyTrend: [12, 18, 15, 22, 19, 25, 28],
  commonVulnerabilities: [
    { name: "SQL Injection", count: 8, severity: "critical" },
    { name: "XSS", count: 15, severity: "high" },
    { name: "Hardcoded Secrets", count: 23, severity: "medium" },
    { name: "Insecure Dependencies", count: 17, severity: "high" },
    { name: "Missing Authentication", count: 5, severity: "critical" }
  ],
  topLanguagesWithIssues: [
    { language: "JavaScript", issues: 45, securityScore: 65 },
    { language: "Python", issues: 32, securityScore: 78 },
    { language: "TypeScript", issues: 28, securityScore: 82 },
    { language: "Java", issues: 19, securityScore: 71 },
    { language: "Go", issues: 12, securityScore: 89 }
  ],
  recentScans: [
    { repo: "api-service", issuesFound: 8, timestamp: "2 hours ago", status: "completed" },
    { repo: "frontend-app", issuesFound: 12, timestamp: "5 hours ago", status: "completed" },
    { repo: "auth-microservice", issuesFound: 3, timestamp: "1 day ago", status: "completed" },
    { repo: "database-migration", issuesFound: 15, timestamp: "2 days ago", status: "completed" },
    { repo: "payment-service", issuesFound: 0, timestamp: "3 days ago", status: "completed" }
  ],
  autoFixStats: {
    totalAutoFixes: 156,
    successfulFixes: 142,
    failedFixes: 14,
    successRate: 91
  }
}

export const useDashboardMetrics = (dataFromDb: Repo[]) => {
  return useMemo(() => {
    const totalRepos = dataFromDb.length
    const privateRepos = dataFromDb.filter(repo => repo.private).length
    const publicRepos = totalRepos - privateRepos
    const autoAuditEnabled = dataFromDb.filter(repo => repo.auto_audit).length

    const languageStats = new Map<string, { count: number, percentage: number, issues?: number, securityScore?: number }>()
    dataFromDb.forEach(repo => {
      const lang = repo.language || "Unknown"
      const current = languageStats.get(lang) || { count: 0, percentage: 0 }
      languageStats.set(lang, { 
        ...current, 
        count: current.count + 1, 
        percentage: 0,
        issues: Math.floor(Math.random() * 20) + 5, 
        securityScore: Math.floor(Math.random() * 30) + 65 
      })
    })

    for (const [lang, stat] of languageStats) {
      stat.percentage = Math.round((stat.count / totalRepos) * 100)
    }

    const sortedLanguages = Array.from(languageStats.entries())
      .sort((a, b) => b[1].count - a[1].count)

    const auditCoverage = totalRepos > 0 
      ? Math.round((autoAuditEnabled / totalRepos) * 100) 
      : 0

    const healthScores = dataFromDb.map(repo => {
      let score = 50 
      if (repo.auto_audit) score += 25
      if (!repo.private) score += 5
      if (repo.language && repo.language !== "Unknown") score += 10
      if (repo.lastScan !== 'Never') score += 15
      score += Math.floor(Math.random() * 10) - 5 
      return Math.max(30, Math.min(score, 98)) 
    })

    const averageHealthScore = healthScores.length > 0
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
      : 0

    const highRiskRepos = dataFromDb.filter(repo => 
      !repo.auto_audit && repo.private
    ).length

    const mediumRiskRepos = dataFromDb.filter(repo => 
      !repo.auto_audit && !repo.private
    ).length

    const lowRiskRepos = dataFromDb.filter(repo => 
      repo.auto_audit
    ).length

    const recentActivity = Math.min(Math.round(dataFromDb.length * 0.4), 15)
    const staleRepos = dataFromDb.filter(repo => 
      repo.lastScan === 'Never' || (repo.lastScan && repo.lastScan.includes('2023'))
    ).length

    const topLanguages = sortedLanguages.slice(0, 3).map(([lang]) => lang)
    const totalIssues = Object.values(DUMMY_ISSUES_DATA.issuesBySeverity).reduce((a, b) => a + b, 0)
    const criticalIssues = DUMMY_ISSUES_DATA.issuesBySeverity.critical
    const securityScore = Math.max(40, 100 - Math.floor(totalIssues / 2))
    const complianceScore = autoAuditEnabled > 0 ? Math.min(95, 70 + (autoAuditEnabled * 3)) : 40

    return {
      totalRepos,
      privateRepos,
      publicRepos,
      autoAuditEnabled,
      languageStats,
      sortedLanguages,
      auditCoverage,
      averageHealthScore,
      highRiskRepos,
      mediumRiskRepos,
      lowRiskRepos,
      recentActivity,
      staleRepos,
      healthScores,
      topLanguages,
      totalIssues,
      criticalIssues,
      securityScore,
      complianceScore,
      ...DUMMY_ISSUES_DATA
    } as AdvancedMetrics
  }, [dataFromDb])
}

export const useTrendData = () => {
  return useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        repos: Math.floor(Math.random() * 8) + 3,
        audits: Math.floor(Math.random() * 15) + 8,
        issues: Math.floor(Math.random() * 6) + 2,
        autoFixes: Math.floor(Math.random() * 10) + 5
      }
    })
  }, [])
}