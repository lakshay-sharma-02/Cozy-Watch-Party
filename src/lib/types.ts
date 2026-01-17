// Room and session types
export interface Room {
  id: string;
  name: string;
  hostId: string;
  createdAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  stream?: MediaStream;
  screenStream?: MediaStream;
}

// Synchronization message types
export type SyncMessageType =
  | 'play'
  | 'pause'
  | 'seek'
  | 'heartbeat'
  | 'sync-request'
  | 'sync-response';

export interface SyncMessage {
  type: SyncMessageType;
  timestamp: number;
  playbackPosition: number;
  senderId: string;
}

// Uno game types
export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoValue;
}

export interface UnoPlayer {
  id: string;
  name: string;
  handCount: number;
  isCurrentTurn: boolean;
  hand: UnoCard[]; // Shared state includes all hands for this simple implementation
}

export interface UnoGameState {
  players: UnoPlayer[];
  currentPlayerId: string;
  topCard: UnoCard;
  direction: 1 | -1;
  drawPileCount: number;
  drawPileCount: number;
  // myHand removed, derived from players array
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner?: string;
}

export type UnoAction =
  | { type: 'play-card'; cardId: string; chosenColor?: UnoColor }
  | { type: 'draw-card' }
  | { type: 'say-uno' }
  | { type: 'challenge-uno'; targetPlayerId: string };

// WebRTC signaling types
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'screen-share-start' | 'screen-share-stop';
  payload: unknown;
  senderId: string;
  targetId?: string;
  roomId: string;
}
