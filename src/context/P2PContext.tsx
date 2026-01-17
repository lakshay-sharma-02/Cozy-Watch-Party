import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

interface P2PContextType {
    peerId: string;
    connectToPeer: (peerId: string) => Promise<void>;
    sendMessage: (data: any) => void;
    remoteStream: MediaStream | null;
    localStream: MediaStream | null;
    isConnected: boolean;
    isHost: boolean;
    callPeer: (remotePeerId: string, stream: MediaStream) => void;
}

const P2PContext = createContext<P2PContextType | null>(null);

export const useP2P = () => {
    const context = useContext(P2PContext);
    if (!context) {
        throw new Error('useP2P must be used within a P2PProvider');
    }
    return context;
};

export const P2PProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [peerId, setPeerId] = useState<string>('');
    const [isConnected, setIsConnected] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isHost, setIsHost] = useState(false);

    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);
    const callRef = useRef<MediaConnection | null>(null);

    useEffect(() => {
        // Generate a shorter, friendlier ID if possible, but UUID is fine for now
        const newPeerId = uuidv4().substring(0, 8); // simplified ID

        const peer = new Peer(newPeerId, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            setPeerId(id);
            setIsHost(true); // Default to host until we connect to someone else? 
            // actually, every peer is a host of their own session until they connect.
        });

        peer.on('connection', (conn) => {
            console.log('Incoming connection from:', conn.peer);
            handleConnection(conn);
            toast({
                title: 'Friend connected!',
                description: 'New participant joined the party.'
            });
        });

        peer.on('call', (call) => {
            console.log('Incoming call from:', call.peer);

            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setLocalStream(stream);
                    call.answer(stream); // Answer the call with an A/V stream.

                    call.on('stream', (remoteStream) => {
                        setRemoteStream(remoteStream);
                    });

                    callRef.current = call;
                })
                .catch((err) => {
                    console.error('Failed to get local stream', err);
                });
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
        };
    }, []);

    const handleConnection = (conn: DataConnection) => {
        connRef.current = conn;
        setIsConnected(true);

        conn.on('data', (data) => {
            console.log('Received data:', data);
            // Dispatch event or handle data internally?
            // For loose coupling, we can emit a custom window event or use a callback registry
            // But for simplicity in this project, we might just expose the last message
            // or use a custom event bus.
            window.dispatchEvent(new CustomEvent('p2p-data', { detail: data }));
        });

        conn.on('close', () => {
            setIsConnected(false);
            setRemoteStream(null);
            toast({
                title: 'Friend disconnected',
                variant: 'destructive'
            });
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
        });
    };

    const connectToPeer = async (remotePeerId: string) => {
        if (!peerRef.current) return;

        setIsHost(false); // We are the guest connecting to a host
        const conn = peerRef.current.connect(remotePeerId);

        conn.on('open', () => {
            console.log('Connected to:', remotePeerId);
            handleConnection(conn);
        });
    };

    const callPeer = (remotePeerId: string, stream: MediaStream) => {
        if (!peerRef.current) return;

        const call = peerRef.current.call(remotePeerId, stream);

        call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
        });

        callRef.current = call;
    };

    const sendMessage = (data: any) => {
        if (connRef.current && connRef.current.open) {
            connRef.current.send(data);
        }
    };

    return (
        <P2PContext.Provider value={{
            peerId,
            connectToPeer,
            sendMessage,
            remoteStream,
            localStream,
            isConnected,
            isHost,
            callPeer
        }}>
            {children}
        </P2PContext.Provider>
    );
};
