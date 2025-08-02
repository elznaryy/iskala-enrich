export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  features: string[];
  description?: string;
  stripe?: {
    priceId: string;
    metadata: {
      planType: string;
      credits: string;
      features: string;
    };
  };
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    credits: 50,
    features: [
      '50 Credits',
      '50 Valid emails',
      'Phone verification',
      'API access',
      'Basic enrichment capabilities'
    ],
    description: 'Perfect for small teams getting started with lead enrichment',
    stripe: {
      priceId: 'price_starter_monthly', // Replace with your actual Stripe Price ID
      metadata: {
        planType: 'starter',
        credits: '50',
        features: 'basic_enrichment,phone_verification,api_access'
      }
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 80,
    credits: 1000,
    popular: true,
    features: [
      '1,000 Credits',
      '1,000 Valid emails',
      'Phone verification',
      'API access',
      'Priority support',
      'Advanced enrichment features'
    ],
    description: 'Most popular choice for growing sales teams',
    stripe: {
      priceId: 'price_pro_monthly', // Replace with your actual Stripe Price ID
      metadata: {
        planType: 'pro',
        credits: '1000',
        features: 'advanced_enrichment,phone_verification,api_access,priority_support'
      }
    }
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 250,
    credits: 5000,
    features: [
      '5,000 Credits',
      '5,000 Valid emails',
      'Phone verification',
      'API access',
      'Enterprise features',
      'Dedicated support'
    ],
    description: 'For large organizations requiring bulk enrichment',
    stripe: {
      priceId: 'price_growth_monthly', // Replace with your actual Stripe Price ID
      metadata: {
        planType: 'growth',
        credits: '5000',
        features: 'enterprise_enrichment,phone_verification,api_access,dedicated_support'
      }
    }
  }
];

export const getPlanById = (id: string): Plan | undefined => {
  return plans.find(plan => plan.id === id);
};

export const getPopularPlan = (): Plan | undefined => {
  return plans.find(plan => plan.popular);
};

export const getDefaultPlan = (): Plan => {
  return plans[0]; // Starter plan as default
};

// Credit usage constants
export const CREDIT_COSTS = {
  EMAIL_ONLY: 1,
  PHONE_ONLY: 10,
  BOTH: 11
} as const;

export type EnrichmentType = keyof typeof CREDIT_COSTS;

export const getCreditsForEnrichment = (type: EnrichmentType): number => {
  return CREDIT_COSTS[type];
};

// Stripe helper functions
export const getPlanByStripePriceId = (priceId: string): Plan | undefined => {
  return plans.find(plan => plan.stripe?.priceId === priceId);
};

export const getStripeMetadata = (planId: string) => {
  const plan = getPlanById(planId);
  return plan?.stripe?.metadata;
};

export const getStripePriceId = (planId: string): string | undefined => {
  const plan = getPlanById(planId);
  return plan?.stripe?.priceId;
}; 