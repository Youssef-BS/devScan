"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { createCheckoutSession } from "@/services/stripe.service";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Monthly",
    plan: "MONTHLY" as const,
    price: 9.99,
    duration: "month",
    description: "Perfect for getting started with code audits",
    features: [
      "1 repository scan",
      "Basic security analysis",
      "Code quality metrics",
      "Up to 100 commits per month",
      "Email support",
    ],
  },
  {
    name: "Quarterly",
    plan: "QUARTERLY" as const,
    price: 24.99,
    duration: "3 months",
    description: "Great value for teams and regular users",
    features: [
      "5 repository scans",
      "Advanced security analysis",
      "Performance optimization",
      "Up to 500 commits per month",
      "Priority email support",
      "API access",
    ],
    highlighted: true,
  },
  {
    name: "Yearly",
    plan: "YEARLY" as const,
    price: 79.99,
    duration: "year",
    savings: "Save 33%",
    description: "Best value for power users and enterprises",
    features: [
      "Unlimited repository scans",
      "Enterprise security analysis",
      "AI-powered auto fixes",
      "Unlimited commits",
      "24/7 phone support",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: "MONTHLY" | "QUARTERLY" | "YEARLY") => {
    try {
      setLoading(plan);
      await createCheckoutSession(plan);
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your needs. All plans include access to
              DevScan's powerful code analysis features.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.plan}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex flex-col ${
                  plan.highlighted ? "md:scale-105" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={`flex-1 rounded-2xl p-8 transition-all duration-300 ${
                    plan.highlighted
                      ? "border-2 border-purple-600 bg-linear-to-br from-purple-50 to-blue-50 shadow-2xl"
                      : "border border-gray-200 bg-white hover:shadow-lg"
                  }`}
                >
                  {plan.savings && (
                    <div className="mb-4 text-sm font-semibold text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full">
                      {plan.savings}
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 font-medium">
                        / {plan.duration}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.plan)}
                    disabled={loading === plan.plan}
                    className={`w-full mb-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg"
                        : "border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                    }`}
                  >
                    {loading === plan.plan ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-current rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 inline mr-2" />
                        Get Started
                      </>
                    )}
                  </Button>

                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-gray-700 text-sm"
                        >
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Have questions? We're here to help
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes! You can change your subscription plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) through Stripe secure payment processing.",
              },
              {
                q: "Is there a free trial?",
                a: "We offer a 7-day free trial for new users so you can try DevScan risk-free before committing to a plan.",
              },
              {
                q: "What happens if I cancel?",
                a: "Your subscription will remain active until the end of your current billing period. You'll have full access to all features until then.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with DevScan.",
              },
              {
                q: "Is there support for enterprise plans?",
                a: "Absolutely! Contact our sales team for custom enterprise plans and dedicated support.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
