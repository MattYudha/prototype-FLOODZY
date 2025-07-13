// mattyudha/floodzy/Floodzy-04cbe0509e23f883f290033cafa7f880e929fe65/lib/api.ts
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
  console.log(
    `fetchRegions called with type: ${type}, parentCode: ${parentCode}`
  );
  const params = new URLSearchParams({ type });
  if (parentCode) {
    params.append("parent_code", String(parentCode));
  }

  const url = `/api/regions?${params.toString()}`;
  console.log(`Fetching from URL: ${url}`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
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

// --- INTERFACE UNTUK OVERPASS DAN FUNGSI FETCH-NYA ---
export interface OverpassElement {
  type: "node" | "way" | "relation";
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

export async function fetchDisasterProneData(
  south: number,
  west: number,
  north: number,
  east: number
): Promise<OverpassResponse> {
  // === PERBAIKAN QUERY OVERPASS QL ===
  // Menghilangkan baris kosong yang tidak perlu dan memastikan sintaks yang tepat
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

  // Fokus pada Air & Drainase untuk detail lebih lengkap
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
`.trim(); // Menggunakan .trim() untuk menghilangkan spasi/newline di awal/akhir string

  console.log("Overpass API Query:", query); // Log query yang dikirim

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch disaster prone data from Overpass API: ${response.status} ${response.statusText} - ${errorText}`
    );
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
  dt?: number; // Add dt for timestamp
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
    throw new Error(
      errorData.message ||
        `Failed to fetch weather data: ${response.status} ${response.statusText}`
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
    rain1h: data.rain?.["1h"] || 0,
    dt: data.dt, // Assign dt from API response
  };

  return weather;
}

// === FUNGSI PUPR SIHKA/GEO API (TINGGI MUKA AIR) ===

// Interface untuk data Pos Duga Air dari PUPR
export interface WaterLevelPost {
  id: string; // ID pos
  name: string; // Nama pos
  lat: number; // Latitude
  lon: number; // Longitude
  water_level?: number; // Tinggi muka air (contoh: dalam meter)
  unit?: string; // Satuan (misalnya "m")
  timestamp?: string; // Waktu pengukuran terakhir (ISO 8601 string)
  status?: string; // Status pos (misalnya 'Normal', 'Siaga', 'Awas')
}

export async function fetchWaterLevelData(): Promise<WaterLevelPost[]> {
  const apiUrl = `/api/water-level-proxy`; // Ini adalah URL yang benar untuk proxy level air
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch water level data from local proxy: ${response.status} ${response.statusText}`
    );
  }

  let data: WaterLevelPost[] = await response.json();

  return data;
}

// === FUNGSI BARU UNTUK DATA STATUS POMPA BANJIR ===

// Interface untuk data Pompa Banjir dari Supabase
export interface PumpData {
  id: string; // ID pompa
  nama_infrastruktur: string; // Nama pompa
  latitude: number;
  longitude: number;
  kondisi_bangunan: string; // Misal: "Beroperasi", "Tidak Beroperasi", "Rusak"
  tipe_hidrologi: string; // Misal: "Manual", "Otomatik", "Telemetri"
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  updated_at?: number; // Unix timestamp dari CSV
}

export async function fetchPumpStatusData(): Promise<PumpData[]> {
  const apiUrl = `/api/pump-status-proxy`; // Panggil API Route proxy lokal Anda untuk pompa

  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch pump status data from local proxy: ${response.status} ${response.statusText}`
    );
  }

  const data: PumpData[] = await response.json();

  return data;
}

// === FUNGSI BARU UNTUK BMKG GEMPA TERKINI ===
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
  Potensi: string; // Misal: "Tidak berpotensi tsunami"
  Dirasakan: string; // Misal: "IV MMI di Garut, III MMI di Bandung"
  Shakemap: string; // URL shakemap
}

export async function fetchBmkgLatestQuake(): Promise<BmkgGempaData> {
  const url = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
  const response = await fetch(url, { cache: "no-store" }); // Pastikan selalu data terbaru

  if (!response.ok) {
    throw new Error(
      `Failed to fetch BMKG earthquake data: ${response.statusText}`
    );
  }

  const data = await response.json(); // BMKG API kadang mengembalikan data dalam properti "Infogempa.gempa"
  if (data && data.Infogempa && data.Infogempa.gempa) {
    return data.Infogempa.gempa;
  }
  throw new Error("Invalid BMKG earthquake data format.");
}

// === FUNGSI BARU UNTUK PETABENCANA.ID REPORTS ===
export interface PetabencanaReport {
  _id: string;
  appid: string;
  cat: string; // Kategori: flood, earthquake, haze, volcano
  detail: {
    en: string;
    id: string; // Detail lokasi dalam Bahasa Indonesia
  };
  event_type: string; // Misal: "Ketinggian Air", "Gempa", "Asap"
  geom: {
    coordinates: [number, number]; // [longitude, latitude]
    type: "Point";
  };
  image?: string; // URL gambar
  source: string; // Misal: "PetaBencana", "Twitter"
  status: string; // Misal: "Siaga", "Waspada", "Aman"
  timestamp: number; // Unix timestamp
  url: string; // URL ke laporan di Petabencana.id
  severity?: number; // <--- BARIS INI HARUS ADA!
}

export async function fetchPetabencanaReports(
  hazardType: string = "flood", // flood, earthquake, volcano, haze, etc.
  timeframe: string = "1h" // 1h, 6h, 24h, 3d, 7d
): Promise<PetabencanaReport[]> {
  const apiUrl = `/api/petabencana-proxy?hazardType=${hazardType}&timeframe=${timeframe}`;
  const response = await fetch(apiUrl, { cache: "no-store" });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch PetaBencana.id reports from proxy: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

// === INTERFACE UNTUK OPENSTREETMAP NOMINATIM GEOCODING ===
export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string]; // [lat_min, lat_max, lon_min, lon_max]
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export async function geocodeLocation(
  query: string
): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&countrycodes=id`;
  console.log(`[Geocoding API] Fetching from URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FloodzyApp/1.0 (your-email@example.com)", // Penting untuk Nominatim
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to geocode location '${query}': ${response.status} - ${errorText}`
    );
  }

  const data: NominatimResult[] = await response.json();
  console.log(`[Geocoding API] Received data for '${query}':`, data);
  return data;
}
