
'use client';

import { useState, useEffect } from 'react';
import { Eye, ShieldAlert, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type SecurityOverlayProps = {
  isActive: boolean;
  onTimerEnd: () => void;
  onAdminOverride: () => void;
};

const ADMIN_PIN = '0012';

export function SecurityOverlay({ isActive, onTimerEnd, onAdminOverride }: SecurityOverlayProps) {
  const [countdown, setCountdown] = useState(10);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowOverlay(true);
      setCountdown(10);
      setPin('');
      setPinError('');
    }
  }, [isActive]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOverlay) {
        timer = setInterval(() => {
            setCountdown((prev) => {
            if (prev <= 1) {
                clearInterval(timer);
                setShowOverlay(false);
                onTimerEnd();
                return 0;
            }
            return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOverlay, onTimerEnd]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsCheckingPin(true);
    setTimeout(() => {
        if (pin === ADMIN_PIN) {
            onAdminOverride();
        } else {
            setPinError('Invalid PIN.');
            setPin('');
        }
        setIsCheckingPin(false);
    }, 500);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background/50 transition-opacity duration-300',
        showOverlay ? 'opacity-100 backdrop-blur-md' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center p-8 rounded-lg bg-card/80 border shadow-2xl w-full max-w-sm">
        <div className="relative">
          <Eye className="h-20 w-20 text-primary animate-pulse" />
           <ShieldAlert className="h-8 w-8 text-destructive absolute -bottom-2 -right-2" />
        </div>
        <h2 className="text-2xl font-bold">Sasha Security has blocked this action.</h2>
        <p className="text-muted-foreground">Screen will be available again in...</p>
        <p className="text-4xl font-mono font-bold text-primary">{countdown}</p>
        <div className="w-full pt-4 border-t">
             <form onSubmit={handlePinSubmit} className="space-y-2">
                <label className="text-sm text-muted-foreground">Admin Override</label>
                <div className="relative">
                    <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="password"
                        placeholder="Enter Admin PIN"
                        className="pl-8 pr-10"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        disabled={isCheckingPin}
                    />
                    <Button type="submit" size="icon" className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full' disabled={isCheckingPin || !pin}>
                        {isCheckingPin ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                </div>
                {pinError && <p className="text-sm text-destructive">{pinError}</p>}
             </form>
        </div>
      </div>
    </div>
  );
}
