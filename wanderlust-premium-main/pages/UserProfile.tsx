import React, { useState, useEffect } from 'react';
import { RouteModel, GeoLocation } from '../types';
import { SEOHelmet } from '../components/SEOHelmet';
import { User, Settings, Heart, Map, Download, LogOut, CreditCard, PenTool, PlusCircle, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  location: GeoLocation;
  purchasedRoutes: RouteModel[];
  favorites: RouteModel[];
  createdRoutes: RouteModel[];
}

type TabType = 'routes' | 'created' | 'favorites' | 'downloads' | 'settings';

export const UserProfile: React.FC<UserProfileProps> = ({ location, purchasedRoutes, favorites, createdRoutes }) => {
  const [activeTab, setActiveTab] = useState<TabType>('routes');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed", error);
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#141414] min-h-screen text-white pt-32 pb-20 overflow-x-hidden">
      <SEOHelmet
        title="Mi Perfil | Wanderlust"
        description="Gestiona tu biblioteca de rutas y configuración."
        image="https://wanderlust.app/og-profile.jpg"
        url="https://wanderlust.app/profile"
      />

      <div className="max-w-[1400px] mx-auto px-[4%]">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-10 mb-16 border-b border-white/10 pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="w-32 h-32 rounded bg-brand-500 flex items-center justify-center text-white text-4xl font-black uppercase italic shadow-2xl">
              {user.email?.substring(0, 2)}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-2">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-500" /> {location.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-all px-6 py-2 rounded border border-white/10 uppercase text-[10px] font-black tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>

        {/* PROFILE STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/5 p-8 rounded border border-white/10">
            <span className="block text-3xl font-black italic tracking-tighter mb-1">{purchasedRoutes.length}</span>
            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Adquisiciones</span>
          </div>
          <div className="bg-white/5 p-8 rounded border border-white/10">
            <span className="block text-3xl font-black italic tracking-tighter mb-1">{createdRoutes.length}</span>
            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Producciones</span>
          </div>
          <div className="bg-white/5 p-8 rounded border border-white/10">
            <span className="block text-3xl font-black italic tracking-tighter mb-1">{favorites.length}</span>
            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Favoritos</span>
          </div>
          <div className="bg-white/5 p-8 rounded border border-white/10">
            <span className="block text-3xl font-black italic tracking-tighter mb-1">PRO</span>
            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Nivel de Acceso</span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-10 border-b border-white/5 mb-12 overflow-x-auto no-scrollbar">
          {['routes', 'created', 'favorites', 'downloads', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`pb-6 px-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500 hover:text-white'}`}
            >
              {tab === 'routes' ? 'MI BIBLIOTECA' : tab === 'created' ? 'MIS PRODUCCIONES' : tab === 'favorites' ? 'FAVORITOS' : tab === 'downloads' ? 'OFFLINE' : 'Ajustes'}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[40vh]">
          {activeTab === 'routes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {purchasedRoutes.length > 0 ? (
                purchasedRoutes.map(route => (
                  <div key={route.id} onClick={() => navigate(`/route/${route.id}`)} className="group cursor-pointer flex flex-col gap-4">
                    <div className="aspect-video rounded overflow-hidden border border-white/10 group-hover:border-brand-500 transition-all duration-500">
                      <img src={route.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
                    </div>
                    <h4 className="font-black uppercase italic tracking-tight group-hover:text-brand-500 transition-colors">{route.title}</h4>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 bg-white/5 rounded border border-dashed border-white/10 text-center">
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-6">Tu biblioteca está vacía</p>
                  <button onClick={() => navigate('/')} className="bg-white text-black px-8 py-3 rounded font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all">Explorar Catálogo</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'created' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div
                onClick={() => navigate('/create')}
                className="aspect-video rounded border-2 border-dashed border-white/10 hover:border-brand-500 group transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <PlusCircle className="w-10 h-10 text-brand-500 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">Nueva Producción</span>
              </div>
              {createdRoutes.map(route => (
                <div key={route.id} onClick={() => navigate('/create', { state: { editRoute: route } })} className="group cursor-pointer flex flex-col gap-4 relative">
                  <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm text-[8px] font-black px-2 py-0.5 rounded tracking-widest uppercase border border-white/10">
                    {route.status || 'Borrador'}
                  </div>
                  <div className="aspect-video rounded overflow-hidden border border-white/10 group-hover:border-brand-500 transition-all duration-500">
                    <img src={route.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="" />
                  </div>
                  <h4 className="font-black uppercase italic tracking-tight group-hover:text-brand-500 transition-colors">{route.title}</h4>
                </div>
              ))}
            </div>
          )}

          {/* Other tabs simplified for MVP look */}
          {(activeTab === 'favorites' || activeTab === 'downloads' || activeTab === 'settings') && (
            <div className="max-w-2xl bg-white/5 p-12 rounded border border-white/10 text-center">
              <Settings className="w-12 h-12 text-brand-500 mx-auto mb-6" />
              <h3 className="text-xl font-black uppercase italic mb-4">Sección Reservada</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                Como parte del MVP editorial, estamos priorizando la experiencia de navegación y consumo de rutas. Esta sección estará disponible en futuras versiones.
              </p>
              <button onClick={() => navigate('/')} className="text-brand-500 font-black uppercase tracking-[0.2em] text-xs hover:underline">Volver al Marketplace</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
