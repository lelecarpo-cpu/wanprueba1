

export enum CategoryType {
  ARQUITECTURA = 'Arquitectura',
  HISTORIA_URBANA = 'Historia Urbana',
  MIRADAS_PERSONALES = 'Miradas Personales',
  RECORRIDOS_INESPERADOS = 'Recorridos Inesperados',
  YINCANAS = 'Yincanas',
}

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface RoutePoint {
  id: string;
  parentId?: string; // Links this point to a main map point
  lat: number;
  lng: number;
  title: string;
  description: string;
  mediaType: 'text' | 'image' | 'video' | 'audio' | 'none'; // Updated types
  mediaUrl?: string;
  durationMin: number;
  streetViewConfig?: {
    heading: number;
    pitch: number;
    zoom?: number; // Added zoom property
  };
  streetViewTarget?: {
    x: number;
    y: number;
  };
  snapshotUrl?: string; // New field for static street view capture

  // Editorial Fields
  story?: string;
  insight?: string;
  insightMultimediaType?: 'image' | 'video' | 'audio';
  insightMultimediaUrl?: string;
  challenge?: string;
  metaphor?: string;

  // Interactive Challenges
  interactiveChallenge?: {
    type: 'text-puzzle';
    question: string;
    hint: string;
    solution: string;
    codedText: string;
  };

  // Service/Recommended Stops
  stopType?: 'editorial' | 'wine' | 'food' | 'rest';
  recommendations?: string[];
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  routesCount: number;
  bio: string;
  badges: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RouteModel {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryType;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  difficulty: 'Fácil' | 'Moderado' | 'Difícil' | 'Experto';
  distanceKm: number;
  durationMin: number;
  thumbnail: string;
  location: GeoLocation;
  creator: Creator;
  points: RoutePoint[];
  tags: string[];
  status?: 'draft' | 'published';
  tagline?: string; // High-level emotional line
  heroHook?: string; // Initial narrative hook
  recapStory?: string; // Final connection/recap narrative
}

export interface UserState {
  currentLocation: GeoLocation;
  cart: RouteModel[];
  purchasedRoutes: string[]; // IDs
  favorites: string[]; // IDs
}