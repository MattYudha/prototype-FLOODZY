import { NextResponse } from 'next/server';
import { fetchSupabaseDataWithRetry } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // No longer needed
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // No longer needed

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase URL or Anon Key environment variables');
// } // No longer needed

// const supabase = createClient(supabaseUrl, supabaseAnonKey); // No longer needed

export async function GET() {
  try {
    const { data, error } = await fetchSupabaseDataWithRetry(
      (client) => client.from('laporan_banjir').select('id, location, waterLevel, timestamp, status, reporterName'),
      'laporan_banjir'
    );

    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in /api/laporan:', error);
    return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
  }
}