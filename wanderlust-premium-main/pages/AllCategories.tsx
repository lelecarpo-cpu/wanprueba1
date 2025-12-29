import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_METADATA, getCategoryImage } from '../constants';
import { SEOHelmet } from '../components/SEOHelmet';
import { ArrowRight, Building, Scroll, User, Compass, Flag } from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'Arquitectura': Building,
  'Historia Urbana': Scroll,
  'Miradas Personales': User,
  'Recorridos Inesperados': Compass,
  'Yincanas': Flag,
};

export const AllCategories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#141414] min-h-screen text-white pt-32 pb-20 overflow-x-hidden">
      <SEOHelmet
        title="Categorías Editoriales | Wanderlust"
        description="Explora la ciudad a través de nuestras categorías curadas: Arquitectura, Historia Urbana, Miradas Personales y más."
      />

      <div className="max-w-[1400px] mx-auto px-[6%]">

        <div className="mb-32">
          <h1 className="editorial-title text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic mb-12">
            <span className="block translate-y-full animate-slide-up">
              Categorías
            </span>
            <span className="block md:pl-32 translate-y-full animate-slide-up [animation-delay:100ms] text-brand-500">
              Editoriales
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed font-medium border-l-2 border-brand-500 pl-8 translate-y-10 opacity-0 animate-fade-in [animation-delay:400ms]">
            Nuestro catálogo se organiza por miradas, no por geografía. Cada categoría ofrece una forma distinta de observar, aprender y habitar el entorno urbano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Object.entries(CATEGORY_METADATA).map(([key, meta], index) => {
            const Icon = CATEGORY_ICONS[key] || Compass;
            return (
              <div
                key={key}
                onClick={() => navigate(`/category/${encodeURIComponent(key)}`)}
                className="group cursor-pointer bg-white/5 rounded border border-white/10 overflow-hidden hover:border-brand-500 transition-all duration-500 flex flex-col shadow-2xl"
              >
                <div className="h-64 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                  <img
                    src={getCategoryImage(key as any, index)}
                    alt={key}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 z-20 bg-brand-500 p-3 rounded shadow-xl group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="p-10 flex-grow flex flex-col">
                  <h2 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tight group-hover:text-brand-500 transition-colors">{key}</h2>
                  <p className="text-gray-400 mb-8 flex-grow leading-relaxed font-medium text-sm">{meta.desc}</p>

                  <div className="flex items-center text-xs font-black uppercase tracking-[0.2em] group-hover:text-brand-500 transition-all">
                    Explorar Catálogo <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vision Section */}
        <div className="mt-32 border-t border-white/10 pt-20">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic mb-8 tracking-tight">El producto es la <span className="text-brand-500">Ruta</span></h2>
              <p className="text-gray-400 leading-relaxed font-medium text-lg mb-8">
                No somos una app de mapas ni un buscador de puntos turísticos. Somos una editorial de experiencias físicas. Cada ruta es una pieza cerrada, producida con rigor y diseñada para ser caminada.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded border border-white/10">
                  <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest mb-3">01. Curaduría</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">Contenido producido internamente con expertos.</p>
                </div>
                <div className="bg-white/5 p-6 rounded border border-white/10">
                  <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest mb-3">02. Observación</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">Diseñado para activar la atención del usuario.</p>
                </div>
              </div>
            </div>
            <div className="aspect-square bg-white/5 rounded border border-white/10 p-2 relative overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1000"
                className="w-full h-full object-cover rounded opacity-40 group-hover:scale-105 transition-all duration-1000"
                alt="City Observation"
              />
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <div className="text-center">
                  <h3 className="text-3xl font-black uppercase italic leading-none mb-2 select-none">La ciudad es un <br />espacio participativo</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

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