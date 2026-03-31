"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  FolderGit2, 
  Clock,
  Activity,
  UserPlus,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Settings,
  GitBranch,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronRight,
  Code2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useUserStore } from "@/store/user.store";
import { useRepoStore } from "@/store/repo.store";
import { useSubscriptionStore } from "@/store/subscription.store";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("week");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { users, pagination: userPagination, fetchListUsers, loading: usersLoading } = useUserStore();
  const { repos, fetchRepos, loading: reposLoading } = useRepoStore();
  const { stats: subscriptionStats, chartData: subscriptionChart, recentSubscriptions, fetchAllSubscriptionData, loading: subscriptionLoading } = useSubscriptionStore();

  useEffect(() => {
    fetchListUsers(1);
    fetchRepos(1);
    fetchAllSubscriptionData();
  }, [fetchListUsers, fetchRepos, fetchAllSubscriptionData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchListUsers(1), fetchRepos(1), fetchAllSubscriptionData()]);
    setIsRefreshing(false);
  };

  // Calculate stats from real data
  const totalUsers = users?.length || 0;
  const totalRepos = repos?.length || 0;
  const bannedUsers = users?.filter(u => u.isBanned).length || 0;
  const activeUsers = totalUsers - bannedUsers;
  
  // Subscription stats
  const activeSubscriptions = subscriptionStats?.activeSubscriptions || 0;
  const inactiveSubscriptions = subscriptionStats?.inactiveSubscriptions || 0;
  const activationRate = subscriptionStats?.activationRate || '0';
  const monthlyRevenue = subscriptionStats?.estimatedMonthlyRevenue || '0';
  
  // Calculate trends (mock data for now - you'd compare with previous period)
  const userTrend = "+12%";
  const repoTrend = "+8%";
  const bannedTrend = "-5%";
  const activeTrend = "+15%";
  const subscriptionTrend = "+23%";
  const revenueTrend = "+18%";

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: userTrend,
      icon: Users,
      trend: userTrend.startsWith('+') ? 'up' : 'down',
      color: "white",
      link: "/admin/users",
    },
    {
      title: "Active Users",
      value: activeUsers.toLocaleString(),
      change: activeTrend,
      icon: UserCheck,
      trend: activeTrend.startsWith('+') ? 'up' : 'down',
      color: "white",
      link: "/admin/users?filter=active",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      change: subscriptionTrend,
      icon: CheckCircle,
      trend: subscriptionTrend.startsWith('+') ? 'up' : 'down',
      color: "white",
      link: "/admin/subscriptions",
    },
    {
      title: "Est. Monthly Revenue",
      value: `$${parseFloat(monthlyRevenue).toFixed(2)}`,
      change: revenueTrend,
      icon: DollarSign,
      trend: revenueTrend.startsWith('+') ? 'up' : 'down',
      color: "white",
      link: "/admin/subscriptions",
    },
    {
      title: "Banned Users",
      value: bannedUsers.toLocaleString(),
      change: bannedTrend,
      icon: UserX,
      trend: bannedTrend.startsWith('+') ? 'up' : 'down',
      color: "white",
      link: "/admin/users?filter=banned",
    },
    {
      title: "Total Repos",
      value: totalRepos.toLocaleString(),
      change: repoTrend,
      icon: FolderGit2,
      trend: repoTrend.startsWith('+') ? 'up' : 'down',
      color: "white",
      link: "/admin/repos",
    },
  ];

  // Recent activity combining users and repos
  const recentActivity = [
    ...(users?.slice(0, 3).map(user => ({
      id: `user-${user.id}`,
      action: user.isBanned ? "User was banned" : "New user registered",
      user: user.email,
      time: new Date(user.createdAt).toLocaleDateString(),
      type: user.isBanned ? "alert" : "user",
      icon: user.isBanned ? UserX : UserPlus,
      link: `/admin/users/${user.id}`,
    })) || []),
    ...(repos?.slice(0, 3).map(repo => ({
      id: `repo-${repo.id}`,
      action: "Repository added",
      user: repo.name,
      time: new Date(repo.createdAt).toLocaleDateString(),
      type: "repo",
      icon: FolderGit2,
      link: `/admin/repos/${repo.id}`,
    })) || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Language distribution
  const languageStats = repos?.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topLanguages = Object.entries(languageStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (usersLoading && reposLoading && !users && !repos) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent mx-auto" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, Admin</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <Calendar size={16} />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Filter */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {["day", "week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  timeRange === range
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Download size={16} />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(stat.link)}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-3">
                      {stat.trend === "up" ? (
                        <TrendingUp size={16} className="text-green-600" />
                      ) : (
                        <TrendingDown size={16} className="text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-400">vs last {timeRange}</span>
                    </div>
                  </div>
                  <div className={`p-3 ${stat.color} bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                <p className="text-sm text-gray-500 mt-1">New users over time</p>
              </div>
              <Activity size={20} className="text-gray-400" />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gray-900 rounded-t-lg transition-all hover:bg-gray-700 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Repository Activity */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Repository Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Scans per day</p>
              </div>
              <FolderGit2 size={20} className="text-gray-400" />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {[55, 45, 70, 60, 80, 50, 65].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gray-700 rounded-t-lg transition-all hover:bg-gray-600 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Subscription Trend</h2>
                <p className="text-sm text-gray-500 mt-1">Active subscriptions per day</p>
              </div>
              <CreditCard size={20} className="text-gray-400" />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {subscriptionChart?.weeklyData && subscriptionChart.weeklyData.length > 0 ? (
                subscriptionChart.weeklyData.map((data, i) => {
                  const maxValue = Math.max(...subscriptionChart.weeklyData.map(d => d.activeSubscriptions), 1);
                  const height = (data.activeSubscriptions / maxValue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-green-600 rounded-t-lg transition-all hover:bg-green-500 cursor-pointer"
                        style={{ height: `${height || 5}%` }}
                        title={`${data.activeSubscriptions} subscriptions`}
                      />
                      <span className="text-xs text-gray-500 truncate">
                        {data.date}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center text-gray-400">
                  No subscription data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Breakdown & Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Plan Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
                <p className="text-sm text-gray-500 mt-1">Active subscribers by plan</p>
              </div>
              <CreditCard size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly ($9.99)</span>
                  <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.monthlySubscribers || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ 
                      width: `${subscriptionStats && (subscriptionStats.monthlySubscribers / (subscriptionStats.activeSubscriptions || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Quarterly ($24.99)</span>
                  <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.quarterlySubscribers || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ 
                      width: `${subscriptionStats && (subscriptionStats.quarterlySubscribers / (subscriptionStats.activeSubscriptions || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Yearly ($79.99)</span>
                  <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.yearlySubscribers || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full"
                    style={{ 
                      width: `${subscriptionStats && (subscriptionStats.yearlySubscribers / (subscriptionStats.activeSubscriptions || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status Overview */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Subscription Status</h2>
                <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
              </div>
              <AlertCircle size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.activeSubscriptions || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Expired</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.expiredSubscriptions || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <UserX size={18} className="text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.cancelledSubscriptions || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Inactive</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{subscriptionStats?.inactiveSubscriptions || 0}</span>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Activation Rate</span>
                  <span className="text-sm font-semibold text-blue-600">{subscriptionStats?.activationRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link 
                href="/admin/activity"
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <Link
                      key={activity.id}
                      href={activity.link}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon size={16} className="text-gray-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Language Distribution & Quick Actions */}
          <div className="space-y-6">
            {/* Language Stats */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top Languages</h3>
                <Code2 size={18} className="text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {topLanguages.map(([lang, count]) => (
                  <div key={lang}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{lang}</span>
                      <span className="text-gray-900 font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-gray-900 h-1.5 rounded-full"
                        style={{ width: `${(count / totalRepos) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/admin/users/create"
                className="p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors group flex items-center gap-3"
              >
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">Add New User</p>
                  <p className="text-sm text-gray-300">Create a new user account</p>
                </div>
              </Link>

              <Link
                href="/admin/repos/add"
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group flex items-center gap-3"
              >
                <FolderGit2 size={20} className="text-gray-700 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-gray-900">Add Repository</p>
                  <p className="text-sm text-gray-500">Scan new repository</p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group flex items-center gap-3"
              >
                <Settings size={20} className="text-gray-700 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-gray-900">System Settings</p>
                  <p className="text-sm text-gray-500">Configure preferences</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Subscriptions Table */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Subscriptions</h2>
                <p className="text-sm text-gray-500 mt-1">Latest active subscriptions</p>
              </div>
            </div>
            <Link 
              href="/admin/subscriptions"
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubscriptions && recentSubscriptions.length > 0 ? (
                  recentSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{sub.email}</p>
                          <p className="text-xs text-gray-500">{sub.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.subscriptionPlan === 'MONTHLY' ? 'bg-blue-100 text-blue-800' :
                          sub.subscriptionPlan === 'QUARTERLY' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sub.subscriptionStartDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sub.subscriptionEndDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-green-700 font-medium">Active</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No recent subscriptions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <GitBranch size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Repos/User</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalUsers ? (totalRepos / totalUsers).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Shield size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Security Score</p>
                <p className="text-xl font-bold text-gray-900">A+</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Clock size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Response</p>
                <p className="text-xl font-bold text-gray-900">1.2s</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Activity size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">System Health</p>
                <p className="text-xl font-bold text-gray-900">98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}