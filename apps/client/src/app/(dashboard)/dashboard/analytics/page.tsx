"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRepoStore } from "@/store/useRepoStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, Activity, GitBranch, Users, Shield, AlertCircle, 
  TrendingUp, Clock, Eye, EyeOff, CheckCircle, XCircle, 
  AlertTriangle, Zap, Code, GitPullRequest, BarChart, FileText, 
  ShieldAlert, Cpu, AlertOctagon, Bug, Lock, Unlock
} from "lucide-react"
import SpinnerLoad from "@/components/Spinner"
import { cn } from "@/lib/utils"

const DUMMY_ISSUES_DATA = {
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

const Page = () => {
  const dataFromDb = useRepoStore(state => state.dataFromDb)
  const loading = useRepoStore(state => state.loading)
  const getFromDb = useRepoStore(state => state.getFromDb)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview')

  useEffect(() => {
    if (dataFromDb.length === 0) {
      getFromDb()
    }
  }, [dataFromDb.length, getFromDb])

  const advancedMetrics = useMemo(() => {
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

    // Risk assessment with more details
    const highRiskRepos = dataFromDb.filter(repo => 
      !repo.auto_audit && repo.private
    ).length

    const mediumRiskRepos = dataFromDb.filter(repo => 
      !repo.auto_audit && !repo.private
    ).length

    const lowRiskRepos = dataFromDb.filter(repo => 
      repo.auto_audit
    ).length

    // Activity trends (simulated - would come from actual activity data)
    const recentActivity = Math.min(Math.round(dataFromDb.length * 0.4), 15)
    const staleRepos = dataFromDb.filter(repo => 
      repo.lastScan === 'Never' || (repo.lastScan && repo.lastScan.includes('2023'))
    ).length

    // Top languages
    const topLanguages = sortedLanguages.slice(0, 3).map(([lang]) => lang)

    // Calculate total issues
    const totalIssues = Object.values(DUMMY_ISSUES_DATA.issuesBySeverity).reduce((a, b) => a + b, 0)
    const criticalIssues = DUMMY_ISSUES_DATA.issuesBySeverity.critical

    // Calculate security metrics
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
    }
  }, [dataFromDb])

  // Simulated trend data
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
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
    return last7Days
  }, [])

  if (loading) return <SpinnerLoad />

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">DevScan Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered code audit insights & security analytics
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === 'overview' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('overview')}
          >
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewMode === 'detailed' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </Button>
          <Button
            variant={viewMode === 'trends' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('trends')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' ? 'Last 7 days' : 
             range === '30d' ? 'Last 30 days' : 
             range === '90d' ? 'Last 90 days' : 'All time'}
          </Button>
        ))}
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Total Repositories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{advancedMetrics.totalRepos}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                  <Eye className="w-3 h-3" />
                  <span>{advancedMetrics.publicRepos} public</span>
                  <EyeOff className="w-3 h-3 ml-2" />
                  <span>{advancedMetrics.privateRepos} private</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{advancedMetrics.securityScore}/100</div>
                <div className="mt-2">
                  <Progress value={advancedMetrics.securityScore} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {advancedMetrics.criticalIssues} critical issues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Auto-Fix Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{advancedMetrics.autoFixStats.successRate}%</div>
                <div className="mt-2">
                  <Progress value={advancedMetrics.autoFixStats.successRate} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {advancedMetrics.autoFixStats.successfulFixes} successful fixes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Total Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{advancedMetrics.totalIssues}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    <span>{advancedMetrics.issuesBySeverity.critical} critical</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>{advancedMetrics.issuesBySeverity.high} high</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section: Issues & Languages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issues by Severity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" />
                  Issues by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(advancedMetrics.issuesBySeverity).map(([severity, count]) => {
                    const severityColors = {
                      critical: "bg-destructive",
                      high: "bg-amber-500",
                      medium: "bg-blue-500",
                      low: "bg-gray-400"
                    }
                    const severityLabels = {
                      critical: "Critical",
                      high: "High",
                      medium: "Medium",
                      low: "Low"
                    }
                    const percentage = Math.round((count / advancedMetrics.totalIssues) * 100)
                    
                    return (
                      <div key={severity} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${severityColors[severity as keyof typeof severityColors]}`}></div>
                            <span className="font-medium">{severityLabels[severity as keyof typeof severityLabels]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{count}</span>
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Issues by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Issues by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(advancedMetrics.issuesByType).map(([type, count]) => {
                    const typeIcons = {
                      security: ShieldAlert,
                      performance: Zap,
                      codeQuality: Code,
                      bestPractices: CheckCircle
                    }
                    const typeLabels = {
                      security: "Security",
                      performance: "Performance",
                      codeQuality: "Code Quality",
                      bestPractices: "Best Practices"
                    }
                    const Icon = typeIcons[type as keyof typeof typeIcons]
                    const percentage = Math.round((count / advancedMetrics.totalIssues) * 100)
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{typeLabels[type as keyof typeof typeLabels]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{count}</span>
                            <Badge variant="outline">{percentage}%</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Common Vulnerabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  Common Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advancedMetrics.commonVulnerabilities.map((vuln, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          vuln.severity === 'critical' ? 'bg-destructive' :
                          vuln.severity === 'high' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}></div>
                        <span className="font-medium">{vuln.name}</span>
                      </div>
                      <Badge variant={
                        vuln.severity === 'critical' ? 'destructive' :
                        vuln.severity === 'high' ? 'outline' : 'secondary'
                      }>
                        {vuln.count} instances
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section: Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Scans
              </CardTitle>
              <CardDescription>
                Latest automated audit results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {advancedMetrics.recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        scan.issuesFound === 0 
                          ? "bg-green-500/10 dark:bg-green-500/20" 
                          : scan.issuesFound > 10
                          ? "bg-destructive/10 dark:bg-destructive/20"
                          : "bg-amber-500/10 dark:bg-amber-500/20"
                      )}>
                        <span className={cn(
                          "font-bold",
                          scan.issuesFound === 0 
                            ? "text-green-600 dark:text-green-400" 
                            : scan.issuesFound > 10
                            ? "text-destructive"
                            : "text-amber-600 dark:text-amber-400"
                        )}>
                          {scan.issuesFound}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{scan.repo}</h4>
                        <p className="text-sm text-muted-foreground">{scan.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scan.issuesFound === 0 ? "default" : "destructive"}>
                        {scan.issuesFound === 0 ? "Clean" : `${scan.issuesFound} issues`}
                      </Badge>
                      <Badge variant="outline">{scan.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* Security Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 p-4 border rounded-lg">
                  <h3 className="font-semibold">Compliance Score</h3>
                  <div className="text-2xl font-bold">{advancedMetrics.complianceScore}/100</div>
                  <Progress value={advancedMetrics.complianceScore} className="h-2" />
                  <p className="text-sm text-muted-foreground">Industry standards compliance</p>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-semibold text-green-700 dark:text-green-400">Auto-Fixed Issues</h3>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {advancedMetrics.autoFixStats.successfulFixes}
                  </div>
                  <p className="text-sm text-muted-foreground">Automatically resolved</p>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-sm">91% success rate</span>
                  </div>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400">Pending Reviews</h3>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {advancedMetrics.issuesBySeverity.high + advancedMetrics.issuesBySeverity.critical}
                  </div>
                  <p className="text-sm text-muted-foreground">Require manual review</p>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">High priority</span>
                  </div>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-400">Audit Coverage</h3>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {advancedMetrics.auditCoverage}%
                  </div>
                  <p className="text-sm text-muted-foreground">Repositories protected</p>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Auto-audit enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Security Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Language Security Analysis</CardTitle>
              <CardDescription>
                Security scores by programming language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {advancedMetrics.topLanguagesWithIssues.map((lang, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <div className="text-lg font-semibold">{lang.language}</div>
                    <div className="text-2xl font-bold mt-2">{lang.securityScore}/100</div>
                    <Progress value={lang.securityScore} className="h-2 mt-2" />
                    <div className="text-sm text-muted-foreground mt-2">
                      {lang.issues} issues found
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Repository Health Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Repository Health Dashboard</CardTitle>
              <CardDescription>
                Individual repository health assessment with issues breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-125 overflow-y-auto">
                {dataFromDb.map((repo, index) => {
                  const score = advancedMetrics.healthScores[index] ?? 0
                  const issuesCount = Math.floor(Math.random() * 15) + 1
                  const securityIssues = Math.floor(issuesCount * 0.4)
                  const performanceIssues = Math.floor(issuesCount * 0.3)
                  const qualityIssues = Math.floor(issuesCount * 0.3)
                  
                  return (
                    <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          score >= 80 ? 'bg-green-500/10 dark:bg-green-500/20' :
                          score >= 60 ? 'bg-amber-500/10 dark:bg-amber-500/20' :
                          'bg-destructive/10 dark:bg-destructive/20'
                        )}>
                          <span className={cn(
                            "font-bold text-lg",
                            score >= 80 ? 'text-green-600 dark:text-green-400' :
                            score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                            'text-destructive'
                          )}>
                            {score}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{repo.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{repo.language}</Badge>
                              {repo.private ? (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Private
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Unlock className="w-3 h-3" />
                                  Public
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-destructive" />
                              <span>{securityIssues} security</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500" />
                              <span>{performanceIssues} performance</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Code className="w-3 h-3 text-blue-500" />
                              <span>{qualityIssues} quality</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {repo.auto_audit ? (
                          <Button size="sm" variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Audited
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Enable Audit
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <BarChart className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'trends' && (
        <div className="space-y-6">
          {/* Activity Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                7-Day Activity Trends
              </CardTitle>
              <CardDescription>
                Issues detected and auto-fixes applied over the last week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-75 flex items-end gap-3 pt-8">
                {trendData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-center mb-2">
                      <div className="font-bold text-lg">{day.issues}</div>
                      <div className="text-xs text-muted-foreground">issues</div>
                    </div>
                    <div className="w-full flex gap-1 justify-center">
                      <div 
                        className="flex-1 bg-destructive rounded-t-lg transition-all hover:bg-destructive/80"
                        style={{ height: `${day.issues * 10}px` }}
                        title={`${day.issues} issues detected`}
                      />
                      <div 
                        className="flex-1 bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
                        style={{ height: `${day.autoFixes * 8}px` }}
                        title={`${day.autoFixes} auto-fixes applied`}
                      />
                    </div>
                    <div className="text-xs mt-2">{day.date}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive"></div>
                  <span>Issues Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>Auto-Fixes Applied</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                AI-Generated Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Based on your current repository analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Critical Security Alert
                  </h4>
                  <p className="text-sm mt-1">
                    {advancedMetrics.criticalIssues} critical security vulnerabilities detected across {
                      advancedMetrics.totalRepos
                    } repositories. Immediate attention required for SQL Injection and Missing Authentication issues.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="destructive">
                      <Shield className="w-3 h-3 mr-1" />
                      View Critical Issues
                    </Button>
                    <Button size="sm" variant="outline">
                      Generate Fix PR
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Performance Optimization
                  </h4>
                  <p className="text-sm mt-1">
                    {advancedMetrics.issuesByType.performance} performance issues detected. Top offenders: 
                    nested loops in JavaScript files and unoptimized database queries in Python services.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 gap-1">
                    <Zap className="w-3 h-3" />
                    Optimize Performance
                  </Button>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/30 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Success Metrics
                  </h4>
                  <p className="text-sm mt-1">
                    Auto-fix system successfully resolved {advancedMetrics.autoFixStats.successfulFixes} issues with {
                      advancedMetrics.autoFixStats.successRate
                    }% success rate. {advancedMetrics.auditCoverage}% audit coverage achieved.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <GitPullRequest className="w-3 h-3" />
                      <span>{advancedMetrics.autoFixStats.totalAutoFixes} auto-fixes attempted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>{advancedMetrics.autoAuditEnabled} repos protected</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/30 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    AI Analysis Insights
                  </h4>
                  <p className="text-sm mt-1">
                    Language analysis shows JavaScript has the highest issue density ({advancedMetrics.topLanguagesWithIssues[0]?.issues} issues). 
                    Go repositories have the best security score ({advancedMetrics.topLanguagesWithIssues[4]?.securityScore}/100).
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 gap-1">
                    <BarChart className="w-3 h-3" />
                    View Language Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export & Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()} • Data refreshed every 30 minutes
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button variant="outline" size="sm">
            Export PDF
          </Button>
          <Button size="sm">
            <BarChart className="w-4 h-4 mr-2" />
            Generate Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page