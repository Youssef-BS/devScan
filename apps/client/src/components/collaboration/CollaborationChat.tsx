'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RealtimeMessage, OnlineUser } from '@/services/realtime.service';
import NotificationService from '@/services/notification.service';
import { toast } from 'sonner';

interface CollaborationChatProps {
  messages: RealtimeMessage[];
  onlineUsers?: OnlineUser[];
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers?: Set<number>;
  currentUserId?: number;
  isConnected?: boolean;
  loading?: boolean;
  repoId: number;
  repoName: string;
}

export function CollaborationChat({
  messages,
  onlineUsers = [],
  onSendMessage,
  onTyping,
  typingUsers = new Set(),
  currentUserId,
  isConnected = true,
  loading = false,
  repoId,
  repoName,
}: CollaborationChatProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (messages.length > lastMessageCount) {
      const newMessage = messages[messages.length - 1];
      if (newMessage && newMessage.userId !== currentUserId) {
        const senderName = newMessage.User.username || newMessage.User.email?.split('@')[0] || 'Team Member';
        
        toast.info(
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <div>
              <p className="font-semibold text-sm">{senderName}</p>
              <p className="text-xs text-gray-600 truncate max-w-xs">{newMessage.content}</p>
            </div>
          </div>,
          {
            duration: 4000,
            position: 'top-right',
          }
        );

        sendBrowserNotification(senderName, newMessage.content, newMessage.User.avatarUrl);
        NotificationService.addMessageNotification(senderName, newMessage.content, repoName, repoId, newMessage.User.avatarUrl);
      }
      setLastMessageCount(messages.length);
    }
  }, [messages, currentUserId, lastMessageCount, repoName, repoId]);

  const sendBrowserNotification = (title: string, message: string, icon?: string) => {
    if (typeof window === 'undefined') return;
    
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported');
      return;
    }

    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: icon || '/icon.png',
          tag: 'collaboration-message',
          requireInteraction: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            const notification = new Notification(title, {
              body: message,
              icon: icon || '/icon.png',
              tag: 'collaboration-message',
              requireInteraction: false,
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        }).catch((error) => {
          console.error('Notification permission error:', error);
        });
      }
    } catch (error) {
      console.error('Browser notification error:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((error) => {
        console.error('Failed to request notification permission:', error);
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onTyping?.(true);

    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isSubmitting) {
      return;
    }
    if (!isConnected) {
      return;
    }

    const message = input.trim();
    setInput('');
    setIsSubmitting(true);

    try {
      onTyping?.(false);
      onSendMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Connection status */}
      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700 dark:text-yellow-200">
          Connecting...
        </div>
      )}

      {/* Online Users with Call Buttons */}
      {onlineUsers && onlineUsers.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Online Users ({onlineUsers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {onlineUsers
              .filter((u) => u.userId !== currentUserId) // Don't show yourself
              .map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-2 bg-green-50 dark:bg-green-900 rounded-lg px-3 py-2 border border-green-200 dark:border-green-700"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {user.email?.split('@')[0] || user.email}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start a conversation with your collaborators</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.userId === currentUserId ? 'flex-row-reverse' : ''
                }`}
              >
                {message.User.avatarUrl && (
                  <img
                    src={message.User.avatarUrl}
                    alt={message.User.email}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                )}

                <div
                  className={`flex flex-col ${
                    message.userId === currentUserId ? 'items-end' : 'items-start'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {message.User.username || 'Unknown'}
                  </p>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.userId === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {message.content}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {typingUsers.size > 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                  ...
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Array.from(typingUsers).length === 1
                      ? 'Someone is typing'
                      : 'Multiple people are typing'}
                  </p>
                  <Loader className="w-3 h-3 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            disabled={isSubmitting || !isConnected || loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !input.trim() || !isConnected || loading}
            className="gap-2"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            Waiting for connection...
          </p>
        )}
      </form>
    </div>
  );
}
