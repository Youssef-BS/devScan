"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/useAuthStore"
import { useAuthContext } from "@/auth-context"
import { useNotifications } from "@/hooks/use-notifications"
import { useTheme } from "@/components/ThemeProvider"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  LayoutDashboard,
  FolderGit2,
  Menu,
  X,
  Code2,
  Sun,
  Moon,
  HelpCircle,
  ChevronDown,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repositories", href: "/dashboard/toCheck?homeType=checking", icon: FolderGit2 },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthContext()
  const { logout } = useAuthStore()
  const { unreadCount } = useNotifications()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const initials = user?.firstName || user?.lastName
    ? `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase()
    : "U"

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname?.startsWith(href.split("?")[0]))

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-white/[0.06] bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* ── Left: logo + nav ── */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-sm shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <Code2 size={16} className="text-white" />
                </div>
                <span className="hidden sm:block font-semibold text-[15px] tracking-tight text-gray-900 dark:text-white">
                  DevScan
                </span>
              </Link>

              {/* Desktop nav links */}
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map(({ name, href, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={name}
                      href={href}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                        active
                          ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/[0.08]"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon size={15} className={active ? "text-blue-600 dark:text-blue-400" : ""} />
                      {name}
                      {active && (
                        <span className="absolute bottom-0 left-3 right-3 h-px bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* ── Right: actions ── */}
            <div className="flex items-center gap-1">

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all"
              >
                {theme === "dark"
                  ? <Sun size={16} className="text-amber-400" />
                  : <Moon size={16} />
                }
              </button>

              {/* Notifications */}
              <button
                onClick={() => router.push("/notifications")}
                title="Notifications"
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none ring-2 ring-white dark:ring-gray-950">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all outline-none">
                    <Avatar className="h-7 w-7 ring-2 ring-gray-200 dark:ring-white/10">
                      <AvatarImage src={user?.avatarUrl} alt={initials} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                      {user?.firstName ?? user?.username ?? "Account"}
                    </span>
                    <ChevronDown size={13} className="hidden lg:block text-gray-400 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                  {/* Profile header */}
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                      <Avatar className="h-9 w-9 ring-2 ring-gray-100 dark:ring-white/10">
                        <AvatarImage src={user?.avatarUrl} alt={initials} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-white text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="p-1">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer rounded-md text-sm">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/profile?tab=security")} className="cursor-pointer rounded-md text-sm">
                        <Shield className="mr-2 h-4 w-4 text-gray-400" />
                        Security
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer rounded-md text-sm">
                        <Settings className="mr-2 h-4 w-4 text-gray-400" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer rounded-md text-sm">
                        {theme === "dark"
                          ? <Sun className="mr-2 h-4 w-4 text-amber-400" />
                          : <Moon className="mr-2 h-4 w-4 text-gray-400" />
                        }
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem onClick={() => router.push("/help")} className="cursor-pointer rounded-md text-sm">
                      <HelpCircle className="mr-2 h-4 w-4 text-gray-400" />
                      Help & Support
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-md text-sm text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-gray-950 px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {navigation.map(({ name, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={name}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-blue-600 dark:text-blue-400" : ""} />
                    {name}
                  </Link>
                )
              })}
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <User size={17} />
                Profile
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
