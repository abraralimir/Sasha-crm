
'use client';

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { useUser } from '@/firebase';

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeOneSignal() {
      // Only initialize OneSignal in production to avoid domain errors
      if (process.env.NODE_ENV !== 'production') return;

      if (typeof window !== 'undefined' && !isInitialized) {
        try {
          await OneSignal.init({
            appId: '775b6ea7-e4c6-4dd0-a528-d87f30055df7',
            safari_web_id: 'web.onesignal.auto.424123c9-df63-4140-aac8-764c37d1fc19',
            allowLocalhostAsSecureOrigin: true,
          });
          setIsInitialized(true);
        } catch (error) {
          console.error("OneSignal initialization failed:", error);
        }
      }
    }

    initializeOneSignal();
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        OneSignal.login(user.uid);
      } else {
        OneSignal.logout();
      }
    }
  }, [user, isInitialized]);


  return <>{children}</>;
}
