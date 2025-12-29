import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapComponent } from '../components/MapComponent';
import { EditorPanel } from '../components/EditorPanel';
import { StructurePanel } from '../components/StructurePanel';
import { RoutePoint, GeoLocation, CategoryType } from '../types';
import { Trash2, GripVertical, Eye, FileText, Map as MapIcon, Edit3, CornerDownRight, AlertCircle, ArrowLeft, Loader, UploadCloud, Settings, X, Info, Image as ImageIcon, Video, Mic, Type, Camera, RefreshCw, Plus, Play } from 'lucide-react';
import { SEOHelmet } from '../components/SEOHelmet';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JourneyPlayer } from '../components/JourneyPlayer';
import { RouteModel } from '../types';
import { MOCK_CREATOR } from '../constants';

// Declare google global
declare var google: any;

interface CreatorStudioProps {
    location: GeoLocation;
    onRouteUpdated?: () => void;
}

type MobileTab = 'list' | 'map' | 'edit';

// Helper to generate Supabase-compatible UUIDs
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const isValidUUID = (uuid: string) => {
    if (!uuid) return false;
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

// --- FIX START: Robust Sanitize POV Helper ---
const sanitizePov = (config: any) => {
    // Hardcoded safe defaults
    const SAFE_HEADING = 0;
    const SAFE_PITCH = 0;
    const SAFE_ZOOM = 1;

    if (!config || typeof config !== 'object') {
        return { heading: SAFE_HEADING, pitch: SAFE_PITCH, zoom: SAFE_ZOOM };
    }

    // Helper to ensure number is finite
    const getFiniteNumber = (val: any, fallback: number): number => {
        if (val === null || val === undefined) return fallback;
        const num = Number(val);
        // Strict finite check (filters out NaN, Infinity)
        return Number.isFinite(num) ? num : fallback;
    };

    const heading = getFiniteNumber(config.heading, SAFE_HEADING);
    const pitch = getFiniteNumber(config.pitch, SAFE_PITCH);

    // Zoom specific logic: fallback to 1, clamp between 0 and 3
    let zoom = getFiniteNumber(config.zoom, SAFE_ZOOM);
    zoom = Math.max(0, Math.min(3, zoom));

    return { heading, pitch, zoom };
};
// --- FIX END ---

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ location, onRouteUpdated }) => {
    const [points, setPoints] = useState<RoutePoint[]>([]);
    const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'street'>('map');
    const [mobileTab, setMobileTab] = useState<MobileTab>('map');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'drafting' | 'publishing'>('idle');
    const navigate = useNavigate();
    const { user } = useAuth();
    const routerLocation = useRouterLocation();

    const [routeId, setRouteId] = useState<string | null>(null);
    const [routeTitle, setRouteTitle] = useState("Nueva Ruta");
    const [routeCategory, setRouteCategory] = useState<CategoryType>(CategoryType.ARQUITECTURA);
    const [routeDescription, setRouteDescription] = useState("");
    const [routeTagline, setRouteTagline] = useState("");
    const [routeHeroHook, setRouteHeroHook] = useState("");
    const [routeRecapStory, setRouteRecapStory] = useState("");
    const [currentStatus, setCurrentStatus] = useState<'draft' | 'published'>('draft');
    const [showSettings, setShowSettings] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    // New Hotspot States
    const [showHotspotModal, setShowHotspotModal] = useState(false);
    const [tempHotspotLoc, setTempHotspotLoc] = useState<{ lat: number, lng: number, x?: number, y?: number } | null>(null);
    const [newHotspotType, setNewHotspotType] = useState<'text' | 'audio' | 'video' | 'image'>('text');
    const [newHotspotContent, setNewHotspotContent] = useState('');
    const [newHotspotTitle, setNewHotspotTitle] = useState('');

    // Mode inside Street View: 'live' (moving camera) or 'snapshot' (editing static image)
    const [streetMode, setStreetMode] = useState<'live' | 'snapshot'>('live');

    // References
    const streetViewRef = useRef<any>(null);
    const pointsRef = useRef<RoutePoint[]>(points); // Ref to hold latest points for event listeners
    const imageRef = useRef<HTMLImageElement>(null);

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Update points ref whenever points change
    useEffect(() => {
        pointsRef.current = points;
    }, [points]);

    useEffect(() => {
        if (routerLocation.state && (routerLocation.state as any).editRoute) {
            const editRoute = (routerLocation.state as any).editRoute;
            setRouteTitle(editRoute.title);
            if (editRoute.status) setCurrentStatus(editRoute.status);
            if (editRoute.category) setRouteCategory(editRoute.category);
            if (editRoute.description) setRouteDescription(editRoute.description);

            if (editRoute.id && isValidUUID(editRoute.id)) {
                setRouteId(editRoute.id);
                if (editRoute.tagline) setRouteTagline(editRoute.tagline);
                if (editRoute.hero_hook) setRouteHeroHook(editRoute.hero_hook);
                if (editRoute.recap_story) setRouteRecapStory(editRoute.recap_story);
                fetchRoutePoints(editRoute.id);
            } else {
                setRouteId(null);
            }
        }
    }, [routerLocation.state]);

    const fetchRoutePoints = async (id: string) => {
        const { data, error } = await supabase.from('route_points').select('*').eq('route_id', id);
        if (data) {
            const mappedPoints: RoutePoint[] = data.map((p: any) => ({
                id: p.id,
                parentId: p.parent_id,
                lat: p.lat,
                lng: p.lng,
                title: p.title,
                description: p.description,
                mediaType: p.media_type,
                durationMin: p.duration_min,
                streetViewConfig: p.street_view_config,
                streetViewTarget: p.street_view_target,
                mediaUrl: p.media_url,
                snapshotUrl: p.snapshot_url,
                story: p.story,
                insight: p.insight,
                challenge: p.challenge,
                metaphor: p.memory_tip
            }));
            setPoints(mappedPoints);
        }
    };

    const selectedPoint = points.find(p => p.id === selectedPointId);

    const activeParentId = useMemo(() => {
        if (!selectedPoint) return null;
        return selectedPoint.parentId || selectedPoint.id;
    }, [selectedPoint]);

    const activeParentPoint = points.find(p => p.id === activeParentId);
    const hasSnapshot = !!activeParentPoint?.snapshotUrl;

    // Sync streetMode with selected point snapshot status
    useEffect(() => {
        if (hasSnapshot) {
            setStreetMode('snapshot');
        } else {
            setStreetMode('live');
        }
    }, [activeParentId, hasSnapshot]);

    const currentViewSubPoints = useMemo(() =>
        points.filter(p => p.parentId === activeParentId),
        [points, activeParentId]);

    // Points that have snapshots (Scenes)
    const scenes = useMemo(() => points.filter(p => !p.parentId && p.snapshotUrl), [points]);

    const currentRoute = useMemo((): RouteModel | null => {
        if (!user) return null;
        return {
            id: routeId || 'preview',
            title: routeTitle,
            slug: 'preview',
            description: routeDescription,
            category: routeCategory,
            price: 0,
            currency: 'USD',
            rating: 5,
            reviews: 0,
            difficulty: 'Moderado',
            distanceKm: 0,
            durationMin: points.reduce((acc, p) => acc + (p.durationMin || 0), 0),
            thumbnail: activeParentPoint?.snapshotUrl || `https://picsum.photos/seed/${routeId}/800/600`,
            location: location,
            creator: MOCK_CREATOR,
            points: points,
            tags: [],
            status: 'draft'
        };
    }, [routeId, routeTitle, routeDescription, routeCategory, points, activeParentPoint, location, user]);

    // Street View Initialization
    useEffect(() => {
        let initTimer: any = null;
        let povListener: any = null;
        let zoomListener: any = null;
        let debounceTimer: any = null;

        if (viewMode === 'street' && streetMode === 'live' && typeof google !== 'undefined' && activeParentPoint) {
            // Wait for DOM
            initTimer = setTimeout(() => {
                const container = document.getElementById("street-view");
                if (container) {
                    const center = { lat: activeParentPoint.lat, lng: activeParentPoint.lng };

                    const rawConfig = activeParentPoint.streetViewConfig || {};
                    const safeConfig = sanitizePov(rawConfig);

                    // Protección extra explícita antes de crear el objeto
                    const finalZoom = Number.isFinite(safeConfig.zoom) ? safeConfig.zoom : 1;
                    const finalHeading = Number.isFinite(safeConfig.heading) ? safeConfig.heading : 0;
                    const finalPitch = Number.isFinite(safeConfig.pitch) ? safeConfig.pitch : 0;

                    // Initialize Panorama with STRICT separation
                    const panorama = new google.maps.StreetViewPanorama(container, {
                        position: center,
                        // POV object MUST ONLY contain heading and pitch
                        pov: {
                            heading: finalHeading,
                            pitch: finalPitch
                        },
                        // Zoom MUST be a root property of StreetViewPanoramaOptions
                        zoom: finalZoom,
                        linksControl: true,
                        panControl: true,
                        enableCloseButton: false,
                        clickToGo: true,
                        addressControl: false,
                        fullscreenControl: false,
                        motionTracking: false,
                        motionTrackingControl: false,
                        showRoadLabels: false
                    });

                    streetViewRef.current = panorama;

                    const handleViewUpdate = () => {
                        if (!streetViewRef.current) return;

                        // 1. Get POV (Returns { heading, pitch })
                        const currentPov = streetViewRef.current.getPov();
                        // 2. Get Zoom explicitly via getZoom()
                        const currentZoom = streetViewRef.current.getZoom();

                        // Guard: verify we have data
                        if (!currentPov || typeof currentZoom !== 'number') return;

                        // 3. Sanitize both just in case
                        const safeState = sanitizePov({
                            heading: currentPov.heading,
                            pitch: currentPov.pitch,
                            zoom: currentZoom
                        });

                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            setPoints(prevPoints => prevPoints.map(p =>
                                p.id === activeParentId
                                    ? {
                                        ...p,
                                        // Save consolidated config for DB/State
                                        streetViewConfig: {
                                            heading: safeState.heading,
                                            pitch: safeState.pitch,
                                            zoom: safeState.zoom
                                        }
                                    }
                                    : p
                            ));
                        }, 500);
                    };

                    // Add listeners for BOTH pov and zoom changes
                    povListener = panorama.addListener('pov_changed', handleViewUpdate);
                    zoomListener = panorama.addListener('zoom_changed', handleViewUpdate);
                }
            }, 100);
        }

        // Cleanup function
        return () => {
            if (initTimer) clearTimeout(initTimer);
            if (debounceTimer) clearTimeout(debounceTimer);
            if (povListener && typeof google !== 'undefined') google.maps.event.removeListener(povListener);
            if (zoomListener && typeof google !== 'undefined') google.maps.event.removeListener(zoomListener);
        };
    }, [viewMode, streetMode, activeParentId]);

    // Handle Capture Snapshot
    const handleCaptureSnapshot = () => {
        if (!streetViewRef.current || !activeParentPoint) return;

        // Get separated values
        const rawPov = streetViewRef.current.getPov();
        const rawZoom = streetViewRef.current.getZoom();

        const pov = sanitizePov({ ...rawPov, zoom: rawZoom });

        const pos = streetViewRef.current.getPosition();

        // Hardcoded key from index.html
        const apiKey = 'AIzaSyDHN4ut1zwr2MP5KpYC5jH_mkKUIX-_Zxk';

        if (!apiKey) {
            showNotification("Error: API Key no configurada.", 'error');
            return;
        }

        // Safe check for coordinates
        const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
        const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;

        // Construct Static Image URL
        const snapshotUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&heading=${pov.heading}&pitch=${pov.pitch}&fov=90&key=${apiKey}`;

        // Update Parent Point with Snapshot URL AND the current view config
        setPoints(prev => prev.map(p =>
            p.id === activeParentPoint.id
                ? {
                    ...p,
                    snapshotUrl: snapshotUrl,
                    streetViewConfig: {
                        heading: pov.heading,
                        pitch: pov.pitch,
                        zoom: pov.zoom
                    }
                }
                : p
        ));

        setStreetMode('snapshot');
    };

    const handleRetakeSnapshot = () => {
        if (!activeParentPoint) return;
        if (confirm("¿Volver a la cámara en vivo? Podrás tomar una nueva captura.")) {
            setStreetMode('live');
        }
    };

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Access latest points via ref to avoid stale closures
        const currentSubPoints = pointsRef.current.filter(p => p.parentId === activeParentId);

        setTempHotspotLoc({ lat: 0, lng: 0, x, y });
        setNewHotspotTitle(`Info ${currentSubPoints.length + 1}`);
        setNewHotspotContent('');
        setNewHotspotType('text');
        setShowHotspotModal(true);
    };

    const confirmHotspotCreation = () => {
        if (!tempHotspotLoc || !activeParentId) return;

        const newPointId = generateUUID();
        const newPoint: RoutePoint = {
            id: newPointId,
            parentId: activeParentId,
            lat: activeParentPoint?.lat || 0, // Fallback lat/lng
            lng: activeParentPoint?.lng || 0,
            title: newHotspotTitle,
            description: newHotspotType === 'text' ? newHotspotContent : '',
            mediaType: newHotspotType,
            mediaUrl: newHotspotType !== 'text' ? newHotspotContent : undefined,
            durationMin: 0,
            streetViewTarget: { x: tempHotspotLoc.x || 0, y: tempHotspotLoc.y || 0 }
        };

        setPoints(prev => [...prev, newPoint]);
        setSelectedPointId(newPointId);
        setShowHotspotModal(false);
        setTempHotspotLoc(null);

        if (window.innerWidth < 768) {
            setMobileTab('edit');
        }
    };

    const handleAddPoint = (lat: number, lng: number) => {
        const newPoint: RoutePoint = {
            id: generateUUID(),
            lat,
            lng,
            title: `Parada ${points.filter(p => !p.parentId).length + 1}`,
            description: '',
            mediaType: 'none',
            durationMin: 10,
            streetViewConfig: { heading: 0, pitch: 0, zoom: 1 } // Default POV
        };
        setPoints([...points, newPoint]);
        setSelectedPointId(newPoint.id);

        if (window.innerWidth < 768) {
            setMobileTab('edit');
        }
    };

    const updatePoint = (id: string, updates: Partial<RoutePoint>) => {
        setPoints(points.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const removePoint = (id: string) => {
        setPoints(points.filter(p => p.id !== id && p.parentId !== id));
        if (selectedPointId === id) setSelectedPointId(null);
    };

    const handleSaveRoute = async (status: 'draft' | 'published') => {
        if (!user) {
            if (confirm("Debes iniciar sesión para guardar. ¿Ir al login?")) {
                navigate('/auth');
            }
            return;
        }

        if (points.length === 0) {
            showNotification("Añade al menos un punto al mapa.", 'error');
            return;
        }

        setIsSaving(true);
        setSaveStatus(status === 'draft' ? 'drafting' : 'publishing');

        try {
            const routePayload = {
                title: routeTitle,
                slug: routeTitle.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                description: routeDescription || "Ruta creada con Creator Studio",
                category: routeCategory,
                price: 9.99,
                rating: 0,
                reviews: 0,
                difficulty: "Moderado",
                distance_km: 5.0,
                duration_min: points.reduce((acc, p) => acc + (p.durationMin || 0), 0),
                thumbnail: activeParentPoint?.snapshotUrl || `https://picsum.photos/seed/${Date.now()}/800/600`, // Use snapshot as thumbnail if available
                location: location,
                creator_id: user.id,
                tags: ['Nuevo', 'User Generated'],
                status: status,
                tagline: routeTagline,
                hero_hook: routeHeroHook,
                recap_story: routeRecapStory
            };

            let currentRouteId = routeId;

            if (currentRouteId && isValidUUID(currentRouteId)) {
                const { error } = await supabase.from('routes').update(routePayload).eq('id', currentRouteId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('routes').insert(routePayload).select().single();
                if (error) throw error;
                if (data) {
                    currentRouteId = data.id;
                    setRouteId(data.id);
                }
            }

            if (currentRouteId) {
                const { error: deleteError } = await supabase.from('route_points').delete().eq('route_id', currentRouteId);
                if (deleteError) throw deleteError;

                // Create a mapping of old IDs to new robust UUIDs to preserve parent/child relationships
                const idMap = new Map();
                points.forEach(p => {
                    idMap.set(p.id, isValidUUID(p.id) ? p.id : generateUUID());
                });

                const pointsPayload = points.map(p => ({
                    id: idMap.get(p.id),
                    route_id: currentRouteId,
                    parent_id: p.parentId ? idMap.get(p.parentId) : null,
                    lat: p.lat,
                    lng: p.lng,
                    title: p.title || 'Punto sin título',
                    description: p.description || '',
                    media_type: p.mediaType || 'none',
                    duration_min: p.durationMin || 0,
                    street_view_config: p.streetViewConfig || null,
                    street_view_target: p.streetViewTarget || null,
                    media_url: p.mediaUrl || null,
                    story: p.story || null,
                    insight: p.insight || null,
                    challenge: p.challenge || null,
                    memory_tip: p.metaphor || null
                }));

                if (pointsPayload.length > 0) {
                    const { error: pointsError } = await supabase.from('route_points').insert(pointsPayload);
                    if (pointsError) throw pointsError;
                }
            }

            if (onRouteUpdated) onRouteUpdated();

            setCurrentStatus(status);
            showNotification(status === 'published' ? "¡Ruta publicada!" : "Borrador guardado.", 'success');

            if (status === 'published') {
                setTimeout(() => navigate('/profile'), 1500);
            }

        } catch (err: any) {
            console.error("Error saving route:", err);
            showNotification("Error al guardar la ruta. Inténtalo de nuevo.", 'error');
        } finally {
            setIsSaving(false);
            setSaveStatus('idle');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-white/5">
                    <div className="w-16 h-16 bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
                    <p className="text-gray-400 mb-6">Debes iniciar sesión para acceder al estudio.</p>
                    <button onClick={() => navigate('/auth')} className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-brand-500 hover:text-white transition-colors">
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <SEOHelmet
                title="Creator Studio"
                description="Crea y diseña rutas digitales."
                image="https://wanderlust.app/og-studio.jpg"
                url="https://wanderlust.app/create"
            />

            <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-[#0a0a0a] text-white font-sans">
                {/* DARK MODE HEADER */}
                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 p-4 md:p-6 flex justify-between items-center z-30 shrink-0 sticky top-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={routeTitle}
                                onChange={(e) => setRouteTitle(e.target.value)}
                                className="text-xl md:text-2xl font-black text-white bg-transparent border-none focus:ring-0 p-0 placeholder-gray-600 w-64 md:w-96 tracking-tight"
                                placeholder="Título de la ruta..."
                            />
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${currentStatus === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                    {routeId ? (currentStatus === 'published' ? 'Publicado' : 'Borrador') : 'Nueva Ruta'}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    {points.length} Paradas geolocalizadas
                                </span>
                                {isSaving && <Loader className="w-3 h-3 text-brand-500 animate-spin" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${viewMode === 'map' ? 'bg-white/10 shadow-sm text-white border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Plano
                            </button>
                            <button
                                onClick={() => setViewMode('street')}
                                disabled={!activeParentId}
                                className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center ${viewMode === 'street' ? 'bg-white/10 shadow-sm text-white border border-white/5' : 'text-gray-500 hover:text-gray-300 disabled:opacity-30'}`}
                            >
                                <Eye className="w-3 h-3 mr-1.5" /> Inmersivo
                            </button>

                            <div className="w-px h-10 bg-white/10 mx-1"></div>

                            <button
                                onClick={() => setIsPreview(true)}
                                className="px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 text-brand-400 hover:bg-white/10 active:scale-95"
                            >
                                <Play className="w-3 h-3 fill-current" /> Preview
                            </button>
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                            title="Ajustes de la ruta"
                        >
                            <Settings className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handleSaveRoute('draft')}
                            disabled={isSaving}
                            className="hidden sm:flex items-center gap-2 bg-transparent border border-white/20 hover:bg-white/5 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95"
                        >
                            {saveStatus === 'drafting' ? <Loader className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                            Guardar
                        </button>

                        <button
                            onClick={() => handleSaveRoute('published')}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-white text-black hover:bg-brand-500 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-black/50 transition-all active:scale-95 group"
                        >
                            {saveStatus === 'publishing' ? <Loader className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />}
                            <span>Publicar</span>
                        </button>
                    </div>
                </div>

                {/* MOBILE TABS (DARK) */}
                <div className="md:hidden flex bg-[#0a0a0a] border-b border-white/10 px-6 py-2 gap-4">
                    <button onClick={() => setMobileTab('list')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${mobileTab === 'list' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500'}`}>Estructura</button>
                    <button onClick={() => setMobileTab('map')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${mobileTab === 'map' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500'}`}>Mapa</button>
                    <button onClick={() => setMobileTab('edit')} disabled={!selectedPointId} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${mobileTab === 'edit' ? 'border-brand-500 text-white' : 'border-transparent text-gray-600'}`}>Relato</button>
                </div>

                <div className="flex flex-grow h-full overflow-hidden relative">

                    <div className={`w-full md:w-[340px] bg-[#0f172a] border-r border-white/10 flex flex-col overflow-hidden z-20 absolute md:relative inset-0 transition-transform duration-500 ease-in-out ${mobileTab === 'list' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                        <StructurePanel
                            points={points}
                            selectedPointId={selectedPointId}
                            onSelectPoint={(id) => {
                                setSelectedPointId(id);
                                if (window.innerWidth < 768) setMobileTab('edit');
                            }}
                        />
                    </div>

                    <div className={`flex-grow relative bg-[#111] absolute md:relative inset-0 transition-transform duration-300 flex flex-col ${mobileTab === 'map' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                        {viewMode === 'map' ? (
                            <div className="w-full h-full relative group">
                                <MapComponent
                                    center={location}
                                    points={points}
                                    editable={true}
                                    onAddPoint={handleAddPoint}
                                    onSelectPoint={(id) => { setSelectedPointId(id); if (window.innerWidth < 768) setMobileTab('edit'); }}
                                    selectedPointId={selectedPointId || undefined}
                                />
                                <div className="absolute top-6 left-6 pointer-events-none">
                                    <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 animate-fade-in-up">
                                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Modo Diseño de Plano</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`w-full h-full relative overflow-hidden select-none bg-black flex flex-col ${activeParentId ? 'cursor-default' : 'cursor-not-allowed'}`}
                            >
                                {!activeParentId ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-12 text-center">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                                            <Eye className="w-10 h-10 text-gray-500" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 tracking-tight">Experiencia Inmersiva</h3>
                                        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">Selecciona una parada en la estructura de la izquierda para entrar en su mundo visual y añadir detalles.</p>
                                        <button onClick={() => setViewMode('map')} className="mt-8 bg-white text-black hover:bg-brand-500 hover:text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all">Regresar al Plano</button>
                                    </div>
                                ) : (
                                    <>
                                        {/* MAIN EDITOR AREA */}
                                        <div className="flex-grow relative">
                                            {streetMode === 'snapshot' && hasSnapshot ? (
                                                // SNAPSHOT EDITOR MODE
                                                <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                                                    <div className="relative max-w-full max-h-full">
                                                        <img
                                                            ref={imageRef}
                                                            src={activeParentPoint.snapshotUrl}
                                                            alt="Vista capturada"
                                                            className="block max-w-full max-h-full object-contain cursor-crosshair transition-opacity duration-1000"
                                                            style={{ maxHeight: '100%' }}
                                                            onClick={handleImageClick}
                                                            onError={(e) => {
                                                                e.currentTarget.src = "https://images.unsplash.com/photo-1596728328736-220d9134a66e?auto=format&fit=crop&q=80&w=1200";
                                                                e.currentTarget.onerror = null;
                                                            }}
                                                        />
                                                        {currentViewSubPoints.map(sp => {
                                                            if (sp.streetViewTarget?.x !== undefined) {
                                                                return (
                                                                    <div
                                                                        key={sp.id}
                                                                        style={{ left: `${sp.streetViewTarget?.x}%`, top: `${sp.streetViewTarget?.y}%` }}
                                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                                                                        onClick={(e) => { e.stopPropagation(); setSelectedPointId(sp.id); }}
                                                                    >
                                                                        <div className={`w-8 h-8 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transition-all ${selectedPointId === sp.id ? 'bg-brand-500 scale-125' : 'bg-black/50 backdrop-blur-md hover:scale-110'}`}>
                                                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                                        </div>
                                                                        {selectedPointId === sp.id && (
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl whitespace-nowrap animate-fade-in-up">
                                                                                {sp.title}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            }
                                                            return null;
                                                        })}

                                                        {/* Helper Badge Overlay */}
                                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
                                                            <div className="bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-2xl flex items-center gap-3">
                                                                <Edit3 className="w-3.5 h-3.5 text-brand-500" />
                                                                Pulsa sobre la imagen para añadir un detalle inmersivo
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // LIVE STREET VIEW MODE
                                                <div className="relative w-full h-full">
                                                    <div id="street-view" style={{ width: '100%', height: '100%' }} className="opacity-80"></div>

                                                    {/* Overlays for Camera Mode */}
                                                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20"></div>
                                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 pointer-events-none"></div>
                                                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 pointer-events-none"></div>

                                                    <div className="absolute top-8 left-8">
                                                        <div className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                            Live View
                                                        </div>
                                                    </div>

                                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center gap-4">
                                                        <button
                                                            onClick={handleCaptureSnapshot}
                                                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all border-8 border-white/20"
                                                        >
                                                            <div className="w-12 h-12 rounded-full border-4 border-black flex items-center justify-center">
                                                                <Camera className="w-6 h-6 text-black" />
                                                            </div>
                                                        </button>
                                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-lg">Capturar Escena</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* BOTTOM FILMSTRIP GALLERY */}
                                        <div className="h-32 bg-[#0a0a0a] border-t border-white/5 flex items-center px-8 gap-4 overflow-x-auto shrink-0 z-20 custom-scrollbar">
                                            <button
                                                onClick={() => setStreetMode('live')}
                                                className={`shrink-0 w-24 h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${streetMode === 'live' ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                                            >
                                                <RefreshCw className={`w-5 h-5 ${streetMode === 'live' ? 'text-brand-500' : 'text-white/40'}`} />
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cámara</span>
                                            </button>

                                            <div className="w-px h-12 bg-white/10 mx-2"></div>

                                            {scenes.length === 0 ? (
                                                <div className="flex items-center gap-3 opacity-20">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-32 h-20 rounded-2xl bg-white/5 border border-white/10"></div>
                                                    ))}
                                                </div>
                                            ) : (
                                                scenes.map((scene) => (
                                                    <button
                                                        key={scene.id}
                                                        onClick={() => { setSelectedPointId(scene.id); setStreetMode('snapshot'); }}
                                                        className={`shrink-0 w-36 h-20 rounded-2xl border-2 relative overflow-hidden group transition-all ${activeParentId === scene.id && streetMode === 'snapshot' ? 'border-brand-500 ring-4 ring-brand-500/20' : 'border-white/5 hover:border-white/20'}`}
                                                    >
                                                        <img src={scene.snapshotUrl} alt={scene.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                                                            <span className="text-[9px] text-white font-black uppercase tracking-wider truncate block">{scene.title}</span>
                                                        </div>
                                                        {activeParentId === scene.id && streetMode === 'snapshot' && (
                                                            <div className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full shadow-lg"></div>
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setViewMode('map'); }} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full shadow-lg text-white md:hidden z-40 border border-white/20"><ArrowLeft className="w-5 h-5" /></button>
                            </div>
                        )}

                        {viewMode === 'map' && activeParentId && (
                            <button onClick={() => setViewMode('street')} className="absolute bottom-6 right-6 bg-white text-black p-3 rounded-full shadow-xl z-[400] md:hidden border border-white/20"><Eye className="w-6 h-6 text-brand-600" /></button>
                        )}
                    </div>

                    <div className={`w-full md:w-[380px] bg-[#0f172a] border-l border-white/10 flex flex-col overflow-hidden z-20 absolute md:relative inset-0 transition-transform duration-500 ease-in-out shadow-2xl md:shadow-none ${mobileTab === 'edit' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                        <EditorPanel
                            point={selectedPoint || null}
                            onChange={updatePoint}
                            onDelete={removePoint}
                            onClose={() => setMobileTab('map')}
                            isGlobalEditorial={selectedPointId === 'route-editorial'}
                            routeEditorial={{
                                title: routeTitle,
                                tagline: routeTagline,
                                heroHook: routeHeroHook,
                                recapStory: routeRecapStory,
                                description: routeDescription
                            }}
                            onRouteEditorialChange={(updates) => {
                                if (updates.title !== undefined) setRouteTitle(updates.title);
                                if (updates.tagline !== undefined) setRouteTagline(updates.tagline);
                                if (updates.heroHook !== undefined) setRouteHeroHook(updates.heroHook);
                                if (updates.recapStory !== undefined) setRouteRecapStory(updates.recapStory);
                                if (updates.description !== undefined) setRouteDescription(updates.description);
                            }}
                        />
                    </div>
                </div>

                {/* Hotspot Creation Modal (DARK) */}
                {showHotspotModal && (
                    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up ring-1 ring-white/10 border border-white/10">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500">
                                            <Edit3 className="w-4 h-4" />
                                        </div>
                                        Nuevo Detalle
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 ml-10">Enriquece tu experiencia 360</p>
                                </div>
                                <button
                                    onClick={() => setShowHotspotModal(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título del Punto</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={newHotspotTitle}
                                            onChange={(e) => setNewHotspotTitle(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-600 outline-none"
                                            placeholder="Ej. Detalle Arquitectónico..."
                                            autoFocus
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors pointer-events-none">
                                            <Type className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo de Contenido</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { id: 'text', icon: Type, label: 'Texto' },
                                            { id: 'audio', icon: Mic, label: 'Audio' },
                                            { id: 'video', icon: Video, label: 'Video' },
                                            { id: 'image', icon: ImageIcon, label: 'Imagen' }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setNewHotspotType(type.id as any)}
                                                className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-300 group ${newHotspotType === type.id ? 'bg-brand-500/10 border-brand-500 text-brand-400 shadow-xl shadow-brand-500/10 scale-105 ring-1 ring-brand-500/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:bg-white/10'}`}
                                            >
                                                <div className={`p-2.5 rounded-full transition-colors ${newHotspotType === type.id ? 'bg-brand-500 text-white shadow-lg' : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'}`}>
                                                    <type.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-wider">{type.label}</span>
                                                {newHotspotType === type.id && (
                                                    <div className="absolute inset-0 bg-brand-500/5 pointer-events-none"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                        {newHotspotType === 'text' ? 'Contenido del Texto' : 'Enlace URL del Archivo'}
                                    </label>
                                    {newHotspotType === 'text' ? (
                                        <div className="relative group">
                                            <textarea
                                                rows={4}
                                                value={newHotspotContent}
                                                onChange={(e) => setNewHotspotContent(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all placeholder:text-gray-600"
                                                placeholder="Escribe la historia o descripción detallada aquí..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={newHotspotContent}
                                                onChange={(e) => setNewHotspotContent(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 pl-12 text-white font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                                                placeholder="https://..."
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors">
                                                <UploadCloud className="w-5 h-5" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={confirmHotspotCreation}
                                        className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-500 hover:text-white hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-black/20 hover:shadow-brand-500/20 flex items-center justify-center gap-2 group"
                                    >
                                        <span>Añadir a la Experiencia</span>
                                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Modal (DARK) */}
                {showSettings && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up ring-1 ring-white/10 border border-white/20">
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#111]">
                                <h3 className="font-black text-white flex items-center gap-3 text-lg tracking-tight">
                                    <div className="bg-white/10 p-2 rounded-lg text-white shadow-lg">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    Configuración de Ruta
                                </h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoría Principal</label>
                                    <div className="relative group">
                                        <select
                                            value={routeCategory}
                                            onChange={(e) => setRouteCategory(e.target.value as CategoryType)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer hover:bg-black/60"
                                        >
                                            {Object.values(CategoryType).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-gray-300 transition-colors">
                                            <CornerDownRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descripción General</label>
                                    <div className="relative group">
                                        <textarea
                                            value={routeDescription}
                                            onChange={(e) => setRouteDescription(e.target.value)}
                                            rows={5}
                                            placeholder="Describe de qué trata esta ruta y qué la hace especial..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-gray-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all placeholder:text-gray-600"
                                        />
                                        <div className="absolute right-3 bottom-3 text-gray-600 pointer-events-none">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-6 py-3 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-500 hover:text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 hover:shadow-brand-500/20"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Real-time Preview Overlay */}
                {isPreview && currentRoute && (
                    <JourneyPlayer
                        route={currentRoute}
                        onClose={() => setIsPreview(false)}
                    />
                )}

                {/* Custom Notification Toast */}
                {notification && (
                    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in-down pointer-events-none">
                        <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${notification.type === 'success' ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'}`}>
                            {notification.type === 'success' ? <UploadCloud className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-black text-xs uppercase tracking-wider">{notification.message}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};