import { Request, Response } from "express";
import { CollaborationService } from "../services/collaboration.service.js";
import { CollaborationRole, prisma } from "../db.js";


export class CollaborationController {
  // Invite a collaborator
  static async inviteCollaborator(req: Request, res: Response) {
    try {
      const { repoId, email, role } = req.body;
      const userId = (req as any).userId; // From auth middleware

      // Validate inputs
      if (!repoId || !email || !role) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: repoId, email, role",
        });
      }

      if (!Object.values(CollaborationRole).includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${Object.values(CollaborationRole).join(", ")}`,
        });
      }

      // Check permission
      const canInvite = await CollaborationService.hasPermission(
        userId,
        repoId,
        CollaborationRole.ADMIN
      );

      if (!canInvite) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to invite collaborators",
        });
      }

      const result = await CollaborationService.inviteCollaborator(
        repoId,
        email,
        role,
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log activity
      await CollaborationService.logActivity(
        repoId,
        "invited_collaborator",
        { email, role },
        userId
      );

      res.json(result);
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      res.status(500).json({
        success: false,
        message: "Failed to invite collaborator",
      });
    }
  }

  // Accept an invitation
  static async acceptInvite(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const userId = (req as any).userId;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Invitation token is required",
        });
      }

      const result = await CollaborationService.acceptInvite(token, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      console.log(`Invitation accepted successfully for userId: ${userId}`, result);

      res.json({
        success: true,
        message: "Invitation accepted",
        collaborator: result.collaborator,
        repoId: result.collaborator?.repoId,
      });
    } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).json({
        success: false,
        message: "Failed to accept invitation",
      });
    }
  }

  // Reject an invitation
  static async rejectInvite(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const userId = (req as any).userId;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Invitation token is required",
        });
      }

      const result = await CollaborationService.rejectInvite(token, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error rejecting invite:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject invitation",
      });
    }
  }

  // Get collaborators
  static async getCollaborators(req: Request, res: Response) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
      const userId = (req as any).userId;

      if (!repoId) {
        return res.status(400).json({
          success: false,
          message: "repoId is required",
        });
      }

      // Check if user has access
      const hasAccess = await CollaborationService.hasPermission(
        userId,
        parseInt(repoId as string),
        CollaborationRole.VIEWER
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this repository",
        });
      }

      const collaborators = await CollaborationService.getCollaborators(
        parseInt(repoId as string)
      );

      res.json({
        success: true,
        collaborators,
      });
    } catch (error) {
      console.error("Error getting collaborators:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get collaborators",
      });
    }
  }

  // Remove a collaborator
  static async removeCollaborator(req: Request, res: Response) {
    try {
      const { repoId, userId } = req.body;
      const currentUserId = (req as any).userId;

      if (!repoId || !userId) {
        return res.status(400).json({
          success: false,
          message: "repoId and userId are required",
        });
      }

      // Check permission
      const canRemove = await CollaborationService.hasPermission(
        currentUserId,
        repoId,
        CollaborationRole.ADMIN
      );

      if (!canRemove) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to remove collaborators",
        });
      }

      const result = await CollaborationService.removeCollaborator(
        repoId,
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log activity
      await CollaborationService.logActivity(
        repoId,
        "removed_collaborator",
        { removedUserId: userId },
        currentUserId,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error("Error removing collaborator:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove collaborator",
      });
    }
  }

  // Update collaborator role
  static async updateCollaboratorRole(req: Request, res: Response) {
    try {
      const { repoId, userId, newRole } = req.body;
      const currentUserId = (req as any).userId;

      if (!repoId || !userId || !newRole) {
        return res.status(400).json({
          success: false,
          message: "repoId, userId, and newRole are required",
        });
      }

      if (!Object.values(CollaborationRole).includes(newRole)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${Object.values(CollaborationRole).join(", ")}`,
        });
      }

      // Check permission
      const canUpdate = await CollaborationService.hasPermission(
        currentUserId,
        repoId,
        CollaborationRole.ADMIN
      );

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update roles",
        });
      }

      const result = await CollaborationService.updateCollaboratorRole(
        repoId,
        userId,
        newRole
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log activity
      await CollaborationService.logActivity(
        repoId,
        "updated_role",
        { userId, newRole },
        currentUserId,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update collaborator role",
      });
    }
  }

  // Get pending invites
  static async getPendingInvites(req: Request, res: Response) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
      const userId = (req as any).userId;

      if (!repoId) {
        return res.status(400).json({
          success: false,
          message: "repoId is required",
        });
      }

      // Check permission - must be owner or have at least VIEWER access
      const parsedRepoId = parseInt(repoId as string);
      const repo = await prisma.repo.findUnique({
        where: { id: parsedRepoId },
      });

      // Only owner or ADMIN can view pending invites
      const isOwner = repo?.ownerId === userId;
      const canView = isOwner || await CollaborationService.hasPermission(
        userId,
        parsedRepoId,
        CollaborationRole.ADMIN
      );

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view pending invites",
        });
      }

      const invites = await CollaborationService.getPendingInvites(
        parseInt(repoId as string)
      );

      res.json({
        success: true,
        invites,
      });
    } catch (error) {
      console.error("Error getting pending invites:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get pending invites",
      });
    }
  }

  // Get activity log
  static async getActivityLog(req: Request, res: Response) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
      const userId = (req as any).userId;
      const { limit = 50 } = req.query;

      if (!repoId) {
        return res.status(400).json({
          success: false,
          message: "repoId is required",
        });
      }

      // Check if user has access
      const hasAccess = await CollaborationService.hasPermission(
        userId,
        parseInt(repoId as string),
        CollaborationRole.VIEWER
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this repository",
        });
      }

      const activities = await CollaborationService.getActivityLog(
        parseInt(repoId as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        activities,
      });
    } catch (error) {
      console.error("Error getting activity log:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get activity log",
      });
    }
  }

  // Get pending invites for current user
  static async getMyPendingInvites(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { prisma } = await import("../db.js");

      // Get user to find their email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user || !user.email) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const invites = await CollaborationService.getPendingInvitesByEmail(user.email);

      res.json({
        success: true,
        invites: invites.map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          token: inv.token,
          role: inv.role,
          repoId: inv.repoId,
          repoName: inv.Repo?.name,
          expiresAt: inv.expiresAt,
          invitedBy: inv.InvitedByUser,
        })),
      });
    } catch (error: any) {
      console.error("Error getting pending invites:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get pending invites",
      });
    }
  }

  // Get messages for a repository
  static async getMessages(req: Request, res: Response) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
      const userId = (req as any).userId;
      const { limit = "50", offset = "0" } = req.query;

      if (!repoId) {
        return res.status(400).json({
          success: false,
          message: "repoId is required",
        });
      }

      const parsedRepoId = parseInt(repoId as string);

      // Check if user has access to this repository
      const hasAccess = await CollaborationService.hasPermission(
        userId,
        parsedRepoId,
        CollaborationRole.VIEWER
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this repository",
        });
      }

      const result = await CollaborationService.getMessages(
        parsedRepoId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get messages",
      });
    }
  }
}
