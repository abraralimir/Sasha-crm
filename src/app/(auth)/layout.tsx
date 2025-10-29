'use client';

import { Logo } from "@/components/logo";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
  useEffect(() => {
    // If the user is logged in, they should not be on any auth pages.
    // Redirect them to the dashboard.
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  // Show a loader while checking for an active user session.
  // This prevents briefly flashing the auth page before redirecting.
  if (isUserLoading || user) {
     return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
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
