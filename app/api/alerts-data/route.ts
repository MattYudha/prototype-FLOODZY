// mattyudha/floodzy/Floodzy-04cbe0509e23f883f290033cafa7f880e929fe65/app/api/alerts-data/route.ts

import { NextResponse } from "next/server";
import {
  fetchBmkgLatestQuake,
  fetchPetabencanaReports,
  BmkgGempaData,
  PetabencanaReport,
} from "@/lib/api";

interface Alert {
  id: string;
  level: "Rendah" | "Sedang" | "Tinggi";
  location: string;
  timestamp: string;
  reason: string;
  details?: string;
  affectedAreas?: string[];
  estimatedPopulation?: number;
  severity?: number;
}

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

const generateMockAlert = (index: number): Alert => {
  const now = new Date().toLocaleString("id-ID");
  const levels = ["Tinggi", "Sedang", "Rendah"];
  const locations = [
    "Simulasi - Jawa Barat",
    "Simulasi - Kalimantan Tengah",
    "Simulasi - Sulawesi Selatan",
    "Simulasi - Sumatera Utara",
    "Simulasi - Nusa Tenggara Timur",
  ];
  const reasons = [
    "Sistem mendeteksi anomali cuaca ekstrem, potensi banjir bandang.",
    "Peningkatan muka air sungai yang signifikan, waspada luapan.",
    "Hujan ringan di wilayah pesisir, drainase terkontrol dengan baik.",
    "Sensor menunjukkan kenaikan debit air sungai di hulu, siaga dini.",
    "Terjadi genangan di beberapa ruas jalan akibat drainase kurang optimal.",
  ];
  const affectedAreasOptions = [
    ["Cianjur", "Sukabumi", "Garut"],
    ["Palangkaraya", "Katingan", "Seruyan"],
    ["Makassar", "Gowa", "Maros"],
    ["Medan", "Deli Serdang", "Binjai"],
    ["Kupang", "Timor Tengah Selatan"],
  ];

  return {
    id: `mock-dynamic-${generateUniqueId()}`,
    level: levels[index % levels.length] as Alert["level"],
    location: locations[index % locations.length],
    timestamp: now,
    reason: reasons[index % reasons.length],
    affectedAreas: affectedAreasOptions[index % affectedAreasOptions.length],
    estimatedPopulation:
      (index + 1) * 25000 + Math.floor(Math.random() * 10000),
    severity: parseFloat((Math.random() * 5 + 5).toFixed(1)),
  };
};

