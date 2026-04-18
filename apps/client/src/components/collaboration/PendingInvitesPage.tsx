'use client';

import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { useAuthContext } from '@/auth-context';
import CollaborationService from '@/services/collaboration.service';

interface PendingInvite {
  id: number;
  email: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  expiresAt: string;
  repoName?: string;
  repoId: number;
  repoGithubId?: string;
  invitedBy?: {
    email: string;
    username?: string;
  };
  token: string;
}

export function PendingInvitesPage() {
  const auth = useAuthContext();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch pending invites
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('Fetching from:', `${apiUrl}/collaboration/my-invites`);

        // Get all pending invites for the current user's email
        const response = await fetch(
          `${apiUrl}/collaboration/my-invites`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch invites');
        }

        const data = await response.json();
        console.log('Invites received:', data);
        setInvites(data.invites || []);
      } catch (err: any) {
        console.error('Error fetching invites:', err);
        setError(err.message || 'Failed to load invitations');
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user?.email) {
      console.log('Current user email:', auth.user.email);
      fetchInvites();
    }
  }, [auth?.user?.email]);

  const handleAccept = async (token: string) => {
    try {
      setAccepting(token);
      setError(null);

      const acceptedInvite = invites.find((inv) => inv.token === token);
      await CollaborationService.acceptInvite(token);

      // Remove from list
      setInvites((prev) => prev.filter((inv) => inv.token !== token));

      setSuccess(`Invitation accepted! Redirecting to ${acceptedInvite?.repoName || 'project'}...`);
      setTimeout(() => {
        if (acceptedInvite?.repoGithubId) {
          window.location.href = `/dashboard/repo/${acceptedInvite.repoGithubId}?tab=collaboration`;
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
      setAccepting(null);
    }
  };

  const handleReject = async (token: string) => {
    try {
      setRejecting(token);
      setError(null);

      await CollaborationService.rejectInvite(token);

      // Remove from list
      setInvites((prev) => prev.filter((inv) => inv.token !== token));
    } catch (err: any) {
      setError(err.message || 'Failed to reject invitation');
    } finally {
      setRejecting(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'VIEWER':
        return '👀 Read-only access';
      case 'EDITOR':
        return '✏️ Can edit content';
      case 'ADMIN':
        return '🔑 Full permissions';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Collaboration Invitations</h1>
          </div>
          <p className="text-gray-600">
            Accept invitations to start collaborating with your team
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* No Invites */}
        {invites.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Invitations</h2>
            <p className="text-gray-600">
              You haven't received any collaboration invitations yet.
            </p>
          </div>
        )}

        {/* Invites List */}
        <div className="space-y-4">
          {invites.map((invite) => {
            const expired = isExpired(invite.expiresAt);
            const daysLeft = Math.ceil(
              (new Date(invite.expiresAt).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={invite.id}
                className={`rounded-lg border p-4 md:p-6 transition-all ${
                  expired
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-blue-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Side */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-100 h-fit">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Collaboration Invitation
                        </h3>

                        {/* Repository Info */}
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Repository:</span> {invite.repoName || `Repo #${invite.repoId}`}
                          </p>

                          {/* Role */}
                          <p>
                            <span className="font-medium">Role:</span> {getRoleDescription(invite.role)}
                          </p>

                          {/* Invited By */}
                          {invite.invitedBy && (
                            <p>
                              <span className="font-medium">From:</span>{' '}
                              {invite.invitedBy.username || invite.invitedBy.email}
                            </p>
                          )}

                          {/* Expiry */}
                          {!expired ? (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                            </p>
                          ) : (
                            <p className="text-xs text-red-600">
                              ⚠️ This invitation has expired
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex gap-2 md:flex-col">
                    {!expired ? (
                      <>
                        <button
                          onClick={() => handleAccept(invite.token)}
                          disabled={accepting === invite.token || rejecting === invite.token}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {accepting === invite.token ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleReject(invite.token)}
                          disabled={accepting === invite.token || rejecting === invite.token}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {rejecting === invite.token ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                        Expired
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Invitations are valid for 7 days. Accept to start collaborating
            or reject to dismiss the invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
