// src/app/api/pump-status-proxy/route.ts

import { NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase"; // Pastikan ini diimpor dan terkonfigurasi dengan benar

export const dynamic = "force-dynamic"; // Penting untuk memastikan route ini dinamis

export async function GET(request: Request) {
  console.log("API pump-status-proxy: Request received.");
  try {
    // Ambil data dari tabel 'pompa_banjir' di Supabase Anda
    // <<< PASTIKAN NAMA TABEL INI SAMA PERSIS DENGAN YANG ANDA BUAT DI SUPABASE UNTUK DATA POMPA >>>
    const { data, error } = await supabaseServiceRole
      .from("pompa_banjir") // GANTI DENGAN NAMA TABEL POMPA BANJIR ANDA (misal: 'pompa_banjir_data')
      .select("*"); // Ambil semua kolom yang tersedia

    if (error) {
      console.error(
        "API pump-status-proxy: Error fetching from Supabase:",
        error.message
      );
      return NextResponse.json(
        {
          error: `Failed to fetch pump status data from Supabase: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Data dari Supabase sudah berupa array objek.
    // Anda bisa menambahkan logika pemrosesan atau agregasi di sini jika diperlukan.
    // Misalnya, menghitung total pompa, pompa aktif/tidak aktif, dll.
    // Untuk saat ini, kita akan mengembalikan data mentah.

    console.log(
      `API pump-status-proxy: Successfully fetched ${
        data?.length || 0
      } pump records.`
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(
      "API pump-status-proxy: Unexpected error in pump status proxy:",
      error.message
    );
    return NextResponse.json(
      { error: `Internal Server Error in pump status proxy: ${error.message}` },
      { status: 500 }
    );
  }
}
