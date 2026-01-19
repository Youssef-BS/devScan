import ProtectedLayout from "@/protected-layout";
import { ReactNode } from "react";

export default function DashboardLayout({
    children
} : {
    children : ReactNode
}) {
    return <ProtectedLayout>{children}</ProtectedLayout>
}