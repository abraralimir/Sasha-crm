import { Phone } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "../ui/button";
import { PlatformAiChat } from "../platform-ai-chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center gap-2">
        <PlatformAiChat />
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                    <span className="sr-only">Start Call</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Video Calling</DialogTitle>
                <DialogDescription>
                    Our enhanced video and voice calling feature is coming soon! Stay tuned for seamless collaboration with screen sharing and easy scheduling.
                </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

        <UserNav />
      </div>
    </header>
  );
}
