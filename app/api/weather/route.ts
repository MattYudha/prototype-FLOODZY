// src/app/api/weather/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export const runtime = 'nodejs';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 },
    );
  }

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'OpenWeatherMap API key not configured' },
      { status: 500 },
    );
  }

  const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

  const commonParams = {
    lat,
    lon,
    appid: API_KEY,
    units: 'metric',
    lang: 'id',
  };

  try {
    // Melakukan dua panggilan API secara bersamaan
    const [weatherResponse, forecastResponse] = await Promise.all([
      axios.get(weatherUrl, { params: commonParams }),
      axios.get(forecastUrl, { params: commonParams }),
    ]);

    // Memproses data prakiraan untuk mendapatkan satu data per hari (misalnya, pada jam 12:00:00)
    const dailyForecasts = forecastResponse.data.list.filter((forecast: any) =>
      forecast.dt_txt.includes('12:00:00'),
    );

    // Menggabungkan hasil dari kedua API
    const combinedData = {
      current: weatherResponse.data,
      daily: dailyForecasts,
    };

    return NextResponse.json(combinedData);
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    const errorMessage =
      error.response?.data?.message ||
      'Gagal mengambil data cuaca. Coba lagi nanti.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}