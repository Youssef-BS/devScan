"use client"

import { useEffect, useState } from "react"
import { getAnalytics } from "@/services/github.service"
import SpinnerLoad from "@/components/Spinner"
import {
  GitBranch, Shield, Bug, CheckCircle, AlertTriangle,
  Clock, Eye, EyeOff, Zap, Code, ShieldAlert, Activity,
  TrendingUp, Lock, Unlock, BarChart2,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsData {
  overview: {
    totalRepos: number
    privateRepos: number
    publicRepos: number
    autoAuditEnabled: number
    totalScans: number
    totalIssues: number
    openIssues: number
    fixedIssues: number
    avgScore: number | null
  }
  issuesBySeverity: { critical: number; high: number; medium: number; low: number }
  issuesByAgent: { security: number; performance: number; clean_code: number; bug: number }
  issuesByStatus: { open: number; fixed: number; confirmed: number; ignored: number }
  recentScans: Array<{
    repoName: string
    issueCount: number
    status: string
    score: number | null
    grade: string | null
    createdAt: string
  }>
  languageDistribution: Array<{ language: string; count: number; percentage: number }>
  topReposByIssues: Array<{ name: string; language: string | null; issueCount: number; score: number | null; grade: string | null }>
  topIssues: Array<{ title: string; count: number }>
}

// ── Helpers ────────────────────────────────────────────────────────────────

const SEVERITY_META = {
  critical: { label: "Critical", color: "bg-red-500", text: "text-red-600 dark:text-red-400", badge: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" },
  high:     { label: "High",     color: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  medium:   { label: "Medium",   color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  low:      { label: "Low",      color: "bg-blue-400",   text: "text-blue-600 dark:text-blue-400",     badge: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
}

const AGENT_META = {
  security:    { label: "Security",    icon: ShieldAlert, color: "text-red-500" },
  performance: { label: "Performance", icon: Zap,         color: "text-yellow-500" },
  clean_code:  { label: "Code Quality",icon: Code,        color: "text-blue-500" },
  bug:         { label: "Bugs",        icon: Bug,         color: "text-orange-500" },
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500", JavaScript: "bg-yellow-400", Python: "bg-green-500",
  Java: "bg-orange-500", Go: "bg-cyan-500", Rust: "bg-orange-700",
  "C++": "bg-pink-500", C: "bg-gray-500", Ruby: "bg-red-500", PHP: "bg-purple-500",
}

function gradeColor(grade: string | null) {
  if (!grade) return "text-gray-400"
  if (grade === "A") return "text-emerald-500"
  if (grade === "B") return "text-blue-500"
  if (grade === "C") return "text-yellow-500"
  return "text-red-500"
}

function scoreColor(score: number | null) {
  if (score === null) return "text-gray-400"
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-yellow-500"
  return "text-red-500"
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/8 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = "text-gray-500 dark:text-gray-400" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={color} />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"overview" | "issues" | "repos">("overview")

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SpinnerLoad />

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BarChart2 size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">{error ?? "No data available"}</p>
      </div>
    )
  }

  const { overview, issuesBySeverity, issuesByAgent, issuesByStatus,
          recentScans, languageDistribution, topReposByIssues, topIssues } = data

  const totalSeverity = Object.values(issuesBySeverity).reduce((a, b) => a + b, 0)
  const fixRate = overview.totalIssues > 0
    ? Math.round((overview.fixedIssues / overview.totalIssues) * 100)
    : 0
  const auditCoverage = overview.totalRepos > 0
    ? Math.round((overview.autoAuditEnabled / overview.totalRepos) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time stats from {overview.totalScans} scans across {overview.totalRepos} repositories
            </p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/8">
          {(["overview", "issues", "repos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize relative transition-colors cursor-pointer ${
                tab === t
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t === "repos" ? "Repositories" : t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-6">

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={GitBranch} label="Total Repositories" value={overview.totalRepos}
                sub={`${overview.publicRepos} public · ${overview.privateRepos} private`} />
              <StatCard icon={Bug} label="Total Issues" value={overview.totalIssues}
                sub={`${overview.openIssues} open · ${overview.fixedIssues} fixed`}
                color={overview.totalIssues > 0 ? "text-red-500" : "text-emerald-500"} />
              <StatCard icon={Shield} label="Avg Scan Score"
                value={overview.avgScore !== null ? `${overview.avgScore}/100` : "—"}
                sub={overview.totalScans > 0 ? `${overview.totalScans} scans completed` : "No scans yet"}
                color={scoreColor(overview.avgScore)} />
              <StatCard icon={CheckCircle} label="Fix Rate" value={`${fixRate}%`}
                sub={`${overview.fixedIssues} of ${overview.totalIssues} resolved`}
                color={fixRate >= 50 ? "text-emerald-500" : "text-orange-500"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Issues by severity */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-orange-500" />
                  Issues by Severity
                </h3>
                {totalSeverity === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No issues found</p>
                ) : (
                  <div className="space-y-4">
                    {(Object.entries(issuesBySeverity) as [keyof typeof SEVERITY_META, number][]).map(([key, count]) => {
                      const meta = SEVERITY_META[key]
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{meta.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                              <span className="text-xs text-gray-400">{totalSeverity > 0 ? Math.round((count / totalSeverity) * 100) : 0}%</span>
                            </div>
                          </div>
                          <Bar value={count} max={totalSeverity} color={meta.color} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Issues by agent */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity size={15} className="text-blue-500" />
                  Issues by Category
                </h3>
                {overview.totalIssues === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No issues found</p>
                ) : (
                  <div className="space-y-4">
                    {(Object.entries(issuesByAgent) as [keyof typeof AGENT_META, number][]).map(([key, count]) => {
                      const meta = AGENT_META[key]
                      const Icon = meta.icon
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Icon size={13} className={meta.color} />
                              {meta.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                              <span className="text-xs text-gray-400">{overview.totalIssues > 0 ? Math.round((count / overview.totalIssues) * 100) : 0}%</span>
                            </div>
                          </div>
                          <Bar value={count} max={overview.totalIssues} color="bg-blue-500" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Issue status breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                { key: "open",      label: "Open",      icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
                { key: "confirmed", label: "Confirmed", icon: Eye,           color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-500/10" },
                { key: "fixed",     label: "Fixed",     icon: CheckCircle,   color: "text-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                { key: "ignored",   label: "Ignored",   icon: EyeOff,        color: "text-gray-400",   bg: "bg-gray-50 dark:bg-white/5" },
              ] as const).map(({ key, label, icon: Icon, color, bg }) => (
                <div key={key} className={`rounded-xl border border-gray-200 dark:border-white/8 ${bg} p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className={color} />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {issuesByStatus[key as keyof typeof issuesByStatus]}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent scans */}
            <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                Recent Scans
              </h3>
              {recentScans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No scans yet</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/6">
                  {recentScans.map((scan, i) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                          scan.issueCount === 0
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : scan.issueCount > 10
                            ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        }`}>
                          {scan.issueCount}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{scan.repoName}</p>
                          <p className="text-xs text-gray-400">{new Date(scan.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {scan.grade && (
                          <span className={`text-lg font-bold ${gradeColor(scan.grade)}`}>{scan.grade}</span>
                        )}
                        {scan.score !== null && (
                          <span className={`text-sm font-semibold ${scoreColor(scan.score)}`}>{scan.score}/100</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          scan.status === "COMPLETED"
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : scan.status === "FAILED"
                            ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                            : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400"
                        }`}>
                          {scan.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ISSUES TAB ── */}
        {tab === "issues" && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top recurring issues */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-blue-500" />
                  Most Frequent Issues
                </h3>
                {topIssues.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No issues found</p>
                ) : (
                  <div className="space-y-3">
                    {topIssues.map((issue, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate pr-4">{issue.title}</span>
                        <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                          ×{issue.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Severity breakdown detail */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield size={15} className="text-orange-500" />
                  Severity Breakdown
                </h3>
                <div className="space-y-3">
                  {(Object.entries(issuesBySeverity) as [keyof typeof SEVERITY_META, number][]).map(([key, count]) => {
                    const meta = SEVERITY_META[key]
                    return (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/4">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${meta.color}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>
                            {totalSeverity > 0 ? Math.round((count / totalSeverity) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{overview.fixedIssues}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fixed</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 dark:bg-orange-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{overview.openIssues}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Still Open</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage + audit stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Zap} label="Auto-Audit Repos" value={overview.autoAuditEnabled}
                sub={`${auditCoverage}% of total repos`} color="text-blue-500" />
              <StatCard icon={Activity} label="Total Scans" value={overview.totalScans}
                sub="Completed audit runs" color="text-purple-500" />
              <StatCard icon={CheckCircle} label="Fix Rate" value={`${fixRate}%`}
                sub={`${overview.fixedIssues} resolved`}
                color={fixRate >= 50 ? "text-emerald-500" : "text-orange-500"} />
              <StatCard icon={Shield} label="Avg Score" value={overview.avgScore !== null ? `${overview.avgScore}` : "—"}
                sub="Average scan score" color={scoreColor(overview.avgScore)} />
            </div>
          </div>
        )}

        {/* ── REPOS TAB ── */}
        {tab === "repos" && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top repos by issue count */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bug size={15} className="text-red-500" />
                  Most Issues Found
                </h3>
                {topReposByIssues.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {topReposByIssues.map((repo, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-gray-400 w-4 shrink-0">#{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{repo.name}</p>
                            {repo.language && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${LANG_COLORS[repo.language] ?? "bg-gray-400"}`} />
                                <span className="text-xs text-gray-400">{repo.language}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {repo.grade && (
                            <span className={`text-sm font-bold ${gradeColor(repo.grade)}`}>{repo.grade}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            repo.issueCount === 0
                              ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : repo.issueCount > 10
                              ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                              : "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400"
                          }`}>
                            {repo.issueCount} issues
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Language distribution */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code size={15} className="text-purple-500" />
                  Language Distribution
                </h3>
                {languageDistribution.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {languageDistribution.slice(0, 6).map((lang) => (
                      <div key={lang.language}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${LANG_COLORS[lang.language] ?? "bg-gray-400"}`} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lang.language}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{lang.count}</span>
                            <span className="text-xs text-gray-400">{lang.percentage}%</span>
                          </div>
                        </div>
                        <Bar value={lang.count} max={languageDistribution[0].count} color={LANG_COLORS[lang.language] ?? "bg-gray-400"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Repo visibility / audit coverage */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Unlock} label="Public Repos" value={overview.publicRepos}
                sub="Open source" color="text-blue-500" />
              <StatCard icon={Lock} label="Private Repos" value={overview.privateRepos}
                sub="Private access" color="text-purple-500" />
              <StatCard icon={Zap} label="Auto-Audit On" value={overview.autoAuditEnabled}
                sub={`${auditCoverage}% coverage`} color="text-emerald-500" />
              <StatCard icon={GitBranch} label="Total Repos" value={overview.totalRepos}
                sub="In audit queue" color="text-gray-400" />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
