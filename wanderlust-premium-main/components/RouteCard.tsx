
import React from 'react';
import { RouteModel } from '../types';
import { Star, Clock, ArrowRight, MapPin, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RouteCardProps {
  route: RouteModel;
  onAddToCart?: (route: RouteModel) => void;
  compact?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onAddToCart, compact = false }) => {
  const navigate = useNavigate();
  const formattedPrice = route.price === 0 ? 'Gratis' : `$${route.price.toFixed(2)}`;

  return (
    <div 
      className="group relative bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 border border-slate-100 flex flex-col h-full isolate shadow-card"
    >
      {/* Image Section */}
      <div 
        className={`relative ${compact ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-[4/3]'} overflow-hidden cursor-pointer w-full`} 
        onClick={() => navigate(`/route/${route.id}`)}
      >
        <img 
          src={route.thumbnail} 
          alt={route.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />
        
        {/* Gradient Overlay (Suave) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E3440]/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
           <span className="bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl text-[10px] font-black text-[#37474F] uppercase tracking-wider shadow-sm border border-white/50">
             {route.category.split(' ')[0]}
           </span>
           <button className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-[#EF5350] transition-colors shadow-sm">
              <Heart className="w-4 h-4" />
           </button>
        </div>

        {/* Stats on Image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-10">
             <div className="flex gap-2">
               <div className="flex items-center text-[10px] font-black bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
                  <Clock className="w-3 h-3 mr-1.5 text-brand-300" /> {route.durationMin} min
               </div>
             </div>
             <div className="flex items-center bg-[#EF5350] text-white px-2 py-1 rounded-xl shadow-lg">
                <Star className="w-3 h-3 text-white mr-1 fill-white" /> 
                <span className="text-xs font-black">{route.rating.toFixed(1)}</span>
             </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex-grow flex flex-col relative bg-white">
        {/* Creator overlap */}
        <div className="absolute -top-6 right-6">
           <img 
             src={route.creator.avatar} 
             className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg object-cover bg-white" 
             alt={route.creator.name} 
           />
        </div>

        <h3 
            className="font-black text-xl text-[#2E3440] mb-2 leading-tight group-hover:text-[#26A69A] transition-colors cursor-pointer line-clamp-2 tracking-tight"
            onClick={() => navigate(`/route/${route.id}`)}
        >
          {route.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">{route.description}</p>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
          <div className="flex flex-col">
             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Precio</span>
             <div className="flex items-baseline gap-2">
               <span className="text-2xl font-black text-[#2E3440] tracking-tighter">
                  {formattedPrice}
               </span>
             </div>
          </div>
          
          {onAddToCart && (
               <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(route); }} 
                  className="w-12 h-12 rounded-2xl bg-[#EF5350] text-white flex items-center justify-center transition-all hover:bg-[#D32F2F] hover:shadow-glow hover:scale-110 active:scale-95 group/btn shadow-lg"
                  aria-label="Add to cart"
               >
                 <ArrowRight className="w-5 h-5 group-hover/btn:-rotate-45 transition-transform duration-300" />
               </button>
           )}
        </div>
      </div>
    </div>
  );
};
