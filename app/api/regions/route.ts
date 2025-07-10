// src/app/api/regions/route.ts

import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('API Regions: Request received.');
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentCode = searchParams.get('parent_code');

    console.log(`API Regions: Extracted type='${type}' and parentCode='${parentCode}'`);

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
        selectColumns = 'sub_district_code, sub_district_name, sub_district_latitude, sub_district_longitude, sub_district_geometry';
        whereColumn = 'sub_district_city_code';
        break;
      case 'villages':
        tableName = 'villages';
        selectColumns = 'village_code, village_name, village_postal_codes, village_latitude, village_longitude, village_geometry';
        whereColumn = 'village_sub_district_code';
        break;
      default:
        console.error('API Regions: Invalid or unexpected region type:', type);
        return NextResponse.json({ error: `Invalid region type: '${type}'` }, { status: 400 });
    }

    console.log(`API Regions: Building query for table '${tableName}' with type '${type}'.`);

    query = supabaseServiceRole.from(tableName).select(selectColumns);

    const sortColumn = selectColumns.split(',')[1]?.trim() || selectColumns.split(',')[0]?.trim();
    if (sortColumn) {
        query = query.order(sortColumn, { ascending: true });
    } else {
        console.warn('API Regions: No clear column for ordering found in selectColumns.');
    }

    if (whereColumn && parentCode) {
      query = query.eq(whereColumn, parentCode);
    }

    console.log('API Regions: Executing Supabase query...');
    const { data, error } = await query;
    console.log('API Regions: Supabase query executed.');

    if (error) {
      console.error('API Regions: Error fetching data from Supabase:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`API Regions: Data fetched successfully. Count: ${data?.length}`);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Regions: Unexpected error in GET handler:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}