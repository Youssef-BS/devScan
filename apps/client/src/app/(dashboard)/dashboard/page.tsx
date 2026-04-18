"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRepoStore } from "@/store/useRepoStore";
import SpinnerLoad from "@/components/Spinner";
import { saveReposInDB } from "@/services/github.service";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import RepoCard from "@/components/cards/RepoCard";

const Dashboard = () => {
  const {
    repos,
    loading,
    page,
    totalPages,
    fetchRepos,
    setSearch,
    setLanguage,
    toggleAutoAudit,
    saveRepo,
  } = useRepoStore();

  const [search, setLocalSearch] = useState("");
  const [language, setLocalLanguage] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => { fetchRepos(1); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(search);
      fetchRepos(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const onLanguageChange = (value: string) => {
    setLocalLanguage(value);
    setLanguage(value);
    fetchRepos(1);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await saveReposInDB();
      await fetchRepos(1);
      toast.success(`Synced ${result.count} repositories`);
    } catch {
      toast.error("Failed to sync repositories");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-8">
          {/* Search + filter combo */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm">
            <Search size={15} className="shrink-0 text-gray-400" />
            <Input
              placeholder="Search repositories…"
              className="flex-1 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400"
              value={search}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <div className="h-5 w-px bg-gray-200 dark:bg-white/10 mx-1" />
            <SlidersHorizontal size={14} className="shrink-0 text-gray-400" />
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-36 p-0 h-auto text-gray-700 dark:text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Go">Go</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sync button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-white/[0.14] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={15} className={isDownloading ? "animate-spin" : ""} />
            {isDownloading ? "Syncing…" : "Sync GitHub"}
          </button>
        </div>

        {/* Repo grid */}
        {loading ? (
          <SpinnerLoad />
        ) : repos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/6 mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No repositories found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or sync your GitHub repositories.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4">
              {repos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  toggleAutoAudit={toggleAutoAudit}
                  addToCheck={() => saveRepo(repo)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious onClick={() => page > 1 && fetchRepos(page - 1)} />
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationLink
                        key={i}
                        isActive={page === i + 1}
                        onClick={() => fetchRepos(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    ))}
                    <PaginationNext onClick={() => page < totalPages && fetchRepos(page + 1)} />
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
