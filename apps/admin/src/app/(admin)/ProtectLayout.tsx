"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin.auth.store";
import SpinnerLoad from "@/components/Spinner";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading, initialized, fetchCurrentAdmin } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      fetchCurrentAdmin();
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized && !admin) {
      router.push("/auth");
    }
  }, [initialized, admin, router]);

  if (!initialized) {
    return <SpinnerLoad />;
  }

  if (!admin) return null;

  return <>{children}</>;
}