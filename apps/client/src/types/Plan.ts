export interface Plan {
  name: string;
  description: string;
  price: string | number;
  period?: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export type Plans = Plan[];

export interface PlanCardProps {
  plan: Plan;
  openLoginModal: () => void;
}
