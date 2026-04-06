'use client';

import React from 'react';
import { Users, Circle } from 'lucide-react';
import { OnlineUser } from '@/services/realtime.service';

interface OnlineIndicatorProps {
  users: OnlineUser[];
  maxShow?: number;
}

export function OnlineIndicator({ users, maxShow = 3 }: OnlineIndicatorProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Circle className="w-2 h-2 text-gray-400" />
        No one else online
      </div>
    );
  }

  const displayUsers = users.slice(0, maxShow);
  const overflow = Math.max(0, users.length - maxShow);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {displayUsers.map((user) => (
          <div
            key={user.userId}
            title={user.email}
            className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700"
          >
            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            {user.email ? user.email.split('@')[0] : 'Unknown'}
          </div>
        ))}

        {overflow > 0 && (
          <div className="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600">
            +{overflow}
          </div>
        )}
      </div>

      <div className="ml-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
        <Users className="w-3 h-3" />
        {users.length} {users.length === 1 ? 'person' : 'people'} online
      </div>
    </div>
  );
}
