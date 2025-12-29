

import { CategoryType, RouteModel, Creator, GeoLocation, RoutePoint } from './types';

export interface CityLocation extends GeoLocation {
  shapePath: string; // SVG path en coordenadas 0-100
  bounds: { // Límites geográficos reales para la proyección
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  mapImage?: string; // Optional static 3D map image
  snapshotUrl?: string; // New field for static street view capture
  story?: string; // Narrative storytelling for this stop
  insight?: string; // Key learning or observation insight
  challenge?: string; // Micro-interaction challenge/quiz
  memoryTip?: string; // Suttle tip for memorization
}

export const AVAILABLE_LOCATIONS: CityLocation[] = [
  {
    lat: 40.4168,
    lng: -3.7038,
    name: 'Madrid, España',
    // Bounding box de la Comunidad de Madrid Completa
    // N: 41.17 (Somosierra), S: 39.88 (Aranjuez), W: -4.58 (Cenicientos), E: -3.05 (Estremera)
    bounds: {
      minLat: 39.8800,
      maxLat: 41.1700,
      minLng: -4.5800,
      maxLng: -3.0500
    },
    // Silueta detallada de la Comunidad de Madrid
    shapePath: "M48.5,1.5 C52,3.5 58,9 62,12 C66,15 75,19 78,21 C81,23 90,28 92,31 C94,34 98,45 98,49 C98,53 94,62 91,66 C88,70 78,78 76,80 C74,82 61,94 59,96 C57,98 52,99 49,97 C46,95 40,89 37,86 C34,83 22,75 19,72 C16,69 4,58 3,55 C2,52 2,44 4,40 C6,36 15,26 18,23 C21,20 31,12 34,10 C37,8 45,1 48.5,1.5 Z",
    mapImage: "/public/assets/maps/madrid-3d.jpg"
  },
  {
    lat: 19.4326,
    lng: -99.1332,
    name: 'Ciudad de México, MX',
    bounds: {
      minLat: 19.3900,
      maxLat: 19.4700,
      minLng: -99.1800,
      maxLng: -99.1000
    },
    shapePath: "M25,20 L75,20 L90,50 L75,85 L25,85 L10,50 Z"
  },
  {
    lat: 4.6097,
    lng: -74.0817,
    name: 'Bogotá, Colombia',
    bounds: {
      minLat: 4.5500,
      maxLat: 4.6500,
      minLng: -74.1200,
      maxLng: -74.0400
    },
    shapePath: "M30,15 L70,15 L85,45 L75,85 L45,95 L20,65 Z"
  },
];

export const CATEGORY_METADATA: Record<CategoryType, { icon: string, imageKeyword: string, desc: string }> = {
  [CategoryType.ARQUITECTURA]: { icon: 'Building', imageKeyword: 'architecture', desc: 'Aprende a reconocer estilos arquitectónicos mediante la observación y comparación.' },
  [CategoryType.HISTORIA_URBANA]: { icon: 'Scroll', imageKeyword: 'history', desc: 'Camina la ciudad y descubre por qué es como es hoy, explorándola con una nueva mirada.' },
  [CategoryType.MIRADAS_PERSONALES]: { icon: 'User', imageKeyword: 'portrait', desc: 'La ciudad vista desde la experiencia individual y la firma de autores.' },
  [CategoryType.RECORRIDOS_INESPERADOS]: { icon: 'Compass', imageKeyword: 'street', desc: 'Evita lo convencional y descubre lo cotidiano, lo intermedio y lo que suele pasarse por alto.' },
  [CategoryType.YINCANAS]: { icon: 'Flag', imageKeyword: 'puzzle', desc: 'Exploraciones activas con acertijos contextuales y decisiones para activar tu atención.' },
};

export const getCategoryImage = (category: CategoryType, index: number): string => {
  const keyword = CATEGORY_METADATA[category]?.imageKeyword || 'travel';
  return `https://picsum.photos/seed/${category}-${index}/800/600?${keyword}`;
};

export const MOCK_CREATOR: Creator = {
  id: 'c1',
  name: 'Lele Carpo',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeleCarpo',
  rating: 5.0,
  reviewCount: 342,
  routesCount: 130,
  bio: 'Explorador urbano apasionado por la historia y la fotografía. Mis rutas están diseñadas para descubrir lo que no sale en las guías.',
  badges: ['Verificado', 'Creador Top', 'Guía Local']
};

export const generateMockRoutes = (baseLocation: GeoLocation): RouteModel[] => {
  const routes: RouteModel[] = [];
  const categories = Object.values(CategoryType);

  const routeNames: Record<CategoryType, string[]> = {
    [CategoryType.ARQUITECTURA]: [
      "Arquitectura caminada: de la defensa al espectáculo",
      "El ladrillo y el cielo: Madrid industrial",
      "Modernismo escondido en las calles",
      "Fachadas que hablan: un recorrido visual",
      "Utopías urbanas y bloques de hormigón"
    ],
    [CategoryType.HISTORIA_URBANA]: [
      "Cuando Madrid dejó de ser pequeña",
      "El rastro de las murallas invisibles",
      "La ciudad que fue río: Manzanares",
      "Barrios que nacieron de la necesidad",
      "Evolución del centro: de plaza en plaza"
    ],
    [CategoryType.MIRADAS_PERSONALES]: [
      "Caminar Madrid como si ya vivieras aquí",
      "La ciudad de los poetas olvidados",
      "Mi barrio, mi refugio: Malasaña",
      "Madrid a través de los ojos de un músico",
      "Rincones de lectura en el asfalto"
    ],
    [CategoryType.RECORRIDOS_INESPERADOS]: [
      "Lo que queda entre los monumentos",
      "Patios y pasajes: la ciudad interior",
      "Detalles mínimos: el arte de lo pequeño",
      "Madrid periférico: belleza en lo cotidiano",
      "Sombras y reflejos: la ciudad a otra hora"
    ],
    [CategoryType.YINCANAS]: [
      "Aprender a mirar la ciudad",
      "El enigma de los escudos perdidos",
      "Decisiones urbanas: elige tu camino",
      "Rastreadores de historias en Chamberí",
      "El juego de las proporciones invisibles"
    ]
  };

  const spreadFactor = baseLocation.name.includes('Madrid') ? 0.05 : 0.04;

  categories.forEach((cat, catIdx) => {
    const titles = routeNames[cat] || ["Ruta Editorial I", "Ruta Editorial II", "Ruta Editorial III", "Ruta Editorial IV", "Ruta Editorial V"];

    for (let i = 0; i < titles.length; i++) {
      const routeId = `r-${catIdx}-${i}`;
      const title = titles[i];

      const points: RoutePoint[] = Array.from({ length: 6 }).map((_, pIdx) => {
        const latOffset = (Math.random() - 0.5) * spreadFactor;
        const lngOffset = (Math.random() - 0.5) * spreadFactor;

        // Custom Injection for Malasaña Moment 2
        if (title.includes('Malasaña') && pIdx === 1) {
          return {
            id: `${routeId}-p${pIdx}`,
            lat: baseLocation.lat + latOffset,
            lng: baseLocation.lng + lngOffset,
            title: `Parada 2: El Enigma del Cuaderno`,
            description: `Encuentras un cuaderno viejo olvidado en un banco de la Plaza del Dos de Mayo. Contiene un mensaje cifrado que parece guiar hacia algo importante.`,
            story: `Malasaña es un barrio de secretos compartidos. Los mensajes en las paredes a veces se trasladan al papel, y este cuaderno es prueba de ello. ¿Serás capaz de descifrar la última voluntad del autor?`,
            insight: `La observación no solo es visual, es intelectual. A veces lo que vemos es solo una máscara de la verdad.`,
            challenge: `Descifra el mensaje del cuaderno. Todas las vocales han sido sustituidas por O y las Q por K.`,
            metaphor: `Malasaña es un barrio de secretos compartidos. Los mensajes en las paredes a veces se trasladan al papel, y este cuaderno es prueba de ello. ¿Serás capaz de descifrar la última voluntad del autor?`,
            mediaType: 'none',
            durationMin: 15,
            interactiveChallenge: {
              type: 'text-puzzle',
              question: '¿Cuál es la frase real descifrada?',
              hint: 'Sustituye cada O por la vocal que mejor encaje y las K por Q.',
              solution: 'EL TESORO QUE INTENTAS ENCONTRAR SE ENCUENTRA EN LA GRAN CIUDAD AL FINAL DEL NILO',
              codedText: 'OL TOSORO KOO\nONTONTOS\nONKONTROR SO\nONKOONTRO ON LO\nGRON COODOD OL\nFONOL DOL NOLO'
            },
            snapshotUrl: `https://picsum.photos/seed/${routeId}-p${pIdx}-snap/1200/800`
          };
        }

        return {
          id: `${routeId}-p${pIdx}`,
          lat: baseLocation.lat + latOffset,
          lng: baseLocation.lng + lngOffset,
          title: `Parada ${pIdx + 1}: Observación`,
          description: `Una pausa para analizar el entorno y comprender un detalle específico del paisaje urbano.`,
          story: `¿Sabías que este rincón de ${baseLocation.name.split(',')[0]} esconde una historia de hace más de 200 años? La luz aquí cae de forma única a esta hora, revelando texturas que suelen pasar desapercibidas.`,
          insight: `Fíjate en la proporción de los vanos; reflejan la transición entre la necesidad defensiva y la apertura a la luz modernista.`,
          challenge: `Encuentra el escudo tallado en la piedra sobre la puerta principal. ¿Cuántas estrellas tiene?`,
          metaphor: `El pasado es un eco que rebota en las fachadas de hoy. Escucha los detalles.`,
          mediaType: 'none',
          durationMin: 10 + Math.floor(Math.random() * 10),
          snapshotUrl: `https://picsum.photos/seed/${routeId}-p${pIdx}-snap/1200/800`
        };
      });

      // Inject Recommended Stop in Malasaña after Point 2
      if (title.includes('Malasaña')) {
        const wineStop: RoutePoint = {
          id: `${routeId}-p-wine`,
          lat: points[1].lat + 0.001,
          lng: points[1].lng + 0.001,
          title: "Pausa en La Ardosa",
          description: "La taberna más icónica de Malasaña para un vermut y su famosa tortilla.",
          story: "No se puede entender Malasaña sin sus tabernas centenarias. La Ardosa es el refugio perfecto para procesar lo aprendido mientras te sumerges en la solera del barrio.",
          insight: "A veces el mejor insight viene acompañado de un buen vino y una ración de tortilla.",
          mediaType: 'none',
          durationMin: 30,
          stopType: 'wine',
          snapshotUrl: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&q=80&w=800",
          recommendations: [
            "Prueba su famosa tortilla de patatas (poco hecha)",
            "Pide un Vermut de grifo servido con su aceituna y sifón",
            "Fíjate en la colección de botellas de cerveza de todo el mundo",
            "Si está lleno, no te rindas, ¡siempre hay un hueco al fondo!"
          ]
        };
        points.splice(2, 0, wineStop);
      }

      // Assign local premium covers where available, fallback to reused premium assets
      let thumbnail = '';

      if (cat === CategoryType.ARQUITECTURA) {
        if (i === 0) thumbnail = '/assets/covers/r-0-0.png';
        else if (i === 1) thumbnail = '/assets/covers/r-0-1.png';
        else if (i === 2) thumbnail = '/assets/covers/r-0-2.png';
        else thumbnail = '/assets/covers/r-0-0.png';
      } else if (cat === CategoryType.HISTORIA_URBANA) {
        if (i === 0) thumbnail = '/assets/covers/r-1-0.png';
        else thumbnail = '/assets/covers/r-0-1.png';
      } else if (cat === CategoryType.MIRADAS_PERSONALES) {
        if (i === 0) thumbnail = '/assets/covers/r-2-0.png';
        else thumbnail = '/assets/covers/r-0-2.png';
      } else if (cat === CategoryType.RECORRIDOS_INESPERADOS) {
        if (i === 0) thumbnail = '/assets/covers/r-3-0.png';
        else thumbnail = '/assets/covers/r-0-0.png';
      } else if (cat === CategoryType.YINCANAS) {
        if (i === 0) thumbnail = '/assets/covers/r-4-0.png';
        else thumbnail = '/assets/covers/r-4-0.png';
      } else {
        thumbnail = '/assets/covers/r-0-0.png';
      }

      routes.push({
        id: routeId,
        title: title,
        slug: `${routeId}-slug`,
        description: `Una pieza editorial caminable diseñada para descubrir la ciudad a través de la categoría ${cat.toLowerCase()}.`,
        category: cat,
        price: 9.99 + (i * 2),
        currency: 'EUR',
        rating: 5,
        reviews: 0,
        difficulty: 'Moderado',
        distanceKm: 2 + (i * 0.5),
        durationMin: 45 + (i * 15),
        thumbnail: thumbnail,
        location: baseLocation,
        creator: MOCK_CREATOR,
        points: points,
        tags: ['Nueva'],
        status: 'published',
        tagline: `Un viaje sensorial por la esencia de ${baseLocation.name}`,
        heroHook: `Imagina que las paredes pudieran hablar. En esta ruta por ${baseLocation.name}, te enseñaremos a escuchar lo que los edificios y plazas tienen que decir sobre nuestro pasado y presente.`,
        recapStory: `Has recorrido los rincones más profundos de ${baseLocation.name}. Desde las sombras de los callejones hasta la luz de las fachadas modernistas, ahora llevas contigo una mirada nueva que transformará cada paseo en una historia viva.`
      });
    }
  });

  return routes;
};

export const COLOR_PALETTES: Record<CategoryType, { primary: string, secondary: string, accent: string }> = {
  [CategoryType.ARQUITECTURA]: { primary: '#6366f1', secondary: '#eef2ff', accent: '#4f46e5' }, // Indigo
  [CategoryType.HISTORIA_URBANA]: { primary: '#a8a29e', secondary: '#fafaf9', accent: '#78716c' }, // Stone
  [CategoryType.MIRADAS_PERSONALES]: { primary: '#ec4899', secondary: '#fdf2f8', accent: '#db2777' }, // Pink
  [CategoryType.RECORRIDOS_INESPERADOS]: { primary: '#14b8a6', secondary: '#f0fdfa', accent: '#0d9488' }, // Teal
  [CategoryType.YINCANAS]: { primary: '#f59e0b', secondary: '#fffbeb', accent: '#d97706' }, // Amber
};

export const getCategoryColor = (category?: CategoryType) => {
  return COLOR_PALETTES[category || CategoryType.ARQUITECTURA];
};