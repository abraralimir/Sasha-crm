'use client';

import { useState, useEffect } from 'react';

const IST_TIME_ZONE = 'Asia/Kolkata';

export const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
