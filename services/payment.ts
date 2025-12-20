/**
 * Payment Service - Stripe Integration
 *
 * Handles subscription management and one-time payments for:
 * - Monthly/Annual subscriptions
 * - Individual analysis purchases
 * - Premium experiences
 */

import { pb } from './pocketbase';
import { getCurrentUser } from './auth';

// Payment Provider Types
export type PaymentProvider = 'stripe' | 'paypal';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  analysisLimit?: number; // null = unlimited
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// Available subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '3 analyses per month',
      'Basic color recommendations',
      'AI chat support',
    ],
    analysisLimit: 3,
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited analyses',
      'Advanced skin analysis',
      'Personalized product recommendations',
      'Priority AI coach',
      'Visual makeup guides',
      'Trend research',
    ],
    analysisLimit: null,
  },
  {
    id: 'pro_yearly',
    name: 'Pro Annual',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited analyses',
      'Advanced skin analysis',
      'Personalized product recommendations',
      'Priority AI coach',
      'Visual makeup guides',
      'Trend research',
      '2 months free!',
    ],
    analysisLimit: null,
  },
];

/**
 * Initialize payment provider (Stripe)
 * This should be called on app initialization
 */
export const initializePaymentProvider = async () => {
  // TODO: Load Stripe.js dynamically
  // const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY);
  // return stripe;
  console.log('Payment provider initialized (placeholder)');
  return null;
};

/**
 * Create a subscription for the current user
 */
export const createSubscription = async (planId: string): Promise<Subscription | null> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to subscribe');
  }

  try {
    // TODO: Integrate with Stripe Checkout or Payment Element
    // 1. Create Stripe checkout session
    // 2. Redirect user to Stripe hosted page
    // 3. Handle webhook for successful payment
    // 4. Create subscription record in PocketBase

    console.log('Creating subscription for plan:', planId);

    // Placeholder: Create subscription record in PocketBase
    const subscription = await pb.collection('subscriptions').create({
      user: user.id,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      cancel_at_period_end: false,
    });

    return {
      id: subscription.id,
      userId: user.id,
      planId: planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return null;
  }
};

/**
 * Get the current user's active subscription
 */
export const getCurrentSubscription = async (): Promise<Subscription | null> => {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const records = await pb.collection('subscriptions').getFullList({
      filter: `user = "${user.id}" && status = "active"`,
      sort: '-created',
    });

    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.id,
      userId: user.id,
      planId: record.plan_id,
      status: record.status,
      currentPeriodStart: new Date(record.current_period_start),
      currentPeriodEnd: new Date(record.current_period_end),
      cancelAtPeriodEnd: record.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
};

/**
 * Cancel subscription at period end
 */
export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    // TODO: Call Stripe API to cancel subscription
    await pb.collection('subscriptions').update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return true;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return false;
  }
};

/**
 * Create a one-time payment for individual analysis or experience
 */
export const createOneTimePayment = async (
  amount: number,
  description: string,
  metadata?: Record<string, any>
): Promise<PaymentIntent | null> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // TODO: Create Stripe Payment Intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100, // Convert to cents
    //   currency: 'usd',
    //   description,
    //   metadata,
    // });

    console.log('Creating payment intent:', { amount, description, metadata });

    // Placeholder
    return {
      id: `pi_${Date.now()}`,
      amount,
      currency: 'usd',
      status: 'pending',
      metadata,
    };
  } catch (error) {
    console.error('Failed to create payment:', error);
    return null;
  }
};

/**
 * Check if user has reached their analysis limit
 */
export const checkAnalysisLimit = async (): Promise<{
  hasLimit: boolean;
  used: number;
  remaining: number;
  planName: string;
}> => {
  const subscription = await getCurrentSubscription();
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription?.planId) || SUBSCRIPTION_PLANS[0];

  if (plan.analysisLimit === null) {
    return {
      hasLimit: false,
      used: 0,
      remaining: Infinity,
      planName: plan.name,
    };
  }

  // Count analyses this period
  const user = getCurrentUser();
  if (!user) {
    return {
      hasLimit: true,
      used: 0,
      remaining: plan.analysisLimit,
      planName: plan.name,
    };
  }

  try {
    const periodStart = subscription?.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const count = await pb.collection('facial_geometry').getList(1, 1, {
      filter: `user = "${user.id}" && created >= "${periodStart.toISOString()}"`,
    });

    const used = count.totalItems;
    const remaining = Math.max(0, plan.analysisLimit - used);

    return {
      hasLimit: true,
      used,
      remaining,
      planName: plan.name,
    };
  } catch (error) {
    console.error('Failed to check analysis limit:', error);
    return {
      hasLimit: true,
      used: 0,
      remaining: plan.analysisLimit,
      planName: plan.name,
    };
  }
};

/**
 * Get pricing display for a plan
 */
export const getPlanPricing = (planId: string): string => {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) return '';

  if (plan.price === 0) return 'Free';

  if (plan.interval === 'month') {
    return `$${plan.price}/month`;
  } else {
    return `$${plan.price}/year`;
  }
};
