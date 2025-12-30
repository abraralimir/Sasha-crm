
'use client';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { PlatformAiChat } from "../platform-ai-chat";
import { NotificationBell } from "./notification-bell";
import { LiveClock } from './live-clock';

export function Header() {
  return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-sm sm:h-20 md:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1">
          {/* Can add breadcrumbs or page title here */}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <LiveClock />
          <PlatformAiChat />
          <NotificationBell />
          <UserNav />
        </div>
      </header>
  );
}
