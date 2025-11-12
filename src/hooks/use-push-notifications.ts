
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirebaseApp, useUser } from '@/firebase';
import { useToast } from './use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export const usePushNotifications = () => {
  const firebaseApp = useFirebaseApp();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firebaseApp || !('Notification' in window) || !user || !firestore) {
      return;
    }

    const messaging = getMessaging(firebaseApp);

    const requestPermission = async () => {
      try {
        const currentToken = await getToken(messaging, { vapidKey: 'B...' }); // You need to generate a VAPID key in Firebase Console
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          // Save the token to Firestore for this user
          const userDocRef = doc(firestore, 'users', user.uid);
          await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
        } else {
          console.log('No registration token available. Request permission to generate one.');
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              console.log('Notification permission granted.');
              requestPermission(); // Retry getting token
            } else {
              console.log('Unable to get permission to notify.');
            }
          });
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseApp, user, firestore, toast]);
};

