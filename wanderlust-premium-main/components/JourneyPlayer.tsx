
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { RouteModel, RoutePoint } from '../types';
import {
  X, Info, Map as MapIcon,
  Layers, ArrowLeft, ArrowDown, CheckCircle2, Bookmark, Target, Sparkles, Play,
  Wine, Utensils, Coffee, Moon, ExternalLink
} from 'lucide-react';
import { ScenicMap } from './ScenicMap';
import { RiddleChallenge } from './RiddleChallenge';

import { useSessionHost } from './SessionHost';

interface JourneyPlayerProps {
  route: RouteModel;
  onClose: () => void;
}

const useActiveSection = (points: RoutePoint[], onActiveChange: (id: string) => void) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onActiveChange(entry.target.id);
        }
      });
    }, { threshold: 0.6 });

    points.forEach(p => {
      const el = document.getElementById(p.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [points, onActiveChange]);
};

export const JourneyPlayer: React.FC<JourneyPlayerProps> = ({ route, onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { broadcastState, role } = useSessionHost();

  // Audio Playback State
  const [playingPointId, setPlayingPointId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parentPoints = useMemo(() => route.points.filter(p => !p.parentId), [route.points]);

  const [flippedPoints, setFlippedPoints] = useState<Record<string, boolean>>({});
  const [activeMapPointId, setActiveMapPointId] = useState<string | null>(null);

  useActiveSection(parentPoints, (id) => setActiveMapPointId(id));

  const toggleFlip = (id: string) => {
    setFlippedPoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayAudio = (pointId: string, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingPointId === pointId) {
      setPlayingPointId(null);
      broadcastState({ pointId, isPlaying: false, timestamp: 0, serverTime: 0 });
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingPointId(pointId);

    broadcastState({ pointId, isPlaying: true, timestamp: 0, serverTime: 0 });

    audio.onended = () => {
      setPlayingPointId(null);
      broadcastState({ pointId, isPlaying: false, timestamp: 0, serverTime: 0 });
    };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] text-white overflow-y-auto overflow-x-hidden selection:bg-brand-500/30 font-sans custom-scrollbar" ref={scrollContainerRef}>

      {/* HEADER CONTROL */}
      <div className="fixed top-0 left-0 right-0 z-[110] p-6 flex justify-between items-center pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-brand-500 hover:border-brand-500 transition-all shadow-2xl group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="hidden md:flex gap-4 pointer-events-auto">
          <button onClick={() => scrollToSection('map-overview')} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Mapa</button>
          <button onClick={() => scrollToSection('stops')} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Paradas</button>
        </div>
      </div>

      {/* 1. HERO BLOCK */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={route.thumbnail}
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            alt={route.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="container mx-auto px-[6%] relative z-10 text-center">
          <div className="overflow-hidden mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white text-[10px] font-black rounded-full tracking-[0.3em] uppercase translate-y-full animate-slide-up shadow-lg">
              <Sparkles className="w-3.5 h-3.5" /> EMPIEZA LA EXPERIENCIA
            </span>
          </div>

          <h1 className="editorial-title text-6xl md:text-9xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8 drop-shadow-2xl">
            <span className="block translate-y-full animate-slide-up [animation-delay:100ms]">
              {route.title.split(' ')[0]}
            </span>
            <span className="block md:pl-24 translate-y-full animate-slide-up [animation-delay:200ms]">
              {route.title.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-white/80 italic max-w-3xl mx-auto translate-y-10 opacity-0 animate-fade-in [animation-delay:400ms]">
            "Cada paso es una línea en la historia de la ciudad. Prepárate para ver lo invisible."
          </p>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-0 animate-fade-in [animation-delay:800ms]">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Desliza para explorar</span>
            <ArrowDown className="w-5 h-5 text-brand-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. SUMMARY & OBJECTIVE */}
      <section className="py-32 px-[6%] max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-12">
            <h2 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em] mb-12 flex items-center gap-4 text-center justify-center">
              <span className="w-12 h-px bg-white/20"></span> Objetivo de la Ruta <span className="w-12 h-px bg-white/20"></span>
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-2xl md:text-4xl font-light leading-snug text-gray-200">
              {route.description}
            </p>
          </div>
          <div className="md:col-span-5 space-y-8">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 mb-4">¿Qué descubrirás?</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-400 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                  <span>Nuevas perspectivas sobre el paisaje urbano cotidiano.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                  <span>Historia viva contada a través de sus edificios.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                  <span>Claves para interpretar la ciudad como un experto.</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => scrollToSection('map-overview')}
              className="w-full bg-white text-black py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-brand-500 hover:text-white transition-all shadow-xl"
            >
              Prepárate para tu aventura
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAP OVERVIEW */}
      <section id="map-overview" className="py-20 px-[6%]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">La Hoja de Ruta</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">6 Paradas • {route.durationMin} Minutos de Exploración</p>
            </div>
          </div>

          <div className="aspect-[3/4] md:aspect-[21/9] w-full bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-3xl">
            <ScenicMap
              points={parentPoints}
              baseLocation={route.location}
              className="w-full h-full"
              showTitle={false}
              showSidebar={false}
              category={route.category}
              activePointId={activeMapPointId || undefined}
              interactive={true}
              onSelectPoint={(id) => scrollToSection(id)}
            />
            <div className="absolute bottom-8 left-8 right-8 flex justify-end">
              <button
                onClick={() => scrollToSection('stops')}
                className="bg-brand-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
              >
                Ir a la primera parada <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STOP BLOCKS */}
      <section id="stops" className="py-40 space-y-60 lg:space-y-80">
        {parentPoints.map((point, idx) => (
          <div key={point.id} id={point.id} className="container mx-auto px-[6%] max-w-7xl">
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-20 items-center ${idx % 2 !== 0 ? 'lg:flex lg:flex-row-reverse' : ''}`}>

              {/* Content Side */}
              <div className={`${point.interactiveChallenge ? 'lg:col-span-12 xl:col-span-7' : 'lg:col-span-6'} space-y-12`}>

                {/* 📍 NEW: LOCATION SNAPSHOT BLOCK - Only for editorial stops */}
                {point.snapshotUrl && (!point.stopType || point.stopType === 'editorial') && (
                  <div className="relative group/snap mb-16">
                    <div className="absolute -top-6 left-0 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Ubicación Exacta / GPS Fix</span>
                    </div>

                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                      <img
                        src={point.snapshotUrl}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover/snap:grayscale-0 group-hover/snap:opacity-100 transition-all duration-700"
                        alt="Ubicación Exacta"
                      />
                      {/* Viewfinder Overlay */}
                      <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/40" />
                      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/40" />
                      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/40" />
                      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/40" />

                      {/* Coordinates Overlay */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-mono text-brand-500 tracking-tighter">
                        LAT: {point.lat.toFixed(6)} • LNG: {point.lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-glow-sm ${point.stopType && point.stopType !== 'editorial'
                      ? 'bg-amber-500 text-black'
                      : 'bg-brand-500 text-white'
                      }`}>
                      {point.stopType === 'wine' && <Wine className="w-6 h-6" />}
                      {point.stopType === 'food' && <Utensils className="w-6 h-6" />}
                      {point.stopType === 'rest' && <Moon className="w-6 h-6" />}
                      {(!point.stopType || point.stopType === 'editorial') && (idx + 1)}
                    </span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                      {point.stopType === 'wine' && 'Pausa: Vino & Vermut'}
                      {point.stopType === 'food' && 'Pausa: Gastronomía'}
                      {point.stopType === 'rest' && 'Pausa: Descanso'}
                      {(!point.stopType || point.stopType === 'editorial') && 'Parada Editorial'}
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter">{point.title}</h3>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-2xl font-serif italic text-white/90 leading-relaxed border-l-4 border-brand-500 pl-10 mb-12">
                    {point.story || "Aquí comienza un nuevo capítulo de nuestra exploración. Detente un momento y observa."}
                  </p>
                  <p className="text-lg text-gray-400 leading-relaxed font-medium">
                    {point.description}
                  </p>
                </div>

                {/* Insight Block */}
                {(!point.stopType || point.stopType === 'editorial') && (
                  <div className="bg-brand-500/10 p-10 rounded-[2rem] border border-brand-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Target className="w-20 h-20 text-brand-500" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brand-500 mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Insight del Autor
                    </h4>
                    <p className="text-xl font-bold text-white relative z-10 leading-snug tracking-tight mb-6">
                      "{point.insight || "El detalle está en lo que decidimos no ignorar."}"
                    </p>

                    {/* Multimedia Player */}
                    {point.insightMultimediaType === 'video' && point.insightMultimediaUrl && (
                      <div className="relative z-10 w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 mt-6">
                        <video
                          src={point.insightMultimediaUrl}
                          controls
                          className="w-full h-full object-cover"
                          poster={`https://picsum.photos/seed/${point.id}_poster/800/450`}
                        />
                      </div>
                    )}

                    {point.insightMultimediaType === 'audio' && point.insightMultimediaUrl && (
                      <div className={`relative z-10 mt-6 bg-black/40 backdrop-blur-md p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${playingPointId === point.id ? 'border-brand-500 shadow-glow-sm' : 'border-white/10'}`}>
                        <button
                          onClick={() => handlePlayAudio(point.id, point.insightMultimediaUrl!)}
                          className={`w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform ${playingPointId === point.id ? 'bg-red-500 animate-pulse' : 'bg-brand-500'}`}
                        >
                          {playingPointId === point.id ? <div className="w-3 h-3 bg-white rounded-sm" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                        </button>
                        <div className="flex-1">
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-brand-500 rounded-full transition-all duration-300 ${playingPointId === point.id ? 'w-full animate-[width_20s_linear]' : 'w-0'}`}></div>
                          </div>
                          <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>{playingPointId === point.id ? 'ESCUCHANDO...' : '00:00'}</span>
                            <span>AUDIO GUÍA</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Micro-Interaction / Quiz */}
                {(!point.stopType || point.stopType === 'editorial') && (
                  <div className={`bg-white/5 p-10 lg:p-14 rounded-[2.5rem] border border-white/10 backdrop-blur-sm transition-all duration-700 ${point.interactiveChallenge ? 'lg:col-span-12 -mx-[6%] lg:mx-0 lg:my-20' : ''}`}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8 flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-brand-500" /> {point.interactiveChallenge ? 'Misión Interactiva' : 'Desafío de Observación'}
                    </h4>

                    {point.interactiveChallenge ? (
                      <RiddleChallenge
                        codedText={point.interactiveChallenge.codedText}
                        solution={point.interactiveChallenge.solution}
                        hint={point.interactiveChallenge.hint}
                      />
                    ) : (
                      <>
                        <p className="text-white font-black text-lg mb-8 uppercase italic leading-tight">{point.challenge || "¿Qué detalle te llama más la atención?"}</p>
                        <button className="w-full bg-white/10 hover:bg-brand-500 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10">Ver Respuesta</button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Media Side */}
              <div className={`${point.interactiveChallenge ? 'lg:col-span-12 xl:col-span-5' : 'lg:col-span-6'} sticky top-32 perspective-1000`}>
                <div
                  className={`relative aspect-[4/5] w-full transition-all duration-700 preserve-3d cursor-pointer ${flippedPoints[point.id] ? 'rotate-y-180' : ''}`}
                  onClick={() => point.stopType && point.stopType !== 'editorial' && toggleFlip(point.id)}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 backface-hidden rounded-[3rem] overflow-hidden shadow-3xl group">
                    <img
                      src={point.mediaUrl || `https://picsum.photos/seed/${point.id}/800/1000`}
                      className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                      alt={point.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                    {/* Info Overlay (Tip or Google Link) */}
                    <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {point.stopType && point.stopType !== 'editorial' ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Pausa: Recomendación del Autor</span>
                            </div>
                            <p className="text-sm font-bold leading-relaxed mb-0">Toca la tarjeta para ver qué pedir y más tips</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <Layers className="w-4 h-4 text-brand-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">Metáfora Editorial</span>
                          </div>
                          <p className="text-sm font-bold leading-relaxed">{point.metaphor || "La ciudad es un lienzo donde cada paso es una pincelada de tu propia historia."}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  {point.stopType && point.stopType !== 'editorial' && (
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#121212] rounded-[3rem] p-12 border border-white/10 shadow-3xl overflow-y-auto flex flex-col">
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-500 mb-2 block">Selección Editorial</span>
                          <h4 className="text-3xl font-black uppercase italic tracking-tighter">Qué hacer aquí</h4>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                          <X className="w-4 h-4" />
                        </div>
                      </div>

                      <ul className="space-y-6 flex-1">
                        {point.recommendations?.map((rec, rIdx) => (
                          <li key={rIdx} className="flex gap-4 items-start group/li">
                            <span className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 border border-brand-500/20">
                              {rIdx + 1}
                            </span>
                            <p className="text-lg font-medium text-white/90 leading-relaxed italic group-hover/li:text-white transition-colors">
                              {rec}
                            </p>
                          </li>
                        )) || <p className="text-gray-500 italic">No hay recomendaciones disponibles aún.</p>}
                      </ul>

                      <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-brand-500 hover:bg-brand-600 text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-glow-sm"
                        >
                          <MapIcon className="w-5 h-5" /> Abrir en Google Maps
                        </a>
                        <p className="text-[9px] text-center font-black uppercase tracking-[0.3em] text-gray-600">Pulsa de nuevo para volver</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ))}
      </section>

      {/* 5. CONCLUSION BLOCK */}
      <section className="py-60 px-[6%] text-center bg-gradient-to-b from-transparent to-brand-500/10">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center animate-pulse shadow-glow">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="editorial-title text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
            Ruta <br />Completada
          </h2>

          <div className="prose prose-invert max-w-none">
            <p className="text-2xl md:text-3xl font-medium text-white/80 italic leading-relaxed">
              "Has visto la ciudad con otros ojos. Ahora este lugar siempre guardará un secreto para ti."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            <button className="bg-white text-black py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-brand-500 hover:text-white transition-all shadow-xl">Desbloquear Badge</button>
            <button
              onClick={onClose}
              className="bg-white/10 border border-white/20 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
            >
              Finalizar Experiencia
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-slow-zoom { animation: slow-zoom 30s ease-out infinite alternate; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .shadow-glow { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
        .shadow-glow-sm { box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.6); }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
};
