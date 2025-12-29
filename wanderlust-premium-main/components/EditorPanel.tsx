import React from 'react';
import { RoutePoint } from '../types';
import { Trash2, Type, Info, Mic, Video, Image as ImageIcon, UploadCloud, X, Edit3, CornerDownRight, Eye, Map as MapIcon, FileText } from 'lucide-react';

interface EditorPanelProps {
    point: RoutePoint | null;
    onChange: (id: string, updates: Partial<RoutePoint>) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    // New props for global editorial
    isGlobalEditorial?: boolean;
    routeEditorial?: {
        title: string;
        tagline: string;
        heroHook: string;
        recapStory: string;
        description: string;
    };
    onRouteEditorialChange?: (updates: any) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
    point,
    onChange,
    onDelete,
    onClose,
    isGlobalEditorial,
    routeEditorial,
    onRouteEditorialChange
}) => {
    const [mediaTab, setMediaTab] = React.useState<'url' | 'upload'>('url');

    if (isGlobalEditorial && routeEditorial && onRouteEditorialChange) {
        return (
            <div className="h-full flex flex-col bg-[#0f172a] border-l border-white/5 shadow-2xl z-30 relative scrollbar-hide text-white">
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#0f172a]/90 backdrop-blur-xl sticky top-0 z-10">
                    <div>
                        <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            Editorial Global
                        </h3>
                        <span className="bg-white/5 text-gray-300 border border-white/10 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                            <FileText className="w-3 h-3" /> Configuración de Portada
                        </span>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-black/20 relative">
                    {/* Header Title */}
                    <div className="space-y-2 group relative z-10">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Título de la Ruta</label>
                        <input
                            type="text"
                            value={routeEditorial.title}
                            onChange={(e) => onRouteEditorialChange({ title: e.target.value })}
                            className="font-black text-2xl text-white leading-tight w-full bg-transparent border-b-2 border-white/10 focus:border-brand-500 rounded-none px-1 py-2 focus:ring-0 placeholder-gray-600 tracking-tight transition-all"
                        />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2 group relative z-10">
                        <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest pl-1 text-center block">Tagline Emocional</label>
                        <input
                            type="text"
                            value={routeEditorial.tagline}
                            onChange={(e) => onRouteEditorialChange({ tagline: e.target.value })}
                            className="font-serif italic text-lg text-gray-200 text-center w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-inner"
                            placeholder="Ej: El latido invisible entre piedras y balcones..."
                        />
                    </div>

                    {/* Hero Hook */}
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Gancho Inicial (Hero Hook)</label>
                        <textarea
                            rows={4}
                            value={routeEditorial.heroHook}
                            onChange={(e) => onRouteEditorialChange({ heroHook: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm leading-relaxed text-gray-300 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner scrollbar-hide"
                            placeholder="Escribe la primera frase que leerá el viajero. Debe ser evocadora y potente..."
                        />
                    </div>

                    {/* Summary / Description */}
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Introducción & Objetivos</label>
                        <textarea
                            rows={4}
                            value={routeEditorial.description}
                            onChange={(e) => onRouteEditorialChange({ description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm leading-relaxed text-gray-400 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner scrollbar-hide"
                            placeholder="Resume la experiencia y qué aprenderá el viajero..."
                        />
                    </div>

                    {/* Recap Story */}
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest pl-1">Relato de Cierre (Conclusion Recap)</label>
                        <textarea
                            rows={4}
                            value={routeEditorial.recapStory}
                            onChange={(e) => onRouteEditorialChange({ recapStory: e.target.value })}
                            className="w-full bg-purple-500/5 border border-purple-500/20 rounded-2xl px-5 py-4 text-sm italic font-serif leading-relaxed text-purple-100 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all resize-none shadow-inner"
                            placeholder="¿Con qué sensación queremos que se vaya el viajero? Conecta todos los puntos aquí..."
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (!point) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-12 text-center bg-[#0f172a]">
                <div className="w-24 h-24 bg-white/5 shadow-2xl rounded-3xl flex items-center justify-center mb-6 border border-white/5 rotate-3 transition-transform hover:rotate-0 duration-500">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                        <Edit3 className="w-7 h-7 text-gray-400" />
                    </div>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Editor en Reposo</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                    Selecciona un punto del mapa o de la estructura para redactar su narrativa.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0f172a] border-l border-white/5 shadow-2xl z-30 relative text-white">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#0f172a]/90 backdrop-blur-xl sticky top-0 z-10 transition-all">
                <div>
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${point.parentId ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></span>
                        Editor de Punto
                    </h3>
                    <div className="flex items-center gap-2">
                        {point.parentId ? (
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                                <Eye className="w-3 h-3" /> Hotspot 360°
                            </span>
                        ) : (
                            <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                                <MapIcon className="w-3 h-3" /> Parada Principal
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-black/20 relative">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {/* Titulo Narrativo */}
                <div className="space-y-2 group relative z-10">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-brand-500 transition-colors">Título del Capítulo</label>
                    <input
                        type="text"
                        value={point.title}
                        onChange={(e) => onChange(point.id, { title: e.target.value })}
                        className="font-black text-2xl text-white leading-tight w-full bg-transparent border-b-2 border-white/10 focus:border-brand-500 rounded-none px-1 py-2 focus:ring-0 placeholder-gray-600 tracking-tight transition-all"
                        placeholder="Escribe un título..."
                        autoFocus
                    />
                </div>

                {/* Story / Relato Editorial */}
                <div className="space-y-4 relative z-10">
                    <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest pl-1">Relato Editorial (Storytelling)</label>
                    <textarea
                        rows={4}
                        value={point.story || ''}
                        onChange={(e) => onChange(point.id, { story: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm italic font-serif leading-relaxed text-gray-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner"
                        placeholder="Escribe la historia o curiosidad de esta parada..."
                    />
                </div>

                {/* Insight & Challenge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Insight del Autor</label>
                        <textarea
                            rows={3}
                            value={point.insight || ''}
                            onChange={(e) => onChange(point.id, { insight: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-400 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner"
                            placeholder="Clave para observar..."
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Desafío (Quiz)</label>
                        <textarea
                            rows={3}
                            value={point.challenge || ''}
                            onChange={(e) => onChange(point.id, { challenge: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-400 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner"
                            placeholder="¿Qué debe encontrar?"
                        />
                    </div>
                </div>

                {/* Metáfora Editorial */}
                <div className="space-y-4 relative z-10">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Metáfora Editorial</label>
                    <textarea
                        rows={2}
                        value={point.metaphor || ''}
                        onChange={(e) => onChange(point.id, { metaphor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-400 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner"
                        placeholder="Mnemotecnia o ancla visual..."
                    />
                </div>

                {/* Contenido Editorial Original (Descripción fallback) */}
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center pl-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Descripción Técnica</label>
                    </div>
                    <div className="relative group">
                        <textarea
                            rows={3}
                            value={point.description}
                            onChange={(e) => onChange(point.id, { description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm leading-relaxed text-gray-500 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner"
                            placeholder="Notas técnicas sobre este punto..."
                        />
                    </div>
                </div>

                {/* Configuración Técnica */}
                <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden relative z-10">
                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            Configuración Parada
                        </h4>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Snapshot Upload */}
                        <div className="space-y-4 pb-6 border-b border-white/5">
                            <label className="text-[9px] font-black text-brand-500 uppercase tracking-wider block pl-1">Captura de Ubicación (Snapshot)</label>
                            <div className="relative group/snap">
                                <input
                                    type="text"
                                    placeholder="URL de la captura del lugar (Ej: Google Street View)"
                                    value={point.snapshotUrl || ''}
                                    onChange={(e) => onChange(point.id, { snapshotUrl: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-gray-600"
                                />
                                {point.snapshotUrl && (
                                    <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10 relative">
                                        <img src={point.snapshotUrl} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/snap:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">Vista Previa GPS</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block pl-1">Duración (min)</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        min="0"
                                        value={point.durationMin}
                                        onChange={(e) => onChange(point.id, { durationMin: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-black/20 group-hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block pl-1">Formato Media</label>
                                <div className="relative group">
                                    <select
                                        value={point.mediaType}
                                        onChange={(e) => onChange(point.id, { mediaType: e.target.value as any })}
                                        className="w-full bg-black/20 group-hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="none">Ninguno</option>
                                        <option value="text">Texto</option>
                                        <option value="image">Imagen</option>
                                        <option value="video">Video</option>
                                        <option value="audio">Audio</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gray-300 transition-colors">
                                        <CornerDownRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media Upload UI */}
                        {point.mediaType !== 'none' && point.mediaType !== 'text' && (
                            <div className="space-y-4 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Recurso Multimedia</label>
                                    <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                                        <button
                                            onClick={() => setMediaTab('url')}
                                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${mediaTab === 'url' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Enlace
                                        </button>
                                        <button
                                            onClick={() => setMediaTab('upload')}
                                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${mediaTab === 'upload' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Subir
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-black/20 rounded-xl border-2 border-dashed border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group cursor-pointer relative overflow-hidden">
                                    {/* Success Indicator Overlay */}
                                    {point.mediaUrl && mediaTab === 'url' && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg z-20">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}

                                    {mediaTab === 'url' ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="https://ejemplo.com/archivo.jpg"
                                                value={point.mediaUrl || ''}
                                                onChange={(e) => onChange(point.id, { mediaUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-xs font-medium text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder-gray-600"
                                                autoFocus
                                            />
                                            {point.mediaUrl && (
                                                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                                    Enlace activo
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-2">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <UploadCloud className="w-5 h-5 text-brand-500" />
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold group-hover:text-brand-400">Haz clic para seleccionar</p>
                                            <p className="text-[10px] text-gray-600 mt-1">Soporta JPG, PNG, MP4, MP3</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Immersive Status Indicator (Read Only) */}
                {point.parentId && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-5 rounded-2xl border border-purple-500/20 flex items-center gap-4 relative z-10 font-sans">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-purple-300">Vista Inmersiva 360°</h5>
                            <p className="text-[11px] text-purple-400/80 font-medium leading-tight mt-0.5">Este punto vive dentro de una panorámica.</p>
                        </div>
                    </div>
                )}

                <div className="pt-4 pb-12 relative z-10">
                    <button
                        onClick={() => onDelete(point.id)}
                        className="w-full group flex items-center justify-center gap-2 text-gray-500 hover:text-red-400 transition-all py-4 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 font-black text-xs uppercase tracking-[0.2em]"
                    >
                        <Trash2 className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Eliminar Punto</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