export async function GET() {
  console.log(
    "API Route: /api/alerts-data received GET request to fetch real-time data."
  );

  let aggregatedAlerts: Alert[] = [];

  try {
    const bmkgQuake: BmkgGempaData = await fetchBmkgLatestQuake();
    console.log("Fetched BMKG Latest Quake:", bmkgQuake.Wilayah);

    const quakeSeverity = parseFloat(bmkgQuake.Magnitude);
    let quakeLevel: Alert["level"] = "Rendah";
    if (quakeSeverity >= 6.0) quakeLevel = "Tinggi";
    else if (quakeSeverity >= 4.5) quakeLevel = "Sedang";

    aggregatedAlerts.push({
      id: `bmkg-quake-${bmkgQuake.DateTime.replace(
        /\s|\./g,
        "_"
      )}-${generateUniqueId()}`,
      level: quakeLevel,
      location: bmkgQuake.Wilayah,
      timestamp: `${bmkgQuake.Tanggal} ${bmkgQuake.Jam} WIB`,
      reason: `Gempa M${bmkgQuake.Magnitude} di ${bmkgQuake.Wilayah}`,
      details: `Kedalaman ${bmkgQuake.Kedalaman}. ${bmkgQuake.Potensi}. Dirasakan: ${bmkgQuake.Dirasakan}.`,
      affectedAreas: bmkgQuake.Wilayah.split(",").map((s) => s.trim()),
      estimatedPopulation: 0,
      severity: quakeSeverity,
    });
  } catch (error: any) {
    console.error("Error fetching BMKG earthquake data:", error.message);
  }

  const hazardTypes = ["flood", "earthquake", "haze", "volcano"];
  const timeframes = ["24h", "3d"];

  for (const hazardType of hazardTypes) {
    for (const timeframe of timeframes) {
      try {
        const petabencanaReports: PetabencanaReport[] =
          await fetchPetabencanaReports(hazardType, timeframe);
        console.log(
          `Fetched ${petabencanaReports.length} PetaBencana.id ${hazardType} reports for ${timeframe}.`
        );

        petabencanaReports.forEach((report) => {
          const baseId = `petabencana-${hazardType}-${report._id}`;
          if (aggregatedAlerts.some((alert) => alert.id.includes(baseId))) {
            return;
          }

          let reportLevel: Alert["level"] = "Rendah";
          let severityFromReport = report.severity || 0;

          if (
            report.status === "Siaga" ||
            report.status === "Waspada" ||
            report.cat === "flood" ||
            report.event_type.toLowerCase().includes("banjir")
          )
            reportLevel = "Tinggi";
          else if (report.status === "Terpantau" || report.status === "Aman")
            reportLevel = "Sedang";
          else reportLevel = "Rendah";

          if (severityFromReport === 0) {
            const severityMatchText =
              report.detail.id.match(/skala (\d+\.?\d*)/i);
            if (severityMatchText && parseFloat(severityMatchText[1])) {
              severityFromReport = parseFloat(severityMatchText[1]);
            } else if (
              report.event_type.toLowerCase().includes("ketinggian air")
            ) {
              severityFromReport =
                reportLevel === "Tinggi" ? 8 : reportLevel === "Sedang" ? 5 : 3;
            } else if (report.cat === "earthquake") {
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
                !s.toLowerCase().includes("skala") &&
                !s.toLowerCase().includes("waktu")
            );

          aggregatedAlerts.push({
            id: `${baseId}-${generateUniqueId()}`,
            level: reportLevel,
            location:
              report.detail.id.split(",")[0].trim() || "Tidak diketahui",
            timestamp: new Date(report.timestamp).toLocaleString("id-ID"),
            reason: report.event_type || report.cat || "Laporan Bencana",
            details: report.detail.id,
            affectedAreas:
              affectedAreasList.length > 0
                ? affectedAreasList
                : [report.detail.id.split(",")[0].trim()],
            estimatedPopulation: undefined,
            severity: severityFromReport > 0 ? severityFromReport : undefined,
          });
        });
      } catch (error: any) {
        console.error(
          `Error fetching PetaBencana.id ${hazardType} reports for ${timeframe}:`,
          error.message
        );
      }
    }
  }

  // --- 3. Tambahkan Data Mock Darurat (Fallback jika semua API gagal atau kurang data) ---
  // Targetkan jumlah alert yang bervariasi antara 2 hingga 7
  const targetMinAlerts = Math.floor(Math.random() * (7 - 2 + 1)) + 2; // Random number between 2 and 7 (inclusive)
  let mockIndex = 0;
  while (aggregatedAlerts.length < targetMinAlerts) {
    console.warn(
      `Insufficient real-time alerts (${aggregatedAlerts.length}). Adding emergency mock data.`
    );
    aggregatedAlerts.push(generateMockAlert(mockIndex++));
  }

  // --- Finalisasi: Pastikan timestamp semua alert selalu up-to-date dan unik ---
  const nowFormatted = new Date().toLocaleString("id-ID");
  const finalAlertsWithFreshTimestamps = aggregatedAlerts.map((alert) => ({
    ...alert,
    timestamp: nowFormatted, // Force semua timestamp ke waktu sekarang
    // Tambahkan ID unik tambahan jika ID aslinya tidak cukup dinamis untuk re-render
    id: alert.id.includes("mock-dynamic-")
      ? alert.id
      : `${alert.id}-${generateUniqueId()}`,
  }));

  // Sortir peringatan berdasarkan tingkat keparahan (severity, jika ada), kemudian level
  finalAlertsWithFreshTimestamps.sort((a, b) => {
    if (a.severity && b.severity) {
      return b.severity - a.severity;
    }
    const levelOrder = { Tinggi: 3, Sedang: 2, Rendah: 1 };
    return (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
  });

  // Ambil hanya sejumlah peringatan teratas untuk menjaga performa UI
  const slicedAlerts = finalAlertsWithFreshTimestamps.slice(0, 10); // Tetap maks 10 peringatan

  return NextResponse.json(slicedAlerts, { status: 200 });
}
