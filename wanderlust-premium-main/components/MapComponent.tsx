
import React, { useEffect, useRef, useState } from 'react';
import { RoutePoint } from '../types';

declare var google: any;

interface MapProps {
  center: { lat: number, lng: number };
  zoom?: number;
  points?: RoutePoint[];
  editable?: boolean;
  onAddPoint?: (lat: number, lng: number) => void;
  onSelectPoint?: (id: string) => void;
  selectedPointId?: string;
  className?: string;
  isIllustrated?: boolean;
}

// Estilo de mapa tipo Ilustración (Colores planos, sin etiquetas de POI)
const ILLUSTRATED_STYLE = [
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
  { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
  { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f4f5" }] },
  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
  { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
  { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#d2e5f9" }, { "visibility": "on" }] }
];

export const MapComponent: React.FC<MapProps> = ({ 
  center, 
  zoom = 14, 
  points = [], 
  editable = false, 
  onAddPoint,
  onSelectPoint,
  selectedPointId,
  className = "w-full h-full",
  isIllustrated = false
}) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        setIsApiLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isApiLoaded || !containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: center,
        zoom: zoom,
        disableDefaultUI: true,
        styles: isIllustrated ? ILLUSTRATED_STYLE : []
      });

      mapRef.current.addListener('click', (e: any) => {
        if (editable && onAddPoint) onAddPoint(e.latLng.lat(), e.latLng.lng());
      });
    } else {
      mapRef.current.panTo(center);
    }
  }, [isApiLoaded, center, zoom, isIllustrated]);

  useEffect(() => {
    if (!isApiLoaded || !mapRef.current) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const path: any[] = [];
    const bounds = new google.maps.LatLngBounds();

    points.forEach((p, index) => {
      const pos = { lat: p.lat, lng: p.lng };
      path.push(pos);
      bounds.extend(pos);

      const marker = new google.maps.Marker({
        position: pos,
        map: mapRef.current,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: "10px",
          fontWeight: "900"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#712bf5",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
          scale: 12,
        },
        zIndex: 100
      });
      markersRef.current.push(marker);
    });

    if (path.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#712bf5',
        strokeOpacity: 0,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3, strokeColor: '#712bf5' },
          offset: '0',
          repeat: '20px'
        }],
        map: mapRef.current
      });

      if (!editable) mapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [isApiLoaded, points, selectedPointId, editable]);

  return <div ref={containerRef} className={className} />;
};
