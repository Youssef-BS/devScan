'use client';

import React, { useState } from 'react';
import { Mail, Plus, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InviteCollaboratorProps {
  onInvite: (email: string, role: 'VIEWER' | 'EDITOR' | 'ADMIN') => Promise<void>;
  loading?: boolean;
}

export function InviteCollaborator({ onInvite, loading = false }: InviteCollaboratorProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN'>('VIEWER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      return;
    }

    if (invitedEmails.includes(email)) {
      setError('This email has already been invited');
      return;
    }

    setIsSubmitting(true);

    try {
      await onInvite(email, role);
      setSuccess(true);
      setInvitedEmails((prev) => [...prev, email]);
      setEmail('');
      setRole('VIEWER');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to invite collaborator');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              placeholder="collaborator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || loading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Role
            </label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as any)}
              disabled={isSubmitting || loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer - Read only</SelectItem>
                <SelectItem value="EDITOR">Editor - Can edit</SelectItem>
                <SelectItem value="ADMIN">Admin - Full access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Invitation sent successfully!
            </p>
          </div>
        )}
      </form>

      {/* Recently Invited */}
      {invitedEmails.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recently Invited
          </h4>
          <div className="space-y-2">
            {invitedEmails.map((invitedEmail) => (
              <div
                key={invitedEmail}
                className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span className="text-sm">{invitedEmail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Invite Info */}
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
          💡 Tip: Invitations are valid for 7 days. Team members will receive an email with a unique link.
        </p>
      </div>
    </div>
  );
}
