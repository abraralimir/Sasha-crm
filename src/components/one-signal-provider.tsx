'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { useUser } from '@/firebase';

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    async function initializeOneSignal() {
      if (typeof window !== 'undefined') {
        await OneSignal.init({
          appId: '775b6ea7-e4c6-4dd0-a528-d87f30055df7',
          safari_web_id: 'web.onesignal.auto.424123c9-df63-4140-aac8-764c37d1fc19',
          allowLocalhostAsSecureOrigin: true,
        });

        if (user) {
          // Set the external user ID for the current user
          OneSignal.login(user.uid);
        }
      }
    }

    initializeOneSignal();

    // If the user logs out, logout of OneSignal
    return () => {
      if (typeof window !== 'undefined') {
        OneSignal.logout();
      }
    };
  }, [user]);

  return <>{children}</>;
}
