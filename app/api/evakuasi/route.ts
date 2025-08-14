import { NextResponse } from 'next/server';
import { supabaseServiceRole, fetchSupabaseDataWithRetry } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log('[API Evakuasi] Request received.');
  // const supabase = createClient(); // No longer needed
  // console.log('[API Evakuasi] Supabase client created.'); // No longer needed

  try {
    console.log(
      '[API Evakuasi] Attempting to fetch from evacuation_locations...',
    );
    const { data, error } = await fetchSupabaseDataWithRetry(
      (client) => client.from('evacuation_locations').select('*'),
      'evacuation_locations'
    );

    if (error) {
      console.error('[API Evakuasi] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      '[API Evakuasi] Data fetched successfully:',
      data ? data.length : 0,
      'items.',
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[API Evakuasi] Unexpected error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
