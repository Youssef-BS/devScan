"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "./store/adminAuth";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { fetchCurrentAdmin } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (!fetchCurrentAdmin) {
      router.push("/login");
    }
  }, [fetchCurrentAdmin, router]);

  if (!fetchCurrentAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
