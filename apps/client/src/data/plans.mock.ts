import { Plans } from "@/types/Plan";

export const plans : Plans = [
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