"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const IntroDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // active tab from URL
  const homeType = searchParams.get("homeType") || "repositories";

  const goTo = (type: string, path = "/dashboard") => {
    router.push(`${path}?homeType=${type}`);
  };

  return (
    <>
      {/* Header */}
      <section className="m-12 flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div>
          <h1 className="text-4xl font-bold">Your Repositories</h1>
          <p className="pt-2.5 text-gray-500">
            Monitor and audit your code automatically
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/add-repository")}
          className="flex items-center gap-2 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 px-4 py-2 text-white hover:opacity-90"
        >
          <Plus />
          <span className="font-medium">Add Repository</span>
        </button>
      </section>

      {/* Filters */}
      <section className="mx-1 mb-4 flex justify-center lg:mx-12 lg:justify-start">
        <div className="flex w-fit gap-1.5 rounded-2xl bg-gray-200 p-1">
          <button
            className={`px-11 py-1 rounded-xl font-semibold transition
              ${homeType === "repositories" ? "bg-white" : "hover:bg-gray-100"}
            `}
            onClick={() => goTo("repositories")}
          >
           All my github Repositories
          </button>

          <button
            className={`px-11 py-1 rounded-xl font-semibold transition
              ${homeType === "checking" ? "bg-white" : "hover:bg-gray-100"}
            `}
            onClick={() => goTo("checking", "/dashboard/toCheck")}
          >
            Repositories for checking
          </button>

          <button
            className={`px-11 py-1 rounded-xl font-semibold transition
              ${homeType === "analytics" ? "bg-white" : "hover:bg-gray-100"}
            `}
            onClick={() => goTo("analytics", "/dashboard/analytics")}
          >
            Analytics
          </button>
        </div>
      </section>
    </>
  );
};

export default IntroDashboard;
