const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Collaborator {
  id: number;
  userId: number;
  repoId: number;
  role: "VIEWER" | "EDITOR" | "ADMIN";
  isActive: boolean;
  joinedAt: string;
  User: {
    id: number;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface Message {
  id: number;
  content: string;
  repoId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    email: string;
    username?: string;
    avatarUrl?: string;
  };
}

export interface ActivityLog {
  id: number;
  action: string;
  details?: Record<string, any>;
  repoId: number;
  performedById?: number;
  affectedUserId?: number;
  createdAt: string;
  PerformedBy?: {
    id: number;
    email: string;
    username?: string;
    avatarUrl?: string;
  };
}

export interface PendingInvite {
  id: number;
  email: string;
  role: "VIEWER" | "EDITOR" | "ADMIN";
  createdAt: string;
}

class CollaborationService {
  // Invite a collaborator
  static async inviteCollaborator(
    repoId: number,
    email: string,
    role: "VIEWER" | "EDITOR" | "ADMIN"
  ) {
    const res = await fetch(`${API_BASE_URL}/collaboration/invite`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, email, role }),
    });
    
    if (!res.ok) throw new Error("Failed to invite collaborator");
    return res.json();
  }

  // Accept an invitation
  static async acceptInvite(token: string) {
    const res = await fetch(`${API_BASE_URL}/collaboration/invite/accept`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to accept invitation");
    }
    return res.json();
  }

  // Reject an invitation
  static async rejectInvite(token: string) {
    const res = await fetch(`${API_BASE_URL}/collaboration/invite/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    
    if (!res.ok) throw new Error("Failed to reject invitation");
    return res.json();
  }

  // Get collaborators for a repository
  static async getCollaborators(repoId: number): Promise<Collaborator[]> {
    const res = await fetch(`${API_BASE_URL}/collaboration/${repoId}/collaborators`, {
      credentials: "include",
    });
    
    if (!res.ok) throw new Error("Failed to get collaborators");
    const data = await res.json();
    console.log(`getCollaborators: API response for repoId ${repoId}:`, data);
    return data.collaborators || [];
  }

  // Remove a collaborator
  static async removeCollaborator(repoId: number, userId: number) {
    const res = await fetch(`${API_BASE_URL}/collaboration/collaborator`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, userId }),
    });
    
    if (!res.ok) throw new Error("Failed to remove collaborator");
    return res.json();
  }

  // Update collaborator role
  static async updateCollaboratorRole(
    repoId: number,
    userId: number,
    newRole: "VIEWER" | "EDITOR" | "ADMIN"
  ) {
    const res = await fetch(`${API_BASE_URL}/collaboration/collaborator/role`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, userId, newRole }),
    });
    
    if (!res.ok) throw new Error("Failed to update role");
    return res.json();
  }

  // Get pending invites
  static async getPendingInvites(repoId: number): Promise<PendingInvite[]> {
    const res = await fetch(`${API_BASE_URL}/collaboration/${repoId}/invites`, {
      credentials: "include",
    });
    
    if (!res.ok) throw new Error("Failed to get invites");
    const data = await res.json();
    return data.invites || [];
  }

  // Get activity log
  static async getActivityLog(repoId: number, limit = 50): Promise<ActivityLog[]> {
    const res = await fetch(`${API_BASE_URL}/collaboration/${repoId}/activity?limit=${limit}`, {
      credentials: "include",
    });
    
    if (!res.ok) throw new Error("Failed to get activity log");
    const data = await res.json();
    return data.activities || [];
  }

  // Get messages for a repository
  static async getMessages(repoId: number, limit = 50, offset = 0) {
    const res = await fetch(
      `${API_BASE_URL}/collaboration/${repoId}/messages?limit=${limit}&offset=${offset}`,
      { credentials: "include" }
    );
    
    if (!res.ok) throw new Error("Failed to get messages");
    return res.json();
  }
}

export default CollaborationService;
