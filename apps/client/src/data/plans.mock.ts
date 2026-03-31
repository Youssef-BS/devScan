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
      price: "9.99",
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
      cta: "Subscribe Now"
    },
    {
      name: "Enterprise",
      price: "24.99",
      period: "per 3 months",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Advanced analytics",
        "Dedicated support",
        "SLA guarantee",
        "Custom integrations",
        "Beta feature access",
        "Performance monitoring",
        "Team collaboration tools"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];