import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db';
import { AuthRequest } from 'src/middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface CheckoutSessionRequest extends AuthRequest {
  body: {
    plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  };
}

const PLAN_PRICES: Record<string, number> = {
  MONTHLY: 999, 
  QUARTERLY: 2499, 
  YEARLY: 7999, 
};

const PLAN_DURATIONS: Record<string, number> = {
  MONTHLY: 30 * 24 * 60 * 60 * 1000, 
  QUARTERLY: 90 * 24 * 60 * 60 * 1000, 
  YEARLY: 365 * 24 * 60 * 60 * 1000, 
};


export const createCheckoutSession = async (
  req: CheckoutSessionRequest,
  res: Response
) => {
  try {
    console.log('=== Checkout Session Started ===');
    console.log('User:', req.user?.userId);
    console.log('Body:', req.body);

    if (!req.user) {
      console.error('❌ Missing user in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { plan } = req.body;
    console.log('Plan requested:', plan);

    if (!['MONTHLY', 'QUARTERLY', 'YEARLY'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ message: 'Stripe configuration missing' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      console.error('❌ User not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.id, user.email);

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: String(user.id),
        },
      });
      customerId = customer.id;
      console.log('✅ Stripe customer created:', customerId);

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
      console.log('✅ Database updated with stripeCustomerId');
    } else {
      console.log('✅ Using existing Stripe customer:', customerId);
    }

    console.log('Creating checkout session...');
    
    // Map plan to interval for easier Stripe API calls
    const intervalConfig = {
      MONTHLY: { interval: 'month' as const, interval_count: 1 },
      QUARTERLY: { interval: 'month' as const, interval_count: 3 },
      YEARLY: { interval: 'year' as const, interval_count: 1 },
    };

    const config = intervalConfig[plan];
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `DevScan ${plan} Subscription`,
            },
            recurring: config,
            unit_amount: PLAN_PRICES[plan],
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: String(user.id),
        plan: plan,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('✅ Subscription URL:', session.url);
    
    return res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Checkout session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return res.status(500).json({ 
      message: errorMessage, 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Stripe Signature Header:', sig ? 'Present' : 'MISSING');
  console.log('Body type:', typeof req.body, Array.isArray(req.body) ? 'Buffer' : 'Unknown');
  console.log('Body length:', req.body?.length);
  console.log('STRIPE_WEBHOOK_SECRET set:', process.env.STRIPE_WEBHOOK_SECRET ? 'Yes' : 'NO ⚠️');

  if (!sig) {
    console.error('❌ Missing stripe signature header - webhook verification failed');
    return res.status(400).json({ message: 'Missing stripe signature' });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured in environment');
    return res.status(400).json({ message: 'Webhook secret not configured' });
  }

  try {
    // req.body is a Buffer when using express.raw()
    const rawBody = req.body as Buffer | string;
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('✅ Webhook signature verified');
    console.log('Stripe webhook event received:', event.type, event.id);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout session completed');
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        console.log('Processing subscription updated');
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('Processing subscription deleted');
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    if (error instanceof Error && error.message.includes('No signatures found')) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }
    return res.status(400).json({ message: 'Webhook failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const userId = Number(session.metadata?.userId);
    const plan = session.metadata?.plan;
    const subscriptionId = session.subscription;

    if (!userId || !plan) {
      console.error('Missing userId or plan in session metadata', { userId, plan });
      return;
    }

    if (!subscriptionId) {
      console.error('No subscription ID in completed session', { sessionId: session.id });
      return;
    }

    // Retrieve the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('Retrieved subscription:', subscription.id, subscription.status);

    // Safely get timestamps
    let startTimestamp = (subscription as any).current_period_start;
    let endTimestamp = (subscription as any).current_period_end;

    // Fallback: use created date if current_period_start isn't available
    if (!startTimestamp && (subscription as any).created) {
      startTimestamp = (subscription as any).created;
    }

    // Fallback: calculate end date from interval
    if (!endTimestamp && startTimestamp && (subscription as any).items?.data?.[0]?.plan?.interval) {
      const interval = (subscription as any).items.data[0].plan.interval;
      const intervalCount = (subscription as any).items.data[0].plan.interval_count || 1;
      
      const msPerInterval = {
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000,
      };
      
      const msDuration = (msPerInterval[interval as keyof typeof msPerInterval] || msPerInterval.month) * intervalCount;
      endTimestamp = Math.floor(startTimestamp + (msDuration / 1000));
    }

    if (!startTimestamp || !endTimestamp) {
      console.error('Missing timestamps in subscription', { startTimestamp, endTimestamp });
      return;
    }

    const startDate = new Date(startTimestamp * 1000);
    const endDate = new Date(endTimestamp * 1000);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates calculated:', { startDate, endDate });
      return;
    }

    const updateData: any = {
      subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'EXPIRED',
      subscriptionPlan: plan as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      stripeSubscriptionId: subscriptionId,
    };

    console.log('Updating user subscription:', { userId, updateData });

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('User subscription updated successfully');
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}


async function handleSubscriptionUpdated(subscription: any) {
  try {
    const userId = Number(subscription.metadata?.userId);

    if (!userId) {
      console.error('Missing userId in subscription metadata');
      return;
    }

    const status: string = subscription.status === 'active' ? 'ACTIVE' : subscription.status === 'past_due' ? 'ACTIVE' : 'EXPIRED';

    console.log('Updating subscription status:', { userId, status, subscriptionStatus: subscription.status });

    // Safely get end timestamp
    let endTimestamp = (subscription as any).current_period_end;
    
    if (!endTimestamp && (subscription as any).created && (subscription as any).items?.data?.[0]?.plan?.interval) {
      // Calculate from created date and interval
      const interval = (subscription as any).items.data[0].plan.interval;
      const intervalCount = (subscription as any).items.data[0].plan.interval_count || 1;
      const startTimestamp = (subscription as any).current_period_start || (subscription as any).created;
      
      const msPerInterval = {
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000,
      };
      
      const msDuration = (msPerInterval[interval as keyof typeof msPerInterval] || msPerInterval.month) * intervalCount;
      endTimestamp = Math.floor(startTimestamp + (msDuration / 1000));
    }

    if (!endTimestamp) {
      console.error('Missing end timestamp in subscription');
      return;
    }

    const endDate = new Date(endTimestamp * 1000);
    if (isNaN(endDate.getTime())) {
      console.error('Invalid end date calculated:', endDate);
      return;
    }

    const updateData: any = {
      subscriptionStatus: status,
      subscriptionEndDate: endDate,
    };

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('Subscription updated in database');
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = Number(subscription.metadata?.userId);

  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'CANCELLED',
    },
  });
}


export const getSubscriptionStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (
      user.subscriptionStatus === 'ACTIVE' &&
      user.subscriptionEndDate &&
      new Date() > user.subscriptionEndDate
    ) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { subscriptionStatus: 'EXPIRED' },
      });
      return res.json({
        ...user,
        subscriptionStatus: 'EXPIRED',
      });
    }

    return res.json(user);
  } catch (error) {
    console.error('Subscription status error:', error);
    return res.status(500).json({ message: 'Failed to get subscription status' });
  }
};

