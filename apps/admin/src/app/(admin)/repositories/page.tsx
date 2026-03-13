"use client";

import { useEffect, useState } from "react";
import { useRepoStore } from "@/store/repo.store";
import RepoCard from "./card/RepositoriesCard";
import SpinnerLoad from "@/components/Spinner";
import { Github, Search, Filter, Grid3x3, List } from "lucide-react";

export default function AdminReposPage() {
  const { repos, fetchRepos, loading } = useRepoStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const languages = ["all", ...new Set(repos?.map(repo => repo.language).filter(Boolean))];
  const filteredRepos = repos?.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === "all" || repo.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <SpinnerLoad />
          <p className="text-gray-500 animate-pulse">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 rounded-xl">
                <Github size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
                <p className="text-sm text-gray-500">Manage and monitor all repositories</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 border border-gray-200">
                Total: {filteredRepos?.length || 0}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 appearance-none cursor-pointer"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang === "all" ? "All Languages" : lang}
                    </option>
                  ))}
                </select>
                <Filter size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" 
                      ? "bg-gray-900 text-white" 
                      : "bg-white text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" 
                      ? "bg-gray-900 text-white" 
                      : "bg-white text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRepos && filteredRepos.length > 0 ? (
          <div className={
            viewMode === "grid" 
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }>
            {filteredRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <Github size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-500">
              {searchTerm || filterLanguage !== "all" 
                ? "Try adjusting your search or filters" 
                : "No repositories available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}