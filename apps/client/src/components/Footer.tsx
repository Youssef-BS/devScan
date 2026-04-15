"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DevScan" className="h-9 w-9 rounded-xl" />
              <span className="font-bold text-xl text-white tracking-tight">DevScan</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              AI-powered code analysis platform that detects security vulnerabilities,
              performance issues, and code quality problems before they reach production.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold">Product</h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Documentation", "API Reference", "Changelog"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold">Company</h4>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Contact", "Partners"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold">Legal</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Security", "Cookie Policy", "Status"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} DevScan. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Built with care by{" "}
            <span className="text-white/50 font-medium">Youssef Ben Said</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
