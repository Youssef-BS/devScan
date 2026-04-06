'use client';

import React, { useEffect, useState } from 'react';
import { CollaborationPanel } from '@/components/collaboration';
import { useAuthContext } from '@/auth-context';
import { Loader } from 'lucide-react';

interface RepositoryCollaborationPageProps {
  repoId: number;
  repoName: string;
}

/**
 * Example Repository Collaboration Page
 * 
 * This page demonstrates how to integrate the CollaborationPanel component
 * into your application. You can use this as a template for adding collaboration
 * features to your repository details pages.
 * 
 * Usage:
 * <RepositoryCollaborationPage repoId={1} repoName="My Repository" />
 * 
 * The page automatically handles:
 * - User authentication
 * - Real-time messaging
 * - Team member management
 * - Permission-based features
 */
export function RepositoryCollaborationPage({
  repoId,
  repoName,
}: RepositoryCollaborationPageProps) {
  const auth = useAuthContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading collaboration...</p>
        </div>
      </div>
    );
  }

  if (!auth?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <CollaborationPanel
        repoId={repoId}
        repoName={repoName}
        isOwner={auth.user?.role === 'ADMIN'} // Adjust based on your actual ownership logic
        currentUserId={auth.user?.id}
      />
    </div>
  );
}
