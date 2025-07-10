// src/lib/api.ts

/**
 * Interface untuk struktur data wilayah
 * Sesuaikan ini jika ada kolom tambahan di data Supabase Anda
 */
export interface RegionData {
  province_code?: number;
  province_name?: string;
  city_code?: number;
  city_name?: string;
  sub_district_code?: number;
  sub_district_name?: string;
  village_code?: number;
  village_name?: string;
  village_postal_codes?: string; // Sesuai dengan skema database
  // Tambahkan kolom lain yang relevan seperti latitude, longitude jika Anda ingin menggunakannya
}

/**
 * Fungsi untuk mengambil data wilayah dari API backend kita
 * @param type Jenis wilayah yang ingin diambil ('provinces', 'regencies', 'districts', 'villages')
 * @param parentCode Kode induk (misal: province_code untuk regencies)
 * @returns Array of RegionData
 */
export async function fetchRegions(
  type: "provinces" | "regencies" | "districts" | "villages",
  parentCode?: number | string
): Promise<RegionData[]> {
  const params = new URLSearchParams({ type });
  if (parentCode) {
    params.append("parent_code", String(parentCode));
  }

  const response = await fetch(`/api/regions?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch ${type}`);
  }
  return response.json();
}

// (Anda bisa menambahkan fungsi fetcher untuk API lain di sini nanti, seperti cuaca, banjir)
