"use client" ;

import { useAuthContext } from "@/auth-context";
import { Navbar } from "@/components/Navbar";
import NavbarHomePage from "@/components/NavbarHomePage";

export default function ClientNavbarWrapper() {
  const { user, loading } = useAuthContext();

  if (loading) return null; 

  return user ? <Navbar /> : <NavbarHomePage />;
}