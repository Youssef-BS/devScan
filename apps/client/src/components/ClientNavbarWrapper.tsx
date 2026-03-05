"use client" ;

import { useAuthContext } from "@/auth-context";
import { Navbar } from "@/components/DashboardNavbar";
import NavbarHomePage from "@/components/HomeNavbar";

export default function ClientNavbarWrapper() {
  const { user, loading } = useAuthContext();

  if (loading) return null; 

  return user ? <Navbar /> : <NavbarHomePage />;
}