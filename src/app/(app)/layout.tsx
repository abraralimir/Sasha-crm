
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { usePresence } from '@/hooks/use-presence';
import { SecurityOverlay } from '@/components/layout/security-overlay';
import { useDevToolsWatcher } from '@/hooks/use-dev-tools-watcher';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSecurityLockActive, setSecurityLockActive] = useState(false);
  const [isAdminOverride, setIsAdminOverride] = useState(false);

  // Initialize presence tracking for the logged-in user
  usePresence();
  
  useEffect(() => {
    // Check for admin override at the beginning of the session
    const override = sessionStorage.getItem('sasha-security-override') === 'true';
    setIsAdminOverride(override);
  }, []);

  // Log the security message to the console on initial load
  useEffect(() => {
    console.log('%c👁️ Sasha Security is active.', 'color: hsl(var(--primary)); font-size: 14px; font-weight: bold;');
    // The following line is commented out to prevent aggressive console clearing which can hinder debugging.
    // setTimeout(() => console.clear(), 500);
  }, []);

  const handleDevToolsOpen = useCallback(() => {
    // Only activate security lock if admin override is not enabled
    if (sessionStorage.getItem('sasha-security-override') !== 'true') {
        setSecurityLockActive(true);
    }
  }, []);

  const handleTimerEnd = useCallback(() => {
    setSecurityLockActive(false);
  }, []);

  const handleAdminOverride = () => {
    sessionStorage.setItem('sasha-security-override', 'true');
    setIsAdminOverride(true);
    setSecurityLockActive(false); // Immediately dismiss the overlay
  };

  useDevToolsWatcher(handleDevToolsOpen);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <SidebarProvider>
        <SecurityOverlay 
          isActive={isSecurityLockActive} 
          onTimerEnd={handleTimerEnd} 
          onAdminOverride={handleAdminOverride}
        />
        <SidebarNav />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="dark">
        <AppContent>{children}</AppContent>
      </div>
  );
}
