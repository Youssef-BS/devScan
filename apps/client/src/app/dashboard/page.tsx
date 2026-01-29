"use client";

import React, { useEffect, useState } from "react";
import { Search, ListFilterPlus, Download } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { saveReposInDB } from "@/lib/api/github";
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

  useEffect(() => {
    fetchRepos(1);
  }, []);

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
      toast.success(`Downloaded ${result.count} repositories successfully`);
    } catch (e) {
      toast.error("Failed to download repositories");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <React.Fragment>
      <section className="mx-16 my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center w-full rounded-2xl bg-gray-100 px-4 py-2">
            <Search className="text-gray-400 mr-3 shrink-0" />
            <Input
              placeholder="Search repositories..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
              value={search}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <div className="mx-4 h-6 w-px bg-gray-300" />
            <ListFilterPlus className="text-gray-500 mr-2 shrink-0" />
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="ml-4 flex items-center gap-2"
            variant="outline"
          >
            <Download size={18} />
            {isDownloading ? "Downloading..." : "Download / Update All"}
          </Button>
        </div>
      </section>

      {loading ? (
        <SpinnerLoad />
      ) : (
        <>
          <section className="flex flex-wrap gap-5 m-16">
            {repos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                toggleAutoAudit={toggleAutoAudit}
                addToCheck={() => saveRepo(repo)}
              />
            ))}
          </section>

          {totalPages > 1 && (
            <div className="mb-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() => page > 1 && fetchRepos(page - 1)}
                  />

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationLink
                      key={i}
                      isActive={page === i + 1}
                      onClick={() => fetchRepos(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  ))}

                  <PaginationNext
                    onClick={() =>
                      page < totalPages && fetchRepos(page + 1)
                    }
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default Dashboard;
