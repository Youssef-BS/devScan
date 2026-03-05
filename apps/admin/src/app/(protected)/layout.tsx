"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminAuth";
import SpinnerLoad from "@/components/Spinner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { admin, loading } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/login");
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <SpinnerLoad />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <SpinnerLoad />
      </div>
    );
  }

  return <>{children}</>;
}