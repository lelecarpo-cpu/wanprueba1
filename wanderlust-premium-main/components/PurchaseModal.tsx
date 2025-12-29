
import React, { useState } from 'react';
import { RouteModel } from '../types';
import { Lock, Loader, Check, X } from 'lucide-react';

interface PurchaseModalProps {
    route: RouteModel;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ route, isOpen, onClose, onConfirm }) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    if (!isOpen) return null;

    const handleConfirm = () => {
        setStatus('processing');
        // Simulate payment processing
        setTimeout(() => {
            setStatus('success');
            // Close after success animation
            setTimeout(() => {
                onConfirm();
                setStatus('idle'); // Reset for next time (though usually unmounted/hidden)
            }, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={status === 'idle' ? onClose : undefined}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in-up">

                {/* Header Image */}
                <div className="h-32 relative">
                    <img src={route.thumbnail} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <button
                        onClick={onClose}
                        disabled={status !== 'idle'}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full backdrop-blur-md transition-colors disabled:opacity-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 text-center">
                    {status === 'idle' && (
                        <>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{route.title}</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Desbloquea todos los puntos de esta experiencia.</p>

                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-slate-600">Total a pagar</span>
                                    <span className="text-2xl font-black text-slate-900">
                                        {route.price === 0 ? 'GRATIS' : `$${route.price.toFixed(2)}`}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full bg-brand-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                {route.price === 0 ? 'Obtener Ahora' : 'Confirmar Pago'}
                            </button>
                        </>
                    )}

                    {status === 'processing' && (
                        <div className="py-8 flex flex-col items-center">
                            <Loader className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                            <p className="text-slate-900 font-bold">Procesando...</p>
                            <p className="text-slate-400 text-xs mt-1">No cierres esta ventana</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8 flex flex-col items-center animate-fade-in">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-6 h-6" />
                            </div>
                            <p className="text-slate-900 font-bold text-lg">¡Todo listo!</p>
                            <p className="text-slate-500 text-sm mt-1">Disfruta de tu aventura.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
