const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface SubscriptionStatus {
  subscriptionStatus: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  subscriptionPlan?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export const createCheckoutSession = async (
  plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
) => {
  try {
    const res = await fetch(`${apiUrl}/subscription/checkout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.error || data.message || 'Failed to create checkout session';
      console.error('Checkout error details:', { status: res.status, error: errorMessage, data });
      throw new Error(errorMessage);
    }

    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    console.error('Checkout error:', message);
    throw error;
  }
};

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const res = await fetch(`${apiUrl}/subscription/status`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to get subscription status');
    }

    return res.json();
  } catch (error) {
    console.error('Get subscription error:', error);
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    const res = await fetch(`${apiUrl}/subscription/cancel`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return res.json();
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
};

export const verifyPayment = async (sessionId: string) => {
  try {
    const res = await fetch(`${apiUrl}/subscription/verify-payment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to verify payment');
    }

    return res.json();
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};
