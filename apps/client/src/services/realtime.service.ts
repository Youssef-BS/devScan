import { io, Socket } from "socket.io-client";

export interface OnlineUser {
  userId: number;
  email: string;
  isTyping?: boolean;
}

export interface RealtimeMessage {
  id: number;
  content: string;
  userId: number;
  repoId: number;
  createdAt: string;
  User: {
    id: number;
    email: string;
    username?: string;
    avatarUrl?: string;
  };
}

class RealtimeService {
  private static socket: Socket | null = null;
  private static repoId: number | null = null;

  static initialize(token: string, apiUrl = "http://localhost:4000"): Socket {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(apiUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  static joinRepo(repoId: number) {
    if (!this.socket) {
      console.error("Socket not initialized");
      return;
    }

    this.repoId = repoId;
    this.socket.emit("join-repo", repoId);
  }

  static leaveRepo(repoId: number) {
    if (!this.socket) {
      return;
    }

    this.socket.emit("leave-repo", repoId);
    this.repoId = null;
  }

  static sendMessage(repoId: number, content: string) {
    if (!this.socket) {
      console.error("Socket not initialized");
      return;
    }

    this.socket.emit("send-message", { repoId, content });
  }

  static setTyping(repoId: number, isTyping: boolean) {
    if (!this.socket) {
      return;
    }

    this.socket.emit("typing", { repoId, isTyping });
  }

  static onUserJoined(callback: (user: OnlineUser) => void) {
    if (!this.socket) {
      return;
    }

    this.socket.on("user-joined", callback);
  }

  static onUserLeft(callback: (user: OnlineUser) => void) {
    if (!this.socket) {
      return;
    }

    this.socket.on("user-left", callback);
  }

  static onNewMessage(callback: (message: RealtimeMessage) => void) {
    if (!this.socket) {
      return;
    }

    this.socket.on("new-message", callback);
  }

  static onUserTyping(callback: (data: OnlineUser) => void) {
    if (!this.socket) {
      return;
    }

    this.socket.on("user-typing", callback);
  }

  static onError(callback: (error: string) => void) {
    if (!this.socket) {
      return;
    }

    this.socket.on("error", callback);
  }

  static removeListener(event: string) {
    if (!this.socket) {
      return;
    }

    this.socket.off(event);
  }

  static disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.repoId = null;
    }
  }

  static isConnected(): boolean {
    return this.socket?.connected || false;
  }

  static on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.on(event, callback);
  }

  static off(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.off(event, callback);
  }
}

export default RealtimeService;
