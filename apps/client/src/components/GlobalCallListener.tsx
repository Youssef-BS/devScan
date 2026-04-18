'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { CallModal, CallPeer } from './collaboration/CallModal';
import { useAuthContext } from '@/auth-context';
import RealtimeService from '@/services/realtime.service';

/**
 * Mounted once at dashboard-layout level so the user receives incoming call
 * notifications no matter which page they are currently on.
 */
export function GlobalCallListener() {
  const { user } = useAuthContext();

  const [callOpen, setCallOpen] = useState(false);
  const [callPeer, setCallPeer] = useState<CallPeer | null>(null);
  const [incomingCallId, setIncomingCallId] = useState<string | undefined>();
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | undefined>();
  const [repoId, setRepoId] = useState<number>(0);

  // Ensure the socket is initialised with the user's token so this listener
  // can receive events even before a CollaborationPanel is mounted.
  useEffect(() => {
    const token = Cookies.get('socketToken');
    if (token) {
      RealtimeService.initialize(token);
    }
  }, []);

  const handleIncomingCall = useCallback((data: any) => {
    // Ignore if a call dialog is already open
    if (callOpen) return;

    setIncomingCallId(data.callId);
    setIncomingOffer(data.offer);
    setCallPeer({ userId: data.from, email: data.email || '' });
    setRepoId(data.repoId ?? 0);
    setCallOpen(true);
  }, [callOpen]);

  useEffect(() => {
    RealtimeService.on('call-offer', handleIncomingCall);
    return () => RealtimeService.off('call-offer', handleIncomingCall);
  }, [handleIncomingCall]);

  if (!callOpen || !callPeer || !user) return null;

  return (
    <CallModal
      isOpen={callOpen}
      onClose={() => setCallOpen(false)}
      currentUserId={user.id}
      repoId={repoId}
      peer={callPeer}
      isIncoming={true}
      incomingCallId={incomingCallId}
      incomingOffer={incomingOffer}
    />
  );
}
