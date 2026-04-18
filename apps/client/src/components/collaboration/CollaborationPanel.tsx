'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, Activity, Settings2, AlertCircle } from 'lucide-react';
import { CollaboratorsList } from './CollaboratorsList';
import { InviteCollaborator } from './InviteCollaborator';
import { CollaborationChat } from './CollaborationChat';
import { OnlineIndicator } from './OnlineIndicator';
import { CallModal, CallPeer } from './CallModal';
import { useCollaboration } from '@/hooks/use-collaboration';
import { OnlineUser } from '@/services/realtime.service';

interface CollaborationPanelProps {
  repoId: number;
  repoName: string;
  isOwner?: boolean;
  currentUserId?: number;
}

export function CollaborationPanel({
  repoId,
  repoName,
  isOwner = false,
  currentUserId,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  // Outgoing call state (incoming calls are handled globally by GlobalCallListener)
  const [callOpen, setCallOpen] = useState(false);
  const [callPeer, setCallPeer] = useState<CallPeer | null>(null);

  useEffect(() => {
    try {
      const socketToken = Cookies.get('socketToken');
      if (socketToken) {
        setToken(socketToken);
        return;
      }
      
      const user = Cookies.get('user');
      if (user) {
        const userData = JSON.parse(user);
        setToken(userData.token);
      }
    } catch (error) {
      console.warn('Failed to get token from cookies:', error);
    }
  }, []);

  const {
    collaborators,
    onlineUsers,
    messages,
    typingUsers,
    pendingInvites,
    isLoading,
    error,
    isConnected,
    invite,
    removeCollaborator,
    updateRole,
    sendMessage,
    setTyping,
  } = useCollaboration({
    repoId,
    token,
  });

  const handleStartCall = useCallback((user: OnlineUser) => {
    setCallPeer({ userId: user.userId, email: user.email });
    setCallOpen(true);
  }, []);

  const handleInvite = async (email: string, role: 'VIEWER' | 'EDITOR' | 'ADMIN') => {
    try {
      await invite(email, role);
      setShowInviteSuccess(true);
      setTimeout(() => setShowInviteSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to invite:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{repoName}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Collaboration</p>
            </div>
          </div>
          {!isConnected && (
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Connecting...
            </div>
          )}
        </div>

        <OnlineIndicator
          users={onlineUsers}
          maxShow={6}
          currentUserId={currentUserId}
          onCall={handleStartCall}
        />
      </div>

      {error && (
        <div className="m-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {showInviteSuccess && (
        <div className="m-4 p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <p className="text-green-700 dark:text-green-300 text-sm">
            ✓ Invitation sent successfully!
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 m-4 gap-2 shrink-0">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
            {collaborators.length > 0 && (
              <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {collaborators.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <TabsContent value="chat" className="h-full flex flex-col m-0 min-h-0">
            <CollaborationChat
              messages={messages}
              onlineUsers={onlineUsers}
              onSendMessage={sendMessage}
              onTyping={setTyping}
              typingUsers={typingUsers}
              currentUserId={currentUserId}
              isConnected={isConnected}
              loading={isLoading}
              repoId={repoId}
              repoName={repoName}
              onStartCall={handleStartCall}
            />
          </TabsContent>

          <TabsContent value="team" className="flex-1 overflow-y-auto p-4 m-0 min-h-0">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Team Members ({collaborators.length})
                </h3>
                {collaborators.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No team members yet</p>
                    <p className="text-sm mt-1">Invite someone to get started</p>
                  </div>
                ) : (
                  <CollaboratorsList
                    collaborators={collaborators}
                    onRemove={isOwner ? removeCollaborator : undefined}
                    onUpdateRole={isOwner ? updateRole : undefined}
                    isOwner={isOwner}
                    loading={isLoading}
                  />
                )}
              </div>

              {pendingInvites.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm">
                    Pending Invitations ({pendingInvites.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{invite.email}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          {invite.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invite" className="flex-1 overflow-y-auto p-4 m-0 min-h-0">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Team Member</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Invite colleagues to collaborate on this repository. They'll receive an email invitation.
                </p>
                <InviteCollaborator onInvite={handleInvite} loading={isLoading} />
              </div>

              <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Role Permissions</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      Viewer
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 ml-4">
                      Can view repository and send messages
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Editor
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 ml-4">
                      Can view, edit and collaborate
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      Admin
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 ml-4">
                      Full access including managing team members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 overflow-y-auto p-4 m-0 min-h-0">
            <div className="max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">Loading activity...</div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {callOpen && callPeer && currentUserId && (
        <CallModal
          isOpen={callOpen}
          onClose={() => setCallOpen(false)}
          currentUserId={currentUserId}
          repoId={repoId}
          peer={callPeer}
          isIncoming={false}
        />
      )}
    </div>
  );
}
