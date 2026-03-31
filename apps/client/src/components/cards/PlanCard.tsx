"use client"

import { FC, useState } from "react";
import { Check, Loader } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanCardProps } from "@/types/Plan";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PlanCard: FC<PlanCardProps> = ({ plan }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    if (!isAuthenticated) {
      router.push('/?setModal=true');
      return;
    }

    setIsLoading(true);

    try {
      // Map plan name to Stripe plan code
      const planMap: Record<string, string> = {
        'Free': 'MONTHLY',
        'Pro': 'QUARTERLY',
        'Enterprise': 'YEARLY',
      };

      const stripePlan = planMap[plan.name];

      // If Free plan, just redirect to dashboard
      if (plan.name === 'Free') {
        router.push('/dashboard');
        return;
      }

      // Call checkout API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan: stripePlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`relative flex flex-col h-full ${plan.popular ? 'border-blue-600 border-2 shadow-xl' : ''}`}>
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
          {plan.price !== "Custom" && plan.period && (
            <span className="text-gray-600 ml-2">/{plan.period}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={handleSelectPlan}
          disabled={isLoading}
          className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
          variant={plan.popular ? 'default' : 'outline'}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            plan.cta
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
