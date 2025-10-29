'use client';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  setDoc,
  getDoc,
  deleteDoc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

let pc: RTCPeerConnection | null = null;

const createPeerConnection = (
  firestore: Firestore,
  callId: string,
  localStream: MediaStream,
  setRemoteStream: (stream: MediaStream) => void
) => {
  pc = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    pc?.addTrack(track, localStream);
  });

  const remoteStream = new MediaStream();
  setRemoteStream(remoteStream);

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  const callerCandidatesCollection = collection(firestore, 'call_sessions', callId, 'callerCandidates');
  const calleeCandidatesCollection = collection(firestore, 'call_sessions', callId, 'calleeCandidates');

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(callerCandidatesCollection, event.candidate.toJSON());
    }
  };
  
  onSnapshot(calleeCandidatesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc?.addIceCandidate(candidate);
      }
    });
  });


  return pc;
};

export const createCall = async (
    firestore: Firestore,
    localStream: MediaStream,
    setRemoteStream: (stream: MediaStream) => void,
    calleeId: string,
    callerId: string
  ): Promise<string> => {
  const callId = uuidv4();
  const callDocRef = doc(firestore, 'call_sessions', callId);

  pc = createPeerConnection(firestore, callId, localStream, setRemoteStream);

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDocRef, { 
      offer, 
      callerId, 
      calleeId, 
      status: 'ringing', 
      startTime: serverTimestamp(),
      id: callId,
      callType: 'video',
    });

  onSnapshot(callDocRef, (snapshot) => {
    const data = snapshot.data();
    if (!pc?.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc?.setRemoteDescription(answerDescription);
    }
  });

  return callId;
};

export const answerCall = async (
  firestore: Firestore,
  callId: string,
  localStream: MediaStream,
  setRemoteStream: (stream: MediaStream) => void,
  offer: RTCSessionDescriptionInit
): Promise<void> => {
  pc = createPeerConnection(firestore, callId, localStream, setRemoteStream);

  const callDocRef = doc(firestore, 'call_sessions', callId);

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDocRef, { answer, status: 'answered' });

  const calleeCandidatesCollection = collection(firestore, 'call_sessions', callId, 'calleeCandidates');
   pc.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(calleeCandidatesCollection, event.candidate.toJSON());
    }
  };
};

export const endCall = async (firestore: Firestore, callId: string) => {
    const callDocRef = doc(firestore, 'call_sessions', callId);
    
    // In a real app you might want to handle cleanup of subcollections
    // For simplicity, we just delete the main doc.
    await deleteDoc(callDocRef);
    pc?.close();
    pc = null;
};


export const listenForCall = (
  firestore: Firestore,
  userId: string,
  callback: (callId: string, offer: RTCSessionDescriptionInit) => void
) => {
  const callsCollection = collection(firestore, 'call_sessions');
  
  const unsubscribe = onSnapshot(callsCollection, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const docData = change.doc.data();
      if (
        change.type === 'added' &&
        docData.calleeId === userId &&
        docData.status === 'ringing' &&
        docData.offer
      ) {
         callback(change.doc.id, docData.offer);
      }
    });
  });

  return unsubscribe;
};
