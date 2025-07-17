// mattyudha/floodzy/Floodzy-04cbe0509e23f883f290033cafa7f880e929fe65/app/peringatan/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  Newspaper, // New icon for news section
  MessageSquare, // Icon for Gemini
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge"; // Import Badge
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

import {
  fetchBmkgLatestQuake,
  fetchPetabencanaReports,
  BmkgGempaData,
  PetabencanaReport,
} from "@/lib/api";

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

// Tipe data untuk laporan/berita
interface NewsReport {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  timestamp: string;
}

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

// Mock function to simulate fetching news/reports
// In a real application, this would fetch from an actual news API or a curated feed.
const fetchNewsAndReports = async (): Promise<NewsReport[]> => {
  // Simulate fetching recent news/reports about disasters from various sources
  // For now, we'll return a static array of mock news reports.
  // In a real scenario, this would involve scraping or using specific news APIs.
  const now = new Date();
  return [
    {
      id: "news-1",
      title: "Banjir Jakarta: Ketinggian Air Terus Meningkat di Beberapa Titik",
      content:
        "Jakarta, [tanggal]. Curah hujan tinggi semalam menyebabkan peningkatan drastis ketinggian air di beberapa wilayah Jakarta, termasuk Kemang, Cipinang Melayu, dan Bidara Cina. BPBD DKI Jakarta mengimbau warga untuk tetap waspada dan mempersiapkan diri untuk evakuasi.",
      source: "Detik News",
      url: "https://www.detik.com/banjirjakarta",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "news-2",
      title:
        "Gempa Bumi Magnitudo 5.2 Guncang Malang, Tidak Berpotensi Tsunami",
      content:
        "Malang, [tanggal]. Gempa bumi berkekuatan Magnitudo 5.2 mengguncang wilayah Malang, Jawa Timur pada pagi hari. Menurut BMKG, pusat gempa berada di laut dengan kedalaman 10 km dan tidak berpotensi tsunami. Getaran dirasakan hingga beberapa kota di sekitarnya.",
      source: "Kompas.com",
      url: "https://www.kompas.com/gempa-malang",
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: "news-3",
      title: "Peringatan Dini Cuaca Ekstrem di Sumatera Barat Minggu Ini",
      content:
        "Padang, [tanggal]. Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) mengeluarkan peringatan dini cuaca ekstrem untuk wilayah Sumatera Barat. Hujan lebat disertai angin kencang berpotensi terjadi di sejumlah daerah, meningkatkan risiko banjir dan longsor.",
      source: "Antara News",
      url: "https://www.antaranews.com/cuaca-sumbar",
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    },
    {
      id: "news-4",
      title:
        "Debit Air Sungai Ciliwung Mencapai Siaga 3, Warga Diminta Waspada",
      content:
        "Bogor, [tanggal]. Debit air Sungai Ciliwung terpantau terus meningkat dan kini mencapai status Siaga 3. Pintu air Katulampa mencatat kenaikan signifikan setelah hujan deras di kawasan Puncak. Warga yang tinggal di bantaran sungai diimbau untuk meningkatkan kewaspadaan.",
      source: "Tempo",
      url: "https://www.tempo.co/ciliwung",
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
  ];
};

export default function PeringatanPage() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newsReports, setNewsReports] = useState<NewsReport[]>([]); // New state for news reports
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(
    null
  );
  const [geminiNewsSummary, setGeminiNewsSummary] = useState<{
    [key: string]: string;
  }>({}); // Store summaries by report ID
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false); // New loading state for news summary
  const [error, setError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null); // New error state for news

  const fetchLatestAlerts = async () => {
    try {
      const response = await fetch("/api/alerts-data");
      if (!response.ok) {
        throw new Error("Failed to fetch latest alerts.");
      }
      const data = await response.json();
      setAlerts(data);
    } catch (err: any) {
      console.error("Error fetching latest alerts:", err);
      // Anda bisa menampilkan pesan error di UI jika diperlukan
    }
  };

  const fetchAndSummarizeNews = async () => {
    setIsNewsLoading(true);
    setNewsError(null);
    setGeminiNewsSummary({}); // Clear previous summaries
    try {
      const reports = await fetchNewsAndReports(); // Fetch mock news
      setNewsReports(reports);

      const newSummaries: { [key: string]: string } = {};
      for (const report of reports) {
        try {
          const summaryResponse = await fetch("/api/gemini-alerts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              alertData: {
                level: "info", // Default level for news summary context
                location: report.source,
                timestamp: report.timestamp,
                reason: report.title,
                severity: 5, // Default severity for news summary context
                affectedAreas: [], // No specific affected areas from news
                estimatedPopulation: 0, // No specific population from news
                newsContent: report.content, // Pass the full news content
                requestType: "news_summary", // Indicate this is a news summary request
              },
            }),
          });

          if (!summaryResponse.ok) {
            const errorData = await summaryResponse.json();
            throw new Error(
              errorData.error ||
                `Failed to summarize news from Gemini: ${report.id}`
            );
          }
          const summaryData = await summaryResponse.json();
          newSummaries[report.id] = summaryData.explanation;
        } catch (summaryErr: any) {
          console.error(
            `Error summarizing news report ${report.id}:`,
            summaryErr
          );
          newSummaries[
            report.id
          ] = `Gagal merangkum berita ini: ${summaryErr.message}`;
        }
      }
      setGeminiNewsSummary(newSummaries);
    } catch (err: any) {
      console.error("Error fetching news and reports:", err);
      setNewsError(err.message || "Gagal memuat berita dan laporan.");
    } finally {
      setIsNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAlerts();
    fetchAndSummarizeNews(); // Fetch and summarize news on component mount

    const alertIntervalId = setInterval(fetchLatestAlerts, 30000);
    const newsIntervalId = setInterval(fetchAndSummarizeNews, 60000 * 5); // Fetch news every 5 minutes

    return () => {
      clearInterval(alertIntervalId);
      clearInterval(newsIntervalId);
    };
  }, []);

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
      const response = await fetch("/api/gemini-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertData: alert }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Gagal mengambil penjelasan dari Gemini API."
        );
      }

      const data = await response.json();
      setGeminiExplanation(data.explanation);
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

  const totalAlerts = alerts.length;
  const highAlerts = alerts.filter((a) => a.level === "Tinggi").length;
  const mediumAlerts = alerts.filter((a) => a.level === "Sedang").length;
  const lowAlerts = alerts.filter((a) => a.level === "Rendah").length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
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
          </motion.div>
        </div>

        {/* Tabs for Alerts and News */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800 border border-gray-700">
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:text-gray-400"
            >
              <Bell className="w-4 h-4 mr-2" /> Peringatan
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:text-gray-400"
            >
              <Newspaper className="w-4 h-4 mr-2" /> Berita Regional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            {/* Alert Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {alerts.length === 0 && !isLoading && !error ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center text-gray-400 py-8"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p>Memuat peringatan terkini...</p>
                  </motion.div>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
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
                          <span className="text-sm font-medium">
                            {alert.level}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{alert.timestamp.split(" ")[1]}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold">
                          {alert.location}
                        </h3>
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
                            <span className="text-xs text-gray-400">
                              Terpengaruh
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {alert.estimatedPopulation?.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Droplets className="h-4 w-4 text-cyan-400" />
                            <span className="text-xs text-gray-400">
                              Severity
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {alert.severity}/10
                          </span>
                        </div>
                      </div>

                      {/* Areas */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Wilayah Terdampak:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {alert.affectedAreas
                            ?.slice(0, 3)
                            .map((area, areaIndex) => (
                              <span
                                key={areaIndex}
                                className="bg-gray-700 text-xs px-2 py-1 rounded"
                              >
                                {area}
                              </span>
                            ))}
                          {alert.affectedAreas &&
                            alert.affectedAreas.length > 3 && (
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
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
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
          </TabsContent>

          <TabsContent value="news">
            {/* News and Reports Section */}
            <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Newspaper className="h-6 w-6 text-orange-400" />
              <span>Berita & Laporan Regional</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Ringkasan berita terkait bencana dari berbagai sumber, ditenagai
              oleh Gemini.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isNewsLoading ? (
                <div className="col-span-full text-center text-gray-400 py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-orange-400 mx-auto mb-4" />
                  <p>
                    Memuat dan merangkum berita mohon tungggu beberapa menit...
                  </p>
                </div>
              ) : newsError ? (
                <div className="col-span-full bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-medium">
                      Error Memuat Berita
                    </span>
                  </div>
                  <p className="text-red-300">{newsError}</p>
                </div>
              ) : newsReports.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-8">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Tidak ada berita atau laporan yang tersedia saat ini.</p>
                </div>
              ) : (
                newsReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">
                        {report.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {report.source}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      <Clock className="inline-block h-3 w-3 mr-1" />{" "}
                      {new Date(report.timestamp).toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center space-x-2 text-cyan-400 mb-3">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-base font-medium">
                        Ringkasan Gemini:
                      </span>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                      {geminiNewsSummary[report.id] ? (
                        <p className="text-sm text-gray-300 whitespace-pre-line">
                          {geminiNewsSummary[report.id]}
                        </p>
                      ) : (
                        <div className="flex items-center text-gray-400 text-sm">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Merangkum...</span>
                        </div>
                      )}
                    </div>
                    {report.url && (
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm"
                      >
                        Baca Selengkapnya{" "}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
