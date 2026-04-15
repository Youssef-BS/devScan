"use client"
import React, { useEffect, useState } from "react";
import AnalyseCard from "@/components/cards/AnalyseCard";
import {
  FingerprintPattern, Zap, Code, BrainCircuit, Github, ArrowRight,
  Lock, Mail, EyeOff, Eye, Sparkles, ZapIcon, Cpu, GithubIcon,
  Star, Award, Shield, TrendingUp, CheckCircle2, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useServiceStore } from "@/store/useServiceStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

const logoMap: Record<string, React.ReactNode> = {
  fingerprint: <FingerprintPattern />,
  zap: <Zap />,
  code: <Code />,
  brain: <BrainCircuit />,
};

const data = [
  {
    id: 1,
    logo: "fingerprint",
    title: "Security Analysis",
    desc: "Detect OWASP vulnerabilities, SQL injections, and security flaws automatically",
  },
  {
    id: 2,
    logo: "zap",
    title: "Performance Optimization",
    desc: "Identify bottlenecks, memory leaks, and performance issues in real-time",
  },
  {
    id: 3,
    logo: "code",
    title: "Code Quality",
    desc: "Enforce clean code principles and best practices across your codebase",
  },
  {
    id: 4,
    logo: "brain",
    title: "AI-Powered Fixes",
    desc: "Get intelligent code suggestions and auto-fix pull requests powered by GPT-4",
  },
];

const testimonials = [
  {
    quote: "DevScan caught a critical SQL injection before our pentest did. Saved us weeks of remediation work.",
    author: "Sarah K.",
    role: "Senior Engineer",
    company: "FinTech Startup",
  },
  {
    quote: "The AI auto-fix feature is genuinely impressive. It doesn't just flag issues — it explains and resolves them.",
    author: "Marcus L.",
    role: "Tech Lead",
    company: "E-commerce Platform",
  },
  {
    quote: "We integrated DevScan into our CI pipeline in under an hour. Zero friction, immediate value.",
    author: "Priya M.",
    role: "DevOps Engineer",
    company: "SaaS Company",
  },
  {
    quote: "Our code review cycles dropped by 40% after we started scanning PRs automatically with DevScan.",
    author: "Tom B.",
    role: "Engineering Manager",
    company: "B2B Software",
  },
];

