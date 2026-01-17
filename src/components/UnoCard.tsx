import { cn } from '@/lib/utils';
import type { UnoCard as UnoCardType } from '@/lib/types';
import { getCardColorClass, getCardDisplayValue } from '@/lib/unoGame';

interface UnoCardProps {
  card: UnoCardType;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
}

export function UnoCard({ card, onClick, disabled, size = 'md', faceDown }: UnoCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-18 text-lg',
    md: 'w-16 h-24 text-2xl',
    lg: 'w-20 h-28 text-3xl'
  };

  if (faceDown) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-lg flex items-center justify-center font-bold',
          'bg-secondary shadow-lg border-2 border-border',
          'transform transition-all duration-200'
        )}
      >
        <span className="text-secondary-foreground opacity-50">UNO</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        'rounded-lg flex items-center justify-center font-bold text-primary-foreground',
        'shadow-lg border-2 border-background/20',
        'transform transition-all duration-200',
        getCardColorClass(card.color),
        !disabled && 'hover:scale-110 hover:-translate-y-2 hover:shadow-xl cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className="drop-shadow-md">{getCardDisplayValue(card.value)}</span>
    </button>
  );
}
