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
  Phone
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

  // Auto-hide controls after 3 seconds of inactivity
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
        'relative bg-secondary rounded-xl overflow-hidden',
        isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'
      )}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Main video area - screen share or remote video */}
      <div className="absolute inset-0">
        {screenStream ? (
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-secondary"
          />
        ) : remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-3xl font-bold text-muted-foreground">
                  {participantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-muted-foreground">Waiting for {participantName}...</p>
            </div>
          </div>
        )}
      </div>

      {/* Local video PIP */}
      <div className="absolute bottom-20 right-4 w-32 md:w-48 aspect-video rounded-lg overflow-hidden shadow-xl border-2 border-border bg-secondary">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {!videoEnabled && localStream && (
          <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center">
            <VideoOff className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Screen share indicator */}
      {isScreenSharing && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-destructive rounded-full">
          <Monitor className="w-4 h-4 text-destructive-foreground" />
          <span className="text-sm font-medium text-destructive-foreground">Sharing Screen</span>
        </div>
      )}

      {/* Controls */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-secondary/90 to-transparent',
        'transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0'
      )}>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={audioEnabled ? 'secondary' : 'destructive'}
            size="icon"
            onClick={onToggleAudio}
            className="rounded-full w-12 h-12"
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={videoEnabled ? 'secondary' : 'destructive'}
            size="icon"
            onClick={onToggleVideo}
            className="rounded-full w-12 h-12"
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            onClick={onToggleScreenShare}
            className="rounded-full w-12 h-12"
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={handleFullscreen}
            className="rounded-full w-12 h-12"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={onEndCall}
            className="rounded-full w-12 h-12"
          >
            <Phone className="w-5 h-5 rotate-135" />
          </Button>
        </div>
      </div>
    </div>
  );
}
