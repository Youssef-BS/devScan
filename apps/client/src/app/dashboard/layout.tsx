import ProtectedLayout from "@/protected-layout";
import { ReactNode } from "react";
import IntroDashboard from "@/components/intro-dashboard";
import NavbarHomePage from "@/components/HomeNavbar";
import { Navbar } from "@/components/DashboardNavbar";

export default function DashboardLayout({
    children
} : {
    children : ReactNode
}) {
    return <ProtectedLayout>
        <Navbar />
        <IntroDashboard />
        {children}
        </ProtectedLayout>
}