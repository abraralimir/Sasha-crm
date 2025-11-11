import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { PlatformAiChat } from "../platform-ai-chat";
import { NotificationBell } from "./notification-bell";
import dynamic from 'next/dynamic';

const LiveClock = dynamic(() => import('./live-clock').then(mod => mod.LiveClock), {
  ssr: false,
});


export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/50 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center gap-4">
        <LiveClock />
        <PlatformAiChat />
        <NotificationBell />
        <UserNav />
      </div>
    </header>
  );
}
