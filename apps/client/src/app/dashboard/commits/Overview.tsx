"use client"

const Overview = ({ addedFiles, modifiedFiles, removedFiles, totalAdditions, totalDeletions, commitDetails } : any) => {
  return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Code Changes</h3>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v14a2 2 0 11-4 0V4z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Total Files</span>
                    <span className="text-2xl font-bold text-gray-800">{commitDetails.files.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Lines Added</span>
                    <span className="text-2xl font-bold text-gray-800">+{totalAdditions}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Lines Removed</span>
                    <span className="text-2xl font-bold text-gray-800">-{totalDeletions}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Net Change</span>
                    <span className="text-2xl font-bold text-gray-800">
                      {totalAdditions - totalDeletions > 0 ? '+' : ''}{totalAdditions - totalDeletions}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">File Statistics</h3>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Added Files</span>
                    <span className="text-2xl font-bold text-gray-800">+{addedFiles}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Modified Files</span>
                    <span className="text-2xl font-bold text-gray-800">~{modifiedFiles}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Removed Files</span>
                    <span className="text-2xl font-bold text-gray-800">-{removedFiles}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-gray-600">Change Density</span>
                    <span className="text-2xl font-bold text-gray-800">{commitDetails.files.length > 0 ? ((totalAdditions + totalDeletions) / commitDetails.files.length).toFixed(1) : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default Overview
