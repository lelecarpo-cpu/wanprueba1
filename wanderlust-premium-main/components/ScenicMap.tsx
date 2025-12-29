import React, { useState, useMemo, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RoutePoint, GeoLocation, CategoryType } from '../types';
import { getCategoryColor } from '../constants';
import { Flag, Camera, Coffee, Info, MapPin, Navigation, Wine, Utensils, Moon, Maximize2, Check } from 'lucide-react';

interface ScenicMapProps {
  points: RoutePoint[];
  baseLocation: GeoLocation;
  activePointId?: string;
  onSelectPoint?: (id: string) => void;
  className?: string;
  showTitle?: boolean;
  showSidebar?: boolean;
  category?: CategoryType;
  interactive?: boolean; // New prop to control interactivity
}

export const ScenicMap: React.FC<ScenicMapProps> = ({
  points,
  baseLocation,
  activePointId,
  onSelectPoint,
  className = "w-full h-full",
  showTitle = true,
  showSidebar = true,
  category,
  interactive = true
}) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: baseLocation.lat,
    longitude: baseLocation.lng,
    zoom: 16,
    pitch: 60,
    bearing: -15
  });
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // State for storing real walking paths between points
  const [routeSegments, setRouteSegments] = useState<Record<number, number[][]>>({});

  const colors = useMemo(() => {
    const c = getCategoryColor(category);
    return c || getCategoryColor();
  }, [category]);

  // Debug Logging
  useEffect(() => {
    console.log('[ScenicMap Debug] Props:', {
      pointsCount: points.length,
      baseLocation,
      activePointId,
      firstPoint: points[0],
      mapboxTokenPresent: !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    });
  }, [points, baseLocation, activePointId]);

  // Fetch walking directions between points
  useEffect(() => {
    const fetchRoutes = async () => {
      if (points.length < 2) return;

      const newSegments: Record<number, number[][]> = {};
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

      if (!MAPBOX_TOKEN) {
        console.warn('Mapbox Token missing, skipping route fetch');
        return;
      }

      // We need to fetch segments: 0->1, 1->2, 2->3...
      const promises = points.slice(0, points.length - 1).map(async (point, index) => {
        const nextPoint = points[index + 1];
        try {
          // Mapbox Directions API
          const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${point.lng},${point.lat};${nextPoint.lng},${nextPoint.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            newSegments[index] = data.routes[0].geometry.coordinates;
          } else {
            // Fallback to straight line if API fails
            newSegments[index] = [[point.lng, point.lat], [nextPoint.lng, nextPoint.lat]];
          }
        } catch (error) {
          console.error(`Error fetching route for segment ${index}:`, error);
          newSegments[index] = [[point.lng, point.lat], [nextPoint.lng, nextPoint.lat]];
        }
      });

      await Promise.all(promises);
      setRouteSegments(newSegments);
    };

    fetchRoutes();
  }, [points]);

  // Determine active index for progressive logic
  const activeIndex = useMemo(() => {
    if (!activePointId) return 0;
    return points.findIndex(p => p.id === activePointId);
  }, [points, activePointId]);

  // Generate GeoJSON Data using real segments
  const routeData = useMemo(() => {
    // Flatten segments relative to their order
    let fullCoordinates: number[][] = [];
    let progressCoordinates: number[][] = [];

    // Construct full route
    for (let i = 0; i < points.length - 1; i++) {
      const segment = routeSegments[i];
      if (segment) {
        fullCoordinates = [...fullCoordinates, ...segment];
      } else {
        // Fallback if segment validation pending
        fullCoordinates.push([points[i].lng, points[i].lat]);
      }
    }

    // Construct progress route (up to activeIndex)
    // If activeIndex is 0 (Point 1), path is empty (we are AT start).
    // If activeIndex is 1 (Point 2), path is Segment 0 (P1->P2).
    // So we take segments 0 to activeIndex - 1.
    for (let i = 0; i < activeIndex; i++) {
      const segment = routeSegments[i];
      if (segment) {
        progressCoordinates = [...progressCoordinates, ...segment];
      }
    }

    // Line for the entire route (Background)
    const fullRouteGeoJSON: any = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: fullCoordinates
      }
    };

    // Line for the progressed route (Foreground)
    const progressRouteGeoJSON: any = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: progressCoordinates
      }
    };

    return { fullRouteGeoJSON, progressRouteGeoJSON };
  }, [points, activeIndex, routeSegments]);


  const getPointIcon = (point: RoutePoint, idx: number) => {
    if (point.stopType === 'wine') return Wine;
    if (point.stopType === 'food') return Utensils;
    if (point.stopType === 'rest') return Moon;

    const icons = [Flag, Camera, Coffee, Info, MapPin, Navigation];
    return icons[idx % icons.length];
  };

  // using the standard light style as requested by user
  const customStyle = "mapbox://styles/mapbox/light-v11";

  // Auto-Center on Active Point
  useEffect(() => {
    if (mapRef.current && activePointId) {
      const activePoint = points.find(p => p.id === activePointId);
      if (activePoint) {
        mapRef.current.flyTo({
          center: [activePoint.lng, activePoint.lat],
          zoom: 17,
          pitch: 60,
          bearing: -20, // Add a slight rotation for style
          duration: 2000,
          essential: true
        });
      }
    }
  }, [activePointId, points]);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  return (
    <div className={`relative bg-[#F8FAFC] overflow-hidden select-none ${className}`}>

      {/* Helper visual for user */}
      {showTitle && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up pointer-events-none">
          <div className="bg-slate-900 text-white px-5 py-2 rounded-full flex items-center gap-3 shadow-xl border border-slate-700">
            <div className="p-1 rounded-full" style={{ backgroundColor: colors?.primary || '#3b82f6' }}>
              <Navigation className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: colors?.primary || '#3b82f6' }}>Mapa Interactivo</span>
          </div>
        </div>
      )}

      <Map
        {...viewState}
        ref={mapRef}
        onMove={interactive ? evt => setViewState(evt.viewState) : undefined}
        style={{ width: '100%', height: '100%' }}
        // TODO: Replace with valid Style URL if this fails. 
        // Format: mapbox://styles/user/style-id
        mapStyle={customStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        scrollZoom={interactive}
        dragPan={interactive}
        dragRotate={interactive}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        fog={{
          range: [0.5, 10],
          color: '#ffffff',
          "horizon-blend": 0.1
        }}
      >
        <NavigationControl position="bottom-right" />

        {/* 3D Buildings Layer */}
        <Layer
          id="3d-buildings"
          source="composite"
          source-layer="building"
          filter={['==', 'extrude', 'true']}
          type="fill-extrusion"
          minzoom={14}
          paint={{
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }}
        />

        {/* 1. LAYER: Full Route Background (Faint) */}
        <Source id="full-route" type="geojson" data={routeData.fullRouteGeoJSON}>
          <Layer
            id="route-background"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            paint={{
              'line-color': '#cbd5e1', // Slate 300
              'line-width': 4,
              'line-opacity': 0.5,
              'line-dasharray': [2, 1]
            }}
          />
        </Source>

        {/* 2. LAYER: Progress Route (Solid) */}
        <Source id="progress-route" type="geojson" data={routeData.progressRouteGeoJSON}>
          <Layer
            id="route-progress"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            paint={{
              'line-color': colors?.primary || '#3b82f6',
              'line-width': 4,
              'line-opacity': 1
            }}
          />
        </Source>


        {points.map((point, index) => {
          const isHovered = hoveredPointId === point.id;
          const isActive = activePointId === point.id;
          const isCompleted = index < activeIndex;
          const isPending = index > activeIndex;

          // State Logic
          let stateClass = '';

          if (isActive) {
            stateClass = 'scale-125 z-50';
          } else if (isCompleted) {
            stateClass = 'scale-90 z-10 grayscale opacity-80';
          } else if (isPending) {
            stateClass = 'scale-90 z-0 opacity-80 grayscale'; // Increased opacity and scale
          }

          if (isHovered) stateClass = 'scale-125 z-50 opacity-100 grayscale-0';

          return (
            <Marker
              key={point.id}
              latitude={point.lat}
              longitude={point.lng}
              anchor="center"
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (!interactive) return;
                e.originalEvent.stopPropagation();
                onSelectPoint?.(point.id);
              }}
            >
              <div
                className={`group transition-all duration-500 cursor-pointer ${interactive ? '' : 'pointer-events-none'}`}
                onMouseEnter={() => interactive && setHoveredPointId(point.id)}
                onMouseLeave={() => interactive && setHoveredPointId(null)}
              >
                <div className={`relative flex flex-col items-center transition-all duration-500 ${stateClass}`}>

                  {/* Active Pulse Ring */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping -z-10 scale-150"></div>
                  )}

                  {/* Image Bubble */}
                  <div
                    className={`w-6 h-5 md:w-8 md:h-6 bg-white p-0.5 rounded-md shadow-lg border-2 mb-[-1px] overflow-hidden transition-colors flex items-center justify-center`}
                    style={{ borderColor: isActive ? (colors?.primary || '#3b82f6') : (isCompleted ? '#64748b' : '#cbd5e1') }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-slate-500" />
                    ) : (
                      <img src={`https://picsum.photos/seed/${point.id}/100/100`} className="w-full h-full object-cover rounded-sm" alt="" />
                    )}
                  </div >

                  {/* Triangle Point */}
                  < div
                    className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px]"
                    style={{ borderTopColor: isActive ? (colors?.primary || '#3b82f6') : (isCompleted ? '#64748b' : '#cbd5e1') }}
                  ></div >

                  {/* Label Badge (Only Active or Hovered) */}
                  {
                    (isActive || isHovered) && (
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[8px] font-bold px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap animate-fade-in-up flex items-center gap-2">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                        {point.title}
                      </div>
                    )
                  }

                  {/* Point Number (Only for Pending) */}
                  {
                    isPending && !isHovered && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[8px] flex items-center justify-center font-bold border border-white">
                        {index + 1}
                      </div>
                    )
                  }
                </div >
              </div >
            </Marker >
          );
        })}
      </Map >

      {/* Sidebar Overlay - Only if interactive and enabled */}
      {
        showSidebar && interactive && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 pointer-events-auto">
            {points.map((p, idx) => {
              const Icon = getPointIcon(p, idx);
              const isHovered = hoveredPointId === p.id;

              return (
                <div
                  key={p.id}
                  className="relative flex items-center justify-end group"
                  onMouseEnter={() => setHoveredPointId(p.id)}
                  onMouseLeave={() => setHoveredPointId(null)}
                  onClick={() => {
                    onSelectPoint?.(p.id);
                    setViewState(prev => ({ ...prev, latitude: p.lat, longitude: p.lng, zoom: 16 }));
                  }}
                >
                  {/* Tooltip */}
                  <div className={`
                        absolute right-full mr-3 bg-white text-slate-800 px-3 py-2 rounded-xl shadow-xl border border-slate-100
                        flex items-center gap-2 transition-all duration-300 origin-right
                        ${isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-90 pointer-events-none'}
                        `}>
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-slate-400">{idx + 1}</span>
                    </div>
                    <div className="whitespace-nowrap">
                      <h1 className="text-xs font-black uppercase tracking-tight">{p.title}</h1>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    className={`
                        w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 relative overflow-hidden
                        ${isHovered ? 'scale-110 text-slate-900' : 'bg-white/90 backdrop-blur border-white text-slate-400 hover:bg-white hover:text-slate-600'}
                    `}
                    style={isHovered ? { backgroundColor: colors?.primary || '#3b82f6', borderColor: colors?.primary || '#3b82f6' } : {}}
                  >
                    <Icon className="w-4 h-4 relative z-10" />
                  </button>
                </div>
              );
            })}

            <div className="relative flex items-center justify-end group mt-2">
              <button
                onClick={() => {
                  if (baseLocation) {
                    setViewState({
                      latitude: baseLocation.lat,
                      longitude: baseLocation.lng,
                      zoom: 14,
                      pitch: 0,
                      bearing: 0
                    });
                  }
                }}
                className="w-8 h-8 rounded-xl bg-slate-200/50 backdrop-blur border border-white text-slate-500 flex items-center justify-center hover:bg-white transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
};