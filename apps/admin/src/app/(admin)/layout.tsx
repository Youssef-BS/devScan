"use client";

import ProtectedLayout from "./ProtectLayout";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/admin.auth.store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAdminStore();
  const router = useRouter();

  return (
    <ProtectedLayout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <Sidebar className="bg-white border-r border-gray-200 shadow-sm">
            <SidebarHeader className="p-6 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">DevScan</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Admin Panel</p>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push("/")}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3 text-gray-500" />
                    Dashboard
                  </Button>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push("/users")}
                  >
                    <Users className="w-5 h-5 mr-3 text-gray-500" />
                    Users
                  </Button>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push("/repositories")}
                  >
                    <FolderGit2 className="w-5 h-5 mr-3 text-gray-500" />
                    Repositories
                  </Button>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push("/analytics")}
                  >
                    <BarChart3 className="w-5 h-5 mr-3 text-gray-500" />
                    Analytics
                  </Button>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="w-5 h-5 mr-3 text-gray-500" />
                    Settings
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-gray-100">
              <div className="mb-4 px-3 py-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate mt-1">admin@devscan.com</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={logout}
              >
                <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                Logout
              </Button>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 bg-gray-50">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedLayout>
  );
}