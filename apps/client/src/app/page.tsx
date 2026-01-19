"use client"
import React from "react" ;
import AnalyseCard from "@/components/AnalyseCard";
import { FingerprintPattern , Zap , Code , BrainCircuit , Check , Github , ArrowRight ,Users , TrendingUp , Code2} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams , useRouter} from "next/navigation";

const data = [
  {
    id : 1 , 
    logo : <FingerprintPattern /> ,
    title : "Security Analysis" , 
    desc : "Detect OWASP vulnerabilities, SQL injections, and security flaws automatically"
  } ,
  {
    id : 2 , 
    logo : <Zap /> ,
    title : "Performance Optimization" , 
    desc : "Identify bottlenecks, memory leaks, and performance issues in real-time"
  } , 
  {
    id : 3 , 
    logo : <Code /> ,
    title : "Code Quality" , 
    desc : "Enforce clean code principles and best practices across your codebase"
  } ,
  {
    id : 4, 
    logo : <BrainCircuit /> ,
    title : "AI-Powered Fixes" , 
    desc : "Get intelligent code suggestions and auto-fix pull requests powered by GPT-4"
  }
]


const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for individual developers and small projects",
      features: [
        "Up to 3 repositories",
        "Basic security scans",
        "Weekly audits",
        "Community support",
        "Public repositories only"
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      name: "Pro",
      price: "29",
      period: "per month",
      description: "For professional developers and growing teams",
      features: [
        "Unlimited repositories",
        "Advanced AI analysis",
        "Real-time scanning (on push)",
        "Auto-fix PR creation",
        "Priority support",
        "Private repositories",
        "Custom webhooks",
        "API access"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Self-hosted option",
        "Custom AI models",
        "SLA guarantee",
        "Dedicated support",
        "Advanced analytics",
        "SSO integration",
        "Compliance reports"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];



const page = () => {

 const openLoginModal = () => {
  const params = new URLSearchParams(searchParams.toString())
  params.set("setModal", "true")

  router.push(`?${params.toString()}`, { scroll: true })
}

 const searchParams = useSearchParams()
  const router = useRouter()

  const isLoginOpen = searchParams.get("setModal") === "true"

    const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("setModal")
    router.push(`?${params.toString()}`)
  }

  
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
                         window.location.href = "http://localhost:4000/auth/github"
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
      {

        data.map((item)=>
            <AnalyseCard key={item.id} id={item.id} title={item.title} logo={item.logo} desc={item.desc}/>  
        )

      }
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
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-blue-600 border-2 shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={openLoginModal}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
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

      {/* CTA Section */}
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

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Examples</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; 2026 DevScan. Made by Youssef Ben Said</p>
          </div>
        </div>
      </footer>

</React.Fragment> 
    
  )
}

export default page