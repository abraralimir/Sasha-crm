'use client';
import { useMeeting } from '@videosdk.live/react-sdk';
import { useEffect } from 'react';
import { ParticipantView } from './participant-view';
import { Controls } from './controls';
import { Loader2 } from 'lucide-react';

export function MeetingContainer({ onMeetingLeave }: { onMeetingLeave: () => void }) {
  const { join, participants, localParticipant } = useMeeting({
    onMeetingLeft: onMeetingLeave,
  });

  useEffect(() => {
    join();
  }, []);

  const remoteParticipants = [...participants.values()].filter(p => p.id !== localParticipant.id);
  const allParticipants = [localParticipant, ...remoteParticipants];

  if (!localParticipant) {
     return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Joining meeting...</p>
      </div>
    );
  }

  return (
    <div className="h-full relative flex flex-col items-center justify-center bg-background text-foreground">
       <div className={`grid h-full w-full gap-2 p-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
         {allParticipants.map((participant) => (
          <ParticipantView
            participantId={participant.id}
            key={participant.id}
          />
        ))}
       </div>
       <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
         <Controls participantId={localParticipant.id} />
       </div>
    </div>
  );
}
