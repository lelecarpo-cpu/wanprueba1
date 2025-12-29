import React from 'react';
import { RoutePoint } from '../types';
import { Map as MapIcon, Info, Mic, Video, Image as ImageIcon, FileText, GripVertical } from 'lucide-react';

interface StructurePanelProps {
    points: RoutePoint[];
    selectedPointId: string | null;
    onSelectPoint: (id: string) => void;
}

interface StructurePanelProps {
    points: RoutePoint[];
    selectedPointId: string | null;
    onSelectPoint: (id: string) => void;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({ points, selectedPointId, onSelectPoint }) => {

    const PointRow: React.FC<{ point: RoutePoint, isChild?: boolean }> = ({ point, isChild = false }) => {
        const isSelected = selectedPointId === point.id;
        const activeParentId = points.find(p => p.id === selectedPointId)?.parentId;
        const isParentOfSelected = !isChild && activeParentId === point.id;

        const Icon = point.mediaType === 'audio' ? Mic : point.mediaType === 'video' ? Video : point.mediaType === 'image' ? ImageIcon : FileText;

        return (
            <div
                onClick={() => onSelectPoint(point.id)}
                className={`
                    relative group transition-all duration-300
                    ${isChild ? 'ml-6 py-1.5' : 'py-2.5'}
                `}
            >
                {isChild && (
                    <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/10"></div>
                )}

                <div className={`
                    flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer
                    ${isSelected
                        ? 'bg-brand-500/20 border-brand-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-[1.02]'
                        : isParentOfSelected
                            ? 'bg-white/5 border-white/20 shadow-inner'
                            : 'bg-black/20 border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 hover:-translate-y-0.5'
                    }
                `}>
                    <div className={`
                        shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                        ${isSelected
                            ? 'bg-brand-500 text-white shadow-glow'
                            : 'bg-white/5 text-gray-400 group-hover:bg-brand-500/20 group-hover:text-brand-400'}
                    `}>
                        <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-grow min-w-0 pr-1 text-left">
                        <div className="flex items-center justify-between gap-2 overflow-hidden mb-0.5">
                            <h4 className={`text-xs font-black uppercase tracking-wider truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {point.title || "Sin título"}
                            </h4>
                            {isChild && <div className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-purple-300' : 'text-purple-500'} bg-transparent rounded-full px-1.5 py-0.5`}>360° Detail</div>}
                        </div>
                        <p className={`text-[10px] font-medium truncate transition-colors ${isSelected ? 'text-white/60' : 'text-gray-500 group-hover:text-gray-400'}`}>
                            {point.description || "Sin descripción narrativa..."}
                        </p>
                    </div>

                    {!isChild && (
                        <div className={`shrink-0 transition-all duration-300 ${isSelected ? 'opacity-100 text-brand-400' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 text-gray-500'}`}>
                            <GripVertical className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-white">
            {/* Header */}
            <div className="px-6 py-5 bg-[#0f172a]/90 backdrop-blur-sm border-b border-white/5 flex flex-col gap-4 z-10 sticky top-0 text-white">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapIcon className="w-3 h-3" />
                        Estructura
                    </h3>
                    <div className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                        {points.filter(p => !p.parentId).length}/10 Puntos
                    </div>
                </div>

                <div className="bg-gradient-to-r from-brand-900/40 to-transparent p-4 rounded-xl border border-brand-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MapIcon className="w-16 h-16 text-brand-500 -rotate-12" />
                    </div>
                    <p className="text-xs text-brand-200 font-medium leading-relaxed relative z-10 italic">
                        "Diseña el flujo de tu historia. Cada parada es un capítulo nuevo para el viajero."
                    </p>
                </div>

                {/* Global Editorial Entry */}
                <button
                    onClick={() => onSelectPoint('route-editorial')}
                    className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left
                        ${selectedPointId === 'route-editorial'
                            ? 'bg-brand-500 border-brand-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white'
                            : 'bg-white/5 border-white/10 hover:border-brand-500/30 text-gray-400 group shadow-sm hover:shadow-brand-500/5'}
                    `}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedPointId === 'route-editorial' ? 'bg-white/20' : 'bg-brand-500/10 text-brand-500'}`}>
                        <FileText className="w-5 h-5 shadow-sm" />
                    </div>
                    <div>
                        <h4 className={`text-xs font-black uppercase tracking-widest ${selectedPointId === 'route-editorial' ? 'text-white' : 'text-gray-200'}`}>Portada & Editorial</h4>
                        <p className={`text-[10px] font-bold ${selectedPointId === 'route-editorial' ? 'text-white/60' : 'text-brand-500'} uppercase tracking-wider`}>Metadata Global</p>
                    </div>
                </button>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar relative bg-black/20">
                {points.length === 0 && selectedPointId !== 'route-editorial' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 1 }}>
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/5 rotate-6 transition-transform hover:rotate-0 duration-500 cursor-pointer group">
                            <MapIcon className="w-8 h-8 text-gray-600 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-3">Lienzo en Blanco</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px]">
                            Explora el mapa a tu derecha y pulsa cualquier ubicación para comenzar tu ruta.
                        </p>
                    </div>
                )}

                <div className="space-y-1 pb-20">
                    {points.filter(p => !p.parentId).map((parent, idx) => (
                        <div key={parent.id} className="relative pl-3">
                            {/* Connector Line */}
                            {idx < points.filter(p => !p.parentId).length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-[-10px] w-px bg-white/10 z-0"></div>
                            )}

                            <div className="flex items-start gap-3 group relative z-10">
                                {/* Number Badge */}
                                <div className="pt-3.5 shrink-0">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all duration-300 shadow-lg ${selectedPointId === parent.id ? 'bg-brand-500 border-brand-500 text-white scale-110 rotate-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-black/40 border-white/10 text-gray-500 group-hover:border-brand-500/50 group-hover:text-brand-500'}`}>
                                        {idx + 1}
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <PointRow point={parent} />
                                    <div className="space-y-1 mt-1">
                                        {points.filter(child => child.parentId === parent.id).map(child => (
                                            <PointRow key={child.id} point={child} isChild={true} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Tip */}
            <div className="p-4 border-t border-white/5 bg-[#0f172a]/90 backdrop-blur-md z-20">
                <div className="bg-black/40 p-4 rounded-xl text-white flex items-center gap-4 shadow-xl border border-white/5 group cursor-help transition-transform active:scale-98">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <Info className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-brand-200 transition-colors">Pro Tip</p>
                        <p className="text-[10px] font-medium leading-tight mt-0.5 text-gray-400 group-hover:text-white transition-colors">Usa la "Vista Inmersiva" para añadir puntos ocultos dentro de una panorámica 360.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
