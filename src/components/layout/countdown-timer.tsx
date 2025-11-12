'use client';

import { useState, useEffect } from 'react';

export function CountdownTimer({ hours, onComplete }: { hours: number; onComplete: () => void; }) {
  const [timeLeft, setTimeLeft] = useState(hours * 60 * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return <span className="font-mono font-bold">{formatTime(timeLeft)}</span>;
}
