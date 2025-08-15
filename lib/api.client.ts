// File: lib/api.client.ts
import { fetchWithRobustErrorHandling } from './fetch-utils';
import {
  RegionData,
  OverpassResponse,
  WeatherData,
  WaterLevelPost,
  PumpData,
  BmkgGempaData,
  PetabencanaReport,
  NominatimResult,
  FetchPetabencanaReportsArgs,
  FetchWeatherDataArgs,
  GeocodeLocationArgs,
  DisplayNotificationArgs,
  OpenWeatherMapCurrentResponse,
  CombinedWeatherData,
} from './api'; // Import necessary types from lib/api.ts

export async function fetchRegionsClient(
  type: 'provinces' | 'regencies' | 'districts' | 'villages',
  parentCode?: number | string,
): Promise<RegionData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/regions?type=${type}${parentCode ? `&parentCode=${parentCode}` : ''}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch regions: ${response.statusText}`);
    }
    const data: RegionData[] = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchRegionsClient: ${error.message}`);
    throw error;
  }
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
  node[\"flood_prone\"=\"yes\"](${south},${west},${north},${east});
  way[\"flood_prone\"=\"yes\"](${south},${west},${north},${east});
  relation[\"flood_prone\"=\"yes\"](${south},${west},${north},${east});
  node[\"hazard\"=\"flood\"](${south},${west},${north},${east});
  way[\"hazard\"=\"flood\"](${south},${west},${north},${east});
  relation[\"hazard\"=\"flood\"](${south},${west},${north},${east});
  node[\"natural\"=\"landslide\"](${south},${west},${north},${east});
  way[\"natural\"=\"landslide\"](${south},${west},${north},${east});
  relation[\"natural\"=\"landslide\"](${south},${west},${north},${east});
  node[\"hazard\"=\"landslide\"](${south},${west},${north},${east});
  way[\"hazard\"=\"landslide\"](${south},${west},${north},${east});
  relation[\"hazard\"=\"landslide\"](${south},${west},${north},${east});
  node[\"waterway\"~\"^(river|stream|canal|drain|ditch)$\"](${south},${west},${north},${east});
  way[\"waterway\"~\"^(river|stream|canal|drain|ditch)$\"](${south},${west},${north},${east});
  relation[\"waterway\"~\"^(river|stream|canal|drain|ditch)$\"](${south},${west},${north},${east});
  node[\"natural\"=\"water\"](${south},${west},${north},${east});
  way[\"natural\"=\"water\"](${south},${west},${north},${east});
  relation[\"natural\"=\"water\"](${south},${west},${north},${east});
  node[\"man_made\"=\"dyke\"](${south},${west},${north},${east});
  way[\"man_made\"=\"dyke\"](${south},${west},${north},${east});
  relation[\"man_made\"=\"dyke\"](${south},${west},${north},${east});
  node[\"landuse\"=\"basin\"](${south},${west},${north},${east});
  way[\"landuse\"=\"basin\"](${south},${west},${north},${east});
  relation[\"landuse\"=\"basin\"](${south},${west},${north},${east});
  node[\"natural\"=\"wetland\"](${south},${west},${north},${east});
  way[\"natural\"=\"wetland\"](${south},${west},${north},${east});
  relation[\"natural\"=\"wetland\"](${south},${west},${north},${east});
);
out body geom;
`.trim();

  console.log('Overpass API Query:', query);

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    next: { revalidate: 3600 }, // Revalidate every 1 hour
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
  let apiUrl = '/api/water-level-proxy';
  const trimmedDistrictName = districtName?.trim();
  if (trimmedDistrictName) {
    apiUrl += `?districtName=${encodeURIComponent(trimmedDistrictName)}`;
  }
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
  let apiUrl = '/api/pump-status-proxy';
  const trimmedDistrictName = districtName?.trim();
  if (trimmedDistrictName) {
    apiUrl += `?districtName=${encodeURIComponent(trimmedDistrictName)}`;
  }
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Fallback for development
  const apiUrl = `${baseUrl}/api/petabencana-proxy-new?hazardType=${hazardType}&timeframe=${timeframe}`;
  const responseData = await fetchWithRobustErrorHandling<any>(apiUrl, { cache: 'no-store' }); // Use 'any' for initial fetch

  // Access the features array from the result object
  const features = responseData?.result?.features;

  if (!Array.isArray(features)) {
    console.warn('PetaBencana.id proxy returned data without a features array or an empty features array:', responseData);
    return [];
  }
  return features;
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
