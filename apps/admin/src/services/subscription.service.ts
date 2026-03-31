import { api } from "@/lib/axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export interface SubscriptionStats {
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  inactiveSubscriptions: number;
  monthlySubscribers: number;
  quarterlySubscribers: number;
  yearlySubscribers: number;
  estimatedMonthlyRevenue: string;
  activationRate: string;
}

export interface SubscriptionBreakdown {
  monthly: {
    active: number;
    expired: number;
    cancelled: number;
  };
  quarterly: {
    active: number;
    expired: number;
    cancelled: number;
  };
  yearly: {
    active: number;
    expired: number;
    cancelled: number;
  };
}

export interface SubscriptionChartData {
  statusCounts: {
    ACTIVE: number;
    EXPIRED: number;
    CANCELLED: number;
    INACTIVE: number;
  };
  weeklyData: Array<{
    date: string;
    activeSubscriptions: number;
  }>;
}

export interface RecentSubscription {
  id: number;
  email: string;
  username: string;
  subscriptionPlan: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  createdAt: string;
}

export const fetchSubscriptionStats = async (): Promise<SubscriptionStats> => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/subscriptions/stats`);
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Failed to fetch subscription stats";
    throw new Error(msg);
  }
};

export const fetchSubscriptionBreakdown = async (): Promise<SubscriptionBreakdown> => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/subscriptions/breakdown`);
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Failed to fetch subscription breakdown";
    throw new Error(msg);
  }
};

export const fetchSubscriptionChartData = async (): Promise<SubscriptionChartData> => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/subscriptions/chart`);
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Failed to fetch subscription chart data";
    throw new Error(msg);
  }
};

export const fetchRecentSubscriptions = async (limit = 10): Promise<RecentSubscription[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/subscriptions/recent?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Failed to fetch recent subscriptions";
    throw new Error(msg);
  }
};
