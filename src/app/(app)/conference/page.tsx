'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConferencePage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Conference</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ready for the new VideoSDK React implementation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
