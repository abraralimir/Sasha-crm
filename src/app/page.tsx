"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) {
      // Wait for the user status to be determined
      return;
    }

    if (user) {
      // If the user is logged in, send them to the dashboard.
      router.replace("/dashboard");
    } else {
      // If the user is not logged in, ALWAYS send them to the verification page.
      router.replace("/verify");
    }
  }, [user, isUserLoading, router]);

  // Show a loader while the initial user check is in progress.
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  );
}
