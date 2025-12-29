import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteModel, GeoLocation, CategoryType } from '../types';
import { CATEGORY_METADATA, getCategoryColor } from '../constants';
import { Play, Info, Clock, MapPin, ChevronRight, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { SEOHelmet } from '../components/SEOHelmet';

interface HomeProps {
  location: GeoLocation;
  routes: RouteModel[];
  addToCart: (route: RouteModel) => void;
}

export const Home: React.FC<HomeProps> = ({ routes }) => {
  const navigate = useNavigate();
  // Carousel State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  // Auto-rotation effect (DISABLED)
  /*
  useEffect(() => {
    if (routes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % routes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [routes]);
  */

  // Fixed featured route as per user request
  const featuredRoute = useMemo(() => {
    return routes.find(r => r.title.toLowerCase().includes('malasaña')) || routes[0];
  }, [routes]);

  const categories = Object.values(CategoryType);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-brand-500/30">
      <SEOHelmet
        title="Wanderlust | Marketplace Cultural de Rutas Urbanas"
        description="Descubre la ciudad a través de piezas editoriales caminables. Curadas por expertos, diseñadas para curiosos."
        image="https://wanderlust.app/og-home.jpg"
        url="https://wanderlust.app"
      />

      {/* HERO SECTION - EDITORIAL STAGGERED LAYOUT */}
      {featuredRoute && (
        <section key={featuredRoute.id} className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
          {/* Background with subtle zoom animation */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredRoute.thumbnail}
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
              alt={featuredRoute.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="container mx-auto px-[6%] relative z-10 grid grid-cols-12 gap-6 pt-10 md:pt-20">
            {/* Tagline */}
            <div className="col-span-12 mb-2 overflow-hidden">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] translate-y-full animate-slide-up">
                <TrendingUp className="w-3 h-3 text-brand-500" />
                Pieza Destacada • {featuredRoute.category}
              </span>
            </div>

            {/* Main Title - Asymmetrical Staggered */}
            <div className="col-span-12 md:col-span-10 lg:col-span-9 relative z-20">
              <h1 className="editorial-title text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.85] tracking-tighter mb-6 italic uppercase drop-shadow-2xl text-white">
                <span className="block translate-y-full animate-slide-up [animation-delay:100ms]">
                  {featuredRoute.title.split(' ')[0]}
                </span>
                <span className="block text-right md:-mr-12 translate-y-full animate-slide-up [animation-delay:200ms]">
                  {featuredRoute.title.split(' ').slice(1).join(' ')}
                </span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end translate-y-10 opacity-0 animate-fade-in [animation-delay:400ms]">
                <p className="text-lg text-gray-400 font-medium leading-relaxed border-l-2 border-brand-500 pl-6 line-clamp-3">
                  {featuredRoute.description}
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {featuredRoute.durationMin} MIN</span>
                    <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-brand-500 text-brand-500" /> 4.9 RATING</span>
                    <span className="w-px h-3 bg-white/20 mx-2" />
                    <div className="flex items-center gap-2 text-white/80">
                      <img src={featuredRoute.creator.avatar} className="w-5 h-5 rounded-full ring-1 ring-white/20" alt={featuredRoute.creator.name} />
                      <span className="text-[10px] tracking-[0.2em]">Relato por {featuredRoute.creator.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/route/${featuredRoute.id}`)}
                      className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black hover:bg-brand-500 hover:text-white transition-all duration-500 hover:scale-105"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      EMPEZAR
                    </button>
                    <button
                      onClick={() => navigate(`/route/${featuredRoute.id}`)}
                      className="w-14 h-14 flex items-center justify-center rounded-full border border-white/20 hover:border-white transition-colors backdrop-blur-sm"
                    >
                      <Info className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="w-[1px] h-12 bg-white" />
          </div>
        </section>
      )}

      {/* CATEGORY EXPLORER - EDITORIAL GRID */}
      <main className="relative z-20 -mt-10 pb-40">
        <div className="max-w-[1800px] mx-auto px-[4%] space-y-32">
          {categories.map((cat, catIdx) => {
            const categoryRoutes = routes.filter(r => r.category === cat);
            const metadata = CATEGORY_METADATA[cat];
            const color = getCategoryColor(cat).primary;

            if (categoryRoutes.length === 0) return null;

            // Variation in layout based on index
            const isReversed = catIdx % 2 !== 0;

            return (
              <section key={cat} className="group/section">
                {/* Section Header */}
                <div className={`flex flex-col md:flex-row items-end gap-6 mb-16 overflow-hidden ${isReversed ? 'md:flex-row-reverse text-right' : ''}`}>
                  <div className="flex-1">
                    <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white/5 transition-colors group-hover/section:text-white/10 duration-700 select-none">
                      {cat}
                    </h2>
                    <p className="text-sm md:text-base font-bold text-gray-500 mt-[-1rem] md:mt-[-2rem] max-w-sm uppercase tracking-[0.2em] relative z-10 px-2">
                      {metadata.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-500 hover:gap-4 transition-all"
                  >
                    Ver colección <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Editorial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Spotlight Card (Large) */}
                  <div className={`md:col-span-8 group cursor-pointer ${isReversed ? 'md:order-2' : ''}`}
                    onMouseEnter={() => setHoveredRoute(categoryRoutes[0].id)}
                    onMouseLeave={() => setHoveredRoute(null)}
                    onClick={() => navigate(`/route/${categoryRoutes[0].id}`)}>
                    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                      <img
                        src={categoryRoutes[0].thumbnail}
                        className={`w-full h-full object-cover transition-transform duration-1000 ${hoveredRoute === categoryRoutes[0].id ? 'scale-110' : 'scale-100'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                      {/* Floating Info Card */}
                      <div className={`absolute bottom-8 left-8 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl max-w-sm transition-all duration-500 ${hoveredRoute === categoryRoutes[0].id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <h3 className="text-2xl font-black uppercase italic leading-none mb-2">{categoryRoutes[0].title}</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-white/60">
                          <span>{categoryRoutes[0].durationMin} MIN</span>
                          <span className="w-1 h-1 bg-brand-500 rounded-full" />
                          <span>{categoryRoutes[0].location.name.split(',')[0]}</span>
                          <span className="w-1 h-1 bg-brand-500 rounded-full" />
                          <div className="flex items-center gap-2 text-white">
                            <img src={categoryRoutes[0].creator.avatar} className="w-4 h-4 rounded-full" />
                            <span>en colaboracion con {categoryRoutes[0].creator.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Staggered Cards */}
                  <div className="md:col-span-4 flex flex-col gap-8 md:pt-12">
                    {categoryRoutes.slice(1, 3).map((route, i) => (
                      <div key={route.id}
                        className="group/card cursor-pointer"
                        onClick={() => navigate(`/route/${route.id}`)}>
                        <div className="relative aspect-video overflow-hidden rounded-xl mb-4">
                          <img
                            src={route.thumbnail}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/20 transition-colors" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase leading-none mb-2 group-hover/card:text-brand-500 transition-colors">{route.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {route.durationMin} MIN</span>
                          <span className="w-1 h-px bg-white/10 w-2" />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-gray-600 italic normal-case font-medium lowercase">por</span>
                            <span className="text-gray-400">{route.creator.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

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
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};