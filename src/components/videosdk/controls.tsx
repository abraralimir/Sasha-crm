'use client';
import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Webcam, WebcamOff, PhoneOff, ScreenShare, ScreenShareOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function Controls({ participantId }: { participantId: string }) {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  const { screenShareOn, startScreenShare, stopScreenShare } = useParticipant(participantId);

  return (
    <div className="flex justify-center">
      <Card className="p-2">
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => leave()}>
            <PhoneOff />
          </Button>
          <Button onClick={() => toggleMic()}>
            <Mic />
          </Button>
          <Button onClick={() => toggleWebcam()}>
            <Webcam />
          </Button>
          <Button onClick={() => screenShareOn ? stopScreenShare() : startScreenShare()}>
            {screenShareOn ? <ScreenShareOff /> : <ScreenShare />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
