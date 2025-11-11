
'use client';

import { MessageSquarePlus } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquarePlus className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Select a conversation</h2>
            <p className="mt-2 text-muted-foreground">
                Choose one from your existing conversations on the left, <br /> or start a new one to begin chatting.
            </p>
        </div>
    );
}
