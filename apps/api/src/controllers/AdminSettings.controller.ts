import { Router, Response, Request, NextFunction } from "express";
import { prisma } from "../db";

interface AdminSetting {
  key: string;
  value: string;
  description: string;
  type: "string" | "number" | "boolean" | "json";
  updatedAt: Date;
}

interface SettingsResponse {
  success: boolean;
  data?: AdminSetting | AdminSetting[];
  message?: string;
}

export const getAllSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings: AdminSetting[] = [
      {
        key: "SYSTEM_NAME",
        value: "DevScan",
        description: "Application name",
        type: "string",
        updatedAt: new Date(),
      },
      {
        key: "ENABLE_SUBSCRIPTIONS",
        value: "true",
        description: "Enable subscription feature",
        type: "boolean",
        updatedAt: new Date(),
      },
      {
        key: "MAX_REPOSITORIES",
        value: "100",
        description: "Maximum repositories per free user",
        type: "number",
        updatedAt: new Date(),
      },
      {
        key: "ENABLE_TWO_FACTOR",
        value: "true",
        description: "Enable two-factor authentication",
        type: "boolean",
        updatedAt: new Date(),
      },
      {
        key: "PASSWORD_MIN_LENGTH",
        value: "8",
        description: "Minimum password length",
        type: "number",
        updatedAt: new Date(),
      },
      {
        key: "SESSION_TIMEOUT",
        value: "3600",
        description: "Session timeout in seconds",
        type: "number",
        updatedAt: new Date(),
      },
      {
        key: "EMAIL_NOTIFICATIONS_ENABLED",
        value: "true",
        description: "Enable email notifications",
        type: "boolean",
        updatedAt: new Date(),
      },
      {
        key: "MAINTENANCE_MODE",
        value: "false",
        description: "Enable maintenance mode",
        type: "boolean",
        updatedAt: new Date(),
      },
    ];

    res.json({
      success: true,
      data: settings,
    } as SettingsResponse);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    } as SettingsResponse);
  }
};

// Get specific setting
export const getSetting = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const key = req.params.key as string;

    const settingsMap: Record<string, AdminSetting> = {
      SYSTEM_NAME: {
        key: "SYSTEM_NAME",
        value: "DevScan",
        description: "Application name",
        type: "string",
        updatedAt: new Date(),
      },
      ENABLE_SUBSCRIPTIONS: {
        key: "ENABLE_SUBSCRIPTIONS",
        value: "true",
        description: "Enable subscription feature",
        type: "boolean",
        updatedAt: new Date(),
      },
      MAX_REPOSITORIES: {
        key: "MAX_REPOSITORIES",
        value: "100",
        description: "Maximum repositories per free user",
        type: "number",
        updatedAt: new Date(),
      },
    };

    const setting = settingsMap[key];

    if (!setting) {
      res.status(404).json({
        success: false,
        message: "Setting not found",
      } as SettingsResponse);
      return;
    }

    res.json({
      success: true,
      data: setting,
    } as SettingsResponse);
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch setting",
    } as SettingsResponse);
  }
};

// Update setting
export const updateSetting = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const key = req.params.key as string;
    const { value } = req.body;

    if (!value) {
      res.status(400).json({
        success: false,
        message: "Value is required",
      } as SettingsResponse);
      return;
    }

    // In a real scenario, you'd save to database
    const updatedSetting: AdminSetting = {
      key,
      value: String(value),
      description: `Updated setting for ${key}`,
      type: typeof value as "string" | "number" | "boolean" | "json",
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: updatedSetting,
      message: `Setting ${key} updated successfully`,
    } as SettingsResponse);
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update setting",
    } as SettingsResponse);
  }
};

// Get system health
export const getSystemHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userCount = await prisma.user.count();
    const repoCount = await prisma.repo.count();
    const subscriptionCount = await prisma.user.count({
      where: { subscriptionStatus: "ACTIVE" },
    });

    const health = {
      status: "healthy",
      timestamp: new Date(),
      database: {
        connected: true,
        users: userCount,
        repositories: repoCount,
        subscriptions: subscriptionCount,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      uptime: process.uptime(),
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check system health",
    });
  }
};

export const getSystemStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { isBanned: false },
    });
    const bannedUsers = totalUsers - activeUsers;
    const totalRepos = await prisma.repo.count();
    const totalSubscriptions = await prisma.user.count({
      where: { subscriptionStatus: "ACTIVE" },
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
      },
      repositories: {
        total: totalRepos,
        average: totalRepos / activeUsers || 0,
      },
      subscriptions: {
        total: totalSubscriptions,
        penetration: ((totalSubscriptions / totalUsers) * 100).toFixed(2),
      },
      timestamp: new Date(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system stats",
    });
  }
};
