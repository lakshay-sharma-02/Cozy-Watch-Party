import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { Users, Video, Copy, Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-1/10 rounded-full blur-3xl animate-float-slow" />
      
      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Header */}
        <div className="text-center space-y-4 opacity-0 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 glass animate-pulse-glow">
            <Video className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">WatchTogether</h1>
          <p className="text-muted-foreground">
            Watch movies with friends, video chat, and play UNO together
          </p>
        </div>

        {/* Name input */}
        <Card className="opacity-0 animate-fade-in-up stagger-1 glass-strong border-0 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-lg h-14 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>

        {/* Create or Join */}
        <div className="grid gap-4 opacity-0 animate-fade-in-up stagger-2">
          {!generatedCode ? (
            <>
              {/* Create Room */}
              <Card className="glass-strong border-0 shadow-2xl overflow-hidden group hover-lift">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3 relative">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    Create a Room
                  </CardTitle>
                  <CardDescription>
                    Start a new watch party and invite your friend
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button 
                    onClick={handleCreateRoom} 
                    className="w-full h-14 text-lg rounded-xl group"
                    size="lg"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Create Room
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="glass px-4 py-1 rounded-full text-muted-foreground">or</span>
                </div>
              </div>

              {/* Join Room */}
              <Card className="glass-strong border-0 shadow-2xl hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-chart-1/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-chart-1" />
                    </div>
                    Join a Room
                  </CardTitle>
                  <CardDescription>
                    Enter the code shared by your friend
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomCode" className="text-muted-foreground">Room Code</Label>
                    <Input
                      id="roomCode"
                      placeholder="XXXXXXXX"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="text-xl h-14 tracking-[0.3em] text-center font-mono rounded-xl bg-background/50 border-border/50 focus:border-primary transition-colors"
                      maxLength={8}
                    />
                  </div>
                  <Button 
                    onClick={handleJoinRoom} 
                    variant="secondary"
                    className="w-full h-14 text-lg rounded-xl"
                    size="lg"
                  >
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Room Created */
            <Card className="glass-strong border-primary/30 shadow-2xl animate-scale-in overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Room Created!
                </CardTitle>
                <CardDescription className="text-center">
                  Share this code with your friend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-5 glass rounded-2xl text-center gradient-border">
                    <span className="text-4xl font-mono font-bold tracking-[0.2em] gradient-text">
                      {generatedCode}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-16 w-16 rounded-2xl glass hover-glow"
                  >
                    {copied ? (
                      <Check className="w-6 h-6 text-chart-1" />
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={handleStartRoom} 
                  className="w-full h-14 text-lg rounded-xl animate-pulse-glow"
                  size="lg"
                >
                  Start Watch Party
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setGeneratedCode(null)}
                  className="w-full rounded-xl"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground opacity-0 animate-fade-in stagger-3">
          Works best on desktop browsers with camera and microphone access
        </p>
      </div>
    </div>
  );
}
