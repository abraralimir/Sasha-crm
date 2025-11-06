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
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If all checks are complete, render the auth pages.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 antialiased dark">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>
      {children}
    </div>
  );
}
