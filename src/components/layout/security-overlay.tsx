'use client';

import { useState, useEffect } from 'react';
import { Eye, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type SecurityOverlayProps = {
  isActive: boolean;
  onTimerEnd: () => void;
};

export function SecurityOverlay({ isActive, onTimerEnd }: SecurityOverlayProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isActive) {
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isActive, onTimerEnd]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background/50 transition-opacity duration-300',
        isActive ? 'opacity-100 backdrop-blur-md' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center p-8 rounded-lg bg-card/80 border shadow-2xl">
        <div className="relative">
          <Eye className="h-20 w-20 text-primary animate-pulse" />
           <ShieldAlert className="h-8 w-8 text-destructive absolute -bottom-2 -right-2" />
        </div>
        <h2 className="text-2xl font-bold">Sasha Security has blocked this action.</h2>
        <p className="text-muted-foreground">Screen will be available again in...</p>
        <p className="text-4xl font-mono font-bold text-primary">{countdown}</p>
      </div>
    </div>
  );
}
