
import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, ArrowRight, TrendingUp, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl animate-fade-in flex items-start justify-center pt-20 md:pt-32 px-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
        {/* Input Area */}
        <div className="p-6 md:p-8 border-b border-slate-100">
           <div className="relative flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-slate-400" />
              <input 
                autoFocus
                type="text"
                placeholder="¿Qué quieres descubrir hoy?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-14 text-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
              <button onClick={onClose} className="absolute right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* Results Area */}
        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
           {query.length === 0 ? (
             <div className="space-y-8">
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <TrendingUp className="w-3.5 h-3.5" /> Búsquedas Populares
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {['Rutas de Tapas', 'Street Art Madrid', 'Parques Secretos', 'Running 5k'].map(tag => (
                        <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-full text-sm font-semibold transition-all border border-slate-100">
                           {tag}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <History className="w-3.5 h-3.5" /> Recientes
                   </h3>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-300" />
                            <span className="text-slate-600 font-medium">Arquitectura Modernista</span>
                         </div>
                         <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-4">
                <p className="text-sm text-slate-400 italic">Mostrando resultados para "{query}"...</p>
                {/* Mocked results for demo */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                       <img src={`https://picsum.photos/seed/${i + 10}/100`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-grow">
                       <h4 className="font-bold text-slate-900">Ruta Especial {i}</h4>
                       <p className="text-xs text-slate-500">Madrid • 45 min • ★ 4.9</p>
                    </div>
                    <button className="p-2 bg-white shadow-sm rounded-full text-brand-600"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                ))}
             </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-slate-50 text-center">
           <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
             Presiona <span className="text-slate-600 font-bold">Esc</span> para cerrar
           </p>
        </div>
      </div>
    </div>
  );
};
