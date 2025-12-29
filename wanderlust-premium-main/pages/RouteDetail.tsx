import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RouteModel } from '../types';
import {
   Clock, MapPin, ArrowLeft, Play, Lock, Info, BookOpen, User
} from 'lucide-react';
import { SEOHelmet } from '../components/SEOHelmet';
import { JourneyPlayer } from '../components/JourneyPlayer';
import { PurchaseModal } from '../components/PurchaseModal';

interface RouteDetailProps {
   routes: RouteModel[];
   addToCart: (route: RouteModel) => void;
   purchasedRoutes: RouteModel[];
}

export const RouteDetail: React.FC<RouteDetailProps> = ({ routes, addToCart, purchasedRoutes }) => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [isPlaying, setIsPlaying] = useState(false);
   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
   const [localUnlock, setLocalUnlock] = useState(false);

   const route = useMemo(() => {
      const r = routes.find(r => r.id === id);
      if (r && r.points.length > 0) {
         // Mock Data Injection for Verification
         r.points[0].insightMultimediaType = 'video';
         r.points[0].insightMultimediaUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

         if (r.points.length > 1) {
            r.points[1].insightMultimediaType = 'audio';
            r.points[1].insightMultimediaUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
         }
      }
      return r;
   }, [routes, id]);
   const isPurchased = useMemo(() => localUnlock || purchasedRoutes.some(r => r.id === id), [purchasedRoutes, id, localUnlock]);

   if (!route) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-[#141414] text-white">
            <div className="text-center p-12">
               <h2 className="text-2xl font-black mb-4 uppercase italic">Ruta no encontrada</h2>
               <button onClick={() => navigate('/')} className="bg-brand-500 text-white px-8 py-3 rounded font-black uppercase">Volver al Inicio</button>
            </div>
         </div>
      );
   }

   const handlePurchase = () => {
      setShowPurchaseModal(true);
   };

   const confirmPurchase = () => {
      addToCart(route);
      setLocalUnlock(true);
      setShowPurchaseModal(false);
   };

   if (isPlaying && isPurchased) {
      return <JourneyPlayer route={route} onClose={() => setIsPlaying(false)} />;
   }

   return (
      <div className="bg-[#141414] min-h-screen text-white pb-20 overflow-x-hidden">
         <SEOHelmet
            title={route.title}
            description={route.description}
            image={route.thumbnail}
            url={`https://wanderlust.app/route/${route.id}`}
            breadcrumbs={[
               { name: 'Inicio', item: '/' },
               { name: route.category, item: `/category/${encodeURIComponent(route.category)}` },
               { name: route.title, item: `/route/${route.id}` }
            ]}
         />

         <PurchaseModal
            route={route}
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            onConfirm={confirmPurchase}
         />

         {/* HERO HEADER */}
         <div className="relative h-[80vh] w-full overflow-hidden">
            <img
               src={route.thumbnail}
               className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
               alt={route.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />

            <button
               onClick={() => navigate(-1)}
               className="absolute top-28 left-[6%] flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-black hover:bg-white/20 transition-all border border-white/20 uppercase text-[10px] tracking-widest z-20"
            >
               <ArrowLeft className="w-4 h-4" /> Volver
            </button>

            <div className="container mx-auto px-[6%] absolute bottom-20 left-0 right-0 z-10">
               <div className="overflow-hidden mb-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500 text-white text-[10px] font-black rounded-full tracking-[0.2em] uppercase translate-y-full animate-slide-up">
                     {route.category} • {route.location.name.split(',')[0]}
                  </span>
               </div>

               <h1 className="editorial-title text-5xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter uppercase italic max-w-5xl">
                  <span className="block translate-y-full animate-slide-up [animation-delay:100ms]">
                     {route.title.split(' ')[0]}
                  </span>
                  <span className="block md:pl-24 translate-y-full animate-slide-up [animation-delay:200ms]">
                     {route.title.split(' ').slice(1).join(' ')}
                  </span>
               </h1>

               <div className="flex flex-wrap items-center gap-8 text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mt-12 translate-y-10 opacity-0 animate-fade-in [animation-delay:400ms]">
                  <div className="flex items-center gap-2.5">
                     <Clock className="w-4 h-4 text-brand-500" /> {route.durationMin} MIN
                  </div>
                  <div className="flex items-center gap-2.5">
                     <Info className="w-4 h-4 text-brand-500" /> {route.difficulty}
                  </div>
                  <div className="flex items-center gap-2.5">
                     <BookOpen className="w-4 h-4 text-brand-500" /> {route.points?.length || 0} MOMENTOS
                  </div>
               </div>
            </div>
         </div>

         {/* CONTENT GRID */}
         <div className="max-w-[1400px] mx-auto px-[4%] mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* LEFT COLUMN: EDITORIAL */}
            <div className="lg:col-span-8 space-y-12">
               <section>
                  <h2 className="text-xs font-black text-brand-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <span className="w-8 h-px bg-brand-500/30"></span> Nota Editorial
                  </h2>
                  <div className="prose prose-invert max-w-none">
                     <p className="text-xl md:text-2xl font-medium leading-relaxed text-gray-200 italic font-serif">
                        "{route.description}"
                     </p>
                  </div>
               </section>

               <section className="bg-white/5 p-12 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <h2 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                     <span className="w-12 h-px bg-brand-500"></span> Perfil del Autor
                  </h2>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                     <div className="w-32 h-32 rounded-2xl bg-brand-500 overflow-hidden flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-700">
                        {route.creator.avatar ? (
                           <img src={route.creator.avatar} className="w-full h-full object-cover" alt={route.creator.name} />
                        ) : (
                           <User className="w-16 h-16 text-white m-auto" />
                        )}
                     </div>
                     <div className="text-center md:text-left">
                        <h4 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">{route.creator.name}</h4>
                        <p className="text-gray-400 text-base leading-relaxed max-w-xl font-medium">
                           {route.creator.bio || "Experto y colaborador en la creación de piezas editoriales caminables para Wanderlust."}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                           {route.creator.badges?.map(badge => (
                              <span key={badge} className="text-[9px] font-black uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full text-white/40">
                                 {badge}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               <section>
                  <h2 className="text-xs font-black text-brand-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                     <span className="w-8 h-px bg-brand-500/30"></span> Estructura del Recorrido
                  </h2>
                  <div className="space-y-4">
                     {route.points.map((point, idx) => (
                        <div key={point.id} className="flex items-start gap-6 group">
                           <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-[10px] font-black group-hover:border-brand-500 transition-colors">
                                 0{idx + 1}
                              </div>
                              {idx < route.points.length - 1 && (
                                 <div className="w-px h-12 bg-white/10 my-2"></div>
                              )}
                           </div>
                           <div className="pt-1">
                              <h5 className="text-sm font-black uppercase tracking-tight group-hover:text-brand-500 transition-colors">{point.title}</h5>
                              <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">{point.durationMin} min de observación</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            </div>

            {/* RIGHT COLUMN: ACTION */}
            <div className="lg:col-span-4">
               <div className="sticky top-32 bg-white/5 p-10 rounded border border-white/10 backdrop-blur-xl">
                  <div className="mb-8">
                     <p className="text-xs font-black uppercase text-gray-500 tracking-[0.2em] mb-2 text-center">Inversión Cultural</p>
                     <div className="text-5xl font-black text-center italic tracking-tighter">
                        {route.price === 0 ? 'GRATIS' : `${route.price.toFixed(2)}€`}
                     </div>
                  </div>

                  {isPurchased ? (
                     <button
                        onClick={() => setIsPlaying(true)}
                        className="w-full bg-white text-black py-5 rounded font-black shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest"
                     >
                        <Play className="w-5 h-5 fill-black" /> Iniciar Ruta
                     </button>
                  ) : (
                     <button
                        onClick={handlePurchase}
                        className="w-full bg-brand-500 text-white py-5 rounded font-black shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest"
                     >
                        <Lock className="w-4 h-4" />
                        {route.price === 0 ? 'Obtener Acceso' : 'Adquirir Ruta'}
                     </button>
                  )}

                  <p className="text-[10px] text-gray-500 mt-6 text-center leading-relaxed uppercase tracking-widest">
                     Al adquirir esta ruta, desbloqueas una pieza editorial completa y curada para tu exploración urbana.
                  </p>

                  <div className="mt-8 space-y-4">
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Pieza Curada
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Sin Gamificación
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Enfoque Editorial
                     </div>
                  </div>
               </div>
            </div>

         </div>

         <style>{`
            @keyframes slow-zoom {
               0% { transform: scale(1); }
               100% { transform: scale(1.1); }
            }
            @keyframes slide-up {
               0% { transform: translateY(100%); opacity: 0; }
               100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes fade-in {
               0% { opacity: 0; }
               100% { opacity: 1; }
            }
            .animate-slow-zoom { animation: slow-zoom 20s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-fade-in { animation: fade-in 1s ease-out forwards; }
         `}</style>
      </div>
   );
};
