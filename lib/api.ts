// src/lib/api.ts
// Pastikan hanya ini isi file api.ts
export interface RegionData {
  province_code?: number;
  province_name?: string;
  city_code?: number;
  city_name?: string;
  sub_district_code?: number;
  sub_district_name?: string;
  village_code?: number;
  village_name?: string;
  village_postal_codes?: string;
}

export async function fetchRegions(
  type: "provinces" | "regencies" | "districts" | "villages",
  parentCode?: number | string
): Promise<RegionData[]> {
  const params = new URLSearchParams({ type });
  if (parentCode) {
    params.append("parent_code", String(parentCode));
  }

  const response = await fetch(`/api/regions?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch ${type}`);
  }
  return response.json();
}

// --- INTERFACE UNTUK OVERPASS DAN FUNGSI FETCH-NYA ---
export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number; // Hanya ada di type: "node"
  lon?: number; // Hanya ada di type: "node"
  tags: { [key: string]: string };
  nodes?: number[]; // Hanya ada di type: "way"
  members?: Array<{ type: string; ref: number; role: string }>; // Hanya ada di type: "relation"
  geometry?: Array<{ lat: number; lon: number }>; // Untuk ways dan relations dengan out geom;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

export async function fetchDisasterProneData(
  south: number,
  west: number,
  north: number,
  east: number
): Promise<OverpassResponse> {
  const query = `[out:json][timeout:25];
  (
    // Tag-tag kerawanan bencana yang sudah ada
    node["flood_prone"="yes"](${south},${west},${north},${east});
    way["flood_prone"="yes"](${south},${west},${north},${east});
    relation["flood_prone"="yes"](${south},${west},${north},${east});

    node["hazard"="flood"](${south},${west},${north},${east});
    way["hazard"="flood"](${south},${west},${north},${east});
    relation["hazard"="flood"](${south},${west},${north},${east});

    node["natural"="landslide"](${south},${west},${north},${east});
    way["natural"="landslide"](${south},${west},${north},${east});
    relation["natural"="landslide"](${south},${west},${north},${east});
    
    node["hazard"="landslide"](${south},${west},${north},${east});
    way["hazard"="landslide"](${south},${west},${north},${east});
    relation["hazard"="landslide"](${south},${west},${north},${east});

    // === PENAMBAHAN TAGS UNTUK DETAIL LEBIH LENGKAP (Fokus pada Air & Drainase) ===
    // Saluran air besar, sungai kecil, dan selokan yang relevan dengan banjir
    node["waterway"~"^(river|stream|canal|drain|ditch)$"](${south},${west},${north},${east});
    way["waterway"~"^(river|stream|canal|drain|ditch)$"](${south},${west},${north},${east});
    relation["waterway"~"^(river|stream|canal|drain|ditch)$"](${south},${west},${north},${east});

    // Area air seperti danau, kolam, reservoir (berpotensi meluap)
    node["natural"="water"](${south},${west},${north},${east});
    way["natural"="water"](${south},${west},${north},${east});
    relation["natural"="water"](${south},${west},${north},${east});
    
    // Tanggul atau dinding yang menahan air
    node["man_made"="dyke"](${south},${west},${north},${east});
    way["man_made"="dyke"](${south},${west},${north},${east});
    relation["man_made"="dyke"](${south},${west},${north},${east});

    // Area penahan air buatan
    node["landuse"="basin"](${south},${west},${north},${east});
    way["landuse"="basin"](${south},${west},${north},${east});
    relation["landuse"="basin"](${south},${west},${north},${east});

    node["natural"="wetland"](${south},${west},${north},${east});
    way["natural"="wetland"](${south},${west},${north},${east});
    relation["natural"="wetland"](${south},${west},${north},${east});


  );
  out body geom;
  `;


  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch disaster prone data from Overpass API: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// === FUNGSI OPENWEATHERMAP API (TETAP SAMA) ===

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  uvIndex?: number;
  rain1h?: number;
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch weather data: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const weather: WeatherData = {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed * 3.6,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    rain1h: data.rain?.['1h'] || 0,
  };

  return weather;
}