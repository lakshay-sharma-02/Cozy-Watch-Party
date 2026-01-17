import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Maximize2,
  Minimize2,
  Phone,
  Sparkles
} from 'lucide-react';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  videoEnabled: boolean;
  audioEnabled: boolean;
  participantName: string;
}

export function VideoCall({
  localStream,
  remoteStream,
  screenStream,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onEndCall,
  videoEnabled,
  audioEnabled,
  participantName
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFullscreen) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isFullscreen, showControls]);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      className={cn(
        'relative rounded-3xl overflow-hidden glass-strong border-0 shadow-2xl',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'
      )}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 pointer-events-none z-10" />
      
      {/* Main video area */}
      <div className="absolute inset-0 bg-secondary">
        {screenStream ? (
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/80">
            <div className="text-center animate-fade-in">
              <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center glass">
                <span className="text-4xl font-bold text-muted-foreground">
                  {participantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">Waiting for {participantName}...</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local video PIP */}
      <div className="absolute bottom-24 right-6 z-20 group">
        <div className={cn(
          'w-36 md:w-52 aspect-video rounded-2xl overflow-hidden shadow-2xl',
          'border-2 border-background/30 glass-strong',
          'transition-transform duration-300 hover:scale-105'
        )}>
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {!videoEnabled && localStream && (
            <div className="absolute inset-0 bg-secondary/90 flex items-center justify-center backdrop-blur-sm">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </div>

      {/* Screen share indicator */}
      {isScreenSharing && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 backdrop-blur-sm animate-pulse">
          <div className="w-2 h-2 rounded-full bg-destructive-foreground animate-ping" />
          <Monitor className="w-4 h-4 text-destructive-foreground" />
          <span className="text-sm font-semibold text-destructive-foreground">Sharing Screen</span>
        </div>
      )}

      {/* Connection quality indicator */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-500">Connected</span>
      </div>

      {/* Controls */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 p-6 z-20',
        'transition-all duration-500',
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={audioEnabled ? 'secondary' : 'destructive'}
            size="icon"
            onClick={onToggleAudio}
            className={cn(
              'rounded-2xl w-14 h-14 shadow-xl transition-all duration-300',
              'hover:scale-110 hover:-translate-y-1',
              audioEnabled && 'glass hover-glow'
            )}
          >
            {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            variant={videoEnabled ? 'secondary' : 'destructive'}
            size="icon"
            onClick={onToggleVideo}
            className={cn(
              'rounded-2xl w-14 h-14 shadow-xl transition-all duration-300',
              'hover:scale-110 hover:-translate-y-1',
              videoEnabled && 'glass hover-glow'
            )}
          >
            {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            onClick={onToggleScreenShare}
            className={cn(
              'rounded-2xl w-14 h-14 shadow-xl transition-all duration-300',
              'hover:scale-110 hover:-translate-y-1',
              !isScreenSharing && 'glass hover-glow',
              isScreenSharing && 'animate-pulse-glow'
            )}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={handleFullscreen}
            className="rounded-2xl w-14 h-14 shadow-xl glass hover-glow transition-all duration-300 hover:scale-110 hover:-translate-y-1"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={onEndCall}
            className="rounded-2xl w-14 h-14 shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-destructive/90"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
