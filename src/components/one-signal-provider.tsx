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
          // IMPORTANT: Replace with your OneSignal App ID
          appId: 'YOUR_ONESIGNAL_APP_ID', 
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
