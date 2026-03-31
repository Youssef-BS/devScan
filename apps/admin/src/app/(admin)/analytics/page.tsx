"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GitBranch,
  Clock,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useUserStore } from "@/store/user.store";
import { useRepoStore } from "@/store/repo.store";
import { useSubscriptionStore } from "@/store/subscription.store";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { users, fetchListUsers, loading: usersLoading } = useUserStore();
  const { repos, fetchRepos, loading: reposLoading } = useRepoStore();
  const {
    stats: subscriptionStats,
    chartData: subscriptionChart,
    breakdown: subscriptionBreakdown,
    fetchAllSubscriptionData,
    loading: subscriptionLoading,
  } = useSubscriptionStore();

  useEffect(() => {
    fetchListUsers(1);
    fetchRepos(1);
    fetchAllSubscriptionData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchListUsers(1),
      fetchRepos(1),
      fetchAllSubscriptionData(),
    ]);
    setIsRefreshing(false);
  };

  // Calculate analytics data
  const totalUsers = users?.length || 0;
  const bannedUsers = users?.filter((u) => u.isBanned).length || 0;
  const activeUsers = totalUsers - bannedUsers;
  const totalRepos = repos?.length || 0;
  const totalSubscriptions = (subscriptionStats?.activeSubscriptions || 0) + 
    (subscriptionStats?.expiredSubscriptions || 0) + 
    (subscriptionStats?.inactiveSubscriptions || 0);
  const activeSubscriptions = subscriptionStats?.activeSubscriptions || 0;
  const expiredSubscriptions = subscriptionStats?.expiredSubscriptions || 0;
  const cancelledSubscriptions = subscriptionStats?.cancelledSubscriptions || 0;

  // User engagement metrics
  const userRetention = ((activeUsers / totalUsers) * 100).toFixed(1);
  const reposPerUser = (totalRepos / activeUsers).toFixed(2);
  const subscriptionPenetration = ((totalSubscriptions / totalUsers) * 100).toFixed(1);

  // Revenue metrics
  const monthlyRevenue = parseFloat(subscriptionStats?.estimatedMonthlyRevenue || "0").toFixed(2);
  const annualizedRevenue = (parseFloat(monthlyRevenue) * 12).toFixed(2);
  const revenuePerSubscription = (parseFloat(monthlyRevenue) / activeSubscriptions).toFixed(2);

  // Churn metrics
  const churnRate = (
    (cancelledSubscriptions / (activeSubscriptions + cancelledSubscriptions)) *
    100
  ).toFixed(1);

  const analyticsCards = [
    {
      title: "User Retention",
      value: `${userRetention}%`,
      description: "%",
      metric: "Active Users / Total Users",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Repos per User",
      value: reposPerUser,
      description: "avg repos",
      metric: "Total Repos / Active Users",
      icon: GitBranch,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Subscription Penetration",
      value: `${subscriptionPenetration}%`,
      description: "of users",
      metric: "Total Subscriptions / Total Users",
      icon: Users,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Monthly Revenue",
      value: `$${monthlyRevenue}`,
      description: "MRR",
      metric: "Estimated recurring revenue",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Annualized Revenue",
      value: `$${annualizedRevenue}`,
      description: "ARR",
      metric: "Projected annual revenue",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Revenue per Subscription",
      value: `$${revenuePerSubscription}`,
      description: "avg monthly",
      metric: "MRR / Active Subscriptions",
      icon: Activity,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Subscription Churn Rate",
      value: `${churnRate}%`,
      description: "monthly churn",
      metric: "Cancelled / (Active + Cancelled)",
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      description: "active",
      metric: `${((activeSubscriptions / totalSubscriptions) * 100).toFixed(1)}% of total`,
      icon: Activity,
      color: "from-teal-500 to-teal-600",
    },
  ];

  // Plan distribution data
  const planData = subscriptionBreakdown ? {
    MONTHLY: (subscriptionBreakdown.monthly?.active || 0),
    QUARTERLY: (subscriptionBreakdown.quarterly?.active || 0),
    YEARLY: (subscriptionBreakdown.yearly?.active || 0),
  } : {
    MONTHLY: 0,
    QUARTERLY: 0,
    YEARLY: 0,
  };
  const totalPlanUsers =
    planData.MONTHLY + planData.QUARTERLY + planData.YEARLY;

  // Status distribution
  const statusData = {
    active: activeSubscriptions,
    expired: expiredSubscriptions,
    cancelled: cancelledSubscriptions,
  };

  // Chart data - simulated weekly breakdown
  const weeklyUserData = [
    { day: "Mon", new: 12, active: 450, churned: 3 },
    { day: "Tue", new: 15, active: 465, churned: 2 },
    { day: "Wed", new: 18, active: 483, churned: 5 },
    { day: "Thu", new: 22, active: 505, churned: 4 },
    { day: "Fri", new: 28, active: 533, churned: 6 },
    { day: "Sat", new: 15, active: 548, churned: 2 },
    { day: "Sun", new: 10, active: 558, churned: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive metrics and insights
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500">{card.metric}</p>
            <p className="text-xs text-gray-400 mt-1">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Plan Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Plan Distribution
          </h2>
          <div className="space-y-4">
            {[
              {
                name: "Monthly",
                count: planData.MONTHLY,
                color: "bg-blue-500",
              },
              {
                name: "Quarterly",
                count: planData.QUARTERLY,
                color: "bg-purple-500",
              },
              {
                name: "Yearly",
                count: planData.YEARLY,
                color: "bg-amber-500",
              },
            ].map((plan) => (
              <div key={plan.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {plan.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {plan.count}(
                    {totalPlanUsers > 0
                      ? ((plan.count / totalPlanUsers) * 100).toFixed(1)
                      : "0"}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${plan.color} transition-all`}
                    style={{
                      width: `${
                        totalPlanUsers > 0
                          ? (plan.count / totalPlanUsers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Subscription Status
          </h2>
          <div className="space-y-3">
            {[
              {
                status: "Active",
                count: statusData.active,
                color: "text-green-600",
                bg: "bg-green-50",
                icon: "✓",
              },
              {
                status: "Expired",
                count: statusData.expired,
                color: "text-yellow-600",
                bg: "bg-yellow-50",
                icon: "⏰",
              },
              {
                status: "Cancelled",
                count: statusData.cancelled,
                color: "text-red-600",
                bg: "bg-red-50",
                icon: "✕",
              },
            ].map((status) => (
              <div
                key={status.status}
                className={`flex justify-between items-center p-3 rounded-lg ${status.bg}`}
              >
                <span className={`font-medium ${status.color}`}>
                  {status.icon} {status.status}
                </span>
                <span className={`text-lg font-semibold ${status.color}`}>
                  {status.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Trends Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Weekly User Activity Trends
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  New Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Active Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Churned
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Retention Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {weeklyUserData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.day}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">
                    {row.new}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">
                    {row.active}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                      {row.churned}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(
                      ((row.active - row.churned) / row.active) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Strong User Growth
              </h3>
              <p className="text-sm text-blue-800">
                User base has grown by 12% this month with consistent daily
                activity.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Healthy Subscription Base
              </h3>
              <p className="text-sm text-green-800">
                High penetration rate with {subscriptionPenetration}% of users
                on paid plans.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Churn Monitoring
              </h3>
              <p className="text-sm text-amber-800">
                Current churn rate at {churnRate}%. Consider retention strategies
                if trending upward.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">
                Revenue Pipeline
              </h3>
              <p className="text-sm text-purple-800">
                Projected ARR: ${annualizedRevenue}. Monitor MoM growth trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
