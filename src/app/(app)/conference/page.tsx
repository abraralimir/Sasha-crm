'use client';

import { JitsiMeet } from "@/components/jitsi/jitsi-meet";
import { useUser } from "@/firebase";

export default function ConferencePage() {
    const { user } = useUser();
    
    // For this demo, we'll use a static room name.
    // In a real application, this could be dynamic (e.g., based on a lead ID or a new meeting).
    const roomName = "SashaLeadsGeneralConference";

    return (
        <div className="h-[calc(100vh-6rem)] w-full">
            <JitsiMeet roomName={roomName} displayName={user?.displayName || 'SashaLeads User'} />
        </div>
    );
}
