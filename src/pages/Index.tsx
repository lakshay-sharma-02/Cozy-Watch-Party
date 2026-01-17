import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { RoomLobby } from '@/components/RoomLobby';
import { WatchRoom } from '@/components/WatchRoom';

type View = 'landing' | 'lobby' | 'room';

interface RoomData {
  roomId: string;
  userName: string;
  isHost: boolean;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  const handleGetStarted = () => {
    setCurrentView('lobby');
  };

  const handleJoinRoom = (roomId: string, userName: string, isHost: boolean) => {
    setRoomData({ roomId, userName, isHost });
    setCurrentView('room');
  };

  const handleLeaveRoom = () => {
    setRoomData(null);
    setCurrentView('lobby');
  };

  if (currentView === 'room' && roomData) {
    return (
      <WatchRoom
        roomId={roomData.roomId}
        userName={roomData.userName}
        isHost={roomData.isHost}
        onLeave={handleLeaveRoom}
      />
    );
  }

  if (currentView === 'lobby') {
    return <RoomLobby onJoinRoom={handleJoinRoom} />;
  }

  return <Hero onGetStarted={handleGetStarted} />;
};

export default Index;
