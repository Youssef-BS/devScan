"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/adminAuth";

export function AuthInitializer() {
  const fetchCurrentAdmin = useAdminStore((state) => state.fetchCurrentAdmin);

  useEffect(() => {
    fetchCurrentAdmin();
  }, [fetchCurrentAdmin]);

  return null;
}