"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // <--- IMPORT INI
import {
  Bell,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Loader2,
  ChevronRight,
  TrendingUp,
  Droplets,
  Eye,
  Users,
  Shield,
  ChevronLeft, // <--- IMPORT ICON INI UNTUK TOMBOL KEMBALI
} from "lucide-react";

// Asumsi Anda menggunakan komponen Card dan Button dari shadcn/ui atau sejenisnya
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Gunakan Button dari UI Anda

// Tipe data untuk peringatan
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

export default function PeringatanPage() {
  const router = useRouter(); // <--- INISIALISASI ROUTER

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert-1",
      level: "Tinggi",
      location: "Jakarta Selatan",
      timestamp: "2025-07-12 09:00 WIB",
      reason:
        "Curah hujan sangat lebat (>100mm/jam) di hulu sungai Ciliwung dan meluapnya beberapa anak sungai.",
      affectedAreas: ["Kemang", "Pancoran", "Tebet", "Kebayoran Baru"],
      estimatedPopulation: 150000,
      severity: 8.5,
    },
    {
      id: "alert-2",
      level: "Sedang",
      location: "Bandung Utara",
      timestamp: "2025-07-11 18:30 WIB",
      reason:
        "Peningkatan debit air di Sungai Cikapundung akibat hujan deras lokal.",
      affectedAreas: ["Dago", "Coblong", "Sukasari"],
      estimatedPopulation: 75000,
      severity: 6.2,
    },
    {
      id: "alert-3",
      level: "Rendah",
      location: "Surabaya Pusat",
      timestamp: "2025-07-10 10:15 WIB",
      reason:
        "Genangan air di beberapa ruas jalan akibat drainase yang kurang optimal setelah hujan.",
      affectedAreas: ["Gubeng", "Tegalsari", "Genteng"],
      estimatedPopulation: 35000,
      severity: 3.8,
    },
  ]);

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Tinggi":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Sedang":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Rendah":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Tinggi":
        return <AlertTriangle className="h-5 w-5" />;
      case "Sedang":
        return <Info className="h-5 w-5" />;
      case "Rendah":
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const fetchGeminiExplanation = async (alert: Alert) => {
    setIsLoading(true);
    setError(null);
    setGeminiExplanation(null);
    setSelectedAlert(alert);

    try {
      // --- Ini adalah bagian di mana Anda memanggil API Gemini sebenarnya ---
      const response = await fetch("/api/gemini-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertData: alert }), // Kirim data peringatan ke API Gemini
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Gagal mengambil penjelasan dari Gemini API."
        );
      }

      const data = await response.json();
      setGeminiExplanation(data.explanation);
      // --- Akhir bagian API Gemini ---
    } catch (err: any) {
      console.error("Error fetching explanation:", err);
      setError(
        err.message ||
          "Terjadi kesalahan saat memuat penjelasan detail. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Statistik ringkasan
  const totalAlerts = alerts.length;
  const highAlerts = alerts.filter((a) => a.level === "Tinggi").length;
  const mediumAlerts = alerts.filter((a) => a.level === "Sedang").length;
  const lowAlerts = alerts.filter((a) => a.level === "Rendah").length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HAPUS ATAU KOMENTARI BAGIAN HEADER INI JIKA PeringatanPage 
        dirender di dalam app/layout.tsx yang sudah memiliki Header global.
      */}
      {/* <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-cyan-400" />
                <h1 className="text-2xl font-bold">Floodzie</h1>
              </div>
              <span className="text-gray-400 text-sm">Sistem Deteksi Banjir</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Live Update</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title with Back Button */}
        <div className="mb-8 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()} // <--- FUNGSI TOMBOL KEMBALI
            className="mr-2 h-10 w-10 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Peringatan Bencana Terkini
            </h2>
            <p className="text-gray-400">
              Monitoring dan analisis peringatan banjir real-time
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Peringatan</p>
                <p className="text-2xl font-bold">{totalAlerts}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">Aktif</span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tingkat Tinggi</p>
                <p className="text-2xl font-bold text-red-400">{highAlerts}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-400">Perlu Tindakan Segera</span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tingkat Sedang</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {mediumAlerts}
                </p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Info className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-400">Pantau Terus</span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tingkat Rendah</p>
                <p className="text-2xl font-bold text-green-400">{lowAlerts}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-400">Kondisi Stabil</span>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-gray-800 border border-gray-700 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 ${
                selectedAlert?.id === alert.id
                  ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                  : ""
              }`}
              onClick={() => fetchGeminiExplanation(alert)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getLevelColor(
                    alert.level
                  )}`}
                >
                  {getLevelIcon(alert.level)}
                  <span className="text-sm font-medium">{alert.level}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{alert.timestamp.split(" ")[1]}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold">{alert.location}</h3>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {alert.reason}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Terpengaruh</span>
                  </div>
                  <span className="text-sm font-medium">
                    {alert.estimatedPopulation?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-gray-400">Severity</span>
                  </div>
                  <span className="text-sm font-medium">
                    {alert.severity}/10
                  </span>
                </div>
              </div>

              {/* Areas */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Wilayah Terdampak:</p>
                <div className="flex flex-wrap gap-1">
                  {alert.affectedAreas?.slice(0, 3).map((area, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {area}
                    </span>
                  ))}
                  {alert.affectedAreas && alert.affectedAreas.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{alert.affectedAreas.length - 3} lainnya
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchGeminiExplanation(alert);
                }}
                disabled={isLoading && selectedAlert?.id === alert.id}
              >
                {isLoading && selectedAlert?.id === alert.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>Lihat Penjelasan Detail</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedAlert && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                Detail Peringatan: {selectedAlert.location}
              </h3>
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getLevelColor(
                  selectedAlert.level
                )}`}
              >
                {getLevelIcon(selectedAlert.level)}
                <span className="font-medium">{selectedAlert.level}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-300">
                    Memuat analisis mendalam...
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Menganalisis data dari berbagai sumber
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 font-medium">Error</span>
                </div>
                <p className="text-red-300">{error}</p>
              </div>
            ) : geminiExplanation ? (
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-line text-gray-200 leading-relaxed">
                    {geminiExplanation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Pilih peringatan untuk melihat analisis mendalam
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
