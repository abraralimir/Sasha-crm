'use client';
import { useMeeting } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Webcam, WebcamOff, PhoneOff, ScreenShare, ScreenShareOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useRouter } from 'next/navigation';

export function Controls() {
  const { leave, toggleMic, toggleWebcam, startScreenShare, stopScreenShare, localScreenShareOn } = useMeeting();
  const router = useRouter();

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
          <Button onClick={() => localScreenShareOn ? stopScreenShare() : startScreenShare()}>
            {localScreenShareOn ? <ScreenShareOff /> : <ScreenShare />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
