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
  ArrowLeft
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

  // Initialize camera/mic
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        toast({
          title: 'Camera ready',
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

  // Simulate participant connection after delay (demo mode)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!participantConnected) {
        // In a real app, this would come from WebRTC
        setParticipantConnected(true);
        toast({
          title: 'Friend connected!',
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
          audio: true // Capture tab audio if available
        });
        
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        toast({
          title: 'Screen sharing started',
          description: 'Your friend can now see your screen. Open your movie in another tab!'
        });
      } catch (err) {
        console.error('Failed to share screen:', err);
        toast({
          title: 'Screen share failed',
          description: 'Could not start screen sharing. Please try again.',
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
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleEndCall}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Watch Party</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="font-mono">{roomId}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-chart-1" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={isHost ? 'default' : 'secondary'}>
              {isHost ? 'Host' : 'Guest'}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participantConnected ? '2' : '1'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container p-4 space-y-4">
        {/* Info banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 py-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">How to watch together:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 mt-1">
                <li>Open your movie in a new browser tab (e.g., Netmirror)</li>
                <li>Click "Share Screen" below and select the movie tab</li>
                <li>Enable "Share tab audio" for synchronized audio</li>
                <li>Your friend will see and hear everything in sync!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Video area */}
          <div className="lg:col-span-2">
            <VideoCall
              localStream={localStream}
              remoteStream={participantConnected ? localStream : null} // Demo: mirror local stream
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
          <div className="space-y-4">
            {/* UNO Game Toggle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  Mini Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowUnoGame(!showUnoGame)}
                  variant={showUnoGame ? 'default' : 'outline'}
                  className="w-full"
                >
                  {showUnoGame ? 'Hide UNO' : 'Play UNO'}
                </Button>
              </CardContent>
            </Card>

            {/* Connection status */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    participantConnected ? 'bg-chart-1' : 'bg-muted animate-pulse'
                  )} />
                  <div>
                    <p className="font-medium text-sm">
                      {participantConnected ? 'Connected' : 'Waiting for friend...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participantConnected 
                        ? 'Your watch party is live!'
                        : 'Share the room code with your friend'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal notice */}
            <Card className="border-destructive/20">
              <CardContent className="flex items-start gap-2 py-3">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Only share content you have the right to share. 
                  Respect copyright and streaming service terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* UNO Game Overlay */}
        {showUnoGame && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
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
