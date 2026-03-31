"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  ToggleRight,
  ToggleLeft,
  Database,
  Shield,
  Mail,
  Clock,
  Eye,
  EyeOff,
  Wifi,
  Activity,
  HardDrive,
  Zap,
} from "lucide-react";
import { useSettingsStore } from "@/store/admin.settings.store";

export default function SettingsPage() {
  const {
    settings,
    systemHealth,
    systemStats,
    loading,
    error,
    fetchAllData,
    updateSetting,
    resetError,
  } = useSettingsStore();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleEditStart = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = async (key: string) => {
    setIsSaving(true);
    const success = await updateSetting(key, editValue);
    setIsSaving(false);

    if (success) {
      setSaveSuccess(true);
      setEditingKey(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const getSectionIcon = (key: string) => {
    if (
      key.includes("EMAIL") ||
      key.includes("MAIL") ||
      key.includes("NOTIFICATION")
    ) {
      return Mail;
    }
    if (
      key.includes("PASSWORD") ||
      key.includes("SECURITY") ||
      key.includes("TWO_FACTOR")
    ) {
      return Shield;
    }
    if (
      key.includes("TIMEOUT") ||
      key.includes("SESSION") ||
      key.includes("TIME")
    ) {
      return Clock;
    }
    if (key.includes("DATABASE") || key.includes("MAX")) {
      return Database;
    }
    return Settings;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage system configuration and preferences
            </p>
          </div>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={resetError}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-sm text-green-800">Setting updated successfully</p>
            </div>
          </div>
        )}
      </div>

      {/* System Health Section */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 capitalize">
              {systemHealth.status}
            </h3>
            <p className="text-xs text-gray-500 mt-2">System operational</p>
          </div>

          {/* Memory Usage */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Memory Usage
              </span>
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {systemHealth.memory.used}/{systemHealth.memory.total}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{
                  width: `${(systemHealth.memory.used / systemHealth.memory.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">MB</p>
          </div>

          {/* Database Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Database
              </span>
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {systemHealth.database.connected ? "Connected" : "Disconnected"}
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              {systemHealth.database.users} users,{" "}
              {systemHealth.database.repositories} repos
            </p>
          </div>

          {/* Uptime */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Uptime</span>
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(systemHealth.uptime / 3600).toFixed(1)}h
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              {(systemHealth.uptime / 86400).toFixed(2)} days
            </p>
          </div>
        </div>
      )}

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Users Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">User Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900">
                  {systemStats.users.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-semibold text-green-600">
                  {systemStats.users.active.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Banned Users</span>
                <span className="font-semibold text-red-600">
                  {systemStats.users.banned.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Repository Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Repository Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Repos</span>
                <span className="font-semibold text-gray-900">
                  {systemStats.repositories.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average per User</span>
                <span className="font-semibold text-purple-600">
                  {systemStats.repositories.average.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Subscription Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Subscriptions</span>
                <span className="font-semibold text-gray-900">
                  {systemStats.subscriptions.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Penetration Rate</span>
                <span className="font-semibold text-blue-600">
                  {systemStats.subscriptions.penetration}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {settings
              .filter((s) =>
                ["SYSTEM_NAME", "ENABLE_SUBSCRIPTIONS", "MAINTENANCE_MODE"].includes(
                  s.key
                )
              )
              .map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {setting.key.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>

                  {editingKey === setting.key ? (
                    <div className="flex gap-2 ml-4">
                      {setting.type === "boolean" ? (
                        <button
                          onClick={() =>
                            setEditValue(editValue === "true" ? "false" : "true")
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {editValue === "true" ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      ) : (
                        <input
                          type={setting.type === "number" ? "number" : "text"}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <button
                        onClick={() => handleSave(setting.key)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-gray-900 font-medium">
                        {setting.type === "boolean"
                          ? editValue === "true"
                            ? "Enabled"
                            : "Disabled"
                          : setting.value}
                      </span>
                      <button
                        onClick={() =>
                          handleEditStart(setting.key, setting.value)
                        }
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {settings
              .filter((s) =>
                [
                  "ENABLE_TWO_FACTOR",
                  "PASSWORD_MIN_LENGTH",
                  "SESSION_TIMEOUT",
                ].includes(s.key)
              )
              .map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {setting.key.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>

                  {editingKey === setting.key ? (
                    <div className="flex gap-2 ml-4">
                      {setting.type === "boolean" ? (
                        <button
                          onClick={() =>
                            setEditValue(editValue === "true" ? "false" : "true")
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {editValue === "true" ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      ) : (
                        <input
                          type={setting.type === "number" ? "number" : "text"}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <button
                        onClick={() => handleSave(setting.key)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-gray-900 font-medium">
                        {setting.type === "boolean"
                          ? setting.value === "true"
                            ? "Enabled"
                            : "Disabled"
                          : setting.value}
                      </span>
                      <button
                        onClick={() =>
                          handleEditStart(setting.key, setting.value)
                        }
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notification Settings
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {settings
              .filter((s) =>
                ["EMAIL_NOTIFICATIONS_ENABLED", "MAX_REPOSITORIES"].includes(
                  s.key
                )
              )
              .map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {setting.key.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>

                  {editingKey === setting.key ? (
                    <div className="flex gap-2 ml-4">
                      {setting.type === "boolean" ? (
                        <button
                          onClick={() =>
                            setEditValue(editValue === "true" ? "false" : "true")
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {editValue === "true" ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      ) : (
                        <input
                          type={setting.type === "number" ? "number" : "text"}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <button
                        onClick={() => handleSave(setting.key)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-gray-900 font-medium">
                        {setting.type === "boolean"
                          ? setting.value === "true"
                            ? "Enabled"
                            : "Disabled"
                          : setting.value}
                      </span>
                      <button
                        onClick={() =>
                          handleEditStart(setting.key, setting.value)
                        }
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
