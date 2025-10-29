'use client';

import React, { useState } from 'react';
import { Session, Publisher } from '@opentok/client';
import {
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface VonageControlsProps {
  publisher: Publisher;
  session: Session;
}

export function VonageControls({ publisher, session }: VonageControlsProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMicrophone = () => {
    publisher.publishAudio(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    publisher.publishVideo(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const hangup = () => {
    session.disconnect();
  };

  const toggleScreenSharing = () => {
    if (isScreenSharing) {
        // This is a simplified stop. A full implementation would re-publish the camera.
        session.unpublish(publisher);
        setIsScreenSharing(false);
    } else {
        OT.checkScreenSharingCapability(response => {
            if(!response.supported || response.extensionRegistered === false) {
                alert("Screen sharing not supported");
            } else if (response.extensionInstalled === false) {
                alert("Please install the screen sharing extension");
            } else {
                const screenSharingPublisher = OT.initPublisher('publisher', { videoSource: 'screen' });
                session.publish(screenSharingPublisher, (err) => {
                    if (err) {
                        alert("Could not share screen");
                    } else {
                        setIsScreenSharing(true);
                    }
                });
            }
        });
    }
  }


  return (
    <div className="flex justify-center">
      <Card className="p-2">
        <div className="flex gap-2">
          <Button
            variant={isMicOn ? 'outline' : 'destructive'}
            onClick={toggleMicrophone}
            aria-label={isMicOn ? 'Mute' : 'Unmute'}
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </Button>
          <Button
            variant={isCameraOn ? 'outline' : 'destructive'}
            onClick={toggleCamera}
            aria-label={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isCameraOn ? <Video /> : <VideoOff />}
          </Button>
           <Button
            variant={isScreenSharing ? 'default' : 'outline'}
            onClick={toggleScreenSharing}
            aria-label={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? <ScreenShareOff /> : <ScreenShare />}
          </Button>
          <Button
            variant="destructive"
            onClick={hangup}
            aria-label="Hang Up"
          >
            <PhoneOff />
          </Button>
        </div>
      </Card>
    </div>
  );
}
