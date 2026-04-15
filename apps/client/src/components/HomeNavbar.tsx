"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Github, Menu, X } from "lucide-react"

const NavbarHomePage = () => {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const openModal = () => {
    setMobileOpen(false)
    router.push("?setModal=true")
  }

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="DevScan"
              className="h-9 w-9 rounded-xl transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-bold text-xl text-white tracking-tight">
              DevScan
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollTo("features")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Pricing
            </button>
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Plans
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={openModal}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Sign in
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-purple-900/30"
            >
              <Github className="h-4 w-4" />
              Get Started Free
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <button
              onClick={() => scrollTo("features")}
              className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Pricing
            </button>
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={openModal}
                className="w-full px-4 py-2.5 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
              >
                Sign in
              </button>
              <button
                onClick={openModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Github className="h-4 w-4" />
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default NavbarHomePage
