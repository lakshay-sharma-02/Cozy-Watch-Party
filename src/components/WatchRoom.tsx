import { useState, useEffect, useCallback } from 'react';
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
import { v4 as uuidv4 } from 'uuid';

interface WatchRoomProps {
  roomId: string;
  userName: string;
  isHost: boolean;
  onLeave: () => void;
}

export function WatchRoom({ roomId, userName, isHost, onLeave }: WatchRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showUnoGame, setShowUnoGame] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participantConnected, setParticipantConnected] = useState(false);
  const [myId] = useState(() => uuidv4());

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        toast({
          title: '✨ Camera ready',
          description: 'Your camera and microphone are connected.'
        });
      } catch (err) {
        console.error('Failed to get media devices:', err);
        toast({
          title: 'Camera access denied',
          description: 'Please allow camera and microphone access.',
          variant: 'destructive'
        });
      }
    };
    initMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      screenStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!participantConnected) {
        setParticipantConnected(true);
        toast({
          title: '🎉 Friend connected!',
          description: 'Your watch party is ready to start.'
        });
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [participantConnected]);

  const handleToggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(prev => !prev);
    }
  }, [localStream]);

  const handleToggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(prev => !prev);
    }
  }, [localStream]);

  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      toast({
        title: 'Screen sharing stopped',
        description: 'Your screen is no longer being shared.'
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        toast({
          title: '🖥️ Screen sharing started',
          description: 'Your friend can now see your screen!'
        });
      } catch (err) {
        console.error('Failed to share screen:', err);
        toast({
          title: 'Screen share failed',
          description: 'Could not start screen sharing.',
          variant: 'destructive'
        });
      }
    }
  }, [isScreenSharing, screenStream]);

  const handleEndCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    onLeave();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
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
              >
                <span className="font-mono tracking-wider">{roomId}</span>
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
                participantConnected ? 'text-emerald-500' : 'text-muted-foreground'
              )}>
                {participantConnected ? '2' : '1'}
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
              <p className="font-semibold text-foreground mb-2">How to watch together:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>Open your movie in a <span className="text-foreground font-medium">new browser tab</span></li>
                <li>Click <span className="text-primary font-medium">"Share Screen"</span> and select the movie tab</li>
                <li>Enable <span className="text-foreground font-medium">"Share tab audio"</span> for synchronized audio</li>
                <li>Your friend will see and hear everything in sync! 🎬</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Video area */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-1">
            <VideoCall
              localStream={localStream}
              remoteStream={participantConnected ? localStream : null}
              screenStream={screenStream}
              isScreenSharing={isScreenSharing}
              onToggleVideo={handleToggleVideo}
              onToggleAudio={handleToggleAudio}
              onToggleScreenShare={handleToggleScreenShare}
              onEndCall={handleEndCall}
              videoEnabled={videoEnabled}
              audioEnabled={audioEnabled}
              participantName={isHost ? 'Friend' : 'Host'}
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
                    participantConnected 
                      ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                      : 'bg-muted animate-pulse'
                  )} />
                  <div>
                    <p className="font-semibold">
                      {participantConnected ? 'Connected' : 'Waiting for friend...'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participantConnected 
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
              myId={myId}
              myName={userName}
              opponentId="opponent-demo"
              opponentName={isHost ? 'Friend' : 'Host'}
              onClose={() => setShowUnoGame(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
