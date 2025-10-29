'use client';

import { useUser } from '@/firebase';
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface JitsiMeetProps {
  roomName: string;
  displayName?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeet: React.FC<JitsiMeetProps> = ({ roomName, displayName }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (typeof window.JitsiMeetExternalAPI === 'undefined') {
        // Jitsi script might not be loaded yet, wait for it
        const scriptChecker = setInterval(() => {
            if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
                clearInterval(scriptChecker);
                initJitsi();
            }
        }, 100);

        return () => clearInterval(scriptChecker);
    } else {
        initJitsi();
    }

    function initJitsi() {
        if (!jitsiContainerRef.current) return;
    
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          interfaceConfigOverwrite: {
            // Overwrite interface properties here
            SHOW_CHROME_EXTENSION_BANNER: false,
          },
          configOverwrite: {
            // Overwrite config properties here
            prejoinPageEnabled: false,
          },
        };
    
        const api = new window.JitsiMeetExternalAPI(domain, options);
    
        api.addEventListener('videoConferenceJoined', () => {
          setLoading(false);
          api.executeCommand('displayName', displayName || user?.displayName || 'Guest');
        });
        
        // Clean up when the component unmounts
        return () => {
          api.dispose();
        };
    }

  }, [roomName, displayName, user]);

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Joining conference...</p>
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} className="h-full w-full" style={{ display: loading ? 'none' : 'block' }} />
    </div>
  );
};
