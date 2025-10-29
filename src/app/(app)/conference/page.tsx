'use client';

import { VonageProvider } from '@/components/vonage/vonage-provider';
import { VonageVideo } from '@/components/vonage/vonage-video';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function ConferencePage() {
  const apiKey = process.env.VONAGE_API_KEY;
  const sessionId = process.env.VONAGE_SESSION_ID;
  const token = process.env.VONAGE_TOKEN;

  if (!apiKey || !sessionId || !token || token === 'YOUR_VONAGE_TOKEN' || sessionId === 'YOUR_VONAGE_SESSION_ID') {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Alert className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Vonage Configuration Incomplete</AlertTitle>
          <AlertDescription>
            <p>Your Vonage credentials are not fully configured. Please update the <strong>.env</strong> file with a valid <strong>Session ID</strong> and <strong>Token</strong> from your Vonage dashboard to use the video feature.</p>
            <p className="mt-2 text-xs text-muted-foreground">You can generate these credentials in your Vonage Project under "Sessions".</p>
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
