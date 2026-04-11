"use client"
import React, { useEffect , useState } from "react";
import AnalyseCard from "@/components/cards/AnalyseCard";
import { FingerprintPattern, Zap, Code, BrainCircuit, Github, ArrowRight, Lock , Mail , EyeOff , Eye, Sparkles,  ZapIcon, Cpu, GithubIcon, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import PlanCard from "@/components/cards/PlanCard";
import { usePlanStore } from "@/store/usePlanStore";
import { useServiceStore } from "@/store/useServiceStore";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    desc: "Detect OWASP vulnerabilities, SQL injections, and security flaws automatically"
  },
  {
    id: 2,
    logo: "zap",
    title: "Performance Optimization",
    desc: "Identify bottlenecks, memory leaks, and performance issues in real-time"
  },
  {
    id: 3,
    logo: "code",
    title: "Code Quality",
    desc: "Enforce clean code principles and best practices across your codebase"
  },
  {
    id: 4,
    logo: "brain",
    title: "AI-Powered Fixes",
    desc: "Get intelligent code suggestions and auto-fix pull requests powered by GPT-4"
  }
]

function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user , loginAuth} = useAuthStore() ;
  const route = useRouter() ;

  const openLoginModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("setModal", "true")
    router.push(`?${params.toString()}`, { scroll: true })
  }

  const isLoginOpen = searchParams.get("setModal") === "true"

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("setModal")
    router.push(`?${params.toString()}`)
  }

  const { plans } = usePlanStore();
  const { services } = useServiceStore();

  const setPlans = usePlanStore((state) => state.setPlans)
  const setServices = useServiceStore((state) => state.setServices)

  useEffect(() => {
    setPlans(plans);
    setServices(data);
  }, [setPlans, plans, setServices]);

const handleEmailSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const success = await loginAuth({ email, password });
    if (success)  route.push('/dashboard');

  } catch (error) {
    console.error('Sign in error:', error);;
  } finally {
    setIsLoading(false);
  }
};

  const handleForgotPassword = async (e :  any) => {
    e.preventDefault();
    setIsResetLoading(true);
    try {
      console.log('Reset password for:', resetEmail);
      setIsForgotPasswordOpen(false);
    } catch (error) {
      console.error('Reset error:', error);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <React.Fragment>
      {/* Hero Section - Premium Gradient */}
      <section className="min-h-screen w-full bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px]" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent" />
        
        {/* Decorative blur elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 flex h-full min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-5xl"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white/90">AI-Powered Code Analysis</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Intelligent Code
              <span className="block bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Auditing Platform
              </span>
            </h1>
            
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/70 leading-relaxed font-light">
              Detect security vulnerabilities, performance issues, and code quality problems before they impact production. Powered by advanced AI analysis.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Dialog open={isLoginOpen} onOpenChange={(open) => !open && closeModal()}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-white text-slate-950 hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-3 text-base font-semibold"
                  onClick={openLoginModal}
                >
                  <Github className="h-5 w-5 mr-2" />
                  Start Free with GitHub
                </Button>
              </DialogTrigger>
              
              {/* Login Dialog - Clean & Professional */}
              <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Welcome Back
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm mt-2">
                    Sign in to your DevScan account
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-6 border-t border-gray-100">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all duration-200"
                    onClick={() => {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                      window.location.href = `${apiUrl}/auth/github`
                    }}
                  >
                    <Github className="h-5 w-5 mr-2" />
                    Continue with GitHub
                  </Button>

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
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordOpen(true)}
                          className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded cursor-pointer"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer font-medium">
                        Remember me
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all duration-200 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        setIsSignUpOpen(true);
                      }}
                      className="text-sm text-gray-900 hover:text-gray-700 font-semibold transition-colors"
                    >
                      Create one
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center py-3">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-gray-700 hover:text-gray-900 font-medium underline">
                      Terms
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-gray-700 hover:text-gray-900 font-medium underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Forgot Password Dialog - Clean & Professional */}
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
                    <Label htmlFor="reset-email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200"
                      disabled={isResetLoading}
                    >
                      {isResetLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Sign Up Dialog - Clean & Professional */}
            <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
              <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Create Account
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm mt-2">
                    Join us and start improving your code quality
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-6 border-t border-gray-100">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all duration-200"
                    onClick={() => {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                      window.location.href = `${apiUrl}/auth/github`
                    }}
                  >
                    <Github className="h-5 w-5 mr-2" />
                    Sign up with GitHub
                  </Button>

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
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 font-medium">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-lg font-medium transition-all duration-200 mt-6"
                    >
                      Create Account
                    </Button>
                  </form>

                  <div className="text-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpOpen(false);
                        openLoginModal();
                      }}
                      className="text-sm text-gray-900 hover:text-gray-700 font-semibold transition-colors"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/20 hover:text-white px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300"
              onClick={() => {
                const element = document.getElementById('pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Pricing
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-12 mt-20 pt-16 border-t border-white/10"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white">10K+</div>
              <div className="text-sm text-white/60 mt-2 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/60 mt-2 font-medium">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">1M+</div>
              <div className="text-sm text-white/60 mt-2 font-medium">Issues Fixed</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-24">
            <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Key Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Comprehensive Analysis</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
              Multi-agent AI system that analyzes every aspect of your codebase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services?.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
        </div>
      </section>

      {/* How It Works - Modern Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-24">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <ZapIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Getting Started</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">How DevScan Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
              Simple three-step process to start improving your code quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect GitHub",
                description: "Securely authenticate with GitHub and select repositories to monitor",
                icon: <GithubIcon className="h-8 w-8" />
              },
              {
                step: "02",
                title: "Automatic Analysis",
                description: "Advanced AI analyzes your code on every push and pull request",
                icon: <Cpu className="h-8 w-8" />
              },
              {
                step: "03",
                title: "Get Improvements",
                description: "Review recommendations and auto-fix issues with one click",
                icon: <Sparkles className="h-8 w-8" />
              }
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
                  <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-linear-to-r from-purple-300 to-transparent" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                  <div className="text-5xl font-bold text-gray-200 mb-4 group-hover:text-purple-100 transition-colors">{item.step}</div>
                  <div className="w-14 h-14 bg-linear-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:from-purple-100 group-hover:to-blue-100 transition-all">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-24">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
              Choose the perfect plan for your needs
            </p>
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing">
              <Button
                className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All Plans & Subscribe
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {plans.slice(0, 3).map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof Section */}
      <section className="py-24 bg-linear-to-br from-purple-950 via-slate-900 to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold">Trusted by Developers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Join thousands of developers improving code quality</h2>
              <p className="text-lg text-white/70 leading-relaxed font-light">
                DevScan is trusted by developers worldwide to deliver better code, faster. Experience the power of AI-driven code analysis.
              </p>
              
              <div className="grid grid-cols-2 gap-10 pt-8">
                <div>
                  <div className="text-4xl font-bold text-transparent bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text">10K+</div>
                  <div className="text-white/60 text-sm font-medium mt-2">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-transparent bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text">50K+</div>
                  <div className="text-white/60 text-sm font-medium mt-2">Repositories</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-transparent bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text">1M+</div>
                  <div className="text-white/60 text-sm font-medium mt-2">Issues Fixed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-transparent bg-linear-to-r from-green-400 to-blue-400 bg-clip-text">99%</div>
                  <div className="text-white/60 text-sm font-medium mt-2">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/90 text-sm mb-4 leading-relaxed">
                    "DevScan has transformed how we approach code quality. It catches issues before they hit production."
                  </p>
                  <div className="text-xs text-white/50 font-medium">Developer @ Tech Company</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Ready to Improve Your Code?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Get started in minutes and start improving your code quality immediately
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={openLoginModal}
            >
              <Github className="h-5 w-5 mr-2" />
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </React.Fragment>
  )
}

export default HomePage;