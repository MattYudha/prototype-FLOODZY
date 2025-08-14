// src/app/api/regions/route.ts
import { NextResponse } from 'next/server';
import { fetchRegionsServer } from '@/lib/api.server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'provinces' | 'regencies' | 'districts' | 'villages';
    const parentCode = searchParams.get('parentCode');

    if (!type) {
      return NextResponse.json({ error: 'Missing region type' }, { status: 400 });
    }

    const data = await fetchRegionsServer(type, parentCode || undefined);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API regions error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}