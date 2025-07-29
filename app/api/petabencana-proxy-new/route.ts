// app/api/petabencana-proxy/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hazardType = searchParams.get('hazardType') || 'flood';
  const timeframe = searchParams.get('timeframe') || '24h';

  // Ambil API Key dari environment variable jika PetaBencana.id membutuhkannya
  // Pastikan Anda menambahkan PETABENCANA_API_KEY di file .env.local Anda
  const PETABENCANA_API_KEY = process.env.PETABENCANA_API_KEY;

  let apiUrl = `https://data.petabencana.id/reports/${hazardType}/${timeframe}.json`;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Pastikan data selalu terbaru
      headers: {
        'Authorization': `Bearer ${PETABENCANA_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Failed to fetch from PetaBencana.id: ${response.status} - ${errorText}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PetaBencana proxy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
