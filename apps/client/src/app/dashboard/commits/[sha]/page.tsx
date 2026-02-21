"use client";

import { useEffect, useState } from "react";
import { useCommitStore } from "@/store/useCommitStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AIChatbot from "@/components/AIChatbot";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import CommitFileAnalysis from "@/components/CommitFileAnalysis";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";

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
  const [analysisType, setAnalysisType] = useState<"audit" | "file_fix">("file_fix");
  const [fullCommitAnalysis, setFullCommitAnalysis] = useState<any>(null);
  const [fullCommitAnalysisLoading, setFullCommitAnalysisLoading] = useState(false);

  useEffect(() => {
    if (sha) {
      console.log("Component: Loading commit details for SHA:", sha);
      loadCommitDetails(sha);
    }
    
    return () => {
      clearError();
    };
  }, [sha, loadCommitDetails, clearError]);

  // Prepare code content for AI analysis
  useEffect(() => {
    if (commitDetails && commitDetails.files) {
      console.log(`📊 Commit Details Updated:`, {
        files: commitDetails.files.length,
        message: commitDetails.commitInfo.message,
        totalChanges: commitDetails.commitInfo.totalChanges
      });
      
      commitDetails.files.forEach((file, idx) => {
        console.log(`  File ${idx + 1}: ${file.path}`, {
          status: file.status,
          changes: `+${file.additions} -${file.deletions}`,
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
              🔄 Retry Loading
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Repositories
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {commitDetails.commitInfo.message}
                </h1>
                <div className="flex items-center flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{commitDetails.commitInfo.author}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{formatDate(commitDetails.commitInfo.date)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-700">
                  {sha.substring(0, 8)}
                </code>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{commitDetails.files.length}</div>
                <div className="text-sm text-blue-600">Files Changed</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">+{totalAdditions}</div>
                <div className="text-sm text-green-600">Additions</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">-{totalDeletions}</div>
                <div className="text-sm text-red-600">Deletions</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">{totalAdditions + totalDeletions}</div>
                <div className="text-sm text-purple-600">Total Changes</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {addedFiles > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  +{addedFiles} added
                </span>
              )}
              {modifiedFiles > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  ~{modifiedFiles} modified
                </span>
              )}
              {removedFiles > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  -{removedFiles} removed
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="border-b border-gray-200 flex justify-between items-center">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('files')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Files Changed ({commitDetails.files.length})
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'ai'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>⚡</span> AI Analysis
              </button>
            </nav>
            
            {activeTab === 'files' && (
              <button
                onClick={handleAnalyzeAllFiles}
                disabled={fullCommitAnalysisLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap font-medium"
              >
                {fullCommitAnalysisLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Analyze All Files
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {activeTab === 'files' ? (
          <div className="space-y-4">
            {fullCommitAnalysis && (
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">📊 Full Commit Analysis</h3>
                      <p className="text-sm text-blue-100">Comprehensive review of all {commitDetails.files.length} files</p>
                    </div>
                    <button
                      onClick={() => setFullCommitAnalysis(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {fullCommitAnalysis.analysis || "Analyzing..."}
                  </div>
                </div>
              </div>
            )}
            
            {commitDetails.files.map((file, index) => (
              <div
                key={`${file.sha}-${file.path}-${index}`}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                <div className="border-b px-6 py-4 flex items-center justify-between bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        file.status === 'added' ? 'bg-green-100 text-green-800' :
                        file.status === 'removed' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {file.status.toUpperCase()}
                      </span>
                      <code className="font-mono text-sm text-gray-900 truncate" title={file.path}>
                        {file.path}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="text-green-600 font-medium">+{file.additions}</span>
                      <span className="text-red-600 font-medium">-{file.deletions}</span>
                      <span>{file.changes} changes</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAnalyzeFile(index, file.path, file.patch)}
                    disabled={analysisLoading && activeFileIndex === index}
                    className="ml-4 px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {analysisLoading && activeFileIndex === index ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        Analyze & Fix
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {file.patch && file.patch.trim() ? (
                    <div className="divide-y divide-gray-100">
                      {renderPatch(file.patch)}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-600 bg-gray-50">
                      <pre className="text-xs text-left bg-gray-100 p-3 rounded overflow-x-auto">
                        {file.patch || '// No patch data available - you can still analyze with AI'}
                      </pre>
                      <button
                        onClick={() => handleAnalyzeFile(index, file.path, file.patch || '')}
                        className="mt-3 px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                      >
                        🤖 Analyze This File
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Analysis for this file */}
                {activeFileIndex === index && analysisResult && (
                  <div className="border-t bg-gray-50 p-4">
                    <CommitFileAnalysis
                      fileName={file.path}
                      analysis={analysisResult.analysis || ""}
                      loading={analysisLoading && activeFileIndex === index}
                      onClose={() => {
                        setActiveFileIndex(null);
                        setFileAnalyses(prev => {
                          const newAnalyses = { ...prev };
                          delete newAnalyses[index];
                          return newAnalyses;
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : activeTab === 'overview' ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commit Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Statistics</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Files</span>
                    <span className="font-medium">{commitDetails.files.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Lines Added</span>
                    <span className="font-medium text-green-600">+{totalAdditions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Lines Removed</span>
                    <span className="font-medium text-red-600">-{totalDeletions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Net Change</span>
                    <span className="font-medium">{totalAdditions - totalDeletions > 0 ? '+' : ''}{totalAdditions - totalDeletions}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">File Types</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Added Files</span>
                    <span className="font-medium text-green-600">{addedFiles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Modified Files</span>
                    <span className="font-medium text-blue-600">{modifiedFiles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Removed Files</span>
                    <span className="font-medium text-red-600">{removedFiles}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AIAnalysisPanel
              analysis={analysisResult?.analysis || ""}
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
  );
};

export default CommitDetailsPage;