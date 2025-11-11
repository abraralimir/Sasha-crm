'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const IST_TIME_ZONE = 'Asia/Kolkata';

export const LiveClock = () => {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        // Set the initial time only on the client
        setTime(new Date());
        
        // Then update it every second
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) {
        return (
            <div className="hidden md:flex items-center gap-2 text-right">
                 <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        );
    }

    return (
        <div className="hidden md:flex items-center gap-2 text-right">
            <div className="flex flex-col">
                <p className="text-sm font-medium font-mono text-foreground">
                    {time.toLocaleTimeString('en-US', { timeZone: IST_TIME_ZONE, hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-muted-foreground">
                    {time.toLocaleDateString('en-GB', { timeZone: IST_TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
            </div>
        </div>
    );
}
