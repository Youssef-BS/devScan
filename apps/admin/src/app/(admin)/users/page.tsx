"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import UserCard from "./card/UserCard";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

const Page = () => {
  const { users, pagination, fetchListUsers } = useUserStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchListUsers(page);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-black">
          Users
        </h1>

        <span className="text-sm text-gray-500">
          {pagination?.total || 0} users
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Pagination>
          <PaginationContent>

            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && setPage(page - 1)}
              />
            </PaginationItem>

            {Array.from({ length: pagination?.totalPages || 1 }).map(
              (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={page === index + 1}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  page < (pagination?.totalPages || 1) &&
                  setPage(page + 1)
                }
              />
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      </div>

    </div>
  );
};

export default Page;