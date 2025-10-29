'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFirebase } from '@/firebase';
import { createCall, answerCall, endCall, listenForCall } from '@/lib/webrtc';
import { useToast } from '@/hooks/use-toast';

export function VideoCall() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (firestore && user && !isCallActive) {
      const unsubscribe = listenForCall(firestore, user.uid, async (id, offer) => {
        toast({
            title: "Incoming Call",
            description: "You have an incoming video call.",
            action: <Button onClick={() => handleAnswerCall(id, offer)}>Answer</Button>
        });
      });
      return () => unsubscribe();
    }
  }, [firestore, user, isCallActive, toast]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      toast({
        variant: 'destructive',
        title: 'Media Error',
        description: 'Could not access camera and microphone.',
      });
      return null;
    }
  };


  const handleStartCall = async () => {
    if (!firestore || !user) return;
    // This is where you would normally get the callee's ID.
    // For this example, we'll use a hardcoded placeholder.
    // In a real app, you'd select a user to call.
    const calleeId = "user2"; // Placeholder
    if (user.uid === calleeId) {
        toast({ title: "You can't call yourself.", variant: "destructive" });
        return;
    }

    const stream = await getMedia();
    if(stream) {
        const id = await createCall(firestore, stream, setRemoteStream, calleeId, user.uid);
        setCallId(id);
        setIsCallActive(true);
    }
  };

  const handleAnswerCall = async (id: string, offer: RTCSessionDescriptionInit) => {
     if (!firestore || !user) return;
     const stream = await getMedia();
     if(stream) {
        await answerCall(firestore, id, stream, setRemoteStream, offer);
        setCallId(id);
        setIsCallActive(true);
     }
  };

  const handleEndCall = async () => {
    if (firestore && callId) {
      await endCall(firestore, callId);
    }
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setCallId(null);
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open && isCallActive) handleEndCall()}}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Video className="h-4 w-4" />
          <span className="sr-only">Start Call</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Video Call</DialogTitle>
           {!isCallActive && <DialogDescription>Start a new video call.</DialogDescription>}
        </DialogHeader>
        <div className="relative h-full flex flex-col">
            {!isCallActive && (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className='mb-4'>Start a call with a colleague.</p>
                    <Button onClick={handleStartCall}>Start Call</Button>
                </div>
            )}
             {isCallActive && (
                 <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div className='relative rounded-md overflow-hidden bg-black'>
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        {!remoteStream && <div className='absolute inset-0 flex items-center justify-center text-white'>Waiting for other user...</div>}
                     </div>
                     <div className='relative rounded-md overflow-hidden bg-black'>
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                     </div>
                 </div>
             )}
        </div>
        {isCallActive && (
            <div className="flex justify-center gap-4 mt-4">
                <Button onClick={toggleMic} variant={isMicMuted ? 'destructive': 'outline'} size="icon">
                    {isMicMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleVideo} variant={isVideoOff ? 'destructive': 'outline'} size="icon">
                    {isVideoOff ? <VideoOff /> : <Video />}
                </Button>
                <Button onClick={handleEndCall} variant="destructive" size="icon">
                    <PhoneOff />
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
