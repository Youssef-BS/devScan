import { create } from 'zustand';
import {
  fetchSubscriptionStats,
  fetchSubscriptionBreakdown,
  fetchSubscriptionChartData,
  fetchRecentSubscriptions,
  type SubscriptionStats,
  type SubscriptionBreakdown,
  type SubscriptionChartData,
  type RecentSubscription,
} from '@/services/subscription.service';

interface SubscriptionStore {
  stats: SubscriptionStats | null;
  breakdown: SubscriptionBreakdown | null;
  chartData: SubscriptionChartData | null;
  recentSubscriptions: RecentSubscription[];
  loading: boolean;
  error: string | null;

  fetchSubscriptionStats: () => Promise<void>;
  fetchSubscriptionBreakdown: () => Promise<void>;
  fetchSubscriptionChartData: () => Promise<void>;
  fetchRecentSubscriptions: (limit?: number) => Promise<void>;
  fetchAllSubscriptionData: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  stats: null,
  breakdown: null,
  chartData: null,
  recentSubscriptions: [],
  loading: false,
  error: null,

  fetchSubscriptionStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSubscriptionStats();
      set({ stats: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stats' });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubscriptionBreakdown: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSubscriptionBreakdown();
      set({ breakdown: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch breakdown' });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubscriptionChartData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSubscriptionChartData();
      set({ chartData: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch chart data' });
    } finally {
      set({ loading: false });
    }
  },

  fetchRecentSubscriptions: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchRecentSubscriptions(limit);
      set({ recentSubscriptions: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch recent subscriptions' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllSubscriptionData: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        fetchSubscriptionStats(),
        fetchSubscriptionBreakdown(),
        fetchSubscriptionChartData(),
        fetchRecentSubscriptions(),
      ]);
      
      const [stats, breakdown, chartData, recentSubscriptions] = await Promise.all([
        fetchSubscriptionStats(),
        fetchSubscriptionBreakdown(),
        fetchSubscriptionChartData(),
        fetchRecentSubscriptions(),
      ]);

      set({
        stats,
        breakdown,
        chartData,
        recentSubscriptions,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch subscription data' });
    } finally {
      set({ loading: false });
    }
  },
}));
