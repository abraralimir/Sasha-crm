'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVonageSession } from './vonage-provider';
import OT, { Publisher, Stream, Subscriber } from '@opentok/client';
import { VonageControls } from './vonage-controls';

const publisherOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  fitMode: 'cover',
  name: 'Me',
};

const subscriberOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  fitMode: 'cover',
};

export function VonageVideo() {
  const { session } = useVonageSession();
  const [publisher, setPublisher] = useState<Publisher>();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const publisherRef = useRef<HTMLDivElement>(null);
  const subscribersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session && publisherRef.current) {
      const pub = OT.initPublisher(
        publisherRef.current,
        publisherOptions,
        (err) => {
          if (err) console.error(err);
        }
      );
      setPublisher(pub);
      session.publish(pub, (err) => {
        if (err) console.error(err);
      });

      return () => {
        if (session && pub) {
          session.unpublish(pub);
        }
        pub.destroy();
      };
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      const handleStreamCreated = (event: { stream: Stream }) => {
        if (subscribersRef.current) {
          const subscriber = session.subscribe(
            event.stream,
            subscribersRef.current,
            subscriberOptions,
            (err) => {
              if (err) {
                console.error(err);
              }
            }
          );
          setSubscribers((prev) => [...prev, subscriber]);
        }
      };
      
      const handleStreamDestroyed = (event: { stream: Stream }) => {
        setSubscribers((prev) =>
          prev.filter((sub) => {
            if (sub.stream.streamId === event.stream.streamId) {
              sub.destroy();
              return false;
            }
            return true;
          })
        );
      };

      session.on('streamCreated', handleStreamCreated);
      session.on('streamDestroyed', handleStreamDestroyed);

      return () => {
        session.off('streamCreated', handleStreamCreated);
        session.off('streamDestroyed', handleStreamDestroyed);
      };
    }
  }, [session]);
  
  return (
    <div className="h-full relative flex flex-col items-center justify-center bg-background text-foreground">
      <div className="relative h-full w-full">
        <div ref={subscribersRef} className="h-full w-full" id="subscribers" />
         {publisherRef.current && (
          <div className="absolute bottom-4 right-4 h-36 w-48 overflow-hidden rounded-md border-2 border-primary shadow-lg md:h-48 md:w-64">
            <div ref={publisherRef} className="h-full w-full" id="publisher" />
          </div>
        )}
        {subscribers.length === 0 && (
           <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Waiting for participants to join...</p>
           </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        {session && publisher && <VonageControls publisher={publisher} session={session} />}
      </div>
    </div>
  );
}
