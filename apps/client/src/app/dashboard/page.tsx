"use client"

import React, { useState, useEffect } from "react";
import { Search, ListFilterPlus, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IntroDashboard from "@/components/intro-dashboard";
import { useRepoStore } from "@/store/useRepoStore";
import SpinnerLoad from "@/components/Spinner" ;
import { Button } from "@/components/ui/button";
import { saveReposInDB } from "@/lib/api/github";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";  
import SonnerAlert from "@/components/SonnerAlert";
import RepoCard from "@/components/cards/RepoCard";


const Dashboard = () => {
  const router = useRouter();

  const [currentPath, setCurrentPath] = useState<string>("repositories");
  const [search, setSearch] = useState<string>("");
  const [language, setLanguage] = useState<string>("all");
  const [isDownloading, setIsDownloading] = useState(false);

  const { repos, toggleAutoAudit, setSearch: setStoreSearch, setLanguage: setStoreLanguage , fetchRepos , loading , page , totalPages , saveRepo } = useRepoStore();
  const setRepo = useRepoStore((state) => state.setRepos);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await saveReposInDB();
      await fetchRepos();
      toast.success(`Downloaded ${result.count} repositories successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download repositories');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(()=> {
    fetchRepos() ;
  } , [setRepo])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const homeType = params.get("homeType");
    const searchParam = params.get("search");
    const languageParam = params.get("language");

    if (homeType === "repositories" || homeType === "analytics") {
      setCurrentPath(homeType);
    }

    if (searchParam) {
      setSearch(searchParam);
      setStoreSearch(searchParam);
    }

    if (languageParam) {
      setLanguage(languageParam);
      setStoreLanguage(languageParam);
    }
  }, [setStoreSearch, setStoreLanguage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (search) params.set("search", search);
      else params.delete("search");

      router.replace(`?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, router]);

  const changePath = (path: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("homeType", path);
    router.push(`?${params.toString()}`);
    setCurrentPath(path);

    if (path === "analytics") {
      setSearch("");
      setLanguage("all");
      setStoreSearch("");
      setStoreLanguage("all");
    }
  };

  const onLanguageChange = (value: string) => {
    setLanguage(value);
    setStoreLanguage(value);

    const params = new URLSearchParams(window.location.search);
    params.set("language", value);
    router.replace(`?${params.toString()}`);
  };
  const filteredRepos = repos.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase());
    const matchesLanguage =
      language === "all" || repo.language.toLowerCase() === language.toLowerCase();
    return matchesSearch && matchesLanguage;
  });

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
              onChange={(e) => {
                setSearch(e.target.value);
                setStoreSearch(e.target.value);
              }}
            />
            <div className="mx-4 h-6 w-px bg-gray-300" />
            <ListFilterPlus className="text-gray-500 mr-2 shrink-0" />
            <Select value={language} defaultValue="all" onValueChange={onLanguageChange}>
              <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="ts">TypeScript</SelectItem>
              <SelectItem value="java">Java</SelectItem>
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
            {isDownloading ? 'Downloading...' : 'Download/update All Repository'}
          </Button>
        </div>
      </section>

{loading ? (
  <SpinnerLoad />
) : (
  <>
    <section className="flex flex-wrap gap-5 m-16 justify-items-start">
      
      {filteredRepos.map((repo) => (
        <RepoCard
          key={repo.full_name}
          repo={repo}
          toggleAutoAudit={toggleAutoAudit}
          addToCheck={()=>saveRepo(repo)}
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
              onClick={() => page < totalPages && fetchRepos(page + 1)}
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