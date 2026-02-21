"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const IntroDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const homeType = searchParams.get("homeType") || "repositories";

  const goTo = (type: string, path = "/dashboard") => {
    router.push(`${path}?homeType=${type}`);
  };

  return (
    <>
      <section className="m-12 flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div>
          <h1 className="text-4xl font-bold">Your Repositories</h1>
          <p className="pt-2.5 text-gray-500">
            Monitor and audit your code automatically
          </p>
        </div>

      </section>

      <section className="mx-1 mb-4 flex justify-center lg:mx-12 lg:justify-start">
        <div className="flex w-fit gap-1.5 rounded-2xl bg-gray-200 p-1">
          <button
            className={`px-11 py-1 rounded-xl font-semibold transition cursor-pointer
              ${homeType === "repositories" ? "bg-white" : "hover:bg-gray-100"}
            `}
            onClick={() => goTo("repositories")}
          >
           All my github Repositories
          </button>

          <button
            className={`px-11 py-1 rounded-xl font-semibold transition cursor-pointer
              ${homeType === "checking" ? "bg-white" : "hover:bg-gray-100"}
            `}
            onClick={() => goTo("checking", "/dashboard/toCheck")}
          >
            Repositories for checking
          </button>

          <button
            className={`px-11 py-1 rounded-xl font-semibold transition cursor-pointer
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
