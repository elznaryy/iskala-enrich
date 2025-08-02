import Stripe from 'stripe';
import { plans, getPlanById } from './subscriptionPlans';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Payment Link IDs for each plan (replace with your actual payment link IDs)
const PAYMENT_LINKS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STARTER,
  pro: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRO,
  growth: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_GROWTH
} as const;

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  id: string;
  customerId: string;
  planType: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Create a customer in Stripe
 */
export async function createStripeCustomer(data: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<StripeCustomer> {
  const customer = await stripe.customers.create({
    email: data.email,
    name: data.name,
    metadata: data.metadata,
  });

  return {
    id: customer.id,
    email: customer.email!,
    name: customer.name || undefined,
    metadata: customer.metadata,
  };
}

/**
 * Get payment link for a specific plan
 */
export function getPaymentLink(planId: string): string | null {
  const plan = getPlanById(planId);
  if (!plan) return null;
  
  return PAYMENT_LINKS[planId as keyof typeof PAYMENT_LINKS] || null;
}

/**
 * Get all payment links
 */
export function getAllPaymentLinks(): Record<string, string> {
  return {
    starter: PAYMENT_LINKS.starter || '',
    pro: PAYMENT_LINKS.pro || '',
    growth: PAYMENT_LINKS.growth || ''
  };
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle successful checkout completion (both initial signup and renewals)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session);
  console.log('Session data:', {
    customer: session.customer,
    metadata: session.metadata,
    mode: session.mode,
    payment_status: session.payment_status
  });
  
  if (!session.customer) {
    console.error('Missing customer in session');
    return;
  }

  const email = session.customer_details?.email

  if (!email) {
    console.error('Missing email in session');
    return;
  }

  // For payment links, we need to get the plan from the line items
  let planType = session.metadata?.planType;
  
  if (!planType && session.line_items?.data) {
    // Try to get plan from line items
    const lineItem = session.line_items.data[0];
    if (lineItem?.price?.metadata?.planType) {
      planType = lineItem.price.metadata.planType;
    }
  }

  if (!planType) {
    console.error('No planType found in session metadata or line items');
    console.log('Available metadata:', session.metadata);
    console.log('Line items:', session.line_items?.data);
    return;
  }

  const plan = getPlanById(planType);
  
  if (!plan) {
    console.error('Invalid plan ID:', planType);
    return;
  }

  console.log(`📦 Plan found: ${plan.name} with ${plan.credits} credits`);

  // Handle subscription renewal - reset credits and update billing period
  try {
    const { handleSubscriptionRenewal } = await import('./database');
    const { supabase } = await import('./supabase');
    
    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (profileError) {
      console.error('Failed to find user by email:', profileError);
      return;
    }
    
    console.log(`Found user by email: ${profile.id}`);
    
    const result = await handleSubscriptionRenewal(
      profile.id, // Use the actual user ID from database
      plan.credits,
      Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      session.customer as string, // Pass Stripe customer ID
      planType
    );
    
    if (result.error) {
      console.error('Failed to handle subscription renewal:', result.error);
    } else {
      console.log(`🔄 Subscription renewed for customer ${session.customer}: ${plan.credits} credits allocated`);
    }
  } catch (error) {
    console.error('Failed to handle subscription renewal:', error);
  }
}



/**
 * Create Stripe Customer Portal URL
 */
export async function createCustomerPortalUrl(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
} 