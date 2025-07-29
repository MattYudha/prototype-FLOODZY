// File: lib/api.ts

// ===============================================
// KUMPULAN INTERFACE (TIPE DATA)
// ===============================================

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
  sub_district_latitude?: number;
  sub_district_longitude?: number;
  sub_district_geometry?: string;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags: { [key: string]: string };
  nodes?: number[];
  members?: Array<{ type: string; ref: number; role: string }>;
  geometry?: Array<{ lat: number; lon: number }>;
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

export interface OpenWeatherMapCurrentResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number; // m/s
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  rain?: {
    '1h'?: number; // Rain volume for the last 1 hour, mm
  };
  dt: number;
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

export interface CombinedWeatherData {
  current: OpenWeatherMapCurrentResponse;
  daily: any[]; // Assuming daily is an array of forecast data, adjust if a specific interface exists
}

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
  dt?: number;
}

export interface WaterLevelPost {
  id: string;
  name: string;
  lat: number;
  lon: number;
  water_level?: number;
  unit?: string;
  timestamp?: string;
  status?: string;
}

export interface PumpData {
  id: string;
  nama_infrastruktur: string;
  latitude: number;
  longitude: number;
  kondisi_bangunan: string;
  tipe_hidrologi: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  updated_at?: number;
}

export interface BmkgGempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
}

export interface PetabencanaReport {
  _id: string;
  appid: string;
  cat: string;
  detail: {
    en: string;
    id: string;
  };
  event_type: string;
  geom: {
    coordinates: [number, number];
    type: 'Point';
  };
  image?: string;
  source: string;
  status: string;
  timestamp: number;
  url: string;
  severity?: number;
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

// ===============================================
// KUMPULAN FUNGSI API
// ===============================================

export async function fetchRegions(
  type: 'provinces' | 'regencies' | 'districts' | 'villages',
  parentCode?: number | string,
): Promise<RegionData[]> {
  console.log(
    `fetchRegions called with type: ${type}, parentCode: ${parentCode}`,
  );
  const params = new URLSearchParams({ type });
  if (parentCode) {
    params.append('parent_code', String(parentCode));
  }

  const url = `/api/regions?${params.toString()}`;
  console.log(`Fetching from URL: ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
  });
  console.log(`Response status: ${response.status}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch ${type}`);
  }
  const data = await response.json();
  console.log(`Received data:`, data);
  return data;
}

export async function fetchDisasterProneData(
  south: number,
  west: number,
  north: number,
  east: number,
): Promise<OverpassResponse> {
  const query = `
[out:json][timeout:25];
(
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
  node["waterway"~"^(river|stream|canal|drain|ditch)$"](${south},${west},${north},${east});
  way["waterway"~"^(river|stream|canal|drain|ditch)$"](${south},${west},${north},${east});
  relation["waterway"~"^(river|stream|canal|drain|ditch)$"](${south},${west},${north},${east});
  node["natural"="water"](${south},${west},${north},${east});
  way["natural"="water"](${south},${west},${north},${east});
  relation["natural"="water"](${south},${west},${north},${east});
  node["man_made"="dyke"](${south},${west},${north},${east});
  way["man_made"="dyke"](${south},${west},${north},${east});
  relation["man_made"="dyke"](${south},${west},${north},${east});
  node["landuse"="basin"](${south},${west},${north},${east});
  way["landuse"="basin"](${south},${west},${north},${east});
  relation["landuse"="basin"](${south},${west},${north},${east});
  node["natural"="wetland"](${south},${west},${north},${east});
  way["natural"="wetland"](${south},${west},${north},${east});
  relation["natural"="wetland"](${south},${west},${north},${east});
);
out body geom;
`.trim();

  console.log('Overpass API Query:', query);

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch disaster prone data from Overpass API: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json();
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message ||
        `Failed to fetch weather data: ${response.status} ${response.statusText}`,
    );
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
    dt: data.dt,
  };
  return weather;
}

export async function fetchWaterLevelData(
  districtName?: string,
): Promise<WaterLevelPost[]> {
  const apiUrl = `/api/water-level-proxy${districtName ? `?districtName=${encodeURIComponent(districtName)}` : ''}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch water level data from local proxy: ${response.status} ${response.statusText}`,
    );
  }

  const data: WaterLevelPost[] = await response.json();
  return data;
}

export async function fetchPumpStatusData(
  districtName?: string,
): Promise<PumpData[]> {
  const apiUrl = `/api/pump-status-proxy${districtName ? `?districtName=${encodeURIComponent(districtName)}` : ''}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch pump status data from local proxy: ${response.status} ${response.statusText}`,
    );
  }

  const data: PumpData[] = await response.json();
  return data;
}

export async function fetchBmkgLatestQuake(): Promise<BmkgGempaData> {
  const url = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch BMKG earthquake data: ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (data && data.Infogempa && data.Infogempa.gempa) {
    return data.Infogempa.gempa;
  }
  throw new Error('Invalid BMKG earthquake data format.');
}

export async function fetchPetabencanaReports(
  hazardType: string = 'flood',
  timeframe: string = '1h',
): Promise<PetabencanaReport[]> {
  const apiUrl = `/api/petabencana-proxy?hazardType=${hazardType}&timeframe=${timeframe}`;
  const response = await fetch(apiUrl, { cache: 'no-store' });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Gagal mengambil laporan PetaBencana.id dari proksi: ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function geocodeLocation(
  query: string,
): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query,
  )}&format=json&limit=1&countrycodes=id`;
  console.log(`[Geocoding API] Fetching from URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FloodzyApp/1.0 (devarahmat12334@gmail.com)', // Ganti dengan email Anda
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to geocode location '${query}': ${response.status} - ${errorText}`,
    );
  }

  const data: NominatimResult[] = await response.json();
  console.log(`[Geocoding API] Received data for '${query}':`, data);
  return data;
}
