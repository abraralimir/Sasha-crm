'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Video } from 'lucide-react';

export function JoinScreen({ getMeetingAndToken }: { getMeetingAndToken: (meetingId: string) => void }) {
  const [meetingId, setMeetingId] = useState('');

  const onClick = async () => {
    if (meetingId) {
      getMeetingAndToken(meetingId);
    } else {
        // In a real app, you'd call an API to create a meeting.
        // For simplicity, we'll just use a hardcoded ID or let the user enter one.
        alert("Please enter a meeting ID")
    }
  };

  const createMeeting = async () => {
     // This is where you would call your backend to create a new meeting ID.
     // For this example, we'll simulate it.
     const newMeetingId = `demo-${Math.random().toString(36).substring(2, 7)}`;
     setMeetingId(newMeetingId);
  }

  return (
     <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <CardTitle>Join a Meeting</CardTitle>
          </div>
          <CardDescription>
            Create a new meeting room or enter an existing meeting ID to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
           <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button onClick={createMeeting} variant="outline" className="w-full">Create a new meeting</Button>
        </CardContent>
        <CardFooter>
          <Button onClick={onClick} className="w-full" disabled={!meetingId}>
            Join Meeting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
