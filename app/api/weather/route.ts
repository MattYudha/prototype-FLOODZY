
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'OpenWeatherMap API Key not found' }, { status: 500 });
  }

  const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  const airPollutionUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';

  const commonParams = {
    lat,
    lon,
    appid: API_KEY,
    units: 'metric',
    lang: 'id',
  };

  try {
    const [weatherResponse, forecastResponse, airPollutionResponse] = await Promise.all([
      axios.get(weatherUrl, { params: commonParams }),
      axios.get(forecastUrl, { params: commonParams }),
      axios.get(airPollutionUrl, { params: commonParams }),
    ]);

    const dailyForecasts = forecastResponse.data.list.filter(
      (forecast: any) => forecast.dt_txt.includes('12:00:00'),
    );

    let airQualityData = null;
    if (airPollutionResponse.data && airPollutionResponse.data.list && airPollutionResponse.data.list.length > 0) {
      const aqi = airPollutionResponse.data.list[0].main.aqi;
      const pm2_5 = airPollutionResponse.data.list[0].components.pm2_5;

      let level = "Tidak Diketahui";
      let recommendation = "Informasi kualitas udara tidak tersedia.";

      if (aqi === 1) { level = "Baik"; recommendation = "Nikmati aktivitas di luar ruangan."; }
      else if (aqi === 2) { level = "Sedang"; recommendation = "Kurangi aktivitas berat di luar ruangan jika Anda sensitif."; }
      else if (aqi === 3) { level = "Tidak Sehat bagi Kelompok Sensitif"; recommendation = "Kelompok sensitif harus mengurangi aktivitas di luar ruangan."; }
      else if (aqi === 4) { level = "Tidak Sehat"; recommendation = "Semua orang harus mengurangi aktivitas di luar ruangan."; }
      else if (aqi === 5) { level = "Sangat Tidak Sehat"; recommendation = "Hindari semua aktivitas di luar ruangan."; }

      airQualityData = {
        aqi: aqi,
        level: level,
        pollutant: `PM2.5 (${pm2_5} µg/m³)` || "PM2.5",
        recommendation: recommendation
      };
    }

    const formattedData = {
      current: weatherResponse.data,
      daily: dailyForecasts,
      airQuality: airQualityData,
    };

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error('Error fetching weather data in API route:', error);
    const errorMessage =
      error.response?.data?.message ||
      'Gagal mengambil data cuaca. Coba lagi nanti.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