function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loginAuth } = useAuthStore();
  const route = useRouter();

  const openLoginModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("setModal", "true");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const isLoginOpen = searchParams.get("setModal") === "true";

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("setModal");
    router.push(`?${params.toString()}`);
  };

  const { services } = useServiceStore();
  const setServices = useServiceStore((state) => state.setServices);

  useEffect(() => {
    setServices(data);
  }, [setServices]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await loginAuth({ email, password });
      if (success) route.push("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: any) => {
    e.preventDefault();
    setIsResetLoading(true);
    try {
      console.log("Reset password for:", resetEmail);
      setIsForgotPasswordOpen(false);
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <React.Fragment>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="min-h-screen w-full bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-125 h-125 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-125 h-125 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-purple-900/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex h-full min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center max-w-5xl"
          >
            {/* Badge */}
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="flex items-center gap-2 bg-white/8 backdrop-blur-md px-4 py-2 rounded-full border border-white/12">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
                  AI-Powered Code Analysis
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Ship code with
              <span className="block bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mt-1">
                confidence.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/60 leading-relaxed font-light mb-10">
              DevScan detects security vulnerabilities, performance regressions, and code quality issues
              on every push — before they reach production.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Dialog open={isLoginOpen} onOpenChange={(open) => !open && closeModal()}>
                <DialogTrigger asChild>
                  <button
                    onClick={openLoginModal}
                    className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-slate-950 bg-white rounded-xl hover:bg-white/90 shadow-lg shadow-black/20 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Github className="h-5 w-5" />
                    Start Free with GitHub
                  </button>
                </DialogTrigger>

                {/* Login Dialog */}
                <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Welcome Back</DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm mt-2">
                      Sign in to your DevScan account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 py-6 border-t border-gray-100">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all duration-200"
                      onClick={() => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
                        window.location.href = `${apiUrl}/auth/github`;
                      }}
                    >
                      <Github className="h-5 w-5" />
                      Continue with GitHub
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500 font-semibold">Email Sign In</span>
                      </div>
                    </div>
                    <form className="space-y-4" onSubmit={handleEmailSignIn}>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-10 border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                          <button
                            type="button"
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                          >
                            Forgot?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-gray-900 border-gray-300 rounded cursor-pointer"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 cursor-pointer font-medium">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all duration-200 mt-6 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                            Signing in...
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>
                    <div className="text-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => { closeModal(); setIsSignUpOpen(true); }}
                        className="text-sm text-gray-900 hover:text-gray-700 font-semibold"
                      >
                        Create one
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      By signing in, you agree to our{" "}
                      <a href="/terms" className="text-gray-700 hover:text-gray-900 font-medium underline">Terms</a>
                      {" "}and{" "}
                      <a href="/privacy" className="text-gray-700 hover:text-gray-900 font-medium underline">Privacy Policy</a>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Forgot Password Dialog */}
              <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Reset Password</DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm mt-2">
                      We'll send you a link to reset your password
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-5 py-6 border-t border-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10 border-gray-300"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(false)}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium py-2.5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResetLoading}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium py-2.5 transition-all disabled:opacity-50"
                      >
                        {isResetLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                            Sending...
                          </div>
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Sign Up Dialog */}
              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Create Account</DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm mt-2">
                      Join and start improving your code quality
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 py-6 border-t border-gray-100">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all"
                      onClick={() => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
                        window.location.href = `${apiUrl}/auth/github`;
                      }}
                    >
                      <Github className="h-5 w-5" />
                      Sign up with GitHub
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500 font-semibold">Email Sign Up</span>
                      </div>
                    </div>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                        <Input id="signup-name" type="text" placeholder="John Doe" className="border-gray-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input id="signup-email" type="email" placeholder="name@example.com" className="pl-10 border-gray-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input id="signup-password" type="password" placeholder="••••••••" className="pl-10 border-gray-300" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Must be at least 8 characters</p>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all mt-2"
                      >
                        Create Account
                      </button>
                    </form>
                    <div className="text-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => { setIsSignUpOpen(false); openLoginModal(); }}
                        className="text-sm text-gray-900 hover:text-gray-700 font-semibold"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white/80 hover:text-white rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
              >
                View Pricing
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col items-center gap-6 mt-8"
          >
            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              No credit card required
              <span className="mx-2">·</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              7-day free trial
              <span className="mx-2">·</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Cancel anytime
            </div>
            <div className="flex flex-wrap justify-center gap-10 pt-6 border-t border-white/10">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "50K+", label: "Repositories" },
                { value: "1M+", label: "Issues Fixed" },
                { value: "99%", label: "Uptime SLA" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted by banner ──────────────────────────────────────── */}
      <section className="py-10 bg-slate-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-white/30 text-xs font-semibold uppercase tracking-widest mb-6">
            Trusted by engineers at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40">
            {["Stripe", "Vercel", "Notion", "Linear", "Figma", "Supabase"].map((company) => (
              <span key={company} className="text-white/80 font-semibold text-sm tracking-wide">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="py-28 bg-slate-950" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">Key Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Everything you need to ship
              <span className="block text-white/60">safer, faster.</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto font-light">
              A multi-agent AI system that analyzes every dimension of your codebase on every commit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(services ?? data).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <AnalyseCard
                  id={item.id}
                  title={item.title}
                  logo={logoMap[item.logo] ?? item.logo}
                  desc={item.desc}
                />
              </motion.div>
            ))}
          </div>

          {/* Extra feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: "OWASP Top 10 Coverage",
                desc: "Comprehensive detection across all major vulnerability categories with zero false-positive tuning.",
                color: "text-red-400",
                bg: "bg-red-500/10",
                border: "border-red-500/20",
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Trend Analytics",
                desc: "Track code quality over time with dashboards that show your team's improvement trajectory.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                icon: <ZapIcon className="h-5 w-5" />,
                title: "CI/CD Native",
                desc: "Integrates directly into GitHub Actions, GitLab CI, and any pipeline with a single config line.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/20",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex gap-4 rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────────── */}
      <section className="py-28 bg-linear-to-b from-slate-950 via-slate-900/50 to-slate-950" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
              <ZapIcon className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Getting Started</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Up and running in minutes
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto font-light">
              No complex setup. No config files. Just connect your repo and start scanning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect GitHub",
                description: "Authenticate with GitHub OAuth and select the repositories you want to monitor. Takes under 60 seconds.",
                icon: <GithubIcon className="h-7 w-7" />,
                accent: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
              },
              {
                step: "02",
                title: "Automatic Analysis",
                description: "DevScan's AI agents scan every push and pull request, analyzing security, performance, and quality in parallel.",
                icon: <Cpu className="h-7 w-7" />,
                accent: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
              },
              {
                step: "03",
                title: "Fix with One Click",
                description: "Review AI-generated explanations, apply auto-fixes directly to your PRs, and track improvements over time.",
                icon: <Sparkles className="h-7 w-7" />,
                accent: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 -right-3 z-10">
                    <ArrowRight className="h-5 w-5 text-white/20" />
                  </div>
                )}
                <div className="rounded-2xl p-8 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-300 h-full">
                  <div className="text-6xl font-black text-white/8 mb-4 leading-none">{item.step}</div>
                  <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${item.accent} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ─────────────────────────────────────────── */}
      <section className="py-28 bg-slate-950" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
              <Star className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto font-light">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          {/* Pricing preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: "Monthly",
                price: "$9.99",
                period: "/month",
                features: ["1 repository scan", "Basic security analysis", "Up to 100 commits/month"],
              },
              {
                name: "Quarterly",
                price: "$24.99",
                period: "/3 months",
                features: ["5 repository scans", "Advanced security analysis", "Up to 500 commits/month", "API access"],
                popular: true,
              },
              {
                name: "Yearly",
                price: "$79.99",
                period: "/year",
                badge: "Save 33%",
                features: ["Unlimited scans", "Enterprise analysis", "AI auto-fixes", "Unlimited commits"],
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-7 border transition-all duration-300 ${
                  plan.popular
                    ? "border-purple-500/50 bg-linear-to-br from-purple-950/60 to-blue-950/60 shadow-xl shadow-purple-900/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    <Star className="h-3 w-3 fill-white" /> Most Popular
                  </div>
                )}
                {plan.badge && (
                  <div className="inline-flex items-center gap-1.5 bg-green-400/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-400/20 mb-4">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/60 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/pricing">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-linear-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-900/30 transition-all duration-200 hover:scale-[1.02]">
                View All Plans & Subscribe
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-28 bg-linear-to-br from-purple-950/40 via-slate-950 to-blue-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: headline + stats */}
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mb-6">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white/90">Trusted Worldwide</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                  Thousands of engineers rely on DevScan daily.
                </h2>
                <p className="text-lg text-white/50 leading-relaxed font-light mt-4">
                  From solo developers to engineering teams at scale, DevScan helps ship better code with less effort.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { value: "10K+", label: "Active Users", color: "from-cyan-400 to-blue-400" },
                  { value: "50K+", label: "Repositories", color: "from-purple-400 to-pink-400" },
                  { value: "1M+", label: "Issues Fixed", color: "from-cyan-400 to-purple-400" },
                  { value: "99%", label: "Satisfaction", color: "from-green-400 to-emerald-400" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className={`text-4xl font-bold text-transparent bg-linear-to-r ${stat.color} bg-clip-text`}>
                      {stat.value}
                    </div>
                    <div className="text-white/50 text-sm font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: testimonial cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white/8 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <div className="text-white/90 text-xs font-semibold">{t.author}</div>
                    <div className="text-white/40 text-xs mt-0.5">{t.role} · {t.company}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Get Started Today</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Ready to write
            <span className="block bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              better code?
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            Join thousands of developers already using DevScan to ship safer, higher-quality software.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={openLoginModal}
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-slate-950 bg-white rounded-xl hover:bg-white/90 shadow-lg shadow-black/30 transition-all duration-200 hover:scale-[1.02]"
            >
              <Github className="h-5 w-5" />
              Start Free with GitHub
            </button>
            <Link href="/pricing">
              <button className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white/80 hover:text-white rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                View Pricing
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
          <p className="text-white/30 text-xs">
            No credit card required · 7-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </React.Fragment>
  );
}

export default HomePage;
