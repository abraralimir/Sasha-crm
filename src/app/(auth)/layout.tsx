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
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verificationStatus = sessionStorage.getItem('isVerified');
    setIsVerified(verificationStatus === 'true');

    if (!isUserLoading) {
      if (user) {
        router.replace('/dashboard');
        return;
      }

      if (verificationStatus !== 'true' && pathname !== '/verify') {
        router.replace('/verify');
      }
    }
  }, [pathname, router, user, isUserLoading]);
  
  // Don't render auth pages if not verified and not on the verify page
  if (!isVerified && pathname !== '/verify') {
    return null; // Or a loading spinner
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
