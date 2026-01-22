"use client"

import React, { useState, useEffect } from "react";
import { Search, ListFilterPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IntroDashboard from "@/components/intro-dashboard";
import { useRepoStore } from "@/store/useRepoStore";

const Dashboard = () => {
  const router = useRouter();

  const [currentPath, setCurrentPath] = useState<string>("repositories");
  const [search, setSearch] = useState<string>("");
  const [language, setLanguage] = useState<string>("all");

  const { repos, toggleAutoAudit, setSearch: setStoreSearch, setLanguage: setStoreLanguage } = useRepoStore();
  const setRepo = useRepoStore((state) => state.setRepos);

  useEffect(()=> {
    setRepo(repos);
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
      <IntroDashboard path={currentPath} changePath={changePath} />

      <section className="mx-16 my-8">
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
            <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-[160px]">
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
      </section>

      <section className="flex flex-wrap gap-5 m-16 justify-items-start">
        {filteredRepos.map((repo, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 basis-[31%] min-h-[220px] hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 16 16"
                  className="w-5 h-5 text-gray-700"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v11a.5.5 0 0 1-.757.429L8 11.101l-5.243 2.828A.5.5 0 0 1 2 13.5v-11Z" />
                </svg>
                <h2 className="font-semibold text-base">{repo.name}</h2>
              </div>

              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={repo.auto_audit}
                  onChange={() => toggleAutoAudit(repo.name)}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{repo.description}</p>

            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1 text-red-600">
                <span className="font-medium">{repo.issues}</span>
                <span className="text-gray-500">issues found</span>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <span>Last scan: {repo.lastScan}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <span
                className={`w-2 h-2 rounded-full ${
                  repo.language === "JavaScript"
                    ? "bg-yellow-400"
                    : repo.language === "TypeScript"
                    ? "bg-blue-500"
                    : repo.language === "Java"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              />
              <span className="text-sm text-gray-600">{repo.language}</span>
            </div>
          </div>
        ))}
      </section>
    </React.Fragment>
  );
};

export default Dashboard;
