'use client';

import React from 'react';
import { Users, Circle, Video } from 'lucide-react';
import { OnlineUser } from '@/services/realtime.service';

interface OnlineIndicatorProps {
  users: OnlineUser[];
  maxShow?: number;
  currentUserId?: number;
  onCall?: (user: OnlineUser) => void;
}

export function OnlineIndicator({ users, maxShow = 6, currentUserId, onCall }: OnlineIndicatorProps) {
  const others = users.filter((u) => u.userId !== currentUserId);

  if (others.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Circle className="w-2 h-2 text-gray-400" />
        No one else online
      </div>
    );
  }

  const displayUsers = others.slice(0, maxShow);
  const overflow = Math.max(0, others.length - maxShow);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {displayUsers.map((user) => (
          <div
            key={user.userId}
            className="group flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full pl-2 pr-1 py-1"
          >
            <Circle className="w-2 h-2 fill-green-500 text-green-500 shrink-0" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
              {user.email ? user.email.split('@')[0] : 'Unknown'}
            </span>

            {onCall && (
              <button
                onClick={() => onCall(user)}
                title={`Call ${user.email?.split('@')[0]}`}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-2 py-0.5 text-xs font-semibold transition-all hover:scale-105 ml-1"
              >
                <Video className="w-3 h-3" />
                Call
              </button>
            )}
          </div>
        ))}

        {overflow > 0 && (
          <div className="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
            +{overflow}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-1">
        <Users className="w-3 h-3" />
        {others.length} online
      </div>
    </div>
  );
}
