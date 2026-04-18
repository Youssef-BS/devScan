"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

const tabs = [
  { label: "All Repositories", type: "repositories", path: "/dashboard" },
  { label: "Audit Queue", type: "checking", path: "/dashboard/toCheck" },
  { label: "Analytics", type: "analytics", path: "/dashboard/analytics" },
];

const IntroDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeType = searchParams.get("homeType") || "repositories";

  return (
    <div className="border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="pt-8 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your Repositories
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and audit your code automatically
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0">
          {tabs.map(({ label, type, path }) => {
            const active = homeType === type;
            return (
              <button
                key={type}
                onClick={() => router.push(`${path}?homeType=${type}`)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntroDashboard;
