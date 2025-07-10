// src/app/api/regions/route.ts

import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log('API Regions: Request received.');
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentCode = searchParams.get('parent_code');

    console.log(`API Regions: Extracted type='${type}' and parentCode='${parentCode}'`);

    // Validate required parameters
    if (!type) {
      console.error('API Regions: Missing required parameter: type');
      return NextResponse.json(
        { error: 'Missing required parameter: type' }, 
        { status: 400, headers }
      );
    }

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
        return NextResponse.json(
          { error: `Invalid region type: '${type}'` }, 
          { status: 400, headers }
        );
    }

    // Validate parent_code for dependent types
    if ((type === 'regencies' || type === 'districts' || type === 'villages') && !parentCode) {
      console.error(`API Regions: Missing parent_code for type: ${type}`);
      return NextResponse.json(
        { error: `Missing parent_code for type: ${type}` }, 
        { status: 400, headers }
      );
    }

    console.log(`API Regions: Building query for table '${tableName}' with type '${type}'.`);

    // Test Supabase connection first
    try {
      const connectionTest = await supabaseServiceRole
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (connectionTest.error) {
        console.error('API Regions: Supabase connection test failed:', connectionTest.error);
        return NextResponse.json(
          { error: `Database connection failed: ${connectionTest.error.message}` },
          { status: 500, headers }
        );
      }
    } catch (connError: any) {
      console.error('API Regions: Supabase connection error:', connError);
      return NextResponse.json(
        { error: `Database connection error: ${connError.message}` },
        { status: 500, headers }
      );
    }

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
      return NextResponse.json(
        { error: error.message }, 
        { status: 500, headers }
      );
    }

    console.log(`API Regions: Data fetched successfully. Count: ${data?.length}`);
    return NextResponse.json(data, { headers });

  } catch (error: any) {
    console.error('API Regions: Unexpected error in GET handler:', error.message);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` }, 
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }}
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}