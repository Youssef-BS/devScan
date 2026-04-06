import { useEffect, useState, useCallback } from "react";
import RealtimeService, { OnlineUser, RealtimeMessage } from "@/services/realtime.service";
import CollaborationService, {
  Collaborator,
  ActivityLog,
  PendingInvite,
} from "@/services/collaboration.service";

export interface UseCollaborationProps {
  repoId: number;
  token?: string;
  apiUrl?: string;
}

export function useCollaboration({ repoId, token, apiUrl }: UseCollaborationProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  // Initialize realtime connection
  useEffect(() => {
    if (!token) return;

    const service = RealtimeService.initialize(token, apiUrl);
    
    // Set up connection status listeners
    const handleConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };

    // Register listeners
    RealtimeService.on("connect", handleConnect);
    RealtimeService.on("disconnect", handleDisconnect);

    // Check if already connected
    if (RealtimeService.isConnected()) {
      setIsConnected(true);
    }

    return () => {
      // Clean up listeners
      RealtimeService.off("connect", handleConnect);
      RealtimeService.off("disconnect", handleDisconnect);
    };
  }, [token, apiUrl]);

  // Load initial data for the repository
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [collabs, activity, invites, messagesData] = await Promise.all([
        CollaborationService.getCollaborators(repoId),
        CollaborationService.getActivityLog(repoId),
        CollaborationService.getPendingInvites(repoId),
        CollaborationService.getMessages(repoId),
      ]);

      setCollaborators(collabs);
      setActivityLog(activity);
      setPendingInvites(invites);
      setMessages(messagesData.messages || []);
    } catch (err: any) {
      setError(err.message || "Failed to load collaboration data");
      console.error('Error loading collaboration data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [repoId]);

  // Expose loadInitialData for external refresh
  const refetch = useCallback(() => {
    return loadInitialData();
  }, [loadInitialData]);

  // Join repository and setup event listeners
  useEffect(() => {
    if (!token) return;

    loadInitialData();
    RealtimeService.joinRepo(repoId);

    // Setup event listeners
    RealtimeService.onUserJoined((user) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === user.userId);
        return exists ? prev : [...prev, user];
      });
    });

    RealtimeService.onUserLeft((user) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(user.userId);
        return updated;
      });
    });

    RealtimeService.onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    RealtimeService.onUserTyping((data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
      } else {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      }
    });

    RealtimeService.onError((error) => {
      setError(error);
    });

    return () => {
      RealtimeService.leaveRepo(repoId);
      RealtimeService.removeListener("user-joined");
      RealtimeService.removeListener("user-left");
      RealtimeService.removeListener("new-message");
      RealtimeService.removeListener("user-typing");
      RealtimeService.removeListener("error");
    };
  }, [repoId, token, loadInitialData]);

  // API Methods
  const invite = useCallback(
    async (email: string, role: "VIEWER" | "EDITOR" | "ADMIN") => {
      try {
        const result = await CollaborationService.inviteCollaborator(repoId, email, role);
        // Refresh pending invites
        const invites = await CollaborationService.getPendingInvites(repoId);
        setPendingInvites(invites);
        return result;
      } catch (err: any) {
        setError(err.message || "Failed to invite collaborator");
        throw err;
      }
    },
    [repoId]
  );

  const removeCollaborator = useCallback(
    async (userId: number) => {
      try {
        await CollaborationService.removeCollaborator(repoId, userId);
        setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      } catch (err: any) {
        setError(err.message || "Failed to remove collaborator");
        throw err;
      }
    },
    [repoId]
  );

  const updateRole = useCallback(
    async (userId: number, newRole: "VIEWER" | "EDITOR" | "ADMIN") => {
      try {
        await CollaborationService.updateCollaboratorRole(repoId, userId, newRole);
        setCollaborators((prev) =>
          prev.map((c) => (c.userId === userId ? { ...c, role: newRole } : c))
        );
      } catch (err: any) {
        setError(err.message || "Failed to update role");
        throw err;
      }
    },
    [repoId]
  );

  const sendMessage = useCallback((content: string) => {
    RealtimeService.sendMessage(repoId, content);
  }, [repoId]);

  const setTyping = useCallback((isTyping: boolean) => {
    RealtimeService.setTyping(repoId, isTyping);
  }, [repoId]);

  return {
    // State
    collaborators,
    onlineUsers,
    messages,
    activityLog,
    pendingInvites,
    typingUsers,
    isLoading,
    error,
    isConnected,

    // Methods
    loadInitialData,
    refetch,
    invite,
    removeCollaborator,
    updateRole,
    sendMessage,
    setTyping,
  };
}
