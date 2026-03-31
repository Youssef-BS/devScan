import { create } from "zustand";
import {
  fetchAllSettings,
  fetchSetting,
  updateSettingAPI,
  fetchSystemHealth,
  fetchSystemStats,
  AdminSetting,
  SystemHealth,
  SystemStats,
} from "@/services/settings.service";

interface SettingsStore {
  // State
  settings: AdminSetting[];
  systemHealth: SystemHealth | null;
  systemStats: SystemStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSettings: () => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateSetting: (key: string, value: string | number | boolean) => Promise<boolean>;
  fetchAllData: () => Promise<void>;
  resetError: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: [],
  systemHealth: null,
  systemStats: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await fetchAllSettings();
      set({ settings, loading: false });
    } catch (error) {
      set({
        error: "Failed to fetch settings",
        loading: false,
      });
    }
  },

  fetchHealth: async () => {
    set({ loading: true, error: null });
    try {
      const systemHealth = await fetchSystemHealth();
      set({ systemHealth, loading: false });
    } catch (error) {
      set({
        error: "Failed to fetch system health",
        loading: false,
      });
    }
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const systemStats = await fetchSystemStats();
      set({ systemStats, loading: false });
    } catch (error) {
      set({
        error: "Failed to fetch system stats",
        loading: false,
      });
    }
  },

  updateSetting: async (key: string, value: string | number | boolean) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateSettingAPI(key, value);
      if (updated) {
        // Update local settings array
        set((state) => ({
          settings: state.settings.map((s) =>
            s.key === key ? { ...s, value: String(value) } : s
          ),
          loading: false,
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({
        error: "Failed to update setting",
        loading: false,
      });
      return false;
    }
  },

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [settings, systemHealth, systemStats] = await Promise.all([
        fetchAllSettings(),
        fetchSystemHealth(),
        fetchSystemStats(),
      ]);

      set({
        settings,
        systemHealth,
        systemStats,
        loading: false,
      });
    } catch (error) {
      set({
        error: "Failed to fetch all data",
        loading: false,
      });
    }
  },

  resetError: () => set({ error: null }),
}));
