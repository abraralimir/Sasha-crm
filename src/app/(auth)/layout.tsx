'use client';

import { Logo } from "@/components/logo";
import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  
  // We no longer use sessionStorage to ensure verification is required
  // on every navigation to the auth flow unless already logged in.
  // The verification status is now implicitly handled by the user's presence on a page.
  // The verify page will set session-limited flags if needed, but the layout enforces the flow.

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // If user is logged in, always go to the dashboard.
        router.replace('/dashboard');
        return;
      }

      // Read verification status from sessionStorage.
      // This is set only upon successful AI verification on the /verify page.
      const isVerified = sessionStorage.getItem('isVerified') === 'true';

      if (!isVerified && pathname !== '/verify') {
        // If not verified and trying to access any auth page other than /verify,
        // force redirect to the verification page.
        router.replace('/verify');
      }
    }
  }, [pathname, router, user, isUserLoading]);
  
  // To prevent flicker or showing a page before redirection,
  // we can check verification status here too.
  if (typeof window !== 'undefined') {
    const isVerified = sessionStorage.getItem('isVerified') === 'true';
    if (!user && !isVerified && pathname !== '/verify') {
      return null; // Or a loading spinner
    }
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8">
        <Logo />
       </div>
       {children}
    </div>
  );
}
