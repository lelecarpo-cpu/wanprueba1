
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SessionHostContextType {
    sessionId: string | null;
    guestCount: number;
    startSession: () => Promise<string>;
    joinSession: (id: string) => Promise<boolean>;
    endSession: () => void;
    broadcastState: (state: AudioState) => void;
    role: 'host' | 'guest' | null;
    remoteAudioState: AudioState | null;
}

interface AudioState {
    pointId: string;
    isPlaying: boolean;
    timestamp: number; // Current playback time
    serverTime: number; // For sync calculation
}

const SessionHostContext = createContext<SessionHostContextType>({
    sessionId: null,
    guestCount: 0,
    startSession: async () => '',
    joinSession: async () => false,
    endSession: () => { },
    broadcastState: () => { },
    role: null,
    remoteAudioState: null,
});

export const useSessionHost = () => useContext(SessionHostContext);

export const SessionHostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState(0);
    const [role, setRole] = useState<'host' | 'guest' | null>(null);
    const [remoteAudioState, setRemoteAudioState] = useState<AudioState | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const startSession = async () => {
        // Generate a simple 6-character session ID (e.g., "AF3-9B2")
        const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setSessionId(newSessionId);
        setRole('host');

        // Initialize Supabase Channel
        const channel = supabase.channel(`session:${newSessionId}`, {
            config: {
                presence: {
                    key: 'host',
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                // Count all presence keys minus the host
                const count = Object.keys(state).length - 1; // Assuming host is 1
                setGuestCount(Math.max(0, count));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString(), type: 'host' });
                }
            });

        channelRef.current = channel;
        return newSessionId;
    };

    const joinSession = async (id: string) => {
        setSessionId(id);
        setRole('guest');

        const channel = supabase.channel(`session:${id}`, {
            config: {
                presence: {
                    key: `guest-${Math.random().toString(36).substring(2, 8)}`,
                },
            },
        });

        channel
            .on('broadcast', { event: 'audio_sync' }, (payload) => {
                console.log('Received broadcast:', payload);
                setRemoteAudioState(payload.payload as AudioState);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString(), type: 'guest' });
                    // Optional: Request current state from host?
                }
            });

        channelRef.current = channel;
        return true;
    };

    const endSession = () => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        setSessionId(null);
        setGuestCount(0);
        setRole(null);
        setRemoteAudioState(null);
    };

    const broadcastState = (state: AudioState) => {
        if (!channelRef.current || !sessionId || role !== 'host') return;

        channelRef.current.send({
            type: 'broadcast',
            event: 'audio_sync',
            payload: {
                ...state,
                serverTime: Date.now(),
            },
        });
    };

    useEffect(() => {
        return () => {
            endSession();
        };
    }, []);

    return (
        <SessionHostContext.Provider value={{ sessionId, guestCount, startSession, joinSession, endSession, broadcastState, role, remoteAudioState }}>
            {children}
        </SessionHostContext.Provider>
    );
};
