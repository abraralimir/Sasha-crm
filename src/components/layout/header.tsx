import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { PlatformAiChat } from "../platform-ai-chat";
import { NotificationBell } from "./notification-bell";
import { LiveClock } from './live-clock';
import { CountdownTimer } from './countdown-timer';
import { AlertTriangle } from "lucide-react";


export function Header() {
  return (
    <>
      <div className="bg-yellow-400 text-yellow-900 text-sm font-medium px-4 py-2 flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="h-5 w-5 animate-pulse flex-shrink-0" />
        <span className="hidden sm:inline">Please note: Sasha AI features are temporarily unavailable. The rest of the platform is fully operational. Service will resume in approximately:</span>
        <span className="sm:hidden">AI features are down. Full service returns in:</span>
        <CountdownTimer hours={8} />
      </div>
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
    </>
  );
}
