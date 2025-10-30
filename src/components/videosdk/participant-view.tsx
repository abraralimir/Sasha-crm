'use client';
import { useParticipant } from '@videosdk.live/react-sdk';
import { useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { MicOff } from 'lucide-react';

export function ParticipantView({ participantId }: { participantId: string }) {
  const micRef = useRef<HTMLAudioElement>(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current && micOn && micStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      micRef.current.srcObject = mediaStream;
      micRef.current.play().catch((error) => console.error('videoElem.current.play() failed', error));
    } else {
      if(micRef.current) {
         micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'G';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div key={participantId} className="relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden bg-secondary">
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn ? (
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          height={'100%'}
          width={'100%'}
          style={{ objectFit: 'cover' }}
        />
      ) : (
         <Avatar className="h-24 w-24">
            <AvatarFallback className="text-3xl">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
         {!micOn && <MicOff className="h-5 w-5 text-destructive-foreground bg-destructive rounded-full p-1" />}
        <p className="text-sm font-medium bg-black/50 text-white px-2 py-1 rounded-md">{displayName}</p>
      </div>
    </div>
  );
}
