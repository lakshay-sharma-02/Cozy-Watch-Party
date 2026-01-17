import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnoCard } from './UnoCard';
import { initializeGame, canPlayCard, shuffleDeck, createDeck } from '@/lib/unoGame';
import type { UnoGameState, UnoCard as UnoCardType, UnoColor } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { RotateCcw, Layers, Sparkles, X, Trophy, Zap } from 'lucide-react';
import { useP2P } from '@/context/P2PContext';

interface UnoGameProps {
  roomId: string; // This is actually the peer ID we are connected to/hosting
  myId: string;
  myName: string;
  opponentId: string;
  opponentName: string;
  onClose: () => void;
}

export function UnoGame({ myId, myName, opponentId, opponentName, onClose }: UnoGameProps) {
  const { sendMessage } = useP2P();

  const [gameState, setGameState] = useState<UnoGameState>(() =>
    initializeGame([myId, opponentId], [myName, opponentName], myId)
  );
  const [selectedWildCard, setSelectedWildCard] = useState<string | null>(null);
  const [drawPile, setDrawPile] = useState<UnoCardType[]>(() => shuffleDeck(createDeck()));

  // In shared state, find MY hand from the players array
  const myPlayerIndex = gameState.players.findIndex(p => p.id === myId);
  const myHand = gameState.players[myPlayerIndex]?.hand || [];
  const opponent = gameState.players.find(p => p.id !== myId);

  const isMyTurn = gameState.currentPlayerId === myId;

  // Sync state listener
  useEffect(() => {
    const handleData = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;

      if (data && data.type === 'GAME_STATE_UPDATE') {
        setGameState(data.payload);
      }
    };

    window.addEventListener('p2p-data', handleData);
    return () => {
      window.removeEventListener('p2p-data', handleData);
    };
  }, []);

  const broadcastState = (newState: UnoGameState) => {
    setGameState(newState);
    sendMessage({ type: 'GAME_STATE_UPDATE', payload: newState });
  };

  const handlePlayCard = (card: UnoCardType) => {
    if (!isMyTurn) return;
    if (!canPlayCard(card, gameState.topCard)) return;

    if (card.color === 'wild') {
      setSelectedWildCard(card.id);
      return;
    }

    executePlayCard(card);
  };

  const executePlayCard = (card: UnoCardType, chosenColor?: UnoColor) => {
    const newState = calculateNextState(gameState, card, chosenColor);
    broadcastState(newState);
    setSelectedWildCard(null);
  };

  const calculateNextState = (current: UnoGameState, card: UnoCardType, chosenColor?: UnoColor): UnoGameState => {
    // Create new players array with updated hand for current player
    const newPlayers = current.players.map(p => {
      if (p.id === current.currentPlayerId) {
        const newHand = p.hand.filter(c => c.id !== card.id);
        return { ...p, hand: newHand, handCount: newHand.length };
      }
      return p;
    });

    const playedCard = chosenColor ? { ...card, color: chosenColor } : card;
    let nextPlayerId = opponentId; // Default to passing turn

    // Simplified turn logic for 2 players
    if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2' || card.value === 'wild4') {
      nextPlayerId = myId; // Play again (skip opponent)
    }

    // Check win condition
    const currentPlayerNewHandCount = newPlayers.find(p => p.id === current.currentPlayerId)?.handCount || 0;
    let status: 'playing' | 'finished' = 'playing';
    let winnerIs = undefined;

    if (currentPlayerNewHandCount === 0) {
      status = 'finished';
      winnerIs = current.players.find(p => p.id === current.currentPlayerId)?.name;
    }

    return {
      ...current,
      players: newPlayers.map(p => ({
        ...p,
        isCurrentTurn: p.id === nextPlayerId
      })),
      topCard: playedCard,
      currentPlayerId: nextPlayerId,
      gameStatus: status,
      winner: winnerIs,
      drawPileCount: current.drawPileCount, // Unchanged
      direction: current.direction
    };
  };

  const handleChooseColor = (color: UnoColor) => {
    const card = myHand.find(c => c.id === selectedWildCard);
    if (card) {
      executePlayCard(card, color);
    }
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;

    const newCard: UnoCardType = drawPile[0] || {
      id: uuidv4(),
      color: 'blue',
      value: '5'
    };

    setDrawPile(prev => prev.slice(1));

    // Add card to my hand in state
    const newPlayers = gameState.players.map(p => {
      if (p.id === myId) {
        const newHand = [...p.hand, newCard];
        return { ...p, hand: newHand, handCount: newHand.length };
      }
      return p;
    });

    const newState: UnoGameState = {
      ...gameState,
      players: newPlayers.map(p => ({
        ...p,
        isCurrentTurn: p.id === opponentId // Pass turn after drawing? Usually yes.
      })),
      drawPileCount: gameState.drawPileCount - 1,
      currentPlayerId: opponentId
    };

    broadcastState(newState);
  };

  const handleNewGame = () => {
    const newState = initializeGame([myId, opponentId], [myName, opponentName], myId);
    setDrawPile(shuffleDeck(createDeck()));
    broadcastState(newState);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto glass-strong border-0 shadow-2xl animate-scale-in overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 pointer-events-none" />

      <CardHeader className="pb-2 flex flex-row items-center justify-between relative">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          UNO Game
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        {/* Opponent area */}
        <div className="flex items-center justify-between p-4 glass rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-4 h-4 rounded-full transition-all duration-300',
              !isMyTurn ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-muted'
            )} />
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground">
              {opponentName.charAt(0)}
            </div>
            <span className="font-semibold text-lg">{opponentName}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
            <Layers className="w-5 h-5 text-muted-foreground" />
            <span className="text-lg font-medium">{opponent?.handCount ?? 0}</span>
            <span className="text-sm text-muted-foreground">cards</span>
          </div>
        </div>

        {/* Game area */}
        <div className="flex items-center justify-center gap-10 py-8">
          {/* Draw pile */}
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn}
            className={cn(
              'relative group transition-all duration-300',
              isMyTurn && 'hover:scale-105',
              !isMyTurn && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="relative">
              {/* Stacked card effect */}
              <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-secondary/50 blur-sm" />
              <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-xl bg-secondary/70" />
              <UnoCard card={{ id: 'draw', color: 'wild', value: 'wild' }} faceDown size="lg" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 glass rounded-full">
              <span className="text-sm font-medium">{gameState.drawPileCount}</span>
            </div>
          </button>

          {/* Top card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-chart-1/20 to-chart-2/20 rounded-3xl blur-xl animate-pulse" />
            <UnoCard card={gameState.topCard} size="lg" disabled />
            <div className={cn(
              'absolute -top-3 -right-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium glass',
              'border border-border/50'
            )}>
              <RotateCcw className={cn(
                'w-4 h-4 transition-transform',
                gameState.direction === -1 && 'rotate-180'
              )} />
            </div>
          </div>
        </div>

        {/* Color chooser for wild cards */}
        {selectedWildCard && (
          <div className="flex items-center justify-center gap-3 p-4 glass rounded-2xl animate-scale-in">
            <span className="text-sm font-semibold mr-3">Choose color:</span>
            {(['red', 'blue', 'green', 'yellow'] as const).map(color => {
              const colorClasses = {
                red: 'from-red-500 to-red-600 hover:shadow-red-500/50',
                blue: 'from-blue-500 to-blue-600 hover:shadow-blue-500/50',
                green: 'from-emerald-500 to-emerald-600 hover:shadow-emerald-500/50',
                yellow: 'from-amber-400 to-amber-500 hover:shadow-amber-400/50'
              };
              return (
                <button
                  key={color}
                  onClick={() => handleChooseColor(color)}
                  className={cn(
                    'w-14 h-14 rounded-2xl border-2 border-background shadow-lg',
                    'bg-gradient-to-br',
                    colorClasses[color],
                    'hover:scale-110 hover:shadow-xl transition-all duration-300',
                    'hover:-translate-y-1'
                  )}
                />
              );
            })}
          </div>
        )}

        {/* My hand */}
        <div className="pt-6 border-t border-border/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-4 h-4 rounded-full transition-all duration-300',
                isMyTurn ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-muted'
              )} />
              <span className="font-semibold text-lg">Your Hand</span>
            </div>
            {isMyTurn && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full animate-pulse">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Your turn!</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {myHand.map((card, i) => (
              <div
                key={card.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                <UnoCard
                  card={card}
                  onClick={() => handlePlayCard(card)}
                  disabled={!isMyTurn || !canPlayCard(card, gameState.topCard)}
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Game over */}
        {gameState.gameStatus === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
            <div className="text-center p-8 glass-strong rounded-3xl shadow-2xl animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-background" />
              </div>
              <p className="text-3xl font-bold mb-2">
                {gameState.winner === myName ? '🎉 You Win!' : `${gameState.winner} Wins!`}
              </p>
              <p className="text-muted-foreground mb-6">Great game!</p>
              <Button onClick={handleNewGame} size="lg" className="rounded-xl px-8">
                Play Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
