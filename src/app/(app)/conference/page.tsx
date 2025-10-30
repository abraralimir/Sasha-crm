'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import { authToken, createMeeting } from "@/lib/videosdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Webcam, WebcamOff, ScreenShare, ScreenShareOff, LogOut, Loader2 } from "lucide-react";

function JoinScreen({ getMeetingAndToken }: { getMeetingAndToken: (meetingId?: string) => void }) {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const onClick = async () => {
        await getMeetingAndToken(meetingId || undefined);
    };
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Join or Create a Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Enter Meeting ID to join"
                        onChange={(e) => {
                            setMeetingId(e.target.value);
                        }}
                    />
                    <Button onClick={onClick} className="w-full">
                        Join
                    </Button>
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
                    <Button onClick={onClick} className="w-full" variant="outline">
                        Create a new Meeting
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function ParticipantView({ participantId }: { participantId: string }) {
    const micRef = useRef<HTMLAudioElement>(null);
    const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);

    useEffect(() => {
        if (micRef.current) {
            if (micOn && micStream) {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(micStream.track);

                micRef.current.srcObject = mediaStream;
                micRef.current
                    .play()
                    .catch((error) =>
                        console.error("videoElem.current.play() failed", error)
                    );
            } else {
                micRef.current.srcObject = null;
            }
        }
    }, [micStream, micOn]);

    return (
        <div className="relative rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm">
            <audio ref={micRef} autoPlay playsInline muted={isLocal} />
            {webcamOn ? (
                <ReactPlayer
                    playsinline
                    pip={false}
                    light={false}
                    controls={false}
                    muted={true}
                    playing={true}
                    url={webcamStream}
                    height={"100%"}
                    width={"100%"}
                    onError={(err) => {
                        console.log(err, "participant video error");
                    }}
                />
            ) : (
                <div className="aspect-video w-full flex items-center justify-center bg-secondary">
                    <p className="text-muted-foreground">{displayName?.charAt(0).toUpperCase()}</p>
                </div>
            )}
             <div className="absolute bottom-2 left-2 bg-background/70 backdrop-blur-sm p-1 px-2 rounded-md text-sm">
                {displayName}
            </div>
             <div className="absolute top-2 right-2">
                {micOn ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-red-500" />}
            </div>
        </div>
    );
}

function Controls() {
    const { leave, toggleMic, toggleWebcam } = useMeeting();
    const { startScreenShare, stopScreenShare, screenShareOn } = useParticipant(useMeeting().localParticipant.id);
    return (
        <div className="flex justify-center items-center gap-2">
            <Button onClick={() => leave()} variant="destructive" size="icon">
                <LogOut />
            </Button>
            <Button onClick={() => toggleMic()} variant="outline" size="icon">
                {useMeeting().micOn ? <Mic /> : <MicOff />}
            </Button>
            <Button onClick={() => toggleWebcam()} variant="outline" size="icon">
                {useMeeting().webcamOn ? <Webcam /> : <WebcamOff />}
            </Button>
            <Button onClick={() => (screenShareOn ? stopScreenShare() : startScreenShare())} variant="outline" size="icon">
                {screenShareOn ? <ScreenShareOff /> : <ScreenShare />}
            </Button>
        </div>
    );
}

function MeetingView({ onMeetingLeave, meetingId }: { onMeetingLeave: () => void; meetingId: string; }) {
    const [joined, setJoined] = useState<string | null>(null);
    const { join, participants } = useMeeting({
        onMeetingJoined: () => {
            setJoined("JOINED");
        },
        onMeetingLeft: () => {
            onMeetingLeave();
        },
    });

    const joinMeeting = () => {
        setJoined("JOINING");
        join();
    };

    return (
        <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
            <h3 className="text-center font-semibold">Meeting Id: {meetingId}</h3>
            {joined && joined === "JOINED" ? (
                <>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[...participants.keys()].map((participantId) => (
                            <ParticipantView
                                participantId={participantId}
                                key={participantId}
                            />
                        ))}
                    </div>
                     <div className="p-2">
                        <Controls />
                    </div>
                </>
            ) : joined && joined === "JOINING" ? (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Joining the meeting...</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <Button onClick={joinMeeting}>Join</Button>
                </div>
            )}
        </div>
    );
}

export default function ConferencePage() {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    
    useEffect(() => {
        const sdkToken = process.env.NEXT_PUBLIC_VIDEOSDK_TOKEN;
        if (sdkToken) {
            setToken(sdkToken);
        }
    }, []);

    const getMeetingAndToken = async (id?: string) => {
        const meetingId = id == null ? await createMeeting({ token: token! }) : id;
        setMeetingId(meetingId);
    };

    const onMeetingLeave = () => {
        setMeetingId(null);
    };

    return token && meetingId ? (
        <MeetingProvider
            config={{
                meetingId,
                micEnabled: true,
                webcamEnabled: true,
                name: "Sasha User",
            }}
            token={token}
        >
            <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
        </MeetingProvider>
    ) : (
        <JoinScreen getMeetingAndToken={getMeetingAndToken} />
    );
}
