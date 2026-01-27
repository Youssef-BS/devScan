import ProtectedLayout from "@/protected-layout";
import { ReactNode } from "react";
import IntroDashboard from "@/components/intro-dashboard";

export default function DashboardLayout({
    children
} : {
    children : ReactNode
}) {
    return <ProtectedLayout>
        <IntroDashboard />
        {children}
        </ProtectedLayout>
}