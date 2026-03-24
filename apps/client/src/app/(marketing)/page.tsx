"use client"
import React, { useEffect , useState } from "react";
import AnalyseCard from "@/components/cards/AnalyseCard";
import { FingerprintPattern, Zap, Code, BrainCircuit, Github, ArrowRight, Lock , Mail , EyeOff , Eye, Sparkles,  ZapIcon, Cpu, GithubIcon, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import PlanCard from "@/components/cards/PlanCard";
import { usePlanStore } from "@/store/usePlanStore";
import { useServiceStore } from "@/store/useServiceStore";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from "framer-motion";

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

  const handleEmailSignIn = async (e : any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Signing in with:', { email, password, rememberMe });
    } catch (error) {
      console.error('Sign in error:', error);
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
      {/* Hero Section - Modern Gradient */}
      <section className="min-h-[90vh] w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute h-full w-full bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="relative z-10 align-center flex h-full min-h-[90vh] w-full flex-col items-center justify-center gap-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white/90">AI-Powered Code Analysis</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl flex flex-col text-center font-bold text-white">
              AI-Powered
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Code Auditing
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/80 mt-8 leading-relaxed">
              DevScan automatically analyzes your code for security vulnerabilities, 
              performance issues, and quality problems. Get instant feedback and 
              AI-powered fixes on every push.
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
                  className="bg-white text-slate-900 hover:bg-white/90 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
                  onClick={openLoginModal}
                >
                  <Github className="h-5 w-5 mr-2" />
                  Start free with GitHub
                </Button>
              </DialogTrigger>
              
              {/* Login Dialog - Pure Black & White */}
              <DialogContent className="sm:max-w-md bg-white border-0">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Welcome to DevScan
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Sign in to start auditing your code
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
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
                      <span className="bg-white px-3 text-gray-500 font-medium">Or continue with email</span>
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleEmailSignIn}>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordOpen(true)}
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                          Signing in...
                        </div>
                      ) : (
                        'Sign in with Email'
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        setIsSignUpOpen(true);
                      }}
                      className="text-sm text-gray-900 hover:text-gray-700 hover:underline font-medium"
                    >
                      Create an account
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-gray-900 hover:text-gray-700 hover:underline">
                      Terms
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-gray-900 hover:text-gray-700 hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Forgot Password Dialog - Pure Black & White */}
            <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
              <DialogContent className="sm:max-w-md bg-white border-0">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">Reset your password</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                      disabled={isResetLoading}
                    >
                      {isResetLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        'Send reset link'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Sign Up Dialog - Pure Black & White */}
            <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
              <DialogContent className="sm:max-w-md bg-white border-0">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Create an account
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Sign up to start auditing your code
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
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
                      <span className="bg-white px-3 text-gray-500 font-medium">Or sign up with email</span>
                    </div>
                  </div>

                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                        Full name
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
                    >
                      Create account
                    </Button>
                  </form>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpOpen(false);
                        openLoginModal();
                      }}
                      className="text-sm text-gray-900 hover:text-gray-700 hover:underline font-medium"
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
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-lg font-semibold"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-white/60">Active Developers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/60">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1M+</div>
              <div className="text-sm text-white/60">Issues Fixed</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Powerful Features</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">Comprehensive Code Analysis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multi-agent AI system analyzing every aspect of your code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <ZapIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Simple Process</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">How DevScan Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our seamless integration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Connect GitHub",
                description: "Sign in with GitHub and select the repositories you want to monitor",
                icon: <GithubIcon className="h-8 w-8" />
              },
              {
                step: "02",
                title: "Automatic Analysis",
                description: "DevScan analyzes your code on every push using advanced AI models",
                icon: <Cpu className="h-8 w-8" />
              },
              {
                step: "03",
                title: "Get Fixes",
                description: "Review issues, apply AI suggestions, and create auto-fix pull requests",
                icon: <Sparkles className="h-8 w-8" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-200 to-transparent" />
                )}
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="text-6xl font-bold text-purple-100 mb-4">{item.step}</div>
                  <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Simple Pricing</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PlanCard plan={plan} openLoginModal={openLoginModal} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Stats Section */}
      <section className="py-32 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Trusted Worldwide</span>
              </div>
              <h2 className="text-5xl font-bold">Trusted by Developers Worldwide</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Join thousands of developers who trust DevScan to improve their code quality and ship better software faster.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <div className="text-4xl font-bold">10K+</div>
                  <div className="text-white/60">Active Developers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">50K+</div>
                  <div className="text-white/60">Repositories</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">1M+</div>
                  <div className="text-white/60">Issues Fixed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">99%</div>
                  <div className="text-white/60">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/90 text-sm mb-3">
                    "DevScan has revolutionized how we review code. It's like having a senior dev on every PR."
                  </p>
                  <div className="text-sm text-white/60">- Developer @ GitHub</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-5xl font-bold text-gray-900">
            Ready to Improve Your Code Quality?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers using DevScan to build better software
          </p>
          <Button
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold"
            onClick={openLoginModal}
          >
            <Github className="h-5 w-5 mr-2" />
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </React.Fragment>
  )
}

export default HomePage;