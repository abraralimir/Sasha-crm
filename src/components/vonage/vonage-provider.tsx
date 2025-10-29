'use client';

import OT, { Session } from '@opentok/client';
import { Loader2 } from 'lucide-react';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface VonageVideoProviderProps {
  children: ReactNode;
  apiKey: string;
  sessionId: string;
  token: string;
}

interface VonageVideoContextType {
  session?: Session;
  connectionId?: string;
  isConnected: boolean;
}

const VonageVideoContext = createContext<VonageVideoContextType | undefined>(
  undefined
);

export const useVonageSession = () => {
  const context = useContext(VonageVideoContext);
  if (!context) {
    throw new Error(
      'useVonageSession must be used within a VonageVideoProvider'
    );
  }
  return context;
};

export const VonageProvider: React.FC<VonageVideoProviderProps> = ({
  children,
  apiKey,
  sessionId,
  token,
}) => {
  const [session, setSession] = useState<Session>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const session = OT.initSession(apiKey, sessionId);
    setSession(session);

    const connect = () => {
      session.connect(token, (err) => {
        if (err) {
          console.error('Failed to connect', err);
        } else {
          setIsConnected(true);
        }
      });
    };

    session.on('sessionConnected', () => {
      setIsConnected(true);
    });

    session.on('sessionDisconnected', () => {
      setIsConnected(false);
    });

    connect();

    return () => {
      session.disconnect();
    };
  }, [apiKey, sessionId, token]);

  if (!isConnected || !session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Connecting to session...</p>
      </div>
    );
  }

  return (
    <VonageVideoContext.Provider
      value={{ session, connectionId: session?.connection?.connectionId, isConnected }}
    >
      {children}
    </VonageVideoContext.Provider>
  );
};
