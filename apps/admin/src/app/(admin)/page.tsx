"use client";

import { useState } from "react";
import {
  Users,
  FolderGit2,
  AlertCircle,
  Clock,
  Activity,
  UserPlus,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("week");

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Active Repos",
      value: "567",
      change: "+8%",
      icon: FolderGit2,
      trend: "up",
    },
    {
      title: "Security Alerts",
      value: "89",
      change: "-23%",
      icon: AlertCircle,
      trend: "down",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      change: "-5%",
      icon: Clock,
      trend: "down",
    },
  ];

  const recentActivity = [
    { 
      id: 1, 
      action: "New user registered", 
      user: "john@example.com", 
      time: "2 hours ago", 
      type: "user",
      icon: UserPlus,
    },
    { 
      id: 2, 
      action: "Repository scanned", 
      user: "company/api-service", 
      time: "4 hours ago", 
      type: "repo",
      icon: FolderGit2,
    },
    { 
      id: 3, 
      action: "Security vulnerability found", 
      user: "Critical in auth module", 
      time: "5 hours ago", 
      type: "alert",
      icon: AlertCircle,
    },
    { 
      id: 4, 
      action: "User deleted repository", 
      user: "old-project", 
      time: "1 day ago", 
      type: "repo",
      icon: FolderGit2,
    },
    { 
      id: 5, 
      action: "New admin login", 
      user: "admin@devscan.com", 
      time: "1 day ago", 
      type: "user",
      icon: Users,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
          <p className="text-gray-900 mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <Calendar className="w-4 h-4 text-gray-900" />
          <span>Last updated: Today at 10:30 AM</span>
        </div>
      </div>

      <div className="mb-8 flex gap-2">
        {["day", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timeRange === range
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-gray-900" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-gray-900" />
                    )}
                    <p className={`text-sm text-gray-900`}>
                      {stat.change} from last {timeRange}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-900" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">User Growth</h2>
            <Activity className="w-5 h-5 text-gray-900" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-gray-900 mx-auto mb-2" />
              <p className="text-gray-900">Chart placeholder - User growth over time</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Repository Activity</h2>
            <FolderGit2 className="w-5 h-5 text-gray-900" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-gray-900 mx-auto mb-2" />
              <p className="text-gray-900">Chart placeholder - Repository scans per day</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-900">{activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-900">{activity.time}</span>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <button className="text-sm text-gray-900 hover:text-gray-900 font-medium flex items-center gap-2">
            View all activity
            <Plus className="w-4 h-4 text-gray-900" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-left group">
          <UserPlus className="w-5 h-5 mb-2 text-white group-hover:scale-110 transition-transform" />
          <p className="font-medium text-white">Add New User</p>
          <p className="text-sm text-gray-300">Create a new user account</p>
        </button>

        <button className="p-4 bg-white border border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 transition-colors text-left group">
          <Download className="w-5 h-5 mb-2 text-gray-900 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-gray-900">Export Reports</p>
          <p className="text-sm text-gray-900">Download analytics data</p>
        </button>

        <button className="p-4 bg-white border border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 transition-colors text-left group">
          <Settings className="w-5 h-5 mb-2 text-gray-900 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-gray-900">System Settings</p>
          <p className="text-sm text-gray-900">Configure preferences</p>
        </button>
      </div>
    </div>
  );
}