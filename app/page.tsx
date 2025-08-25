import { createClient } from '@/lib/supabase/server';
import { fetchBmkgLatestQuake } from '@/lib/api.client';
import { BmkgGempaData, WaterLevelPost, PumpData } from '@/lib/api';
import { DashboardClientPage } from '@/components/layout/DashboardClientPage';
import { DASHBOARD_STATS_MOCK, FLOOD_MOCK_ALERTS } from '@/lib/constants';

export default async function Home() {
  const supabase = createClient();

  let waterLevelPosts: WaterLevelPost[] = [];
  let waterLevelError: string | null = null;
  let pumpStatusData: PumpData[] = [];
  let pumpStatusError: string | null = null;
  let latestQuake: BmkgGempaData | null = null;
  let quakeError: string | null = null;

  try {
    const { data, error } = await supabase.from('posdugaair').select('*');
    if (error) throw error;
    waterLevelPosts = (data ?? []).map((item: any) => ({
      id: item.id,
      name: item.nama_hidrologi,
      lat: parseFloat(item.latitude),
      lon: parseFloat(item.longitude),
      water_level: item.water_level,
      unit: item.unit || 'm',
      timestamp: item.updated_at ? new Date(Number(item.updated_at)).toISOString() : new Date().toISOString(),
      status: item.status || 'Normal',
    })).filter(p => p.lat && p.lon);
  } catch (error: any) {
    waterLevelError = error.message;
    console.error('Error fetching water level data:', error);
  }

  try {
    const { data, error } = await supabase.from('pompa_banjir').select('*');
    if (error) throw error;
    pumpStatusData = data ?? [];
  } catch (error: any) {
    pumpStatusError = error.message;
    console.error('Error fetching pump status data:', error);
  }

  try {
    latestQuake = await fetchBmkgLatestQuake();
  } catch (error: any) {
    quakeError = error.message;
    console.error('Error fetching BMKG quake data:', error);
  }

  let realTimeAlerts = [];
  if (latestQuake) {
    const quakeTimestampISO = latestQuake.DateTime.replace(' ', 'T') + '+07:00';
    realTimeAlerts.push({
      id: `bmkg-quake-${latestQuake.DateTime}`,
      regionId: latestQuake.Wilayah,
      level: parseFloat(latestQuake.Magnitude) >= 5 ? 'danger' : 'warning',
      title: `Gempa M${latestQuake.Magnitude} di ${latestQuake.Wilayah}`,
      message: `Pusat gempa di ${latestQuake.Kedalaman}. Dirasakan: ${latestQuake.Dirasakan}`,
      timestamp: quakeTimestampISO,
      isActive: true,
      affectedAreas: latestQuake.Wilayah.split(',').map((s) => s.trim()),
      coordinates: [parseFloat(latestQuake.Lintang), parseFloat(latestQuake.Bujur)], // Add coordinates
      actions: [],
    });
  }
  realTimeAlerts = realTimeAlerts.concat(FLOOD_MOCK_ALERTS);

  const initialData = {
    stats: DASHBOARD_STATS_MOCK,
    waterLevelPosts,
    loadingWaterLevel: false,
    waterLevelError,
    pumpStatusData,
    loadingPumpStatus: false,
    pumpStatusError,
    latestQuake,
    quakeError,
    realTimeAlerts,
  };

  return <DashboardClientPage initialData={initialData} />;
}
