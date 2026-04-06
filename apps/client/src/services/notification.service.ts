const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Notification {
  id: string;
  type: "invite" | "collaboration" | "message" | "activity";
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  repoId?: number;
  repoName?: string;
  userId?: number;
  userName?: string;
}

class NotificationService {
  /**
   * Get all notifications for the current user
   * Combines pending invites, recent activities, and collaboration updates
   */
  static async getNotifications(): Promise<Notification[]> {
    try {
      const invites = await this.getPendingInvites();
      const notifications = this.transformInvitesToNotifications(invites);
      
      // Sort by timestamp descending (newest first)
      return notifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter((n) => !n.read).length;
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    // In a real implementation, save to localStorage or backend
    const notifications = this.getStoredNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    const notifications = this.getStoredNotifications();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updated));
  }

  /**
   * Get pending invites from API
   */
  private static async getPendingInvites(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/collaboration/my-invites`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch pending invites");
    }

    const data = await res.json();
    return data.invites || [];
  }

  /**
   * Transform pending invites to notifications
   */
  private static transformInvitesToNotifications(invites: any[]): Notification[] {
    return invites.map((invite, index) => ({
      id: `invite-${invite.id}`,
      type: "invite",
      title: `Repository Invitation`,
      description: `You've been invited to collaborate on ${invite.repoName}`,
      action: "View Invitation",
      actionUrl: `/notifications`,
      avatar: invite.InvitedByUser?.avatarUrl,
      timestamp: new Date(invite.createdAt || Date.now()),
      read: false,
      repoId: invite.repoId,
      repoName: invite.repoName,
      userId: invite.invitedBy,
      userName: invite.InvitedByUser?.email,
    }));
  }

  /**
   * Add a message notification
   */
  static addMessageNotification(
    senderName: string,
    message: string,
    repoName: string,
    repoId: number,
    senderAvatar?: string
  ): void {
    if (typeof window === 'undefined') return;

    const notifications = this.getStoredNotifications();
    const newNotification: Notification = {
      id: `message-${Date.now()}-${Math.random()}`,
      type: 'message',
      title: `New message from ${senderName}`,
      description: message,
      avatar: senderAvatar,
      timestamp: new Date(),
      read: false,
      repoId,
      repoName,
      userName: senderName,
    };

    notifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  /**
   * Get stored notifications from localStorage
   */
  private static getStoredNotifications(): Notification[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  }
}

export default NotificationService;
