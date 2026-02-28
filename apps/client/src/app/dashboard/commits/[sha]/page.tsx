"use client";

import { useEffect, useState } from "react";
import { useCommitStore } from "@/store/useCommitStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AIChatbot from "@/components/AIChatbot";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import CommitFileAnalysis from "@/components/CommitFileAnalysis";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import CommitFileCard from "@/components/cards/CommitFileCard";
import { Bot , Zap  , Kanban , File , User , Clock, Files, RefreshCcwDot} from "lucide-react";
import SpinnerLoad from "@/components/Spinner";
import Overview from "../Overview";
import FileView from "../FileView";


type AnalysisMode = "individual" | "batch" | "comprehensive";
type AnalysisType = "audit" | "file_fix" | "comprehensive_review";

const CommitDetailsPage = () => {
  const { sha } = useParams<{ sha: string }>();
  const router = useRouter();
  const { commitDetails, loadCommitDetails, loading, error, clearError } = useCommitStore();
  const { analyzeCode, loading: analysisLoading, error: analysisError, result: analysisResult } = useAIAnalysis();
  const [activeTab, setActiveTab] = useState<'files' | 'overview' | 'ai'>('files');
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);
  const [codeContent, setCodeContent] = useState("");
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [fileAnalyses, setFileAnalyses] = useState<{ [key: number]: any }>({});
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("individual");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("file_fix");
  const [fullCommitAnalysis, setFullCommitAnalysis] = useState<any>(null);
  const [fullCommitAnalysisLoading, setFullCommitAnalysisLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [batchAnalysisProgress, setBatchAnalysisProgress] = useState(0);
  const [batchAnalysisResults, setBatchAnalysisResults] = useState<{ [key: number]: any }>({});
  const [allFilesToggle, setAllFilesToggle] = useState(false);

  useEffect(() => {
    if (sha) {
      console.log("Component: Loading commit details for SHA:", sha);
      loadCommitDetails(sha);
    }
    
    return () => {
      clearError();
    };
  }, [sha, loadCommitDetails, clearError]);

  useEffect(() => {
    if (commitDetails && commitDetails.files) {
      console.log(`📊 Commit Details Updated:`, {
        totalFiles: commitDetails.files.length,
        message: commitDetails.commitInfo.message,
        totalChanges: commitDetails.commitInfo.totalChanges,
        fullResponse: commitDetails
      });
      
      console.log(`All ${commitDetails.files.length} Files:`);
      commitDetails.files.forEach((file , idx) => {
        console.log(`  File ${idx + 1}/${commitDetails.files.length}: ${file.path}`, {
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          hasPatch: !!file.patch && file.patch.trim().length > 0
        });
      });
      
      const allCode = commitDetails.files
        .map((file) => {
          return `\n\n--- File: ${file.path} (${file.status}) ---\n${file.patch || '// Binary file or no diff available'}`;
        })
        .join("\n");
      setCodeContent(allCode);
    }
  }, [commitDetails]);

  const handleAnalyzeWithAI = async () => {
    if (codeContent) {
      await analyzeCode(codeContent, sha);
    }
  };

  const handleRetry = () => {
    if (sha) {
      loadCommitDetails(sha);
    }
  };

  const handleAnalyzeFile = async (fileIndex: number, filePath: string, patch: string) => {
    setActiveFileIndex(fileIndex);
    const fileContext = `File: ${filePath}\n\n${patch || '// Binary file or no diff available'}`;
    await analyzeCode(fileContext, sha, "file_fix");
    
    // Store the analysis result
    setFileAnalyses(prev => ({
      ...prev,
      [fileIndex]: analysisResult
    }));
  };

  const handleAnalyzeAllFiles = async () => {
    if (!commitDetails) return;
    
    setFullCommitAnalysisLoading(true);
    
    // Combine all files into one comprehensive context
    const allFilesContext = commitDetails.files
      .map((file, idx) => {
        return `\n${'='.repeat(80)}\nFile ${idx + 1}: ${file.path} (${file.status})\n${'-'.repeat(80)}\nAdditions: +${file.additions} | Deletions: -${file.deletions} | Changes: ${file.changes}\n${'-'.repeat(80)}\n${file.patch || '// Binary file or no diff available'}`;
      })
      .join("\n");
    
    const commitContext = `Commit: ${commitDetails.commitInfo.message}
Author: ${commitDetails.commitInfo.author}
Date: ${commitDetails.commitInfo.date}
Total Files Changed: ${commitDetails.files.length}
Total Additions: +${commitDetails.files.reduce((sum, f) => sum + f.additions, 0)}
Total Deletions: -${commitDetails.files.reduce((sum, f) => sum + f.deletions, 0)}

Analysis: Please review all these files together and identify any issues across the entire commit, including integration issues between files.
${allFilesContext}`;
    
    await analyzeCode(commitContext, sha, "commit");
    setFullCommitAnalysis(analysisResult);
    setFullCommitAnalysisLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPatch = (patch: string) => {
    if (!patch) return null;
    
    // Check if it's a binary/non-diff file notice
    if (patch.startsWith('//') && patch.includes('Binary')) {
      return (
        <div className="p-8 text-center text-yellow-600 bg-yellow-50">
          <svg className="w-12 h-12 mx-auto text-yellow-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4v2m0 6v2M9 3h6m0 0a9 9 0 019 9H0a9 9 0 019-9zm0 0V1m0 18a9 9 0 01-9-9m9 9v2m0-6V9m-6 0h6m-6 0V3" />
          </svg>
          <p className="font-semibold">{patch.split('\n')[2]}</p>
          <p className="text-sm mt-2">This file cannot be displayed as a text diff</p>
        </div>
      );
    }
    
    return patch.split('\n').map((line, index) => {
      let bgColor = 'bg-transparent';
      let textColor = 'text-gray-800';
      let prefix = '';
      
      if (line.startsWith('+')) {
        bgColor = 'bg-green-50';
        textColor = 'text-green-700';
        prefix = '+';
      } else if (line.startsWith('-')) {
        bgColor = 'bg-red-50';
        textColor = 'text-red-700';
        prefix = '-';
      } else if (line.startsWith('@@')) {
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-700';
        prefix = '@@';
      } else if (line.startsWith('diff')) {
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-600';
      } else if (line.startsWith('index')) {
        bgColor = 'bg-gray-50';
        textColor = 'text-gray-500';
      } else if (line.startsWith('//')) {
        bgColor = 'bg-purple-50';
        textColor = 'text-purple-700';
      }
      
      return (
        <div key={index} className={`${bgColor} ${textColor} px-4 py-1 font-mono text-sm`}>
          <span className="inline-block w-8 text-gray-400 text-right pr-2 select-none">
            {index + 1}
          </span>
          {prefix && <span className="inline-block w-4 text-center">{prefix}</span>}
          <span className="pl-2">{line}</span>
        </div>
      );
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center text-red-600 mb-4">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold">Error Loading Commit</h2>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <p className="text-red-700 mb-2">
              <span className="font-medium">SHA:</span>{' '}
              <code className="bg-red-100 px-2 py-1 rounded text-sm">{sha}</code>
            </p>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <RefreshCcwDot /> Retry Loading
            </button>
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!commitDetails) return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500 text-lg">No commit data available.</p>
      </div>
    </div>
  );

  const totalAdditions = commitDetails.files.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = commitDetails.files.reduce((sum, file) => sum + file.deletions, 0);
  const addedFiles = commitDetails.files.filter(f => f.status === 'added').length;
  const modifiedFiles = commitDetails.files.filter(f => f.status === 'modified').length;
  const removedFiles = commitDetails.files.filter(f => f.status === 'removed').length;

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-gray-100/50 to-gray-200/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-gray-100/50 to-gray-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-all mb-6 border border-gray-300 hover:border-gray-400"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Repositories
            </Link>

            <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4 wrap-break-word">
                    {commitDetails.commitInfo.message}
                  </h1>
                  
                  <div className="flex flex-wrap gap-6 text-gray-600">
                    <div className="flex items-center gap-2 hover:text-gray-800 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Author</p>
                        <p className="font-semibold text-white">{commitDetails.commitInfo.author}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 hover:text-gray-800 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                        <p className="font-semibold text-gray-800">{formatDate(commitDetails.commitInfo.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Commit SHA</p>
                  <code className="bg-gray-100 px-4 py-2 rounded-lg text-mono text-sm font-semibold text-gray-800 border border-gray-300 font-mono break-all text-right">
                    {sha.substring(0, 12)}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Files Changed</p>
                  <p className="text-3xl font-bold text-gray-800">{commitDetails.files.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Additions</p>
                  <p className="text-3xl font-bold text-gray-800">+{totalAdditions}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Deletions</p>
                  <p className="text-3xl font-bold text-gray-800">-{totalDeletions}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Net Change</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalAdditions - totalDeletions > 0 ? '+' : ''}{totalAdditions - totalDeletions}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 p-4 shadow-md">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <nav className="flex gap-1">
                  {['files', 'overview', 'ai'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 text-sm md:text-base ${
                        activeTab === tab
                          ? 'bg-gray-800 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {tab === 'files' && (
                        <>
                          <span><File /></span>
                          Files ({commitDetails.files.length})
                        </>
                      )}
                      {tab === 'overview' && (
                        <>
                          <span><Kanban /></span>
                          Overview
                        </>
                      )}
                      {tab === 'ai' && (
                        <>
                          <span><Zap /></span>
                          AI Analysis
                        </>
                      )}
                    </button>
                  ))}
                </nav>

                {activeTab === 'files' && (
                  <button
                    onClick={handleAnalyzeAllFiles}
                    disabled={fullCommitAnalysisLoading}
                    className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {fullCommitAnalysisLoading ? (
                      <>
                        <SpinnerLoad />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span><Files /></span>
                        Analyze All Files
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'files' ? (
           <FileView
  files={commitDetails.files}
  addedFiles={addedFiles}
  modifiedFiles={modifiedFiles}
  removedFiles={removedFiles}
  activeFileIndex={activeFileIndex}
  analysisLoading={analysisLoading}
  analysisResult={analysisResult}
  fullCommitAnalysis={fullCommitAnalysis}
  setFullCommitAnalysis={setFullCommitAnalysis}
  handleAnalyzeFile={handleAnalyzeFile}
  renderPatch={renderPatch}
/>
        ) : activeTab === 'overview' ? (
          <Overview addedFiles={addedFiles} modifiedFiles={modifiedFiles} removedFiles={removedFiles} totalAdditions={totalAdditions} totalDeletions={totalDeletions} commitDetails={commitDetails} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
            <AIAnalysisPanel
              analysis={analysisResult?.analysis || ""}
              correctedExamples={analysisResult?.correctedExamples || []}
              loading={analysisLoading}
              error={analysisError}
              onAnalyzeClick={handleAnalyzeWithAI}
            />
            <AIChatbot
              codeContext={codeContent}
              isOpen={isChatbotOpen}
              onClose={() => setIsChatbotOpen(false)}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CommitDetailsPage;