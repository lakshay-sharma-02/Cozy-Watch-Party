import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoCall } from './VideoCall';
import { UnoGame } from './UnoGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Gamepad2,
  Copy,
  Check,
  AlertCircle,
  Info,
  Users,
  ArrowLeft,
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';
import { useP2P } from '@/context/P2PContext';

interface WatchRoomProps {
  roomId: string;
  userName: string;
  isHost: boolean;
  onLeave: () => void;
}

export function WatchRoom({ roomId: initialRoomId, userName, isHost, onLeave }: WatchRoomProps) {
  const {
    peerId,
    connectToPeer,
    localStream,
    remoteStream,
    isConnected,
    callPeer
  } = useP2P();

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showUnoGame, setShowUnoGame] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);

  // If host, the room ID is MY peer ID.
  // If guest, the room ID is what I entered (initialRoomId).
  const displayRoomId = isHost ? peerId : initialRoomId;

  useEffect(() => {
    // If we are a guest and haven't connected yet, connect to the host
    if (!isHost && initialRoomId && !isConnected && !hasConnected) {
      connectToPeer(initialRoomId).then(() => {
        setHasConnected(true);
      });
    }
  }, [isHost, initialRoomId, isConnected, connectToPeer, hasConnected]);

  // Handle auto-calling when connected and streams are ready?
  // P2PContext handles answering calls. 
  // If I am the guest, maybe I should initiate the call once connected?
  // Or the host initiates? 
  // Let's say Guest initiates call after connection is established.
  useEffect(() => {
    if (isConnected && !isHost && localStream && !remoteStream) {
      // Give a small delay to ensure everything is ready
      const timer = setTimeout(() => {
        callPeer(initialRoomId, localStream);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isHost, localStream, remoteStream, callPeer, initialRoomId]);


  const handleToggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const handleToggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const handleToggleScreenShare = useCallback(async () => {
    // Basic screen share implementation: switch local stream track or replace track
    // For simplicity with P2PContext current impl, we might need to re-call or replace track
    // This part requires access to the PeerConnection which is inside P2PContext.
    // P2PContext might need to expose a replaceTrack method. 
    // For now, let's just log it or implement a simple version if possible.
    // If not, we might disable it for this migration step or notify user.
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream);
        setIsScreenSharing(true);

        // To properly screen share, we'd need to replace the video track in the active call.
        // Since P2PContext manages the call, we'd need to extend it.
        // For this quick migration, let's just show local screen share 
        // and assume we need to update P2PContext later for full support.
        // Or better: Re-call with screen stream?
        if (isConnected && !isHost) {
          callPeer(initialRoomId, stream);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      screenStream?.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      // Switch back to camera call
      if (isConnected && !isHost && localStream) {
        callPeer(initialRoomId, localStream);
      }
    }
  }, [isScreenSharing, screenStream, isConnected, isHost, initialRoomId, callPeer, localStream]);

  const handleEndCall = () => {
    onLeave();
    // Maybe force reload to clear peer state completely
    window.location.reload();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Room code copied to clipboard.'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--chart-1)/0.05),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <div className="container flex h-18 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleEndCall} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold gradient-text">Watch Party</h1>
                <Heart className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                disabled={!isHost} // Only host code matters usually, or both show their own ID? 
              // Actually, Guest needs to see Host ID? No, Guest sees Host ID that they typed.
              >
                <span className="font-mono tracking-wider">{displayRoomId || 'Loading...'}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={isHost ? 'default' : 'secondary'}
              className={cn(
                'rounded-lg px-3 py-1',
                isHost && 'animate-pulse-glow'
              )}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {isHost ? 'Host' : 'Guest'}
            </Badge>
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className={cn(
                'font-medium',
                isConnected ? 'text-emerald-500' : 'text-muted-foreground'
              )}>
                {isConnected ? '2' : '1'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container p-4 space-y-4">
        {/* Info banner */}
        <Card className="glass border-primary/20 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="flex items-start gap-4 py-4 relative">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-foreground mb-2">How to watch together (P2P):</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>If you are Host, copy the Room Code above and send it to your friend.</li>
                <li>If you are Guest, paste the code and join.</li>
                <li>Once connected, video and game sync will start automatically! 🚀</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Video area */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-1">
            <VideoCall
              localStream={localStream}
              remoteStream={remoteStream}
              screenStream={screenStream}
              isScreenSharing={isScreenSharing}
              onToggleVideo={handleToggleVideo}
              onToggleAudio={handleToggleAudio}
              onToggleScreenShare={handleToggleScreenShare}
              onEndCall={handleEndCall}
              videoEnabled={videoEnabled}
              audioEnabled={audioEnabled}
              participantName={isConnected ? (isHost ? 'Guest' : 'Host') : 'Waiting...'}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-fade-in-up stagger-2">
            {/* UNO Game Toggle */}
            <Card className="glass-strong border-0 shadow-xl overflow-hidden group hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-chart-2" />
                  </div>
                  Mini Games
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <Button
                  onClick={() => setShowUnoGame(!showUnoGame)}
                  variant={showUnoGame ? 'default' : 'outline'}
                  className={cn(
                    'w-full rounded-xl transition-all',
                    showUnoGame && 'animate-pulse-glow'
                  )}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {showUnoGame ? 'Hide UNO' : 'Play UNO'}
                </Button>
              </CardContent>
            </Card>

            {/* Connection status */}
            <Card className="glass-strong border-0 shadow-xl">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-4 h-4 rounded-full transition-all duration-500',
                    isConnected
                      ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'bg-muted animate-pulse'
                  )} />
                  <div>
                    <p className="font-semibold">
                      {isConnected ? 'Connected' : 'Waiting for friend...'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isConnected
                        ? '✨ Your watch party is live!'
                        : 'Share the room code with your friend'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal notice */}
            <Card className="glass border-destructive/20">
              <CardContent className="flex items-start gap-3 py-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only share content you have the right to share.
                  Respect copyright and streaming service terms of use.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* UNO Game Overlay */}
        {showUnoGame && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <UnoGame
              roomId={displayRoomId}
              myId={peerId} // My Peer ID is my unique ID in the game
              myName={userName}
              opponentId={'opponent'} // Simplified opponent ID since we only support 1 peer
              opponentName={isConnected ? (isHost ? 'Guest' : 'Host') : 'Waiting...'}
              onClose={() => setShowUnoGame(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
