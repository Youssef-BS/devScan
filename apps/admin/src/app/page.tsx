"use client";

import { useAuth } from "../auth-context";
import ProtectedLayout from "../protected-layout";

export default function Home() {
  const { logout } = useAuth();

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-black text-white">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold">DevScan Admin Panel</h1>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard Cards */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-400">1,234</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Active Repositories</h3>
              <p className="text-3xl font-bold text-green-400">567</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Security Alerts</h3>
              <p className="text-3xl font-bold text-red-400">89</p>
            </div>
          </div>

          <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div>
                  <p className="font-medium">New repository scanned</p>
                  <p className="text-sm text-gray-400">user/repo-name</p>
                </div>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div>
                  <p className="font-medium">Security vulnerability detected</p>
                  <p className="text-sm text-gray-400">Critical issue in authentication</p>
                </div>
                <span className="text-sm text-gray-400">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">User registered</p>
                  <p className="text-sm text-gray-400">newuser@example.com</p>
                </div>
                <span className="text-sm text-gray-400">1 day ago</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
