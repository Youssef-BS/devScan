"use client"
import React, { useEffect, Suspense } from "react";
import AnalyseCard from "@/components/cards/AnalyseCard";
import { FingerprintPattern, Zap, Code, BrainCircuit, Check, Github, ArrowRight, Users, TrendingUp, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import PlanCard from "@/components/cards/PlanCard";
import { usePlanStore } from "@/store/usePlanStore";
import { useServiceStore } from "@/store/useServiceStore";

const data = [
  {
    id: 1,
    logo: <FingerprintPattern />,
    title: "Security Analysis",
    desc: "Detect OWASP vulnerabilities, SQL injections, and security flaws automatically"
  },
  {
    id: 2,
    logo: <Zap />,
    title: "Performance Optimization",
    desc: "Identify bottlenecks, memory leaks, and performance issues in real-time"
  },
  {
    id: 3,
    logo: <Code />,
    title: "Code Quality",
    desc: "Enforce clean code principles and best practices across your codebase"
  },
  {
    id: 4,
    logo: <BrainCircuit />,
    title: "AI-Powered Fixes",
    desc: "Get intelligent code suggestions and auto-fix pull requests powered by GPT-4"
  }
]

function MainContent() {
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
                <div className="mx-2 px-6 py-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg transition cursor-pointer font-bold" onClick={openLoginModal}>Start free with github</div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Welcome to DevScan</DialogTitle>
                  <DialogDescription>
                    Sign in with your GitHub account to start auditing your code
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800"
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
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
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
            <AnalyseCard key={item.id} id={item.id} title={item.title} logo={item.logo} desc={item.desc} />
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

// Main page component with Suspense
const Page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <MainContent />
    </Suspense>
  )
}

export default Page