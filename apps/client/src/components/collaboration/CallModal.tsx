'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
  Monitor, MonitorOff, Maximize2, Minimize2,
} from 'lucide-react';
import RealtimeService from '@/services/realtime.service';

export interface CallPeer {
  userId: number;
  email: string;
}

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  repoId: number;
  peer: CallPeer;
  isIncoming: boolean;
  incomingCallId?: string;
  incomingOffer?: RTCSessionDescriptionInit;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type CallState = 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected';

export function CallModal({
  isOpen,
  onClose,
  currentUserId,
  repoId,
  peer,
  isIncoming,
  incomingCallId,
  incomingOffer,
}: CallModalProps) {
  const [callState, setCallState] = useState<CallState>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string>(incomingCallId ?? `call-${Date.now()}`);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  // Queue ICE candidates that arrive before remote description is set
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSet = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const stopTimer = () => {
    if (durationRef.current) clearInterval(durationRef.current);
  };

  const startTimer = () => {
    stopTimer();
    durationRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getLocalMedia = async (): Promise<MediaStream> => {
    // Try video + audio first; fall back to audio-only if camera is unavailable
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (videoErr) {
      console.warn('Camera unavailable, falling back to audio-only:', videoErr);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        return stream;
      } catch (audioErr: any) {
        throw new Error(
          audioErr?.message?.includes('Permission')
            ? 'Microphone/camera access was denied. Please allow access in your browser and try again.'
            : audioErr?.message || 'Could not access microphone or camera.'
        );
      }
    }
  };

  const drainIceCandidateQueue = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const candidate of iceCandidateQueue.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add queued ICE candidate:', e);
      }
    }
    iceCandidateQueue.current = [];
  }, []);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    remoteDescSet.current = false;
    iceCandidateQueue.current = [];

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        RealtimeService.getSocket()?.emit('ice-candidate', {
          callId: callIdRef.current,
          to: peer.userId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startTimer();
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setCallState('ended');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  }, [peer.userId, drainIceCandidateQueue]);

  // ── Outgoing call: create offer ───────────────────────────────────────────

  const initiateCall = useCallback(async () => {
    try {
      setCallState('ringing');
      const stream = await getLocalMedia();
      const pc = createPeerConnection(stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      RealtimeService.getSocket()?.emit('call-offer', {
        callId: callIdRef.current,
        from: currentUserId,
        to: peer.userId,
        email: '',
        type: 'video',
        offer,
        repoId,
      });
    } catch (err: any) {
      console.error('initiateCall error:', err);
      setError(err.message || 'Failed to start call');
      setCallState('ended');
    }
  }, [createPeerConnection, currentUserId, peer.userId, repoId]);

  // ── Incoming call: accept ─────────────────────────────────────────────────

  const acceptCall = useCallback(async () => {
    try {
      setCallState('connecting');

      if (!incomingOffer) {
        throw new Error('No offer received — the call may have expired. Please ask the caller to try again.');
      }

      const stream = await getLocalMedia();
      const pc = createPeerConnection(stream);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      remoteDescSet.current = true;
      await drainIceCandidateQueue();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      RealtimeService.getSocket()?.emit('call-answer', {
        callId: callIdRef.current,
        from: currentUserId,
        to: peer.userId,
        answer,
      });
    } catch (err: any) {
      console.error('acceptCall error:', err);
      setError(err.message || 'Failed to accept call');
      setCallState('ended');
    }
  }, [createPeerConnection, currentUserId, drainIceCandidateQueue, incomingOffer, peer.userId]);

  // ── Reject / End ──────────────────────────────────────────────────────────

  const rejectCall = useCallback(() => {
    RealtimeService.getSocket()?.emit('call-rejected', {
      callId: callIdRef.current,
      to: peer.userId,
    });
    setCallState('rejected');
    cleanup();
    onClose();
  }, [peer.userId, onClose]);

  const endCall = useCallback(() => {
    RealtimeService.getSocket()?.emit('call-ended', {
      callId: callIdRef.current,
      to: peer.userId,
    });
    setCallState('ended');
    cleanup();
    onClose();
  }, [peer.userId, onClose]);

  const cleanup = useCallback(() => {
    stopTimer();
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    remoteDescSet.current = false;
    iceCandidateQueue.current = [];
  }, []);

  // ── Socket event listeners ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const handleAnswer = async (data: any) => {
      if (data.callId !== callIdRef.current) return;
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
        remoteDescSet.current = true;
        await drainIceCandidateQueue();
        setCallState('connecting');
      } catch (e) {
        console.error('handleAnswer error:', e);
      }
    };

    const handleIce = async (data: any) => {
      if (data.callId !== callIdRef.current) return;
      if (!data.candidate) return;
      try {
        if (remoteDescSet.current && pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          // Queue until remote description is set
          iceCandidateQueue.current.push(data.candidate);
        }
      } catch (e) {
        console.warn('handleIce error:', e);
      }
    };

    const handleEnded = (data: any) => {
      if (data.callId !== callIdRef.current) return;
      setCallState('ended');
      cleanup();
      setTimeout(onClose, 1500);
    };

    const handleRejected = (data: any) => {
      if (data.callId !== callIdRef.current) return;
      setCallState('rejected');
      cleanup();
      setTimeout(onClose, 1500);
    };

    RealtimeService.on('call-answer', handleAnswer);
    RealtimeService.on('ice-candidate', handleIce);
    RealtimeService.on('call-ended', handleEnded);
    RealtimeService.on('call-rejected', handleRejected);

    // Kick off the call
    if (!isIncoming) {
      initiateCall();
    }

    return () => {
      RealtimeService.off('call-answer', handleAnswer);
      RealtimeService.off('ice-candidate', handleIce);
      RealtimeService.off('call-ended', handleEnded);
      RealtimeService.off('call-rejected', handleRejected);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted((m) => !m);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = isCameraOff));
    setIsCameraOff((c) => !c);
  };

  const toggleScreenShare = async () => {
    if (!pcRef.current || !localStreamRef.current) return;

    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && camTrack) await sender.replaceTrack(camTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(screenTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {
        // user cancelled screen pick
      }
    }
  };

  if (!isOpen) return null;

  const peerName = peer.email?.split('@')[0] || peer.email || `User ${peer.userId}`;

  // ── Incoming ringing UI ───────────────────────────────────────────────────

  if (isIncoming && callState === 'ringing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl p-8 w-80 text-center shadow-2xl border border-white/10">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Phone className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-white/60 text-sm mb-1">Incoming video call</p>
          <h3 className="text-white text-xl font-semibold mb-6">{peerName}</h3>
          <div className="flex justify-center gap-6">
            <button
              onClick={rejectCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-105 shadow-lg"
              title="Reject"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={acceptCall}
              className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all hover:scale-105 shadow-lg animate-bounce"
              title="Accept"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Ended / Rejected UI ───────────────────────────────────────────────────

  if (callState === 'ended' || callState === 'rejected') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl p-8 w-80 text-center shadow-2xl border border-white/10">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white text-lg font-medium mb-1">
            {callState === 'rejected' ? 'Call Declined' : 'Call Ended'}
          </p>
          {duration > 0 && (
            <p className="text-white/50 text-sm mb-2">{formatDuration(duration)}</p>
          )}
          {error && (
            <p className="text-red-400 text-sm mt-2 px-2">{error}</p>
          )}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ── Active call UI ────────────────────────────────────────────────────────

  return (
    <div
      className={`fixed z-50 bg-gray-950 shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
        isPinned
          ? 'inset-0 rounded-none'
          : 'bottom-6 right-6 w-96 h-72 rounded-2xl'
      }`}
    >
      {/* Remote video (main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover bg-gray-900"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-white font-semibold text-sm">{peerName}</p>
          <p className="text-white/60 text-xs">
            {callState === 'connected'
              ? formatDuration(duration)
              : callState === 'connecting'
              ? 'Connecting...'
              : 'Calling...'}
          </p>
        </div>
        <button
          onClick={() => setIsPinned((p) => !p)}
          className="text-white/60 hover:text-white transition-colors"
          title={isPinned ? 'Minimize' : 'Expand'}
        >
          {isPinned ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Local video (picture-in-picture) */}
      <div className="absolute top-12 right-3 w-24 h-16 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-gray-800">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {isCameraOff && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <VideoOff className="w-5 h-5 text-white/40" />
          </div>
        )}
        {isScreenSharing && (
          <div className="absolute bottom-1 right-1 bg-blue-600 rounded px-1 py-0.5">
            <p className="text-white text-[9px] font-semibold">Screen</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-4 pb-4 pt-2">
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
        </button>

        <button
          onClick={toggleCamera}
          title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
            isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-white" />}
        </button>

        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
            isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isScreenSharing
            ? <MonitorOff className="w-4 h-4 text-white" />
            : <Monitor className="w-4 h-4 text-white" />}
        </button>

        <button
          onClick={endCall}
          title="End call"
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-105 shadow-lg"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
