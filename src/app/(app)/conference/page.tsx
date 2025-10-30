'use client';

import { useState, useEffect } from 'react';
import { MeetingProvider, useMeeting } from '@videosdk.live/react-sdk';
import { MeetingContainer } from '@/components/videosdk/meeting-container';
import { JoinScreen } from '@/components/videosdk/join-screen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useUser } from '@/firebase';

export default function ConferencePage() {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { user } = useUser();

  const apiKey = process.env.VIDEOSDK_API_KEY;

  useEffect(() => {
    // A real app would get a token from a server, but for simplicity, we'll use the one from the .env file.
    setToken(process.env.VIDEOSDK_TOKEN || null);
  }, []);

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  if (!apiKey || !token || apiKey === "YOUR_VIDEOSDK_API_KEY" || token === "YOUR_VIDEOSDK_TOKEN") {
    return (
       <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Alert className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>VideoSDK Configuration Incomplete</AlertTitle>
          <AlertDescription>
            <p>Your VideoSDK credentials are not fully configured. Please update the <strong>.env</strong> file with a valid <strong>API Key</strong> and <strong>Token</strong> from your VideoSDK dashboard to use the video feature.</p>
             <p className="mt-2 text-xs text-muted-foreground">You can generate a temporary token from the "API Keys" section of your dashboard for testing.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {meetingId ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: user?.displayName || 'Guest',
          }}
          token={token}
        >
          <MeetingContainer onMeetingLeave={onMeetingLeave} />
        </MeetingProvider>
      ) : (
        <JoinScreen getMeetingAndToken={setMeetingId} />
      )}
    </div>
  );
}
