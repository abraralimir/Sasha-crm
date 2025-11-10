
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useToast } from './use-toast';
import type { UserStatus } from '@/lib/types';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function usePresence() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const idleTimer = useRef<NodeJS.Timeout>();
  const lastActiveTime = useRef<number>(Date.now());
  const sessionActive = useRef<boolean>(false);
  const statusRef = useRef<'active' | 'away' | 'on-break' | 'offline'>('offline');

  const updateUserStatus = useCallback(async (newStatus: UserStatus['status'], logType?: 'check-in' | 'check-out' | 'break-start' | 'break-end') => {
    if (!firestore || !user) return;

    statusRef.current = newStatus;

    const statusDocRef = doc(firestore, 'userStatus', user.uid);
    const statusPayload: Partial<UserStatus> = {
      status: newStatus,
      lastSeen: serverTimestamp() as Timestamp,
      userName: user.displayName || 'Anonymous',
      userAvatar: user.photoURL || '',
    };
    
    await setDoc(statusDocRef, statusPayload, { merge: true });

    if (logType) {
      const attendanceCollection = collection(firestore, 'attendance');
      await addDoc(attendanceCollection, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        type: logType,
        timestamp: serverTimestamp(),
      });
    }

  }, [firestore, user]);

  const handleActivity = useCallback(() => {
    lastActiveTime.current = Date.now();
    
    if (statusRef.current !== 'active' && statusRef.current !== 'on-break') {
      updateUserStatus('active', sessionActive.current ? undefined : 'check-in');
      sessionActive.current = true;
    }

    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (statusRef.current === 'active') {
        updateUserStatus('away');
      }
    }, IDLE_TIMEOUT);
  }, [updateUserStatus]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      handleActivity();
    } else {
      if (statusRef.current === 'active') {
        updateUserStatus('away');
      }
      clearTimeout(idleTimer.current);
    }
  }, [handleActivity, updateUserStatus]);

  useEffect(() => {
    if (!user || !firestore) return;

    // Initial setup
    sessionActive.current = false;
    handleActivity(); // Initial check-in

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up a beforeunload listener to handle check-out
    const handleBeforeUnload = () => {
      // This is a synchronous operation but we can fire and forget the async one
       if (statusRef.current !== 'offline') {
         navigator.sendBeacon ? 
            console.log("Beacon API not available for checkout log.") : 
            updateUserStatus('offline', 'check-out');
       }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);


    return () => {
      clearTimeout(idleTimer.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // On unmount (e.g. logout), perform final checkout
      if (statusRef.current !== 'offline') {
        updateUserStatus('offline', 'check-out');
      }
    };
  }, [user, firestore, handleActivity, handleVisibilityChange, updateUserStatus]);

  const startBreak = async () => {
    if (statusRef.current === 'active') {
      clearTimeout(idleTimer.current);
      await updateUserStatus('on-break', 'break-start');
      toast({ title: "Break Started", description: "Your timer is paused." });
    }
  };
  
  const endBreak = async () => {
    if (statusRef.current === 'on-break') {
      await updateUserStatus('active', 'break-end');
      handleActivity(); // Restart idle timer
      toast({ title: "Break Ended", description: "Welcome back!" });
    }
  };

  const manualCheckout = async () => {
    if (statusRef.current !== 'offline') {
      clearTimeout(idleTimer.current);
      await updateUserStatus('offline', 'check-out');
      toast({ title: "Checked Out", description: "Have a great day!" });
    }
  };


  return { startBreak, endBreak, manualCheckout };
}
