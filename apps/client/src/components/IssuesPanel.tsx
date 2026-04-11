"use client";

import React, { useState } from "react";
import { Shield, Zap, Code2, Bug, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import { AnalysisResult, ScanIssue } from "@/types/AnalyseResult";
import ApplyFixModal from "./ApplyFixModal";

// ─── Helpers ──────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  CRITICAL: { label: "Critical", bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    dot: "bg-red-500"    },
  HIGH:     { label: "High",     bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-500" },
  MEDIUM:   { label: "Medium",   bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", dot: "bg-yellow-500" },
  LOW:      { label: "Low",      bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300",   dot: "bg-blue-400"   },
} as const;

const AGENT_CONFIG = {
  security:    { label: "Security",    icon: Shield, color: "text-red-500"    },
  performance: { label: "Performance", icon: Zap,    color: "text-yellow-500" },
  clean_code:  { label: "Clean Code",  icon: Code2,  color: "text-blue-500"   },
  bug:         { label: "Bug",         icon: Bug,    color: "text-purple-500" },
} as const;

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-600 bg-green-50 border-green-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-yellow-600 bg-yellow-50 border-yellow-200",
  D: "text-orange-600 bg-orange-50 border-orange-200",
  F: "text-red-600 bg-red-50 border-red-200",
};

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function sortIssues(issues: ScanIssue[]): ScanIssue[] {
  return [...issues].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

// ─── Issue Card ───────────────────────────────────────────────────────────

function IssueCard({
  issue,
  repoGithubId,
}: {
  issue: ScanIssue;
  repoGithubId?: string;
}) {
  const [expanded, setExpanded]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  const sev   = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.MEDIUM;
  const agent = AGENT_CONFIG[issue.agent]        ?? AGENT_CONFIG.clean_code;
  const AgentIcon = agent.icon;

  return (
    <>
      <div className={`rounded-xl border ${sev.border} bg-white shadow-sm overflow-hidden`}>
        {/* Header row */}
        <div
          className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Severity dot */}
          <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${sev.dot}`} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Severity badge */}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
                {sev.label}
              </span>
              {/* Agent badge */}
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <AgentIcon className={`w-3.5 h-3.5 ${agent.color}`} />
                {agent.label}
              </span>
              {/* Type badge */}
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {issue.type.replace("_", " ")}
              </span>
            </div>
            <p className="font-medium text-gray-800 text-sm leading-snug">{issue.title}</p>
            {issue.filePath && issue.filePath !== "unknown" && (
              <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                {issue.filePath}
                {issue.lineStart ? `:${issue.lineStart}` : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {issue.fixedCode && repoGithubId && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                <Wrench className="w-3 h-3" />
                Apply Fix
              </button>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {issue.message && (
              <p className="text-sm text-gray-700 leading-relaxed">{issue.message}</p>
            )}
            {issue.fixedCode && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Suggested Fix
                </p>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto font-mono text-gray-800">
                  <code>{issue.fixedCode}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && issue.fixedCode && repoGithubId && (
        <ApplyFixModal
          repoGithubId={repoGithubId}
          issue={issue}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────

interface IssuesPanelProps {
  result: AnalysisResult;
  repoGithubId?: string;
  onClose?: () => void;
}

export default function IssuesPanel({ result, repoGithubId, onClose }: IssuesPanelProps) {
  const issues: ScanIssue[] = result.scan?.issues ?? [];
  const score   = result.score  ?? result.scan?.score;
  const grade   = result.grade  ?? result.scan?.grade;
  const sorted  = sortIssues(issues);

  const counts = {
    CRITICAL: issues.filter((i) => i.severity === "CRITICAL").length,
    HIGH:     issues.filter((i) => i.severity === "HIGH").length,
    MEDIUM:   issues.filter((i) => i.severity === "MEDIUM").length,
    LOW:      issues.filter((i) => i.severity === "LOW").length,
  };

  const agentCounts = {
    security:    issues.filter((i) => i.agent === "security").length,
    performance: issues.filter((i) => i.agent === "performance").length,
    clean_code:  issues.filter((i) => i.agent === "clean_code").length,
  };

  const gradeClass = grade ? (GRADE_COLOR[grade] ?? "text-gray-600 bg-gray-50 border-gray-200") : "";

  return (
    <div className="space-y-5">
      {/* ── Score / Grade header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Grade */}
        {grade && (
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 font-bold text-4xl ${gradeClass}`}>
            {grade}
          </div>
        )}

        {/* Score bar */}
        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Code Quality Score</span>
            {score !== undefined && (
              <span className="text-lg font-bold text-gray-800">{score}/100</span>
            )}
          </div>
          {score !== undefined && (
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          )}
        </div>

        {/* Severity counts */}
        <div className="flex gap-3 flex-wrap">
          {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((s) => (
            <div key={s} className={`text-center px-3 py-1.5 rounded-xl border ${SEVERITY_CONFIG[s].bg} ${SEVERITY_CONFIG[s].border}`}>
              <p className={`text-xl font-bold ${SEVERITY_CONFIG[s].text}`}>{counts[s]}</p>
              <p className={`text-xs font-medium ${SEVERITY_CONFIG[s].text}`}>{SEVERITY_CONFIG[s].label}</p>
            </div>
          ))}
        </div>

        {onClose && (
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">×</button>
        )}
      </div>

      {/* ── Agent breakdown ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {(["security", "performance", "clean_code"] as const).map((agent) => {
          const cfg  = AGENT_CONFIG[agent];
          const Icon = cfg.icon;
          return (
            <div key={agent} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Icon className={`w-5 h-5 ${cfg.color}`} />
              <div>
                <p className="text-lg font-bold text-gray-800">{agentCounts[agent]}</p>
                <p className="text-xs text-gray-500">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Issues list ───────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-green-600" />
          </div>
          <p className="font-semibold text-gray-700">No issues found</p>
          <p className="text-sm text-gray-500 mt-1">Great code quality!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-1">
            Issues ({sorted.length})
          </p>
          {sorted.map((issue) => (
            <IssueCard key={issue.id} issue={issue} repoGithubId={repoGithubId} />
          ))}
        </div>
      )}
    </div>
  );
}
