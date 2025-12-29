
import React, { useEffect, useState } from 'react';
import { X, Users, Copy, Check, Info } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useSessionHost } from './SessionHost';

interface GroupInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartRoute: () => void;
    routeTitle: string;
}

export const GroupInvitationModal: React.FC<GroupInvitationModalProps> = ({
    isOpen,
    onClose,
    onStartRoute,
    routeTitle
}) => {
    const { sessionId, startSession, guestCount, endSession } = useSessionHost();
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !sessionId) {
            const init = async () => {
                setIsLoading(true);
                await startSession();
                setIsLoading(false);
            };
            init();
        }
    }, [isOpen]);

    const joinLink = sessionId ? `${window.location.origin}/#/join/${sessionId}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(joinLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = () => {
        onStartRoute();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-[#121212] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter">Modo Grupo</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center space-y-8">

                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest text-brand-500 font-bold">Escucha Sincronizada</p>
                        <h4 className="text-xl font-medium text-white/90 leading-tight">Invita a tus acompañantes</h4>
                        <p className="text-sm text-gray-400">Escanead este código para conectaros al audio del guía.</p>
                    </div>

                    {/* QR Card */}
                    <div className="bg-white p-4 rounded-2xl shadow-glow relative group">
                        {isLoading ? (
                            <div className="w-[180px] h-[180px] flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <QRCode
                                value={joinLink}
                                size={180}
                                level={"H"}
                                includeMargin={false}
                                renderAs={"svg"}
                            />
                        )}
                        <div className="absolute -bottom-3 -right-3 bg-brand-500 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                            LIVE
                        </div>
                    </div>

                    {/* Link Copy */}
                    <div className="w-full flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Enlace de invitación</p>
                            <p className="text-xs text-white truncate font-mono">{joinLink}</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-500"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Connected Count */}
                    <div className="flex items-center gap-3 bg-brand-500/10 px-5 py-3 rounded-full border border-brand-500/20">
                        <Users className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-bold text-brand-500">
                            {guestCount} {guestCount === 1 ? 'Acompañante' : 'Acompañantes'} conectados
                        </span>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={handleStart}
                        className="w-full bg-brand-500 hover:bg-brand-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-glow-sm"
                    >
                        Comenzar Ruta ({guestCount})
                    </button>

                </div>
            </div>
        </div>
    );
};
