// mattyudha/floodzy/Floodzy-04cbe0509e23f883f290033cafa7f880e929fe65/app/api/alerts-data/route.ts

import { NextResponse } from 'next/server';
import {
  fetchBmkgLatestQuake,
  fetchPetabencanaReports,
  BmkgGempaData,
  PetabencanaReport,
} from '@/lib/api';

interface Alert {
  id: string;
  level: 'Rendah' | 'Sedang' | 'Tinggi';
  location: string;
  timestamp: string;
  reason: string;
  details?: string;
  affectedAreas?: string[];
  estimatedPopulation?: number;
  severity?: number;
}

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

export async function GET() {
  console.log(
    'API Route: /api/alerts-data received GET request to fetch real-time data.',
  );

  let aggregatedAlerts: Alert[] = [];

  try {
    const bmkgQuake: BmkgGempaData = await fetchBmkgLatestQuake();
    console.log('Fetched BMKG Latest Quake:', bmkgQuake.Wilayah);

    const quakeSeverity = parseFloat(bmkgQuake.Magnitude);
    let quakeLevel: Alert['level'] = 'Rendah';
    if (quakeSeverity >= 6.0) quakeLevel = 'Tinggi';
    else if (quakeSeverity >= 4.5) quakeLevel = 'Sedang';

    aggregatedAlerts.push({
      id: `bmkg-quake-${bmkgQuake.DateTime.replace(
        /\s|\./g,
        '_',
      )}-${generateUniqueId()}`,
      level: quakeLevel,
      location: bmkgQuake.Wilayah,
      timestamp: `${bmkgQuake.Tanggal} ${bmkgQuake.Jam} WIB`,
      reason: `Gempa M${bmkgQuake.Magnitude} di ${bmkgQuake.Wilayah}`,
      details: `Kedalaman ${bmkgQuake.Kedalaman}. ${bmkgQuake.Potensi}. Dirasakan: ${bmkgQuake.Dirasakan}.`,
      affectedAreas: bmkgQuake.Wilayah.split(',').map((s) => s.trim()),
      estimatedPopulation: 0,
      severity: quakeSeverity,
    });
  } catch (error: any) {
    console.error('Error fetching BMKG earthquake data:', error.message);
  }

  const hazardTypes = ['flood', 'earthquake', 'haze', 'volcano'];
  const timeframes = ['24h', '3d'];

  for (const hazardType of hazardTypes) {
    for (const timeframe of timeframes) {
      try {
        const petabencanaReports: PetabencanaReport[] =
          await fetchPetabencanaReports(hazardType, timeframe);
        console.log(
          `Fetched ${petabencanaReports.length} PetaBencana.id ${hazardType} reports for ${timeframe}.`,
        );

        petabencanaReports.forEach((report) => {
          const baseId = `petabencana-${hazardType}-${report._id}`;
          if (aggregatedAlerts.some((alert) => alert.id.includes(baseId))) {
            return;
          }

          let reportLevel: Alert['level'] = 'Rendah';
          let severityFromReport = report.severity || 0;

          if (
            report.status === 'Siaga' ||
            report.status === 'Waspada' ||
            report.cat === 'flood' ||
            report.event_type.toLowerCase().includes('banjir')
          )
            reportLevel = 'Tinggi';
          else if (report.status === 'Terpantau' || report.status === 'Aman')
            reportLevel = 'Sedang';
          else reportLevel = 'Rendah';

          if (severityFromReport === 0) {
            const severityMatchText =
              report.detail.id.match(/skala (\d+\.?\d*)/i);
            if (severityMatchText && parseFloat(severityMatchText[1])) {
              severityFromReport = parseFloat(severityMatchText[1]);
            } else if (
              report.event_type.toLowerCase().includes('ketinggian air')
            ) {
              severityFromReport =
                reportLevel === 'Tinggi' ? 8 : reportLevel === 'Sedang' ? 5 : 3;
            } else if (report.cat === 'earthquake') {
              const eventTypeMatch = report.event_type.match(/M(\d+\.?\d*)/);
              if (eventTypeMatch && eventTypeMatch[1]) {
                severityFromReport = parseFloat(eventTypeMatch[1]);
              }
            }
          }

          const affectedAreasList = report.detail.id
            .split(/[.,;]/)
            .map((s) => s.trim())
            .filter(
              (s) =>
                s.length > 2 &&
                !s.toLowerCase().includes('skala') &&
                !s.toLowerCase().includes('waktu'),
            );

          aggregatedAlerts.push({
            id: `${baseId}-${generateUniqueId()}`,
            level: reportLevel,
            location:
              report.detail.id.split(',')[0].trim() || 'Tidak diketahui',
            timestamp: new Date(report.timestamp).toLocaleString('id-ID'),
            reason: report.event_type || report.cat || 'Laporan Bencana',
            details: report.detail.id,
            affectedAreas:
              affectedAreasList.length > 0
                ? affectedAreasList
                : [report.detail.id.split(',')[0].trim()],
            estimatedPopulation: undefined,
            severity: severityFromReport > 0 ? severityFromReport : undefined,
          });
        });
      } catch (error: any) {
        console.error(
          `Error fetching PetaBencana.id ${hazardType} reports for ${timeframe}:`,
          error.message,
        );
      }
    }
  }

  // --- Finalisasi: Pastikan ID unik untuk re-render jika diperlukan ---
  const finalAlertsWithUniqueIds = aggregatedAlerts.map((alert) => ({
    ...alert,
    id: alert.id.includes('mock-dynamic-')
      ? alert.id
      : `${alert.id}-${generateUniqueId()}`,
  }));

  // Sortir peringatan berdasarkan tingkat keparahan (severity, jika ada), kemudian level
  finalAlertsWithUniqueIds.sort((a, b) => {
    if (a.severity && b.severity) {
      return b.severity - a.severity;
    }
    const levelOrder = { Tinggi: 3, Sedang: 2, Rendah: 1 };
    return (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
  });

  // Ambil sejumlah peringatan acak (antara 1 hingga 10) untuk mensimulasikan data real-time yang dinamis
  const numberOfAlertsToReturn = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
  const shuffledAlerts = finalAlertsWithUniqueIds.sort(
    () => 0.5 - Math.random(),
  ); // Acak urutan
  const slicedAlerts = shuffledAlerts.slice(0, numberOfAlertsToReturn);

  return NextResponse.json(slicedAlerts, { status: 200 });
}
