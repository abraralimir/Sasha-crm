'use client';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Declare VideoSDK at the component's top level for type safety
declare const VideoSDK: any;

export default function ConferencePage() {
  const [meeting, setMeeting] = useState<any>(null);
  const [meetingId, setMeetingId] = useState<string>('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isWebCamOn, setIsWebCamOn] = useState(true);
  const [isMeetingJoined, setIsMeetingJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const sdkToken = process.env.NEXT_PUBLIC_VIDEOSDK_TOKEN;
  const apiKey = process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY;

  useEffect(() => {
    // Load the VideoSDK script
    const script = document.createElement('script');
    script.src = `https://sdk.videosdk.live/js-sdk/0.1.41/videosdk.js`;
    script.onload = () => {
      console.log('VideoSDK script loaded.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (meeting) {
      // Participant Joined
      meeting.on('participant-joined', (participant: any) => {
        console.log('Participant Joined:', participant.displayName);
        createParticipantStream(participant);
      });

      // Participant Left
      meeting.on('participant-left', (participant: any) => {
        const vElement = document.getElementById(`f-${participant.id}`);
        if (vElement) vElement.remove();
        const aElement = document.getElementById(`a-${participant.id}`);
        if (aElement) aElement.remove();
      });

      return () => {
        // Clean up event listeners when meeting object changes
        if (meeting.events) {
          meeting.off('participant-joined');
          meeting.off('participant-left');
        }
      };
    }
  }, [meeting]);

  const createParticipantStream = (participant: any) => {
    if (videoContainerRef.current) {
      const videoElement = createVideoElement(participant.id, participant.displayName);
      const audioElement = createAudioElement(participant.id);
      
      participant.on('stream-enabled', (stream: any) => {
        setTrack(stream, audioElement, participant, false);
      });
      
      participant.on('stream-disabled', (stream: any) => {
        if (stream.kind === 'video') {
           const videoElm = document.getElementById(`v-${participant.id}`) as HTMLVideoElement;
           if(videoElm) videoElm.srcObject = null;
        }
      });

      videoContainerRef.current.appendChild(videoElement);
      videoContainerRef.current.appendChild(audioElement);
    }
  };

  const createVideoElement = (pId: string, name: string) => {
    const videoFrame = document.createElement('div');
    videoFrame.setAttribute('id', `f-${pId}`);
    videoFrame.className = "relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden bg-secondary";

    const videoElement = document.createElement('video');
    videoElement.classList.add('video-frame');
    videoElement.setAttribute('id', `v-${pId}`);
    videoElement.setAttribute('playsinline', 'true');
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';

    const nameTag = document.createElement('div');
    nameTag.className = "absolute bottom-2 left-2 text-sm font-medium bg-black/50 text-white px-2 py-1 rounded-md";
    nameTag.innerHTML = `${name}`;

    videoFrame.appendChild(videoElement);
    videoFrame.appendChild(nameTag);
    return videoFrame;
  };

  const createAudioElement = (pId: string) => {
    const audioElement = document.createElement('audio');
    audioElement.setAttribute('autoPlay', 'true');
    audioElement.setAttribute('playsInline', 'true');
    audioElement.setAttribute('controls', 'false');
    audioElement.setAttribute('id', `a-${pId}`);
    audioElement.style.display = 'none';
    return audioElement;
  };
  
  const setTrack = (stream: any, audioElement: HTMLAudioElement | null, participant: any, isLocal: boolean) => {
    if (stream.kind === 'video') {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(stream.track);
      const videoElm = document.getElementById(`v-${participant.id}`) as HTMLVideoElement;
      if (videoElm) {
        videoElm.srcObject = mediaStream;
        videoElm.play().catch(e => console.error('Video play failed', e));
      }
    }
    if (stream.kind === 'audio' && audioElement) {
      if (!isLocal) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(stream.track);
        audioElement.srcObject = mediaStream;
        audioElement.play().catch(e => console.error('Audio play failed', e));
      }
    }
  };

  const initializeAndJoinMeeting = (id: string) => {
    if (typeof VideoSDK === 'undefined' || !sdkToken) {
        console.error("VideoSDK is not loaded or token is missing");
        return;
    }
    setLoading(true);
    setMeetingId(id);

    window.VideoSDK.config(sdkToken);

    const newMeeting = window.VideoSDK.initMeeting({
      meetingId: id,
      name: user?.displayName || 'Guest',
      micEnabled: isMicOn,
      webcamEnabled: isWebCamOn,
    });
    
    newMeeting.on('meeting-joined', () => {
      setIsMeetingJoined(true);
      setLoading(false);
      // Create local participant stream
      if (videoContainerRef.current) {
        const localParticipantFrame = createVideoElement(
          newMeeting.localParticipant.id,
          newMeeting.localParticipant.displayName
        );
        videoContainerRef.current.appendChild(localParticipantFrame);
        
        newMeeting.localParticipant.on('stream-enabled', (stream: any) => {
          setTrack(stream, null, newMeeting.localParticipant, true);
        });

        newMeeting.localParticipant.on('stream-disabled', (stream: any) => {
            if (stream.kind === 'video') {
                const videoElm = document.getElementById(`v-${newMeeting.localParticipant.id}`) as HTMLVideoElement;
                if(videoElm) videoElm.srcObject = null;
            }
        });
      }
    });

    newMeeting.on('meeting-left', () => {
        if(videoContainerRef.current) videoContainerRef.current.innerHTML = '';
        setIsMeetingJoined(false);
        setMeeting(null);
        setMeetingId('');
    });

    newMeeting.join();
    setMeeting(newMeeting);
  };

  const createNewMeeting = async () => {
    setLoading(true);
    try {
        const url = `https://api.videosdk.live/v2/rooms`;
        const options = {
            method: 'POST',
            headers: { Authorization: sdkToken || '', 'Content-Type': 'application/json' },
        };
        const { roomId } = await fetch(url, options).then(res => res.json());
        if (roomId) {
            initializeAndJoinMeeting(roomId);
        } else {
            console.error("Failed to create meeting room.");
            setLoading(false);
        }
    } catch(e) {
        console.error(e);
        setLoading(false);
    }
  };

  const joinExistingMeeting = () => {
      if (meetingId) {
          initializeAndJoinMeeting(meetingId);
      }
  };
  
  const leaveMeeting = () => {
      meeting?.leave();
  }

  const toggleMic = () => {
    if (isMicOn) {
      meeting?.muteMic();
    } else {
      meeting?.unmuteMic();
    }
    setIsMicOn(!isMicOn);
  }

  const toggleWebcam = () => {
    const videoFrame = document.getElementById(`v-${meeting.localParticipant.id}`) as HTMLVideoElement;
    if (isWebCamOn) {
      meeting?.disableWebcam();
      if(videoFrame) videoFrame.style.display = 'none';
    } else {
      meeting?.enableWebcam();
      if(videoFrame) videoFrame.style.display = 'inline';
    }
    setIsWebCamOn(!isWebCamOn);
  }

  if (!apiKey || !sdkToken || apiKey === "YOUR_VIDEOSDK_API_KEY" || sdkToken === "YOUR_VIDEOSDK_TOKEN") {
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
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {isMeetingJoined ? (
        <div className="h-full relative flex flex-col items-center justify-center bg-background text-foreground">
          <div ref={videoContainerRef} className="grid h-full w-full gap-2 p-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"></div>
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
              <div className="flex justify-center">
                <Card className="p-2">
                    <div className="flex gap-2">
                    <Button variant="destructive" onClick={leaveMeeting}>Leave</Button>
                    <Button onClick={toggleMic}>{isMicOn ? 'Mute Mic' : 'Unmute Mic'}</Button>
                    <Button onClick={toggleWebcam}>{isWebCamOn ? 'Disable Webcam' : 'Enable Webcam'}</Button>
                    </div>
                </Card>
            </div>
          </div>
        </div>
      ) : (
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
                disabled={loading}
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button onClick={createNewMeeting} variant="outline" className="w-full" disabled={loading}>
                {loading && !meetingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create a new meeting'}
              </Button>
            </CardContent>
            <CardFooter>
              <Button onClick={joinExistingMeeting} className="w-full" disabled={!meetingId || loading}>
                {loading && meetingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Join Meeting'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
