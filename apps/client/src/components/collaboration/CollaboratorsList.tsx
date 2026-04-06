'use client';

import React, { useState } from 'react';
import { X, Shield, Eye, Edit, UserPlus } from 'lucide-react';
import { Collaborator } from '@/services/collaboration.service';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  onRemove?: (userId: number) => Promise<void>;
  onUpdateRole?: (userId: number, role: 'VIEWER' | 'EDITOR' | 'ADMIN') => Promise<void>;
  isOwner?: boolean;
  loading?: boolean;
}

const roleIcons = {
  VIEWER: <Eye className="w-4 h-4" />,
  EDITOR: <Edit className="w-4 h-4" />,
  ADMIN: <Shield className="w-4 h-4" />,
};

const roleLabels = {
  VIEWER: 'Viewer',
  EDITOR: 'Editor',
  ADMIN: 'Admin',
};

export function CollaboratorsList({
  collaborators,
  onRemove,
  onUpdateRole,
  isOwner = false,
  loading = false,
}: CollaboratorsListProps) {
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const handleRemove = async (userId: number) => {
    if (!onRemove) return;

    setRemovingIds((prev) => new Set([...prev, userId]));
    try {
      await onRemove(userId);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    } finally {
      setRemovingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!onUpdateRole || !['VIEWER', 'EDITOR', 'ADMIN'].includes(newRole)) return;

    setUpdatingIds((prev) => new Set([...prev, userId]));
    try {
      await onUpdateRole(userId, newRole as 'VIEWER' | 'EDITOR' | 'ADMIN');
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdatingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  };

  if (collaborators.length <= 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No collaborators yet. Invite someone to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {collaborators.map((collaborator) => (
        <div
          key={collaborator.userId}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          
          <div className="flex items-center gap-3 flex-1">
            {collaborator.User.avatarUrl && (
              <img
                src={collaborator.User.avatarUrl}
                alt={collaborator.User.email}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">
                {collaborator.User.firstName || collaborator.User.username || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">{collaborator.User.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onUpdateRole ? (
              <Select
                value={collaborator.role}
                onValueChange={(value) => handleRoleChange(collaborator.userId, value)}
                disabled={updatingIds.has(collaborator.userId) || loading}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium">
                {roleIcons[collaborator.role as keyof typeof roleIcons]}
                {roleLabels[collaborator.role as keyof typeof roleLabels]}
              </div>
            )}

            {isOwner && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(collaborator.userId)}
                disabled={removingIds.has(collaborator.userId) || loading}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
