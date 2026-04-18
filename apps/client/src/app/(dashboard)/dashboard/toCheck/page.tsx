"use client"

import { useEffect } from "react"
import { useRepoStore } from "@/store/useRepoStore"
import RepoCard from "@/components/cards/RepoCard"
import SpinnerLoad from "@/components/Spinner"
import { GitBranch, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Page = () => {
  const { deleteAllRepos, getFromDb, toggleAutoAudit, saveRepo, loading, dataFromDb } = useRepoStore()

  useEffect(() => { getFromDb() }, [getFromDb])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Audit Queue
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {dataFromDb.length} {dataFromDb.length === 1 ? "repository" : "repositories"} queued for review
            </p>
          </div>

          {dataFromDb.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                  <Trash2 size={14} />
                  Clear queue
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear the audit queue?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all repositories from your queue. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAllRepos}
                    className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  >
                    Clear queue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <SpinnerLoad />
        ) : dataFromDb.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {dataFromDb.map((repo, index) => (
              <RepoCard
                key={index}
                repo={repo}
                toggleAutoAudit={toggleAutoAudit}
                addToCheck={() => saveRepo(repo)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/6 mb-4">
              <GitBranch size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Queue is empty
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add repositories from the All Repositories tab to start auditing.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
