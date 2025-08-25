import { GeocodingResponse, ReverseGeocodingResponse } from '@/types/geocoding';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = 'http://api.openweathermap.org/geo/1.0';

export async function getCoordsByLocationName(
  locationName: string,
): Promise<GeocodingResponse | null> {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured.');
  }

  const url = `${BASE_URL}/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Geocoding API request failed with status ${response.status}`,
      );
    }
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    return null;
  }
}

export async function getLocationNameByCoords(
  lat: number,
  lon: number,
): Promise<ReverseGeocodingResponse | null> {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured.');
  }

  const url = `${BASE_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Reverse geocoding API request failed with status ${response.status}`,
      );
    }
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching reverse geocoding data:', error);
    return null;
  }
}

export async function getAirPollutionData(
  lat: number,
  lon: number,
): Promise<any | null> {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured.');
  }

  const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Air Pollution API request failed with status ${response.status}`,
      );
    }
    const data = await response.json();
    return data.list && data.list.length > 0 ? data.list[0] : null;
  } catch (error) {
    console.error('Error fetching air pollution data:', error);
    return null;
  }
}
