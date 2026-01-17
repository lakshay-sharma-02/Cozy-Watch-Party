import { v4 as uuidv4 } from 'uuid';
import type { UnoCard, UnoColor, UnoValue, UnoGameState, UnoPlayer } from './types';

const COLORS: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
const NUMBER_VALUES: UnoValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTION_VALUES: UnoValue[] = ['skip', 'reverse', 'draw2'];

export function createDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  
  // Number cards (one 0, two of 1-9 for each color)
  for (const color of COLORS) {
    deck.push({ id: uuidv4(), color, value: '0' });
    for (const value of NUMBER_VALUES.slice(1)) {
      deck.push({ id: uuidv4(), color, value });
      deck.push({ id: uuidv4(), color, value });
    }
  }
  
  // Action cards (two of each for each color)
  for (const color of COLORS) {
    for (const value of ACTION_VALUES) {
      deck.push({ id: uuidv4(), color, value });
      deck.push({ id: uuidv4(), color, value });
    }
  }
  
  // Wild cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: uuidv4(), color: 'wild', value: 'wild' });
    deck.push({ id: uuidv4(), color: 'wild', value: 'wild4' });
  }
  
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: UnoCard[]): UnoCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function canPlayCard(card: UnoCard, topCard: UnoCard): boolean {
  if (card.color === 'wild') return true;
  if (card.color === topCard.color) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export function dealCards(deck: UnoCard[], numPlayers: number, cardsPerPlayer: number = 7): { hands: UnoCard[][]; remainingDeck: UnoCard[] } {
  const hands: UnoCard[][] = [];
  const remainingDeck = [...deck];
  
  for (let i = 0; i < numPlayers; i++) {
    hands.push(remainingDeck.splice(0, cardsPerPlayer));
  }
  
  return { hands, remainingDeck };
}

export function getInitialTopCard(deck: UnoCard[]): { topCard: UnoCard; remainingDeck: UnoCard[] } {
  const remainingDeck = [...deck];
  let topCardIndex = remainingDeck.findIndex(card => card.color !== 'wild');
  if (topCardIndex === -1) topCardIndex = 0;
  
  const [topCard] = remainingDeck.splice(topCardIndex, 1);
  return { topCard, remainingDeck };
}

export function initializeGame(playerIds: string[], playerNames: string[], myId: string): UnoGameState {
  const deck = createDeck();
  const { hands, remainingDeck } = dealCards(deck, playerIds.length);
  const { topCard, remainingDeck: finalDeck } = getInitialTopCard(remainingDeck);
  
  const myIndex = playerIds.indexOf(myId);
  
  const players: UnoPlayer[] = playerIds.map((id, index) => ({
    id,
    name: playerNames[index],
    handCount: hands[index].length,
    isCurrentTurn: index === 0
  }));
  
  return {
    players,
    currentPlayerId: playerIds[0],
    topCard,
    direction: 1,
    drawPileCount: finalDeck.length,
    myHand: hands[myIndex] || [],
    gameStatus: 'playing',
  };
}

export function getCardColorClass(color: UnoColor): string {
  switch (color) {
    case 'red': return 'bg-destructive';
    case 'blue': return 'bg-primary';
    case 'green': return 'bg-chart-1';
    case 'yellow': return 'bg-chart-2';
    case 'wild': return 'bg-gradient-to-br from-destructive via-primary to-chart-1';
    default: return 'bg-muted';
  }
}

export function getCardDisplayValue(value: UnoValue): string {
  switch (value) {
    case 'skip': return '⊘';
    case 'reverse': return '⟲';
    case 'draw2': return '+2';
    case 'wild': return '★';
    case 'wild4': return '+4';
    default: return value;
  }
}
