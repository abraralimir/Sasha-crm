'use client';

import { Logo } from "@/components/logo";
import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const [isVerificationCheckComplete, setIsVerificationCheckComplete] = useState(false);
  
  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until we know if a user is logged in or not.
    }

    if (user) {
      // If a user session exists, they should not be on any auth pages.
      router.replace('/dashboard');
      return;
    }

    // For unauthenticated users, enforce verification.
    const isVerified = sessionStorage.getItem('isVerified') === 'true';

    if (!isVerified && pathname !== '/verify') {
      // If not verified and trying to access /login or /signup directly, force to /verify.
      router.replace('/verify');
    } else {
      // If they are verified or are on the verify page, allow rendering.
      setIsVerificationCheckComplete(true);
    }
  }, [user, isUserLoading, router, pathname]);
  
  // Show a loader while checking for an active user session or verification status.
  if (isUserLoading || !isVerificationCheckComplete) {
     return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // If all checks are complete, render the auth pages.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8">
        <Logo />
       </div>
       {children}
    </div>
  );
}
