// src/app/api/regions/route.ts

import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Pastikan ini ada dan benar

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentCode = searchParams.get('parent_code');

    let query;
    let tableName: string;
    let selectColumns: string;
    let whereColumn: string | null = null;

    switch (type) {
      case 'provinces':
        tableName = 'provinces';
        selectColumns = 'province_code, province_name, province_latitude, province_longitude';
        break;
      case 'regencies':
        tableName = 'regencies';
        selectColumns = 'city_code, city_name, city_latitude, city_longitude';
        whereColumn = 'city_province_code';
        break;
      case 'districts':
        tableName = 'districts';
        // PASTIKAN BARIS selectColumns INI PERSIS SEPERTI DI BAWAH
        selectColumns = 'sub_district_code, sub_district_name, sub_district_latitude, sub_district_longitude, sub_district_geometry';
        whereColumn = 'sub_district_city_code';
        break;
      case 'villages':
        tableName = 'villages';
        selectColumns = 'village_code, village_name, village_postal_codes, village_latitude, village_longitude, village_geometry';
        whereColumn = 'village_sub_district_code';
        break;
      default:
        return NextResponse.json({ error: 'Invalid region type' }, { status: 400 });
    }

    query = supabaseServiceRole.from(tableName).select(selectColumns);

    if (whereColumn && parentCode) {
      query = query.eq(whereColumn, parentCode);
    }

    query = query.order(`${selectColumns.split(',')[1].trim()}`, { ascending: true }); // Pengurutan tetap berdasarkan nama

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching regions:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Unexpected error in /api/regions:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}