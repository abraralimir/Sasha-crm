
'use client';

import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { GroupChat } from '@/components/chat/group-chat';
import { useState } from 'react';

export default function ChatPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('main');

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      <ChatSidebar onSelectGroup={setSelectedGroupId} />
      <main className="flex-1 pl-4">
        <GroupChat groupId={selectedGroupId} />
      </main>
    </div>
  );
}
