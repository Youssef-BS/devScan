import { prisma } from "../db.js";
import type {
  Scan,
  Issue,
  ScanStatus,
  IssueType,
  Severity,
  IssueStatus,
  AgentType,
} from "../../prisma/generated/client.js";

// prisma is imported from db.js

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

export interface IssueData {
  title: string;
  message?: string;
  type: IssueType;
  severity: Severity;
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  effort?: string;
  tags?: string[];
  agent: AgentType;
  confidence?: number;
  rawAI?: any;
}

/**
 * Create a new scan for a repository and commit
 */
export async function createScan(
  repoId: number,
  commitId: number,
  status: ScanStatus = "PENDING"
): Promise<Scan> {
  try {
    const scan = await prisma.scan.create({
      data: {
        repoId,
        commitId,
        status,
      },
    });
    return scan;
  } catch (error) {
    throw new Error(`Failed to create scan: ${error}`);
  }
}

/**
 * Update scan status and results
 */
export async function updateScan(
  scanId: number,
  data: {
    status?: ScanStatus;
    score?: number;
    grade?: string;
  }
): Promise<Scan> {
  try {
    const scan = await prisma.scan.update({
      where: { id: scanId },
      data,
    });
    return scan;
  } catch (error) {
    throw new Error(`Failed to update scan ${scanId}: ${error}`);
  }
}

/**
 * Save issues from analysis results
 */
export async function saveIssues(
  scanId: number,
  commitId: number,
  issues: IssueData[]
): Promise<Issue[]> {
  try {
    const savedIssues = await Promise.all(
      issues.map((issue) =>
        prisma.issue.create({
          data: {
            ...issue,
            scanId,
            commitId,
          },
        })
      )
    );
    return savedIssues;
  } catch (error) {
    throw new Error(`Failed to save issues: ${error}`);
  }
}

/**
 * Get a single scan with its issues
 */
export async function getScanWithIssues(scanId: number) {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        issues: true,
        Repo: {
          select: {
            id: true,
            name: true,
            fullName: true,
          },
        },
        Commit: {
          select: {
            id: true,
            sha: true,
            message: true,
            author: true,
            date: true,
          },
        },
      },
    });
    return scan;
  } catch (error) {
    throw new Error(`Failed to get scan ${scanId}: ${error}`);
  }
}

/**
 * Get all scans for a repository
 */
export async function getRepoScans(repoId: number, limit = 50) {
  try {
    const scans = await prisma.scan.findMany({
      where: { repoId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        Commit: {
          select: {
            sha: true,
            message: true,
            date: true,
          },
        },
        _count: {
          select: { issues: true },
        },
      },
    });
    return scans;
  } catch (error) {
    throw new Error(`Failed to get repo scans: ${error}`);
  }
}

/**
 * Get all issues for a scan
 */
export async function getScanIssues(
  scanId: number,
  filters?: {
    severity?: Severity;
    type?: IssueType;
    status?: IssueStatus;
  }
) {
  try {
    const where: any = { scanId };
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { severity: "desc" },
    });
    return issues;
  } catch (error) {
    throw new Error(`Failed to get scan issues: ${error}`);
  }
}

/**
 * Get issue statistics for a scan
 */
export async function getIssueStats(scanId: number) {
  try {
    const issues = await prisma.issue.findMany({
      where: { scanId },
    });

    const stats = {
      total: issues.length,
      bySeverity: {
        CRITICAL: issues.filter((i: Issue) => i.severity === "CRITICAL").length,
        HIGH: issues.filter((i: Issue) => i.severity === "HIGH").length,
        MEDIUM: issues.filter((i: Issue) => i.severity === "MEDIUM").length,
        LOW: issues.filter((i: Issue) => i.severity === "LOW").length,
      },
      byType: {
        BUG: issues.filter((i: Issue) => i.type === "BUG").length,
        VULNERABILITY: issues.filter((i: Issue) => i.type === "VULNERABILITY").length,
        CODE_SMELL: issues.filter((i: Issue) => i.type === "CODE_SMELL").length,
      },
      byStatus: {
        OPEN: issues.filter((i: Issue) => i.status === "OPEN").length,
        CONFIRMED: issues.filter((i: Issue) => i.status === "CONFIRMED").length,
        FIXED: issues.filter((i: Issue) => i.status === "FIXED").length,
        IGNORED: issues.filter((i: Issue) => i.status === "IGNORED").length,
      },
    };

    return stats;
  } catch (error) {
    throw new Error(`Failed to get issue stats: ${error}`);
  }
}

/**
 * Update issue status
 */
export async function updateIssueStatus(
  issueId: number,
  status: IssueStatus
): Promise<Issue> {
  try {
    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { status },
    });
    return issue;
  } catch (error) {
    throw new Error(`Failed to update issue ${issueId}: ${error}`);
  }
}

/**
 * Mark issue as false positive
 */
export async function markFalsePositive(issueId: number): Promise<Issue> {
  try {
    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        isFalsePositive: true,
        status: "IGNORED",
      },
    });
    return issue;
  } catch (error) {
    throw new Error(`Failed to mark issue as false positive: ${error}`);
  }
}

/**
 * Delete a scan and its associated issues
 */
export async function deleteScan(scanId: number): Promise<void> {
  try {
    await prisma.scan.delete({
      where: { id: scanId },
    });
  } catch (error) {
    throw new Error(`Failed to delete scan: ${error}`);
  }
}

export default {
  createScan,
  updateScan,
  saveIssues,
  getScanWithIssues,
  getRepoScans,
  getScanIssues,
  getIssueStats,
  updateIssueStatus,
  markFalsePositive,
  deleteScan,
};
