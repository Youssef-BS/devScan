import { api } from "@/lib/axios";


export interface AdminSetting {
  key: string;
  value: string;
  description: string;
  type: "string" | "number" | "boolean" | "json";
  updatedAt: Date;
}

export interface SystemHealth {
  status: string;
  timestamp: Date;
  database: {
    connected: boolean;
    users: number;
    repositories: number;
    subscriptions: number;
  };
  memory: {
    used: number;
    total: number;
  };
  uptime: number;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    banned: number;
  };
  repositories: {
    total: number;
    average: number;
  };
  subscriptions: {
    total: number;
    penetration: string;
  };
  timestamp: Date;
}

export const fetchAllSettings = async (): Promise<AdminSetting[]> => {
  try {
    const { data } = await api.get(`/admin/settings`);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching settings:", error);
    return [];
  }
};


export const fetchSetting = async (key: string): Promise<AdminSetting | null> => {
  try {
    const { data } = await api.get(`/admin/settings/${key}`);
    return data.data || null;
  } catch (error) {
    console.error("Error fetching setting:", error);
    return null;
  }
};


export const updateSettingAPI = async (
  key: string,
  value: string | number | boolean
): Promise<AdminSetting | null> => {
  try {
    const { data } = await api.put(`/admin/settings/${key}`, {
      value,
    });
    return data.data || null;
  } catch (error) {
    console.error("Error updating setting:", error);
    return null;
  }
};

export const fetchSystemHealth = async (): Promise<SystemHealth | null> => {
  try {
    const { data } = await api.get(`/admin/system/health`);
    return data.data || null;
  } catch (error) {
    console.error("Error fetching system health:", error);
    return null;
  }
};

export const fetchSystemStats = async (): Promise<SystemStats | null> => {
  try {
    const { data } = await api.get(`/admin/system/stats`);
    return data.data || null;
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return null;
  }
};
