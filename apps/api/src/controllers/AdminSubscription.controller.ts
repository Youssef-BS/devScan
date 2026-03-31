import { prisma } from "../db";
import { Request, Response } from "express";

export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        email: true,
        createdAt: true,
      },
    });

    const stats = {
      totalUsers: users.length,
      activeSubscriptions: users.filter(u => u.subscriptionStatus === 'ACTIVE').length,
      expiredSubscriptions: users.filter(u => u.subscriptionStatus === 'EXPIRED').length,
      cancelledSubscriptions: users.filter(u => u.subscriptionStatus === 'CANCELLED').length,
      inactiveSubscriptions: users.filter(u => u.subscriptionStatus === 'INACTIVE').length,
      monthlySubscribers: users.filter(u => u.subscriptionPlan === 'MONTHLY' && u.subscriptionStatus === 'ACTIVE').length,
      quarterlySubscribers: users.filter(u => u.subscriptionPlan === 'QUARTERLY' && u.subscriptionStatus === 'ACTIVE').length,
      yearlySubscribers: users.filter(u => u.subscriptionPlan === 'YEARLY' && u.subscriptionStatus === 'ACTIVE').length,
      estimatedMonthlyRevenue: (
        users.filter(u => u.subscriptionPlan === 'MONTHLY' && u.subscriptionStatus === 'ACTIVE').length * 9.99 +
        users.filter(u => u.subscriptionPlan === 'QUARTERLY' && u.subscriptionStatus === 'ACTIVE').length * (24.99 / 3) +
        users.filter(u => u.subscriptionPlan === 'YEARLY' && u.subscriptionStatus === 'ACTIVE').length * (79.99 / 12)
      ).toFixed(2),
      
      activationRate: users.length > 0 
        ? (users.filter(u => u.subscriptionStatus === 'ACTIVE').length / users.length * 100).toFixed(2)
        : '0',
    };

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return res.status(500).json({ message: 'Failed to fetch subscription statistics' });
  }
};

export const getSubscriptionBreakdown = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    const breakdown = {
      monthly: {
        active: users.filter(u => u.subscriptionPlan === 'MONTHLY' && u.subscriptionStatus === 'ACTIVE').length,
        expired: users.filter(u => u.subscriptionPlan === 'MONTHLY' && u.subscriptionStatus === 'EXPIRED').length,
        cancelled: users.filter(u => u.subscriptionPlan === 'MONTHLY' && u.subscriptionStatus === 'CANCELLED').length,
      },
      quarterly: {
        active: users.filter(u => u.subscriptionPlan === 'QUARTERLY' && u.subscriptionStatus === 'ACTIVE').length,
        expired: users.filter(u => u.subscriptionPlan === 'QUARTERLY' && u.subscriptionStatus === 'EXPIRED').length,
        cancelled: users.filter(u => u.subscriptionPlan === 'QUARTERLY' && u.subscriptionStatus === 'CANCELLED').length,
      },
      yearly: {
        active: users.filter(u => u.subscriptionPlan === 'YEARLY' && u.subscriptionStatus === 'ACTIVE').length,
        expired: users.filter(u => u.subscriptionPlan === 'YEARLY' && u.subscriptionStatus === 'EXPIRED').length,
        cancelled: users.filter(u => u.subscriptionPlan === 'YEARLY' && u.subscriptionStatus === 'CANCELLED').length,
      },
    };

    return res.json(breakdown);
  } catch (error) {
    console.error('Error fetching subscription breakdown:', error);
    return res.status(500).json({ message: 'Failed to fetch subscription breakdown' });
  }
};

export const getSubscriptionChartData = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    const statusCounts = {
      ACTIVE: users.filter(u => u.subscriptionStatus === 'ACTIVE').length,
      EXPIRED: users.filter(u => u.subscriptionStatus === 'EXPIRED').length,
      CANCELLED: users.filter(u => u.subscriptionStatus === 'CANCELLED').length,
      INACTIVE: users.filter(u => u.subscriptionStatus === 'INACTIVE').length,
    };

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const weeklyData = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const activeCount = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= dayStart && userDate <= dayEnd && u.subscriptionStatus === 'ACTIVE';
      }).length;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activeSubscriptions: activeCount,
      };
    });

    return res.json({
      statusCounts,
      weeklyData,
    });
  } catch (error) {
    console.error('Error fetching subscription chart data:', error);
    return res.status(500).json({ message: 'Failed to fetch subscription chart data' });
  }
};

export const getRecentSubscriptions = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const subscriptions = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        username: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        createdAt: true,
      },
      orderBy: {
        subscriptionStartDate: 'desc',
      },
      take: limit,
    });

    return res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching recent subscriptions:', error);
    return res.status(500).json({ message: 'Failed to fetch recent subscriptions' });
  }
};
