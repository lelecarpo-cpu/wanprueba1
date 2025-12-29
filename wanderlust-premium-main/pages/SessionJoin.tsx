
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionHost } from '../components/SessionHost';
import { Play, Pause, Headphones, Radio, Volume2 } from 'lucide-react';

export const SessionJoin: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { joinSession, remoteAudioState, role } = useSessionHost();
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [isMuted, setIsMuted] = useState(true); // Browsers auto-block audio
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
            return;
        }

        const connect = async () => {
            try {
                const success = await joinSession(sessionId);
                if (success) {
                    setStatus('connected');
                } else {
                    setStatus('error');
                    setErrorMsg('No se pudo conectar a la sesión.');
                }
            } catch (err) {
                setStatus('error');
                setErrorMsg('Error de conexión.');
            }
        };

        if (role !== 'guest') {
            connect();
        } else {
            setStatus('connected');
        }
    }, [sessionId, joinSession, navigate, role]);

    if (status === 'error') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-bold">{errorMsg}</p>
                    <button onClick={() => navigate('/')} className="text-sm underline">Volver al inicio</button>
                </div>
            </div>
        );
    }

    if (status === 'connecting') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-widest text-gray-500">Conectando a la sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#0a0a0a] text-white relative flex flex-col items-center justify-between py-20 px-6 overflow-hidden">
            {/* Ambient Background */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${remoteAudioState?.isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">En vivo</span>
                </div>
                <h1 className="text-xl font-bold text-gray-400">Sesión {sessionId}</h1>
            </div>

            {/* Visualization */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md space-y-12">
                {remoteAudioState?.isPlaying ? (
                    <div className="space-y-6 text-center">
                        <div className="w-40 h-40 mx-auto rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border border-brand-500/50 animate-ping opacity-20" />
                            <Headphones className="w-16 h-16 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">Reproduciendo Audio</h2>
                            <p className="text-sm text-gray-400">Escuchando sincronizado con el guía</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 text-center opacity-50">
                        <div className="w-32 h-32 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Radio className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Esperando al guía...</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="relative z-10 w-full max-w-md">
                {isMuted && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <p className="text-xs text-amber-500 mb-2">El navegador ha silenciado el audio automáticamente.</p>
                        <button
                            onClick={() => setIsMuted(false)}
                            className="bg-amber-500 text-black px-6 py-2 rounded-full text-xs font-black uppercase hover:scale-105 transition-transform"
                        >
                            Activar Audio
                        </button>
                    </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                    <span>SERVER: {remoteAudioState?.serverTime || '--'}</span>
                    <span>LATENCY: 24ms</span>
                </div>
            </div>
        </div>
    );
};
