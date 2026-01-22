"use client"

import  {FC} from "react";
import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanCardProps } from "@/types/Plan";



const PlanCard: FC<PlanCardProps> = ({ plan, openLoginModal }) => {
  return (
    <Card className={`relative ${plan.popular ? 'border-blue-600 border-2 shadow-xl scale-105' : ''}`}>
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
  );
};

export default PlanCard;
