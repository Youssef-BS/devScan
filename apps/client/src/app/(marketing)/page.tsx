"use client"
import React, { useEffect , useState } from "react";
import AnalyseCard from "@/components/cards/AnalyseCard";
import { FingerprintPattern, Zap, Code, BrainCircuit, Check, Github, ArrowRight, Users, TrendingUp, Code2 , Lock , Mail , EyeOff , Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import PlanCard from "@/components/cards/PlanCard";
import { usePlanStore } from "@/store/usePlanStore";
import { useServiceStore } from "@/store/useServiceStore";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


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

  console.log("plans in page.tsx:", services);
const handleEmailSignIn = async (e : any) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    // Implement your email sign-in logic here
    console.log('Signing in with:', { email, password, rememberMe });
    // await signInWithEmail(email, password);
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
    // Implement your forgot password logic here
    console.log('Reset password for:', resetEmail);
    // await sendPasswordResetEmail(resetEmail);
    setIsForgotPasswordOpen(false);
    // Show success toast/message
  } catch (error) {
    console.error('Reset error:', error);
  } finally {
    setIsResetLoading(false);
  }
};
  return (
    <React.Fragment>
      <section className="h-[90vh] w-full bg-gradient-to-br from-gray-50 to-purple-100 mb-20">
        <div className="align-center flex h-full w-full flex-col items-center justify-center gap-8">
          <h1 className="text-7xl flex flex-col text-center font-bold">AI-Powered Code Auditing
            <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Like a Senior Dev</span></h1>
          <p className="text-2xl w-2/3 text-center text-gray-800 ">DevScan automatically analyzes your code for security vulnerabilities, performance issues, and quality problems. Get instant feedback and AI-powered fixes on every push.</p>
          <div className="flex">
            <Dialog open={isLoginOpen} onOpenChange={(open) => !open && closeModal()}>
              <DialogTrigger asChild>
                <div className="mx-2 px-6 py-4 bg-gray-900 text-white rounded-lg transition cursor-pointer font-bold hover:bg-gray-800 hover:shadow-lg hover:scale-105 transform duration-200" onClick={openLoginModal}>
                  Start free with GitHub
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Welcome to DevScan
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Sign in to start auditing your code
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* GitHub Button */}
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white hover:shadow-md transition-all duration-200 h-11"
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
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
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
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200 font-medium"
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
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
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
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg h-11"
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
                      className="text-sm text-gray-900 hover:text-gray-700 hover:underline font-medium transition-colors duration-200"
                    >
                      Create an account
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-gray-900 hover:text-gray-700 hover:underline font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-gray-900 hover:text-gray-700 hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
              <DialogContent className="sm:max-w-md">
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

            {/* Sign Up Dialog */}
            <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
              <DialogContent className="sm:max-w-md">
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

                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            <div className="mx-2 px-6 py-4 bg-white text-black border-2 border-gray-800 rounded-lg transition cursor-pointer font-bold" >watch demo</div>
          </div>
        </div>
      </section>

      <section className="w-full my-20">
        <div className="description py-2.5 text-center">
          <h1 className="flex flex-col gap-1"><span className="font-bold text-3xl">Comprehensive Code Analysis</span>
            <span className="text-gray-400">Multi-agent AI system analyzing every aspect of your code</span>
          </h1>
        </div>
        <div className="flex flex-row mt-16 mx-24 justify-center">
          {services?.map((item) =>
            <AnalyseCard key={item.id} id={item.id} title={item.title} logo={logoMap[item.logo] ?? item.logo} desc={item.desc} />
          )}
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How DevScan Works</h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our seamless integration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Connect GitHub</h3>
              <p className="text-gray-600">
                Sign in with GitHub and select the repositories you want to monitor
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Automatic Analysis</h3>
              <p className="text-gray-600">
                DevScan analyzes your code on every push using advanced AI models
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Fixes</h3>
              <p className="text-gray-600">
                Review issues, apply AI suggestions, and create auto-fix pull requests
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PlanCard key={index} plan={plan} openLoginModal={openLoginModal} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">Trusted by Developers Worldwide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="h-8 w-8 text-blue-600 mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <p className="text-gray-600">Active Developers</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Code2 className="h-8 w-8 text-purple-600 mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">50,000+</div>
                <p className="text-gray-600">Repositories Scanned</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <TrendingUp className="h-8 w-8 text-green-600 mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">1M+</div>
                <p className="text-gray-600">Issues Fixed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to Improve Your Code Quality?
          </h2>
          <p className="text-xl opacity-90">
            Join thousands of developers using DevScan to build better software
          </p>
          <Button
            size="lg"
            className="bg-gray-800"
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

export default HomePage ; 