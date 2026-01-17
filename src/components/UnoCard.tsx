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
    sm: 'w-14 h-20 text-lg',
    md: 'w-18 h-26 text-2xl',
    lg: 'w-24 h-36 text-4xl'
  };

  if (faceDown) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-xl flex items-center justify-center font-bold',
          'bg-gradient-to-br from-secondary to-secondary/80',
          'shadow-lg border-2 border-border/50',
          'transform transition-all duration-300'
        )}
      >
        <div className="absolute inset-2 rounded-lg border-2 border-dashed border-border/30 flex items-center justify-center">
          <span className="text-secondary-foreground/40 text-sm font-bold tracking-wider rotate-[-15deg]">UNO</span>
        </div>
      </div>
    );
  }

  const colorClasses = {
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-400 to-amber-500',
    wild: 'from-violet-500 via-pink-500 to-orange-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        'relative rounded-xl flex items-center justify-center font-black',
        'shadow-lg border-2 border-background/30',
        'transform transition-all duration-300',
        'bg-gradient-to-br',
        colorClasses[card.color],
        !disabled && 'hover:scale-110 hover:-translate-y-3 hover:rotate-[-5deg] hover:shadow-2xl cursor-pointer',
        !disabled && 'hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)]',
        disabled && 'opacity-40 cursor-not-allowed grayscale-[30%]'
      )}
    >
      {/* Inner oval */}
      <div className="absolute inset-2 rounded-[40%] bg-background/20 flex items-center justify-center">
        <span className="text-primary-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          {getCardDisplayValue(card.value)}
        </span>
      </div>
      
      {/* Corner numbers */}
      <span className="absolute top-1 left-2 text-xs text-primary-foreground/80">
        {getCardDisplayValue(card.value)}
      </span>
      <span className="absolute bottom-1 right-2 text-xs text-primary-foreground/80 rotate-180">
        {getCardDisplayValue(card.value)}
      </span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </button>
  );
}