export const cancelSubscription = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription' });
    }
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'CANCELLED' },
    });

    return res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};

export const webhookTestHealth = async (req: Request, res: Response) => {
  const envConfig = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ SET' : '❌ MISSING',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ SET' : '❌ MISSING',
    CLIENT_URL: process.env.CLIENT_URL || '❌ MISSING',
    PORT: process.env.PORT || '4000',
  };

  console.log('=== WEBHOOK HEALTH CHECK ===');
  console.log(envConfig);

  return res.json({
    message: '✅ Webhook endpoint is reachable',
    environment: envConfig,
    instruction: 'If STRIPE_WEBHOOK_SECRET is MISSING, add it to your .env file',
  });
};

export const testWebhook = async (req: Request, res: Response) => {
  console.log('=== TEST WEBHOOK CALLED ===');
  console.log('Body received:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Headers:', req.headers);

  try {
    let bodyData;
    if (Buffer.isBuffer(req.body)) {
      bodyData = JSON.parse(req.body.toString());
    } else {
      bodyData = req.body;
    }

    console.log('Parsed body:', bodyData);

    return res.json({
      message: '✅ Test webhook received successfully',
      bodyReceived: Boolean(bodyData),
      bodyType: typeof bodyData,
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return res.json({
      message: '⚠️ Test webhook received but parsing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID required' });
    }

    console.log('=== VERIFY PAYMENT ===');
    console.log('User ID:', req.user.userId);
    console.log('Session ID:', sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Session status:', session.payment_status);
    console.log('Subscription ID:', session.subscription);

    if (session.payment_status !== 'paid') {
      return res.json({ 
        status: 'unpaid',
        message: 'Payment not yet completed',
        paymentStatus: session.payment_status,
      });
    }

    const subscriptionId = session.subscription;

    if (!subscriptionId) {
      return res.json({ 
        status: 'pending',
        message: 'Subscription not yet created',
      });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const plan = session.metadata?.plan || 'MONTHLY';

    console.log('📦 Full subscription object from Stripe:', JSON.stringify(subscription, null, 2));

    console.log('Subscription object keys:', Object.keys(subscription));
    console.log('current_period_start:', (subscription as any).current_period_start);
    console.log('current_period_end:', (subscription as any).current_period_end);

    let startTimestamp = (subscription as any).current_period_start;
    let endTimestamp = (subscription as any).current_period_end;

    if (!startTimestamp && (subscription as any).created) {
      startTimestamp = (subscription as any).created;
      console.log('✅ Using created timestamp instead:', startTimestamp);
    }

    if (!endTimestamp) {
      if (startTimestamp && (subscription as any).items?.data?.[0]?.plan?.interval) {
        const interval = (subscription as any).items.data[0].plan.interval;
        const intervalCount = (subscription as any).items.data[0].plan.interval_count || 1;
        
        const msPerInterval = {
          'day': 24 * 60 * 60 * 1000,
          'week': 7 * 24 * 60 * 60 * 1000,
          'month': 30 * 24 * 60 * 60 * 1000,
          'year': 365 * 24 * 60 * 60 * 1000,
        };
        
        const msDuration = (msPerInterval[interval as keyof typeof msPerInterval] || msPerInterval.month) * intervalCount;
        endTimestamp = Math.floor(startTimestamp + (msDuration / 1000));
        console.log('✅ Calculated end timestamp:', endTimestamp);
      }
    }

    if (!startTimestamp || !endTimestamp) {
      console.error('❌ Still missing timestamps after fallback', { startTimestamp, endTimestamp, subscriptionStatus: subscription.status });
      console.error('Full subscription data:', JSON.stringify(subscription, null, 2));
      return res.status(400).json({ 
        message: 'Invalid subscription dates from Stripe',
        debug: {
          startTimestamp,
          endTimestamp,
          subscriptionStatus: subscription.status,
          hasItems: Boolean((subscription as any).items?.data),
        },
      });
    }

    const startDate = new Date(startTimestamp * 1000);
    const endDate = new Date(endTimestamp * 1000);

    console.log('Calculated dates:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('❌ Invalid calculated dates:', { startDate, endDate, startTimestamp, endTimestamp });
      return res.status(400).json({ 
        message: 'Failed to parse subscription dates',
        debug: {
          startDate: startDate.toString(),
          endDate: endDate.toString(),
          startTimestamp,
          endTimestamp,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'EXPIRED',
        subscriptionPlan: plan as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        stripeSubscriptionId: subscriptionId as string,
      },
    });

    console.log('✅ User subscription updated successfully');
    console.log('Updated user:', {
      id: updatedUser.id,
      status: updatedUser.subscriptionStatus,
      plan: updatedUser.subscriptionPlan,
    });

    return res.json({
      status: 'verified',
      message: '✅ Payment verified and user subscription updated',
      subscription: {
        status: updatedUser.subscriptionStatus,
        plan: updatedUser.subscriptionPlan,
        startDate: updatedUser.subscriptionStartDate,
        endDate: updatedUser.subscriptionEndDate,
      },
    });
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    return res.status(500).json({ 
      message: 'Failed to verify payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
