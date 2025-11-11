
import { ChatSidebar } from '@/components/chat/chat-sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-6rem)]">
      <ChatSidebar />
      <main className="flex-1 pl-4">
          {children}
      </main>
    </div>
  );
}
