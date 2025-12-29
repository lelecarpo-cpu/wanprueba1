import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, Pen } from 'lucide-react';

interface RiddleChallengeProps {
    codedText: string;
    solution: string;
    hint: string;
    onSolve?: () => void;
}

export const RiddleChallenge: React.FC<RiddleChallengeProps> = ({ codedText, solution, hint, onSolve }) => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'wrong' | 'solved'>('idle');
    const [showHint, setShowHint] = useState(false);

    const checkSolution = () => {
        const normalizedInput = input.trim().toUpperCase().replace(/\s+/g, ' ');
        const normalizedSolution = solution.trim().toUpperCase().replace(/\s+/g, ' ');

        if (normalizedInput === normalizedSolution) {
            setStatus('solved');
            if (onSolve) onSolve();
        } else {
            setStatus('wrong');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <div className="relative max-w-lg lg:max-w-3xl mx-auto my-12 lg:my-20 animate-fade-in group/notebook">
            {/* Notebook Background */}
            <div className="bg-[#fdfdfd] rounded-sm shadow-2xl overflow-hidden flex min-h-[500px] lg:min-h-[600px] border border-gray-200 ring-1 ring-black/5">
                {/* Spiral Binding */}
                <div className="w-12 lg:w-16 bg-gray-100 border-r border-gray-300 flex flex-col justify-around py-4 lg:py-6 shadow-inner">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-gray-400/50 -ml-3 lg:-ml-4 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" />
                    ))}
                </div>

                {/* Paper Content */}
                <div className="flex-1 p-8 lg:p-14 relative flex flex-col pt-12 lg:pt-16">
                    {/* Lined Paper Lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
                        style={{
                            backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: '100% 2.5rem',
                            marginTop: '3.5rem'
                        }}
                    />

                    <div className="relative z-10 flex-grow">
                        {/* Header Content */}
                        <div className="flex justify-between items-start mb-12 lg:mb-16">
                            <div className="flex items-center gap-2 text-brand-500/60 uppercase text-[10px] lg:text-[11px] font-black tracking-widest">
                                <Pen className="w-3 h-3" />
                                Notas de Malasaña
                            </div>
                            <div className="text-[10px] lg:text-[11px] text-gray-400 font-bold">166 / 991</div>
                        </div>

                        {/* Coded Message */}
                        <div className="mb-16 lg:mb-20">
                            <div className="font-serif italic text-3xl md:text-5xl text-gray-800 leading-[2.5rem] md:leading-[3.5rem] tracking-tight whitespace-pre-wrap text-center opacity-90 transition-all drop-shadow-sm">
                                {codedText.split('\n').map((line, i) => (
                                    <div key={i} className="mb-2 uppercase">{line}</div>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="space-y-8 max-w-xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Escribe la frase real aquí..."
                                    className={`w-full bg-transparent border-b-2 border-gray-300 focus:border-brand-500 outline-none py-4 text-xl lg:text-2xl font-medium text-gray-700 placeholder-gray-400 transition-all uppercase tracking-tight text-center ${status === 'wrong' ? 'border-red-500 text-red-600' : ''} ${status === 'solved' ? 'border-green-500 text-green-600' : ''}`}
                                    disabled={status === 'solved'}
                                />

                                {status === 'wrong' && (
                                    <div className="absolute top-full left-0 right-0 mt-3 flex justify-center items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
                                        <AlertCircle className="w-3 h-3" /> Inténtalo de nuevo
                                    </div>
                                )}

                                {status === 'solved' && (
                                    <div className="absolute top-full left-0 right-0 mt-3 flex justify-center items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                                        <CheckCircle2 className="w-3 h-3" /> ¡Resuelto! El secreto es tuyo.
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 lg:gap-6 pt-4">
                                <button
                                    onClick={checkSolution}
                                    disabled={status === 'solved' || !input.trim()}
                                    className={`flex-1 py-5 rounded-xl font-black text-xs lg:text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] ${status === 'solved' ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-brand-500 shadow-brand-500/10'}`}
                                >
                                    {status === 'solved' ? 'COMPLETADO' : 'DESCIFRAR'}
                                </button>

                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="w-16 h-16 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-white hover:text-brand-500 border border-gray-200 transition-all active:scale-95 group/hint"
                                    title="Pista"
                                >
                                    <HelpCircle className={`w-7 h-7 transition-transform group-hover/hint:rotate-12 ${showHint ? 'text-brand-500' : ''}`} />
                                </button>
                            </div>

                            {showHint && (
                                <div className="p-5 lg:p-6 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs lg:text-sm font-medium text-brand-600 leading-relaxed animate-fade-in-up">
                                    <span className="font-black uppercase tracking-wider mr-2">Pista Editorial:</span>
                                    {hint}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bookmark Decor */}
                    <div className="absolute bottom-0 right-12 w-8 h-16 bg-brand-500/80 rounded-b-md shadow-lg transition-all duration-500 group-hover/notebook:-translate-y-2 pointer-events-auto cursor-pointer" />
                </div>
            </div>

            {/* Visual Accessories */}
            <div className="absolute -right-24 top-1/2 -translate-y-1/2 hidden xl:block opacity-40 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="w-14 h-72 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-full relative shadow-2xl border border-white/10">
                    <div className="absolute top-0 w-full h-10 bg-black/10 rounded-t-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[85%] bg-gray-200/50 rounded-full blur-[1px]" />
                    <div className="absolute bottom-0 w-full h-6 bg-black/30 rounded-b-full" />
                </div>
            </div>
        </div>
    );
};
