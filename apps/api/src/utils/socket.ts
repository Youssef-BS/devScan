import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyJWT } from "./jwt-verify.js";
import { CollaborationService } from "../services/collaboration.service.js";

interface UserSocket {
  userId: number;
  repoId?: number;
  email?: string;
  username?: string;
}

const connectedUsers = new Map<string, UserSocket>();

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CORS_ORIGIN || "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3000",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    path: "/socket.io/",
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = verifyJWT(token);
      socket.data = { userId: decoded.id || decoded.userId || 0, email: decoded.email };
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`User ${socket.data.userId} connected: ${socket.id}`);

    // Join a collaboration room
    socket.on("join-repo", async (repoId: number) => {
      const roomName = `repo-${repoId}`;

      // Verify user has access to repo
      const hasAccess = await CollaborationService.hasPermission(
        socket.data.userId,
        repoId,
        "VIEWER" as any
      );

      if (!hasAccess) {
        socket.emit("error", "You don't have access to this repository");
        return;
      }

      socket.join(roomName);
      connectedUsers.set(socket.id, {
        userId: socket.data.userId,
        repoId,
        email: socket.data.email,
      });

      io.to(roomName).emit("user-joined", {
        userId: socket.data.userId,
        email: socket.data.email,
        timestamp: new Date(),
      });

      console.log(
        `User ${socket.data.userId} joined repo ${repoId} room`
      );
    });

    // Handle new message
    socket.on("send-message", async (data: { repoId: number; content: string }) => {
      const { repoId, content } = data;
      const roomName = `repo-${repoId}`;

      if (!socket.rooms.has(roomName)) {
        socket.emit("error", "You are not in this room");
        return;
      }

      const hasAccess = await CollaborationService.hasPermission(
        socket.data.userId,
        repoId,
        "EDITOR" as any
      );

      if (!hasAccess) {
        socket.emit("error", "You don't have permission to send messages");
        return;
      }

      try {
        const message = await CollaborationService.createMessage(
          repoId,
          socket.data.userId,
          content
        );
        io.to(roomName).emit("new-message", message);
      } catch (error) {
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("typing", async (data: { repoId: number; isTyping: boolean }) => {
      const { repoId, isTyping } = data;
      const roomName = `repo-${repoId}`;

      if (!socket.rooms.has(roomName)) {
        return;
      }

      const hasAccess = await CollaborationService.hasPermission(
        socket.data.userId,
        repoId,
        "VIEWER" as any
      );

      if (!hasAccess) {
        return;
      }

      socket.to(roomName).emit("user-typing", {
        userId: socket.data.userId,
        email: socket.data.email,
        isTyping,
      });
    });
    socket.on("disconnect", () => {
      const user = connectedUsers.get(socket.id);
      if (socket.data?.userId) {
        console.log(`User ${socket.data.userId} disconnected`);
      } else {
        console.log(`Socket ${socket.id} disconnected (unauthenticated)`);
      }

      if (user?.repoId) {
        const roomName = `repo-${user.repoId}`;
        io.to(roomName).emit("user-left", {
          userId: user.userId,
          email: user.email,
          timestamp: new Date(),
        });
      }

      console.log(`User ${socket.data.userId} disconnected`);
    });

    socket.on("leave-repo", (repoId: number) => {
      const roomName = `repo-${repoId}`;
      socket.leave(roomName);

      io.to(roomName).emit("user-left", {
        userId: socket.data.userId,
        email: socket.data.email,
        timestamp: new Date(),
      });
    });

    // Call signaling handlers
    socket.on("call-offer", (data: any) => {
      console.log(`Call offer from ${data.from} to ${data.to}`);
      // Find the socket ID of the recipient
      let recipientSocket: string | null = null;
      connectedUsers.forEach((user, socketId) => {
        if (user.userId === data.to && user.repoId === data.repoId) {
          recipientSocket = socketId;
        }
      });

      if (recipientSocket) {
        io.to(recipientSocket).emit("call-offer", {
          callId: data.callId,
          from: socket.data.userId,
          to: data.to,
          email: socket.data.email,
          type: data.type,
          offer: data.offer,
          repoId: data.repoId,
        });
      } else {
        socket.emit("error", "Recipient not found or not connected");
      }
    });

    socket.on("call-answer", (data: any) => {
      console.log(`Call answered by ${socket.data.userId}`);
      // Send answer back to the initiator
      let initiatorSocket: string | null = null;
      connectedUsers.forEach((user, socketId) => {
        if (user.userId === data.to) {
          initiatorSocket = socketId;
        }
      });

      if (initiatorSocket) {
        io.to(initiatorSocket).emit("call-answer", {
          callId: data.callId,
          from: socket.data.userId,
          to: data.to,
          answer: data.answer,
        });
      }
    });

    socket.on("ice-candidate", (data: any) => {
      // Forward ICE candidate to the peer
      let peerSocket: string | null = null;
      connectedUsers.forEach((user, socketId) => {
        if (user.userId === data.to) {
          peerSocket = socketId;
        }
      });

      if (peerSocket && data.candidate) {
        io.to(peerSocket).emit("ice-candidate", {
          callId: data.callId,
          from: socket.data.userId,
          candidate: data.candidate,
        });
      }
    });

    socket.on("call-rejected", (data: any) => {
      console.log(`Call rejected by ${socket.data.userId}`);
      let initiatorSocket: string | null = null;
      connectedUsers.forEach((user, socketId) => {
        if (user.userId === data.to) {
          initiatorSocket = socketId;
        }
      });

      if (initiatorSocket) {
        io.to(initiatorSocket).emit("call-rejected", {
          callId: data.callId,
          from: socket.data.userId,
        });
      }
    });

    socket.on("call-ended", (data: any) => {
      console.log(`Call ended by ${socket.data.userId}`);
      let peerSocket: string | null = null;
      connectedUsers.forEach((user, socketId) => {
        if (user.userId === data.to) {
          peerSocket = socketId;
        }
      });

      if (peerSocket) {
        io.to(peerSocket).emit("call-ended", {
          callId: data.callId,
          from: socket.data.userId,
        });
      }
    });
  });

  return io;
}

export function getOnlineUsers(repoId: number) {
  const users: UserSocket[] = [];
  connectedUsers.forEach((user) => {
    if (user.repoId === repoId) {
      users.push(user);
    }
  });
  return users;
}
