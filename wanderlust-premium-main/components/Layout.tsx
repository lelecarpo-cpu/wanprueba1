import React, { useEffect, useState } from 'react';
import { Map, ShoppingCart, Globe, ChevronDown, Search, Command } from 'lucide-react';
import { AVAILABLE_LOCATIONS } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeoLocation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SearchOverlay } from './SearchOverlay';

interface LayoutProps {
  children: React.ReactNode;
  userLocation: GeoLocation;
  onLocationChange: (loc: GeoLocation) => void;
  cartCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, userLocation, onLocationChange, cartCount }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isActive = (path: string) =>
    location.pathname === path ? 'text-white font-black' : 'text-gray-400 hover:text-white transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] font-sans relative overflow-x-hidden">
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-[4%] py-4 ${scrolled ? 'bg-[#141414] shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">

          <div className="flex items-center gap-10">
            <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center mr-2 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-all">
                <Map className="text-white w-5 h-5" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">
                Wander<span className="text-brand-500">lust</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <button onClick={() => navigate('/')} className={isActive('/')}>INICIO</button>
              <button onClick={() => navigate('/categories')} className={isActive('/categories')}>EXPLORAR</button>
              <button onClick={() => navigate('/create')} className={isActive('/create')}>ESTUDIO</button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-white hover:text-brand-500 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 text-[10px] font-black text-white bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-all uppercase tracking-widest">
                <Globe className="w-3.5 h-3.5" />
                <span>{userLocation.name.split(',')[0]}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#181818] rounded border border-white/10 hidden group-hover:block p-2 shadow-2xl overflow-hidden">
                {AVAILABLE_LOCATIONS.map(loc => (
                  <button key={loc.name} onClick={() => onLocationChange(loc)} className="flex items-center w-full px-4 py-2 text-[10px] font-black text-gray-300 hover:bg-white/10 rounded transition-all uppercase tracking-widest text-left">
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 ${loc.name === userLocation.name ? 'bg-brand-500' : 'bg-gray-600'}`}></span>
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/cart')} className="relative text-white hover:text-brand-500 transition-all">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-brand-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[#141414]">{cartCount}</span>}
              </button>

              {user ? (
                <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded bg-brand-500 flex items-center justify-center text-white text-xs font-black overflow-hidden hover:scale-110 transition-all">
                  {user.email?.substring(0, 2).toUpperCase()}
                </button>
              ) : (
                <button onClick={() => navigate('/auth')} className="bg-white text-black px-4 py-1.5 rounded text-xs font-black hover:bg-white/90 transition-colors uppercase tracking-widest">Entrar</button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-[#141414] text-gray-400 py-10 px-[4%] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">© 2025 Wanderlust Premium - Piezas Editoriales Caminables</p>
        </div>
      </footer>
    </div>
  );
};
