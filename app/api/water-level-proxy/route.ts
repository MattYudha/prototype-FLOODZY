// src/app/api/water-level-proxy/route.ts

import { NextResponse } from 'next/server';
import { fetchSupabaseDataWithRetry } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Tetapkan runtime ke Node.js

export async function GET(request: Request) {
  console.log('API water-level-proxy: Request received.');
  try {
    // === PERBAIKAN DI SINI: Ubah nama tabel menjadi 'posdugaair' ===
    const { data, error } = await fetchSupabaseDataWithRetry(
      (client) => client.from('posdugaair').select('*'),
      'posdugaair'
    );

    if (error) {
      console.error(
        'API water-level-proxy: Error fetching from Supabase:',
        error.message,
      );
      return NextResponse.json(
        {
          error: `Failed to fetch water level data from Supabase: ${error.message}`,
        },
        { status: 500 },
      );
    }

    // Parsing dan pemetaan data dari respons Supabase
    const waterLevelPosts = data
      .map((item: any) => {
        // Sesuaikan nama properti di sini agar sesuai dengan NAMA KOLOM di tabel Supabase Anda
        // berdasarkan CSV yang Anda impor.
        const lat = item.latitude;
        const lon = item.longitude;

        // Pastikan koordinat valid sebelum membuat objek
        if (
          lat == null ||
          lon == null ||
          isNaN(parseFloat(lat)) ||
          isNaN(parseFloat(lon))
        ) {
          return null; // Abaikan item tanpa koordinat valid
        }

        // Asumsi nama kolom di tabel 'posdugaair' Anda (sesuaikan jika berbeda):
        return {
          id: item.id, // Sesuai dengan primary key di tabel
          name: item.nama_hidrologi, // Kolom nama_hidrologi dari CSV/tabel
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          // CATATAN: water_level, unit, status tidak ada di CSV awal Anda.
          // Anda perlu memastikan kolom ini ada di Supabase dan terisi,
          // atau memberikan nilai default/placeholder jika tidak relevan.
          water_level: item.water_level || undefined, // Asumsi nama kolom water_level di tabel Supabase
          unit: item.unit || 'm', // Asumsi nama kolom unit di tabel Supabase
          timestamp: item.updated_at
            ? new Date(Number(item.updated_at)).toISOString()
            : new Date().toISOString(), // updated_at dari CSV adalah Unix timestamp
          status: item.status || 'Normal', // Asumsi nama kolom status di tabel Supabase
        };
      })
      .filter((post: any) => post !== null); // Filter null entries

    console.log(
      `Proxy: Successfully fetched and parsed ${waterLevelPosts.length} water level posts from Supabase.`,
    );

    return NextResponse.json(waterLevelPosts);
  } catch (error: any) {
    console.error('Proxy: Unexpected error:', error.message);
    return NextResponse.json(
      { error: `Internal Server Error in water level proxy: ${error.message}` },
      { status: 500 },
    );
  }
}
