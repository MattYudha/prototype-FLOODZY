import { fetchBmkgLatestQuake } from '@/lib/api.client';

// SOLUSI: Tambahkan baris ini untuk mengaktifkan ISR (revalidasi setiap 5 menit)
export const revalidate = 300;
import { BmkgGempaData } from '@/lib/api';
import { DashboardClientPage } from '@/components/layout/DashboardClientPage';
import { generateMockWaterLevels, generateMockPumpStatus, generateMockAlerts } from '@/lib/mock-data';

export default async function Home() {
  // Fetch other data as usual
  let latestQuake: BmkgGempaData | null = null;
  let quakeError: string | null = null;
  try {
    latestQuake = await fetchBmkgLatestQuake();
  } catch (error: any) {
    quakeError = error.message;
    console.error('Error fetching BMKG quake data:', error);
  }

  // === LANGKAH 1: Gunakan fungsi mockup untuk menghasilkan data awal ===
  const waterLevelPosts = generateMockWaterLevels(100);
  const pumpStatusData = generateMockPumpStatus(100);
  const realTimeAlerts = generateMockAlerts();

  // === LANGKAH 2: Hitung Lokasi Siaga Secara Dinamis ===
  const waterLevelAlertCount = waterLevelPosts.filter(p => p.status !== 'Normal').length;
  const pumpAlertCount = pumpStatusData.filter(p => p.kondisi_bangunan !== 'Aktif').length;
  const totalLokasiSiaga = waterLevelAlertCount + pumpAlertCount;

  // === LANGKAH 3: Buat Statistik Dasbor Secara Dinamis ===
  const dashboardStats = [
    {
      id: '1',
      label: 'Total Sensor TMA',
      value: waterLevelPosts.length.toString(),
      description: 'Jumlah sensor tinggi muka air aktif',
    },
    {
      id: '2',
      label: 'Total Pompa Banjir',
      value: pumpStatusData.length.toString(),
      description: 'Jumlah pompa banjir terpasang',
    },
    {
      id: '3',
      label: 'Lokasi Siaga',
      value: totalLokasiSiaga.toString(), // Gunakan hasil perhitungan dinamis
      description: 'Sensor & pompa dalam status peringatan',
    },
    {
      id: '4',
      label: 'Laporan Masuk',
      value: '42', // Biarkan statis sebagai contoh
      description: 'Laporan dari warga 24 jam terakhir',
    },
  ];

  // Siapkan data akhir untuk dikirim ke komponen client
  const initialData = {
    stats: dashboardStats, // Gunakan data statistik yang baru dan dinamis
    waterLevelPosts,
    pumpStatusData,
    waterLevelError: null, // Tidak ada error karena ini mockup
    pumpStatusError: null, // Tidak ada error karena ini mockup
    latestQuake,
    quakeError,
    realTimeAlerts, // Gunakan data mockup yang baru
  };

  return <DashboardClientPage initialData={initialData} />;
}

