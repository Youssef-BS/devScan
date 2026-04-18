import { prisma as db } from "../db.js";
import { CollaborationRole, InviteStatus } from "../db.js";
import crypto from "crypto";

export class CollaborationService {
  // Invite a user to collaborate on a repository
  static async inviteCollaborator(
    repoId: number,
    email: string,
    role: CollaborationRole,
    invitedBy: number
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const token = crypto.randomBytes(32).toString("hex");

    // Check if invite already exists
    const existingInvite = await db.collaborationInvite.findUnique({
      where: {
        email_repoId: {
          email,
          repoId,
        },
      },
    });

    if (existingInvite?.status === InviteStatus.PENDING) {
      return {
        success: false,
        message: "An invitation is already pending for this email",
      };
    }

    const invite = await db.collaborationInvite.create({
      data: {
        email,
        token,
        repoId,
        invitedBy,
        role,
        expiresAt,
      },
    });

    return {
      success: true,
      invite,
      inviteLink: `${process.env.CLIENT_URL || "http://localhost:3000"}/invite/${token}`,
    };
  }

  // Accept an invitation
  static async acceptInvite(token: string, userId: number) {
    const invite = await db.collaborationInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return { success: false, message: "Invalid invitation token" };
    }

    if (new Date() > invite.expiresAt) {
      return { success: false, message: "Invitation has expired" };
    }

    if (invite.status !== InviteStatus.PENDING) {
      return {
        success: false,
        message: `Invitation has already been ${invite.status.toLowerCase()}`,
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return {
        success: false,
        message: "You cannot accept an invitation for another email",
      };
    }

    // Check if already a collaborator
    const existing = await db.collaborator.findUnique({
      where: {
        userId_repoId: {
          userId,
          repoId: invite.repoId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        message: "You are already a collaborator on this repository",
      };
    }

    // Create collaborator and update invite
    const [collaborator] = await Promise.all([
      db.collaborator.create({
        data: {
          userId,
          repoId: invite.repoId,
          role: invite.role,
        },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      db.collaborationInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.ACCEPTED },
      }),
    ]);

    // Log the successful acceptance
    console.log(
      `Collaborator accepted invitation - userId: ${userId}, repoId: ${invite.repoId}, role: ${invite.role}`
    );
    console.log(`Created collaborator:`, collaborator);

    return { success: true, collaborator };
  }

  // Reject an invitation
  static async rejectInvite(token: string, userId: number) {
    const invite = await db.collaborationInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return { success: false, message: "Invalid invitation token" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invite.email) {
      return {
        success: false,
        message: "You can only reject invitations sent to your email",
      };
    }

    await db.collaborationInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.REJECTED },
    });

    return { success: true, message: "Invitation rejected" };
  }

  // Get all collaborators for a repo
  static async getCollaborators(repoId: number) {
    const collaborators = await db.collaborator.findMany({
      where: { repoId, isActive: true },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    console.log(
      `getCollaborators: Found ${collaborators.length} active collaborators for repoId ${repoId}`,
      collaborators.map((c) => ({ userId: c.userId, email: c.User.email, role: c.role }))
    );

    return collaborators;
  }

  // Remove a collaborator
  static async removeCollaborator(repoId: number, userId: number) {
    const collaborator = await db.collaborator.findUnique({
      where: {
        userId_repoId: {
          userId,
          repoId,
        },
      },
    });

    if (!collaborator) {
      return { success: false, message: "Collaborator not found" };
    }

    await db.collaborator.update({
      where: {
        userId_repoId: {
          userId,
          repoId,
        },
      },
      data: { isActive: false },
    });

    return { success: true, message: "Collaborator removed" };
  }

  // Update collaborator role
  static async updateCollaboratorRole(
    repoId: number,
    userId: number,
    newRole: CollaborationRole
  ) {
    const collaborator = await db.collaborator.update({
      where: {
        userId_repoId: {
          userId,
          repoId,
        },
      },
      data: { role: newRole },
    });

    return { success: true, collaborator };
  }

  // Create a message
  static async createMessage(repoId: number, userId: number, content: string) {
    const message = await db.message.create({
      data: {
        repoId,
        userId,
        content,
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return message;
  }

  // Get messages for a repo (with pagination)
  static async getMessages(repoId: number, limit = 50, offset = 0) {
    const [messages, total] = await Promise.all([
      db.message.findMany({
        where: { repoId },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.message.count({
        where: { repoId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      hasMore: offset + limit < total,
    };
  }

  // Log activity
  static async logActivity(
    repoId: number,
    action: string,
    details?: any,
    performedById?: number,
    affectedUserId?: number
  ) {
    return db.activityLog.create({
      data: {
        repoId,
        action,
        details,
        performedById,
        affectedUserId,
      },
    });
  }

  // Get activity log for a repo
  static async getActivityLog(repoId: number, limit = 50) {
    return db.activityLog.findMany({
      where: { repoId },
      include: {
        PerformedBy: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // Get pending invites for a repo
  static async getPendingInvites(repoId: number) {
    return db.collaborationInvite.findMany({
      where: {
        repoId,
        status: InviteStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Get pending invites for a user by email
  static async getPendingInvitesByEmail(email: string) {
    return db.collaborationInvite.findMany({
      where: {
        email,
        status: InviteStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        InvitedByUser: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        Repo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async hasPermission(
    userId: number,
    repoId: number,
    minRole: CollaborationRole
  ): Promise<boolean> {
    const repo = await db.repo.findUnique({
      where: { id: repoId },
    });

    // Owner has all permissions
    if (repo?.ownerId === userId) {
      return true;
    }

    const collaborator = await db.collaborator.findUnique({
      where: {
        userId_repoId: {
          userId,
          repoId,
        },
      },
    });

    if (!collaborator || !collaborator.isActive) {
      return false;
    }

    // Permission hierarchy: ADMIN > EDITOR > VIEWER
    const roleHierarchy: Record<CollaborationRole, number> = {
      VIEWER: 0,
      EDITOR: 1,
      ADMIN: 2,
    };

    return roleHierarchy[collaborator.role] >= roleHierarchy[minRole];
  }
}
