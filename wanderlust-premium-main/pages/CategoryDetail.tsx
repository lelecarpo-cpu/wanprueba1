import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RouteModel, CategoryType, GeoLocation } from '../types';
import { CATEGORY_METADATA } from '../constants';
import { SEOHelmet } from '../components/SEOHelmet';
import { Clock, MapPin, ArrowLeft } from 'lucide-react';

interface CategoryDetailProps {
  allRoutes: RouteModel[];
  addToCart: (route: RouteModel) => void;
  location: GeoLocation;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({ allRoutes, location }) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const decodedCategory = decodeURIComponent(categoryId || '') as CategoryType;
  const navigate = useNavigate();

  const meta = CATEGORY_METADATA[decodedCategory];

  const filteredRoutes = useMemo(() => {
    return allRoutes.filter(r => r.category === decodedCategory);
  }, [allRoutes, decodedCategory]);

  if (!meta) {
    return (
      <div className="bg-[#141414] min-h-screen text-white flex items-center justify-center p-20 text-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic mb-4">Categoría no encontrada</h2>
          <button onClick={() => navigate('/categories')} className="text-brand-500 font-black uppercase tracking-widest hover:underline">Volver al Catálogo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white pt-32 pb-20 overflow-x-hidden">
      <SEOHelmet
        title={`Explorar ${decodedCategory} | Wanderlust`}
        description={`Las mejores rutas de ${decodedCategory.toLowerCase()} en ${location.name}. ${meta.desc}`}
        image={`https://wanderlust.app/category/${encodeURIComponent(decodedCategory)}.jpg`}
        url={`https://wanderlust.app/category/${encodeURIComponent(decodedCategory)}`}
      />

      {/* HEADER */}
      <div className="max-w-[1400px] mx-auto px-[6%] mb-24">
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center gap-2 text-gray-500 font-black hover:text-white transition-colors uppercase text-[10px] tracking-[0.3em] mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Todas las Categorías
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="flex-1">
            <h1 className="editorial-title text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic mb-8">
              <span className="block translate-y-full animate-slide-up">
                {decodedCategory}
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl text-xl font-medium leading-relaxed border-l-2 border-brand-500 pl-8 translate-y-10 opacity-0 animate-fade-in [animation-delay:400ms]">
              {meta.desc}
            </p>
          </div>

          <div className="bg-white/5 px-10 py-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-w-[200px] backdrop-blur-xl translate-y-10 opacity-0 animate-fade-in [animation-delay:600ms]">
            <span className="text-6xl font-black italic text-white tracking-tighter leading-none mb-2">{filteredRoutes.length}</span>
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Piezas Editoriales</span>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-[1400px] mx-auto px-[4%]">
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-40 bg-white/5 rounded border border-dashed border-white/10">
            <h3 className="text-xl font-black text-gray-500 uppercase italic">No hay rutas disponibles en esta categoría</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-12">
            {filteredRoutes.map(route => (
              <div
                key={route.id}
                onClick={() => navigate(`/route/${route.id}`)}
                className="group cursor-pointer flex flex-col gap-6"
              >
                <div className="aspect-video relative rounded-lg overflow-hidden border border-white/10 group-hover:border-brand-500 transition-all duration-500 shadow-2xl">
                  <img
                    src={route.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    alt={route.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 right-4 bg-brand-500 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                    {route.price === 0 ? 'Gratis' : `${route.price.toFixed(2)}€`}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight group-hover:text-brand-500 transition-colors mb-2">{route.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-brand-500" /> {route.durationMin} min</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-brand-500" /> {route.location.name.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
};