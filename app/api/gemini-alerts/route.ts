import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Load API key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Debug log untuk memastikan API key ter-load
console.log(
  "[Gemini API] Key Loaded:",
  GEMINI_API_KEY ? "✅ Yes" : "❌ Missing"
);

// ✅ Inisialisasi AI instance (PERBAIKAN DI SINI)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function POST(request: Request) {
  if (!genAI) {
    console.error("[Gemini API] ❌ API key not found.");
    return NextResponse.json(
      { error: "GEMINI_API_KEY is missing in environment." },
      { status: 500 }
    );
  }

  try {
    const rawBody = await request.text();
    console.log("[Gemini API] 📥 Raw Request Body:", rawBody);

    const body = JSON.parse(rawBody);
    const alertData = body?.alertData;

    if (!alertData) {
      console.warn("[Gemini API] ⚠️ 'alertData' missing in request.");
      return NextResponse.json(
        { error: "'alertData' is required in request body." },
        { status: 400 }
      );
    }

    const {
      level,
      location,
      timestamp,
      reason,
      affectedAreas,
      estimatedPopulation,
      severity,
    } = alertData;

    if (!level || !location || !timestamp || !reason || severity == null) {
      console.warn("[Gemini API] ⚠️ Required fields missing.");
      return NextResponse.json(
        {
          error: "Missing required fields in 'alertData'.",
          missing: {
            level: !level,
            location: !location,
            timestamp: !timestamp,
            reason: !reason,
            severity: severity == null,
          },
        },
        { status: 400 }
      );
    }

    // ✅ Professional disaster analysis prompt dengan struktur output yang menarik
    const prompt = `
Anda adalah Ahli Mitigasi Bencana dan Analisis Risiko profesional dengan spesialisasi dalam komunikasi krisis. Buatlah laporan peringatan bencana yang SANGAT MENARIK, PROFESIONAL, dan TERSTRUKTUR.

📊 DATA PERINGATAN BENCANA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 Tingkat Peringatan: ${level}
📍 Lokasi: ${location}
⏰ Waktu Kejadian: ${timestamp}
💡 Penyebab Utama: ${reason}
🏘️ Wilayah Terdampak: ${
      affectedAreas?.length ? affectedAreas.join(", ") : "Tidak diketahui"
    }
👥 Estimasi Populasi: ${
      estimatedPopulation?.toLocaleString("id-ID") ?? "Tidak diketahui"
    } jiwa
⚠️ Tingkat Keparahan: ${severity}/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT OUTPUT YANG WAJIB:
Buatlah laporan dengan format yang SANGAT MENARIK dan PROFESIONAL berikut:

🔴 **EXECUTIVE SUMMARY BENCANA**
───────────────────────────────────────
[Ringkasan singkat namun impactful dalam 2-3 kalimat yang langsung menjelaskan situasi kritis]

📈 **ANALISIS STATISTIK KOMPREHENSIF**
───────────────────────────────────────
• **Intensitas Kejadian**: [Berikan data spesifik seperti curah hujan X mm/jam, kecepatan angin Y km/jam, magnitudo Z, dll]
• **Perbandingan Historis**: [Bandingkan dengan kejadian serupa 5-10 tahun terakhir dengan persentase]
• **Proyeksi Dampak**: [Estimasi area terdampak dalam km², jumlah bangunan berisiko, kerugian ekonomi]
• **Probabilitas Eskalasi**: [Persentase kemungkinan memburuk dalam 6-24 jam kedepan]
• **Indeks Risiko Regional**: [Skor 1-100 berdasarkan kerentanan wilayah]

🌍 **ANALISIS GEOGRAFIS & METEOROLOGIS**
───────────────────────────────────────
[Jelaskan kondisi geografis spesifik, topografi, dan faktor meteorologis yang mempengaruhi. Gunakan data teknis yang akurat]

⚡ **SKENARIO DAMPAK BERTINGKAT**
───────────────────────────────────────
🟡 **SKENARIO RINGAN (Probabilitas: X%)**
   → Dampak: [Jelaskan konsekuensi minimal]
   → Durasi: [Estimasi waktu]
   → Area: [Jangkauan geografis]

🟠 **SKENARIO SEDANG (Probabilitas: Y%)**
   → Dampak: [Jelaskan konsekuensi menengah]
   → Durasi: [Estimasi waktu]
   → Area: [Jangkauan geografis]

🔴 **SKENARIO BERAT (Probabilitas: Z%)**
   → Dampak: [Jelaskan konsekuensi maksimal]
   → Durasi: [Estimasi waktu]
   → Area: [Jangkauan geografis]

🛡️ **PROTOKOL RESPONS DARURAT**
───────────────────────────────────────
**FASE 1 - TINDAKAN SEGERA (0-2 jam)**
• [Langkah konkret dengan timeline spesifik]
• [Rute evakuasi dengan koordinat GPS jika memungkinkan]
• [Kontak darurat prioritas]

**FASE 2 - STABILISASI (2-6 jam)**
• [Tindakan lanjutan untuk keamanan]
• [Koordinasi dengan pihak berwenang]
• [Persiapan kebutuhan dasar]

**FASE 3 - PEMULIHAN (6-24 jam)**
• [Langkah evaluasi dan normalisasi]
• [Monitoring kondisi]
• [Rencana pemulihan awal]

📱 **SISTEM MONITORING TERPADU**
───────────────────────────────────────
• **Frekuensi Update**: [Setiap X menit/jam]
• **Indikator Kritis**: [Parameter yang harus dipantau]
• **Threshold Eskalasi**: [Nilai yang memicu peningkatan status]
• **Kanal Komunikasi**: [Platform resmi untuk update]

🎯 **REKOMENDASI STRATEGIS**
───────────────────────────────────────
[Berikan rekomendasi spesifik berdasarkan karakteristik bencana dan wilayah]

⚠️ **PERINGATAN KHUSUS**
───────────────────────────────────────
[Highlight risiko spesifik yang perlu perhatian ekstra]

PENTING: 
- Gunakan data numerik yang realistis dan spesifik
- Sertakan persentase, estimasi waktu, dan ukuran yang konkret
- Buat tampilan yang visual dengan emoji dan formatting yang menarik
- Gunakan bahasa profesional namun mudah dipahami
- Pastikan semua informasi actionable dan praktis
- Berikan sense of urgency yang tepat tanpa menimbulkan panik
    `.trim();

    console.log(
      "[Gemini API] ✉️ Sending PROFESSIONAL disaster analysis prompt to Gemini..."
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const explanation = await response.text();

    // ✅ Generate statistical data untuk dashboard
    const generateStatisticalData = (alertData: any) => {
      const { severity, estimatedPopulation, affectedAreas, level } = alertData;

      // Generate realistic statistics based on severity and population
      const baseImpact = severity * 0.1;
      const populationAtRisk = estimatedPopulation || 10000;

      return {
        overviewStats: {
          totalAlertsToday: Math.floor(Math.random() * 50) + 10,
          activeAlerts: Math.floor(Math.random() * 15) + 5,
          resolvedAlerts: Math.floor(Math.random() * 30) + 15,
          criticalAlerts:
            severity >= 7
              ? Math.floor(Math.random() * 8) + 2
              : Math.floor(Math.random() * 3),
        },
        impactAnalysis: {
          populationAtRisk: populationAtRisk,
          evacuationCenters: Math.floor(populationAtRisk / 2000) + 2,
          emergencyResponders: Math.floor(populationAtRisk / 1000) + 10,
          affectedInfrastructure: Math.floor(severity * 12) + 5,
        },
        riskDistribution: {
          highRisk: Math.floor(baseImpact * 100 * 0.3) + "%",
          mediumRisk: Math.floor(baseImpact * 100 * 0.4) + "%",
          lowRisk: Math.floor(baseImpact * 100 * 0.3) + "%",
        },
        timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          riskLevel: Math.floor(Math.random() * severity) + 1,
          incidents: Math.floor(Math.random() * 10) + 1,
          responses: Math.floor(Math.random() * 8) + 1,
        })),
        departmentResponse: {
          fireDepart: {
            deployed: Math.floor(severity * 5) + 3,
            available: Math.floor(severity * 3) + 2,
            utilization: Math.floor(baseImpact * 80) + 20,
          },
          medicalTeam: {
            deployed: Math.floor(severity * 3) + 2,
            available: Math.floor(severity * 2) + 1,
            utilization: Math.floor(baseImpact * 70) + 15,
          },
          police: {
            deployed: Math.floor(severity * 4) + 2,
            available: Math.floor(severity * 2) + 1,
            utilization: Math.floor(baseImpact * 60) + 25,
          },
          volunteers: {
            deployed: Math.floor(severity * 8) + 5,
            available: Math.floor(severity * 5) + 3,
            utilization: Math.floor(baseImpact * 50) + 30,
          },
        },
        resourceAllocation:
          affectedAreas?.map((area: string, index: number) => ({
            area: area,
            priority: severity >= 7 ? "HIGH" : severity >= 4 ? "MEDIUM" : "LOW",
            resources: Math.floor(severity * 15) + 10,
            personnel: Math.floor(severity * 8) + 5,
            equipment: Math.floor(severity * 6) + 3,
            status:
              index % 3 === 0
                ? "ACTIVE"
                : index % 3 === 1
                ? "STANDBY"
                : "DEPLOYED",
          })) || [],
        performanceMetrics: {
          responseTime: Math.floor(severity * 2) + 3 + " minutes",
          resolutionRate: Math.floor(90 - severity * 3) + "%",
          publicSatisfaction: Math.floor(85 - severity * 2) + "%",
          resourceEfficiency: Math.floor(80 - severity * 1.5) + "%",
        },
      };
    };

    const statisticalData = generateStatisticalData(alertData);

    console.log(
      "[Gemini API] ✅ PROFESSIONAL disaster analysis with statistics generated."
    );
    return NextResponse.json(
      {
        explanation,
        statistics: statisticalData,
        metadata: {
          generatedAt: new Date().toISOString(),
          modelUsed: "gemini-1.5-flash",
          promptVersion: "professional-v2.0",
          responseLength: explanation.length,
          alertLevel: level,
          severityScore: severity,
          includesStatistics: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Gemini API] ❌ Error:", error?.message);
    return NextResponse.json(
      {
        error: "Failed to generate explanation.",
        message: error?.message || "Unknown error",
        stack: error?.stack || null,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("[Gemini API] 🔎 Health check passed.");
  return NextResponse.json(
    { message: "Gemini API (Flash) is running OK" },
    { status: 200 }
  );
}
