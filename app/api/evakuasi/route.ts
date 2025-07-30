import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  console.log('[API Evakuasi] Request received.');
  const supabase = createClient();
  console.log('[API Evakuasi] Supabase client created.');

  try {
    console.log('[API Evakuasi] Attempting to fetch from evacuation_locations...');
    const { data, error } = await supabase
      .from('evacuation_locations')
      .select('*');

    if (error) {
      console.error('[API Evakuasi] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API Evakuasi] Data fetched successfully:', data ? data.length : 0, 'items.');
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[API Evakuasi] Unexpected error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
