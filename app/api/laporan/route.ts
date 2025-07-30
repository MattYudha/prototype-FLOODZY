
import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validasi data dasar
    if (!data.location || !data.water_level) {
      return NextResponse.json({ error: 'Lokasi dan tinggi air wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabaseServiceRole.from('laporan_banjir').insert([
      {
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        water_level: data.water_level,
        description: data.description,
        photo_url: data.photo_url,
        reporter_name: data.reporter_name,
        reporter_contact: data.reporter_contact,
      },
    ]);

    if (error) {
      console.error('Error inserting data to Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Laporan berhasil disimpan.' }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
