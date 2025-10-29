'use client';

import { VonageProvider } from '@/components/vonage/vonage-provider';
import { VonageVideo } from '@/components/vonage/vonage-video';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function ConferencePage() {
  const apiKey = process.env.VONAGE_API_KEY;
  const sessionId = process.env.VONAGE_SESSION_ID;
  const token = process.env.VONAGE_TOKEN;

  if (!apiKey || !sessionId || !token || sessionId === 'YOUR_VONAGE_SESSION_ID') {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Alert className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Missing</AlertTitle>
          <AlertDescription>
            Please set your Vonage API Key, Session ID, and Token in the `.env` file to use the video conferencing feature. You can get these credentials from your Vonage dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full">
      <VonageProvider apiKey={apiKey} sessionId={sessionId} token={token}>
        <VonageVideo />
      </VonageProvider>
    </div>
  );
}
