
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CreatorStudio } from './pages/CreatorStudio';
import { AllCategories } from './pages/AllCategories';
import { CategoryDetail } from './pages/CategoryDetail';
import { RouteDetail } from './pages/RouteDetail';
import { UserProfile } from './pages/UserProfile';
import { Cart } from './pages/Cart';
import { Auth } from './pages/Auth';
import { SessionJoin } from './pages/SessionJoin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AVAILABLE_LOCATIONS, generateMockRoutes, MOCK_CREATOR } from './constants';
import { GeoLocation, RouteModel } from './types';
import { supabase } from './supabaseClient';
import { AIConcierge } from './components/AIConcierge';

// Scroll To Top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// IDs used in Creator Studio and Mock Data
const DEMO_CREATOR_ID_DB = '00000000-0000-0000-0000-000000000000';

const AppContent = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(AVAILABLE_LOCATIONS[0]);
  const [allRoutes, setAllRoutes] = useState<RouteModel[]>([]);
  const [cart, setCart] = useState<RouteModel[]>([]);
  const [favorites, setFavorites] = useState<RouteModel[]>([]);
  const { user } = useAuth();
  const [purchasedRoutes, setPurchasedRoutes] = useState<RouteModel[]>([]);

  const fetchRoutes = useCallback(async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('routes')
        .select(`*, creator:profiles(*)`);

      // Generamos los mocks independientemente
      const mocks = generateMockRoutes(currentLocation);

      if (error || !dbData || dbData.length === 0) {
        setAllRoutes(mocks);
        return;
      }

      const mappedDbRoutes: RouteModel[] = dbData.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        category: item.category,
        price: item.price,
        currency: item.currency,
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        difficulty: item.difficulty,
        distanceKm: item.distance_km,
        durationMin: item.duration_min,
        thumbnail: item.thumbnail,
        location: item.location,
        tags: item.tags || [],
        status: item.status || 'published',
        points: [], // In a full app, we'd fetch points too or include them in the select
        creator: {
          id: item.creator?.id || item.creator_id || DEMO_CREATOR_ID_DB,
          name: item.creator?.name || 'Creador RouteX',
          avatar: item.creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.creator_id}`,
          bio: item.creator?.bio || '',
          badges: item.creator?.badges || ['Verificado'],
          rating: item.creator?.rating || 5.0,
          reviewCount: item.creator?.review_count || 0,
          routesCount: item.creator?.routes_count || 0,
        }
      }));

      // Combinamos ambos: Rutas de DB primero, luego Mocks para rellenar
      // Filtramos duplicados por ID por si acaso
      const combined = [...mappedDbRoutes];
      mocks.forEach(m => {
        if (!combined.find(c => c.id === m.id)) {
          combined.push(m);
        }
      });

      setAllRoutes(combined);
    } catch (err) {
      setAllRoutes(generateMockRoutes(currentLocation));
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const addToCart = (route: RouteModel) => {
    if (!cart.find(r => r.id === route.id) && !purchasedRoutes.find(r => r.id === route.id)) {
      setCart([...cart, route]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCartAndPurchase = () => {
    setPurchasedRoutes([...purchasedRoutes, ...cart]);
    setCart([]);
  };

  const publishedRoutes = useMemo(() => {
    return allRoutes.filter(r => r.status === 'published' || !r.status);
  }, [allRoutes]);

  const createdRoutes = useMemo(() => {
    if (!user) return allRoutes.filter(r => r.creator.id === MOCK_CREATOR.id);
    // Mostramos tanto las del usuario actual como las del MOCK_CREATOR para que el perfil no esté vacío
    return allRoutes.filter(r => r.creator.id === user.id || r.creator.id === MOCK_CREATOR.id);
  }, [allRoutes, user]);

  return (
    <Router>
      <ScrollToTop />
      <Layout
        userLocation={currentLocation}
        onLocationChange={setCurrentLocation}
        cartCount={cart.length}
      >
        <Routes>
          <Route path="/" element={<Home location={currentLocation} routes={publishedRoutes} addToCart={addToCart} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create" element={<CreatorStudio location={currentLocation} onRouteUpdated={fetchRoutes} />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route path="/category/:categoryId" element={<CategoryDetail allRoutes={publishedRoutes} addToCart={addToCart} location={currentLocation} />} />
          <Route path="/route/:id" element={<RouteDetail routes={allRoutes} addToCart={addToCart} purchasedRoutes={purchasedRoutes} />} />
          <Route path="/cart" element={<Cart items={cart} onRemoveItem={removeFromCart} onClearCart={clearCartAndPurchase} />} />
          <Route path="/profile" element={<UserProfile location={currentLocation} purchasedRoutes={purchasedRoutes} favorites={favorites} createdRoutes={createdRoutes} />} />
          <Route path="/join/:sessionId" element={<SessionJoin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <AIConcierge routes={publishedRoutes} />
      </Layout>
    </Router>
  );
};

import { SessionHostProvider } from './components/SessionHost';

export default function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <SessionHostProvider>
          <AppContent />
        </SessionHostProvider>
      </HelmetProvider>
    </AuthProvider>
  );
}
