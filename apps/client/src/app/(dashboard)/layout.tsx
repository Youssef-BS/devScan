"use client";

import ProtectedLayout from "@/protected-layout";
import { ReactNode } from "react";
import IntroDashboard from "@/components/intro-dashboard";
import { Navbar } from "@/components/DashboardNavbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hideIntro = pathname === "/profile" || pathname?.startsWith("/notifications");

  return (
    <ProtectedLayout>
      <Navbar />
      {!hideIntro && <IntroDashboard />}
      {children}
    </ProtectedLayout>
  );
}