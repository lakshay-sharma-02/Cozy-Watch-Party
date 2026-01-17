import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { Users, Video, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RoomLobbyProps {
  onJoinRoom: (roomId: string, userName: string, isHost: boolean) => void;
}

export function RoomLobby({ onJoinRoom }: RoomLobbyProps) {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name to create a room.',
        variant: 'destructive'
      });
      return;
    }
    const newRoomId = uuidv4().slice(0, 8).toUpperCase();
    setGeneratedCode(newRoomId);
  };

  const handleStartRoom = () => {
    if (generatedCode) {
      onJoinRoom(generatedCode, userName, true);
    }
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name to join a room.',
        variant: 'destructive'
      });
      return;
    }
    if (!roomCode.trim()) {
      toast({
        title: 'Room code required',
        description: 'Please enter the room code shared by your friend.',
        variant: 'destructive'
      });
      return;
    }
    onJoinRoom(roomCode.toUpperCase(), userName, false);
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Room code copied to clipboard.'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WatchTogether</h1>
          <p className="text-muted-foreground">
            Watch movies with friends, video chat, and play UNO together
          </p>
        </div>

        {/* Name input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Create or Join */}
        <div className="grid gap-4">
          {!generatedCode ? (
            <>
              {/* Create Room */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Create a Room
                  </CardTitle>
                  <CardDescription>
                    Start a new watch party and invite your friend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleCreateRoom} 
                    className="w-full"
                    size="lg"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </CardContent>
              </Card>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Join Room */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Join a Room</CardTitle>
                  <CardDescription>
                    Enter the code shared by your friend
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomCode">Room Code</Label>
                    <Input
                      id="roomCode"
                      placeholder="Enter room code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="text-lg tracking-widest text-center font-mono"
                      maxLength={8}
                    />
                  </div>
                  <Button 
                    onClick={handleJoinRoom} 
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Room Created */
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center">Room Created!</CardTitle>
                <CardDescription className="text-center">
                  Share this code with your friend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-4 bg-secondary rounded-lg text-center">
                    <span className="text-3xl font-mono font-bold tracking-widest text-primary">
                      {generatedCode}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-14 w-14"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-chart-1" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={handleStartRoom} 
                  className="w-full"
                  size="lg"
                >
                  Start Watch Party
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setGeneratedCode(null)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground">
          Works best on desktop browsers with camera and microphone access
        </p>
      </div>
    </div>
  );
}
