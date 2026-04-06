"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, ArrowRight } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function NotificationDropdown() {
  const router = useRouter();
  const { notifications, unreadCount } = useNotifications();
  const recentNotifications = notifications.slice(0, 3);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell size={18} className="text-gray-600" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate-ping opacity-75"></span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 mt-2">
        <div className="px-4 py-3">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <p className="text-xs text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        <DropdownMenuSeparator />

        {recentNotifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 border-l-2 ${
                  !notification.read
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {notification.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatTime(notification.timestamp)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No notifications
          </div>
        )}

        <DropdownMenuSeparator />

        <div className="px-4 py-2">
          <Link href="/notifications" className="flex items-center justify-center w-full">
            <Button variant="outline" size="sm" className="w-full gap-2">
              View all notifications
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
