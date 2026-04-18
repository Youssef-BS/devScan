import { describe, it, expect } from "vitest";
import {
  calculateScore,
  calculateGrade,
  normalizeIssueType,
  normalizeSeverity,
  normalizeAgent,
} from "../queue/analysisWorker.js";

// ─── calculateScore ───────────────────────────────────────────────────────────

describe("calculateScore", () => {
  it("returns 100 when there are no issues", () => {
    expect(calculateScore([])).toBe(100);
  });

  it("deducts 10 for a CRITICAL issue", () => {
    expect(calculateScore([{ severity: "CRITICAL" }])).toBe(90);
  });

  it("deducts 5 for a HIGH issue", () => {
    expect(calculateScore([{ severity: "HIGH" }])).toBe(95);
  });

  it("deducts 2 for a MEDIUM issue", () => {
    expect(calculateScore([{ severity: "MEDIUM" }])).toBe(98);
  });

  it("deducts 1 for a LOW issue", () => {
    expect(calculateScore([{ severity: "LOW" }])).toBe(99);
  });

  it("accumulates deductions across multiple issues", () => {
    const issues = [
      { severity: "HIGH" },
      { severity: "MEDIUM" },
      { severity: "LOW" },
    ];
    expect(calculateScore(issues)).toBe(92);
  });

  it("never goes below 0", () => {
    const issues = Array.from({ length: 20 }, () => ({ severity: "CRITICAL" }));
    expect(calculateScore(issues)).toBe(0);
  });

  it("defaults unknown severity to MEDIUM (-2)", () => {
    expect(calculateScore([{ severity: "UNKNOWN" }])).toBe(98);
  });
});

// ─── calculateGrade ───────────────────────────────────────────────────────────

describe("calculateGrade", () => {
  it("returns A for score >= 90", () => {
    expect(calculateGrade(100)).toBe("A");
    expect(calculateGrade(90)).toBe("A");
  });

  it("returns B for score 80-89", () => {
    expect(calculateGrade(89)).toBe("B");
    expect(calculateGrade(80)).toBe("B");
  });

  it("returns C for score 70-79", () => {
    expect(calculateGrade(79)).toBe("C");
    expect(calculateGrade(70)).toBe("C");
  });

  it("returns D for score 60-69", () => {
    expect(calculateGrade(69)).toBe("D");
    expect(calculateGrade(60)).toBe("D");
  });

  it("returns F for score below 60", () => {
    expect(calculateGrade(59)).toBe("F");
    expect(calculateGrade(0)).toBe("F");
  });
});

// ─── normalizeIssueType ───────────────────────────────────────────────────────

describe("normalizeIssueType", () => {
  it("maps BUG correctly (case-insensitive)", () => {
    expect(normalizeIssueType("BUG")).toBe("BUG");
    expect(normalizeIssueType("bug")).toBe("BUG");
    expect(normalizeIssueType("Bug")).toBe("BUG");
  });

  it("maps VULNERABILITY correctly", () => {
    expect(normalizeIssueType("VULNERABILITY")).toBe("VULNERABILITY");
    expect(normalizeIssueType("vulnerability")).toBe("VULNERABILITY");
  });

  it("maps CODE_SMELL correctly", () => {
    expect(normalizeIssueType("CODE_SMELL")).toBe("CODE_SMELL");
  });

  it("defaults unknown type to CODE_SMELL", () => {
    expect(normalizeIssueType("unknown")).toBe("CODE_SMELL");
    expect(normalizeIssueType("")).toBe("CODE_SMELL");
  });
});

// ─── normalizeSeverity ────────────────────────────────────────────────────────

describe("normalizeSeverity", () => {
  it("maps all severity levels correctly", () => {
    expect(normalizeSeverity("LOW")).toBe("LOW");
    expect(normalizeSeverity("MEDIUM")).toBe("MEDIUM");
    expect(normalizeSeverity("HIGH")).toBe("HIGH");
    expect(normalizeSeverity("CRITICAL")).toBe("CRITICAL");
  });

  it("is case-insensitive", () => {
    expect(normalizeSeverity("low")).toBe("LOW");
    expect(normalizeSeverity("Critical")).toBe("CRITICAL");
  });

  it("defaults unknown severity to MEDIUM", () => {
    expect(normalizeSeverity("extreme")).toBe("MEDIUM");
    expect(normalizeSeverity("")).toBe("MEDIUM");
  });
});

// ─── normalizeAgent ───────────────────────────────────────────────────────────

describe("normalizeAgent", () => {
  it("maps all agent types correctly", () => {
    expect(normalizeAgent("security")).toBe("security");
    expect(normalizeAgent("performance")).toBe("performance");
    expect(normalizeAgent("clean_code")).toBe("clean_code");
    expect(normalizeAgent("bug")).toBe("bug");
  });

  it("is case-insensitive", () => {
    expect(normalizeAgent("Security")).toBe("security");
    expect(normalizeAgent("PERFORMANCE")).toBe("performance");
  });

  it("defaults unknown agent to clean_code", () => {
    expect(normalizeAgent("unknown")).toBe("clean_code");
    expect(normalizeAgent("")).toBe("clean_code");
  });
});
