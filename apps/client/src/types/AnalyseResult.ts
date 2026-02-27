export interface AnalysisResult {
  analysis: string;
  timestamp: string;
  correctedExamples?: Array<{
    issue: number;
    code: string;
  }>;
  error?: string;
}