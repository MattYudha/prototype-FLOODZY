
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ message: 'Latitude and longitude are required' }, { status: 400 });
  }

  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: 'API key is not configured' }, { status: 500 });
  }

  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;

  try {
    const response = await fetch(weatherApiUrl);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Failed to fetch weather data' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
