import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnoCard } from './UnoCard';
import { initializeGame, canPlayCard, shuffleDeck, createDeck } from '@/lib/unoGame';
import type { UnoGameState, UnoCard as UnoCardType, UnoColor } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { RotateCcw, Layers, Sparkles, X } from 'lucide-react';

interface UnoGameProps {
  myId: string;
  myName: string;
  opponentId: string;
  opponentName: string;
  onClose: () => void;
}

export function UnoGame({ myId, myName, opponentId, opponentName, onClose }: UnoGameProps) {
  const [gameState, setGameState] = useState<UnoGameState>(() => 
    initializeGame([myId, opponentId], [myName, opponentName], myId)
  );
  const [selectedWildCard, setSelectedWildCard] = useState<string | null>(null);
  const [drawPile, setDrawPile] = useState<UnoCardType[]>(() => shuffleDeck(createDeck()));

  const isMyTurn = gameState.currentPlayerId === myId;
  const myPlayer = gameState.players.find(p => p.id === myId);
  const opponent = gameState.players.find(p => p.id === opponentId);

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
    setGameState(prev => {
      const newHand = prev.myHand.filter(c => c.id !== card.id);
      const playedCard = chosenColor ? { ...card, color: chosenColor } : card;
      
      // Handle special cards
      let nextPlayerId = opponentId;
      if (card.value === 'skip' || card.value === 'reverse') {
        nextPlayerId = myId; // Skip opponent's turn
      }

      // Check for winner
      if (newHand.length === 0) {
        return {
          ...prev,
          myHand: newHand,
          topCard: playedCard,
          gameStatus: 'finished',
          winner: myName,
          currentPlayerId: nextPlayerId,
          players: prev.players.map(p => ({
            ...p,
            handCount: p.id === myId ? 0 : p.handCount,
            isCurrentTurn: p.id === nextPlayerId
          }))
        };
      }

      return {
        ...prev,
        myHand: newHand,
        topCard: playedCard,
        currentPlayerId: nextPlayerId,
        players: prev.players.map(p => ({
          ...p,
          handCount: p.id === myId ? newHand.length : p.handCount,
          isCurrentTurn: p.id === nextPlayerId
        }))
      };
    });
    setSelectedWildCard(null);

    // Simulate opponent's turn after a delay
    if (gameState.currentPlayerId === myId) {
      setTimeout(() => simulateOpponentTurn(), 1500);
    }
  };

  const handleChooseColor = (color: UnoColor) => {
    const card = gameState.myHand.find(c => c.id === selectedWildCard);
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
    setGameState(prev => ({
      ...prev,
      myHand: [...prev.myHand, newCard],
      drawPileCount: prev.drawPileCount - 1,
      currentPlayerId: opponentId,
      players: prev.players.map(p => ({
        ...p,
        handCount: p.id === myId ? prev.myHand.length + 1 : p.handCount,
        isCurrentTurn: p.id === opponentId
      }))
    }));

    setTimeout(() => simulateOpponentTurn(), 1500);
  };

  const simulateOpponentTurn = () => {
    setGameState(prev => {
      if (prev.gameStatus === 'finished') return prev;

      // Simple AI: draw a card and play a random playable card
      const opponentPlayer = prev.players.find(p => p.id === opponentId);
      if (!opponentPlayer) return prev;

      // Simulate playing a card
      const playedCard: UnoCardType = {
        id: uuidv4(),
        color: prev.topCard.color === 'wild' ? 'blue' : prev.topCard.color,
        value: Math.random() > 0.5 ? prev.topCard.value : String(Math.floor(Math.random() * 10)) as any
      };

      const newHandCount = Math.max(1, opponentPlayer.handCount - 1);
      
      if (newHandCount === 0) {
        return {
          ...prev,
          topCard: playedCard,
          gameStatus: 'finished',
          winner: opponentName,
          currentPlayerId: myId,
          players: prev.players.map(p => ({
            ...p,
            handCount: p.id === opponentId ? 0 : p.handCount,
            isCurrentTurn: p.id === myId
          }))
        };
      }

      return {
        ...prev,
        topCard: playedCard,
        currentPlayerId: myId,
        players: prev.players.map(p => ({
          ...p,
          handCount: p.id === opponentId ? newHandCount : p.handCount,
          isCurrentTurn: p.id === myId
        }))
      };
    });
  };

  const handleNewGame = () => {
    setGameState(initializeGame([myId, opponentId], [myName, opponentName], myId));
    setDrawPile(shuffleDeck(createDeck()));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-border shadow-2xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="w-5 h-5 text-primary" />
          UNO Game
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Opponent area */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              !isMyTurn ? 'bg-chart-1 animate-pulse' : 'bg-muted'
            )} />
            <span className="font-medium text-secondary-foreground">{opponentName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{opponent?.handCount} cards</span>
          </div>
        </div>

        {/* Game area */}
        <div className="flex items-center justify-center gap-8 py-6">
          {/* Draw pile */}
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn}
            className={cn(
              'relative group',
              !isMyTurn && 'opacity-50 cursor-not-allowed'
            )}
          >
            <UnoCard card={{ id: 'draw', color: 'wild', value: 'wild' }} faceDown size="lg" />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              Draw ({gameState.drawPileCount})
            </span>
          </button>

          {/* Top card */}
          <div className="relative">
            <UnoCard card={gameState.topCard} size="lg" disabled />
            <div className={cn(
              'absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
              gameState.direction === 1 ? 'bg-chart-1 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
            )}>
              <RotateCcw className={cn('w-3 h-3', gameState.direction === -1 && 'rotate-180')} />
            </div>
          </div>
        </div>

        {/* Color chooser for wild cards */}
        {selectedWildCard && (
          <div className="flex items-center justify-center gap-2 p-3 bg-accent rounded-lg">
            <span className="text-sm font-medium mr-2">Choose color:</span>
            {(['red', 'blue', 'green', 'yellow'] as const).map(color => (
              <button
                key={color}
                onClick={() => handleChooseColor(color)}
                className={cn(
                  'w-10 h-10 rounded-full border-2 border-background shadow-md',
                  'hover:scale-110 transition-transform',
                  color === 'red' && 'bg-destructive',
                  color === 'blue' && 'bg-primary',
                  color === 'green' && 'bg-chart-1',
                  color === 'yellow' && 'bg-chart-2'
                )}
              />
            ))}
          </div>
        )}

        {/* My hand */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                isMyTurn ? 'bg-chart-1 animate-pulse' : 'bg-muted'
              )} />
              <span className="font-medium">Your Hand</span>
            </div>
            {isMyTurn && (
              <span className="text-sm text-primary font-medium animate-pulse">Your turn!</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {gameState.myHand.map(card => (
              <UnoCard
                key={card.id}
                card={card}
                onClick={() => handlePlayCard(card)}
                disabled={!isMyTurn || !canPlayCard(card, gameState.topCard)}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Game over */}
        {gameState.gameStatus === 'finished' && (
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-xl font-bold mb-2">
              {gameState.winner === myName ? '🎉 You Win!' : `${gameState.winner} Wins!`}
            </p>
            <Button onClick={handleNewGame} className="mt-2">
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
