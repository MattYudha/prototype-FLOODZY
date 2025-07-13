"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { FloodAlert } from "@/components/flood/FloodAlert";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  MapPin,
  Bell,
  Users,
  Shield,
  Activity,
  ArrowRight,
  AlertTriangle,
  CloudRain,
  Waves,
  Globe,
  Send,
  Bot,
  User,
  Droplets,
  Info,
  Clock,
  Zap,
  MessageSquare, // New import for chatbot icon
  X, // New import for close icon
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  FLOOD_MOCK_ALERTS,
  DASHBOARD_STATS_MOCK,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/lib/constants";
import { cn, formatNumber, getTimeAgo } from "@/lib/utils";
import { RegionDropdown } from "@/components/region-selector/RegionDropdown";
import { FloodMap } from "@/components/map/FloodMap";

import {
  fetchDisasterProneData,
  OverpassElement,
  fetchWeatherData,
  WeatherData,
  fetchWaterLevelData,
  WaterLevelPost,
  fetchPumpStatusData,
  PumpData,
  fetchBmkgLatestQuake,
  BmkgGempaData,
} from "@/lib/api";

const OPEN_WEATHER_API_KEY = "b48e2782f52bd9c6783ef14a35856abc";
const ROTATION_INTERVAL_MS = 10000; // Ganti berita setiap 10 detik (10000 ms)
const DATA_FETCH_INTERVAL_MS = 10 * 60 * 1000; // Fetch data setiap 10 menit (600000 ms)

interface SelectedLocationDetails {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
}

interface FloodAlertItem {
  id: string;
  regionId: string;
  level: "info" | "warning" | "danger";
  title: string;
  message: string;
  timestamp: string;
  isActive: boolean;
  affectedAreas: string[];
  actions?: string[];
}

// === KOMPONEN CyclingAlertCard ===
const CyclingAlertCard = ({
  alerts,
  initialOffset = 0,
}: {
  alerts: FloodAlertItem[];
  initialOffset?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialOffset);

  useEffect(() => {
    if (alerts.length > 0) {
      setCurrentIndex((initialOffset) => initialOffset % alerts.length); // Pastikan index awal valid

      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
      }, ROTATION_INTERVAL_MS);

      return () => clearInterval(interval);
    } else {
      setCurrentIndex(0);
    }
  }, [alerts.length, initialOffset]);

  if (alerts.length === 0) {
    return (
      <Alert variant="info" className="w-full">
        <Bell className="h-4 w-4" />
        <AlertTitle>Tidak ada peringatan aktif</AlertTitle>
        <AlertDescription>
          Mohon maaf, tidak ada berita atau peringatan yang tersedia saat ini.
        </AlertDescription>
      </Alert>
    );
  }

  const currentAlert = alerts[currentIndex];

  if (!currentAlert || !currentAlert.id) {
    console.warn(
      "CyclingAlertCard: currentAlert atau currentAlert.id tidak terdefinisi.",
      currentAlert
    );
    return (
      <Alert variant="warning" className="w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Peringatan tidak valid</AlertTitle>
        <AlertDescription>
          Terjadi masalah saat memuat peringatan. Mencoba lagi...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAlert.id + "-" + currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <FloodAlert alert={currentAlert} />
      </motion.div>
    </AnimatePresence>
  );
};

// --- INI ADALAH KOMPONEN UTAMA UNTUK HALAMAN ROOT ---
export default function Home() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationDetails | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [disasterProneAreas, setDisasterProneAreas] = useState<
    OverpassElement[]
  >([]);
  const [loadingDisasterData, setLoadingDisasterData] = useState(false);
  const [disasterDataError, setLoadingDisasterDataError] = useState<
    string | null
  >(null);

  const [currentWeatherData, setCurrentWeatherData] =
    useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [waterLevelPosts, setWaterLevelPosts] = useState<WaterLevelPost[]>([]);
  const [loadingWaterLevel, setLoadingWaterLevel] = useState(false);
  const [waterLevelError, setWaterLevelError] = useState<string | null>(null);

  const [pumpStatusData, setPumpStatusData] = useState<PumpData[]>([]);
  const [loadingPumpStatus, setLoadingPumpStatus] = useState(false);
  const [pumpStatusError, setPumpStatusError] = useState<string | null>(null);

  const [latestBmkgQuake, setLatestBmkgQuake] = useState<BmkgGempaData | null>(
    null
  );
  const [loadingBmkgQuake, setLoadingBmkgQuake] = useState(false);
  const [bmkgQuakeError, setBmkgQuakeError] = useState<string | null>(null);

  const [currentMapBounds, setCurrentMapBounds] = useState<{
    south: number;
    west: number;
    north: number;
    east: number;
  } | null>(null);

  // === State untuk Chatbot (UPDATED) ===
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    {
      sender: "user" | "bot";
      message: string;
      timestamp: Date;
      isError?: boolean;
    }[]
  >([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false); // New state for typing indicator
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State to control chatbot visibility

  // Ref to scroll to the bottom of the chat history
  const chatScrollRef = useRef<HTMLDivElement>(null);
  // ==========================

  // Quick action buttons for chatbot
  const quickActions = [
    {
      icon: Droplets,
      text: "Status Banjir",
      query: "Bagaimana status banjir saat ini?",
    },
    {
      icon: MapPin,
      text: "Lokasi Rawan",
      query: "Dimana lokasi rawan banjir?",
    },
    {
      icon: AlertTriangle,
      text: "Peringatan",
      query: "Apakah ada peringatan banjir?",
    },
    {
      icon: Info,
      text: "Info Cuaca",
      query: "Bagaimana kondisi cuaca hari ini?",
    },
  ];

  // Helper to format time for chat messages
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Simulate typing effect for bot responses
  const simulateTyping = (
    message: string,
    isError: boolean = false,
    callback: () => void
  ) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", message, timestamp: new Date(), isError },
      ]);
      callback(); // Call the callback after typing simulation
    }, 1000 + Math.random() * 2000);
  };

  useEffect(() => {
    if (currentMapBounds) {
      const { south, west, north, east } = currentMapBounds;

      setLoadingDisasterData(true);
      setLoadingDisasterDataError(null);
      fetchDisasterProneData(south, west, north, east)
        .then((data) => {
          setDisasterProneAreas(data.elements);
          console.log(
            "Disaster Prone Data (from map move) from Overpass:",
            data.elements
          );
        })
        .catch((err) => {
          console.error(
            "Error fetching disaster prone data (from map move):",
            err
          );
          setLoadingDisasterDataError(err.message);
          setDisasterProneAreas([]);
        })
        .finally(() => {
          setLoadingDisasterData(false);
        });
    }
  }, [currentMapBounds]);

  useEffect(() => {
    const getLatestQuake = async () => {
      setLoadingBmkgQuake(true);
      setBmkgQuakeError(null);
      try {
        const data = await fetchBmkgLatestQuake();
        setLatestBmkgQuake(data);
        console.log("BMKG Latest Earthquake Data:", data);
      } catch (err: any) {
        console.error("Error fetching BMKG latest earthquake:", err);
        setBmkgQuakeError(err.message);
      } finally {
        setLoadingBmkgQuake(false);
      }
    };

    getLatestQuake();
    const interval = setInterval(getLatestQuake, DATA_FETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Effect to scroll to the bottom of the chat history when it updates (UPDATED)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]); // Added isTyping to dependencies for auto-scroll

  const handleMapBoundsChange = (
    south: number,
    west: number,
    north: number,
    east: number
  ) => {
    setCurrentMapBounds({ south, west, north, east });
  };

  const handleRegionSelect = (
    districtCode: string,
    districtName: string,
    regencyCode: string,
    provinceCode: string,
    latitude?: number,
    longitude?: number,
    geometry?: string
  ) => {
    const newLocation: SelectedLocationDetails = {
      districtCode,
      districtName,
      regencyCode,
      provinceCode,
      latitude,
      longitude,
      geometry,
    };
    setSelectedLocation(newLocation);
    console.log(
      "DEBUG page.tsx: Lokasi Terpilih (newLocation dari dropdown):",
      newLocation
    );

    if (latitude != null && longitude != null) {
      setLoadingWeather(true);
      setWeatherError(null);
      fetchWeatherData(latitude, longitude, OPEN_WEATHER_API_KEY)
        .then((data) => {
          setCurrentWeatherData(data);
          console.log("Weather Data from OpenWeatherMap:", data);
        })
        .catch((err) => {
          console.error("Error fetching weather data:", err);
          setWeatherError(err.message);
          setCurrentWeatherData(null);
        })
        .finally(() => {
          setLoadingWeather(false);
        });

      setLoadingWaterLevel(true);
      setWaterLevelError(null);
      fetchWaterLevelData()
        .then((data) => {
          setWaterLevelPosts(data);
          console.log("Water Level Posts from PUPR API (all):", data);
        })
        .catch((err) => {
          console.error("Error fetching water level data:", err);
          setWaterLevelError(err.message);
          setWaterLevelPosts([]);
        })
        .finally(() => {
          setLoadingWaterLevel(false);
        });

      setLoadingPumpStatus(true);
      setPumpStatusError(null);
      fetchPumpStatusData()
        .then((data) => {
          setPumpStatusData(data);
          console.log("Pump Status Data (all):", data);
        })
        .catch((err) => {
          console.error("Error fetching pump status data:", err);
          setPumpStatusError(err.message);
          setPumpStatusData([]);
        })
        .finally(() => {
          setLoadingPumpStatus(false);
        });

      const buffer = 0.05;
      const south = latitude - buffer;
      const west = longitude - buffer;
      const north = latitude + buffer;
      const east = longitude + buffer;
      setCurrentMapBounds({ south, west, north, east });
    } else {
      setDisasterProneAreas([]);
      setLoadingDisasterData(false);
      setCurrentWeatherData(null);
      setLoadingWeather(false);
      setWaterLevelPosts([]);
      setLoadingWaterLevel(false);
      setPumpStatusData([]);
      setLoadingPumpStatus(false);
      setCurrentMapBounds(null);
    }
  };

  const realTimeAlerts = useMemo(() => {
    const alerts: FloodAlertItem[] = [];

    if (latestBmkgQuake) {
      const quakeTimestampISO =
        latestBmkgQuake.DateTime.replace(" ", "T") + "+07:00";

      alerts.push({
        id: `bmkg-quake-${latestBmkgQuake.DateTime}`,
        regionId: latestBmkgQuake.Wilayah,
        level: parseFloat(latestBmkgQuake.Magnitude) >= 5 ? "danger" : "info",
        title: `Gempa Bumi M${latestBmkgQuake.Magnitude} di ${latestBmkgQuake.Wilayah}`,
        message: `Terjadi gempa bumi berkekuatan ${latestBmkgQuake.Magnitude} SR pada ${latestBmkgQuake.Tanggal}, Pukul ${latestBmkgQuake.Jam} WIB dengan kedalaman ${latestBmkgQuake.Kedalaman}. ${latestBmkgQuake.Potensi}. Dirasakan: ${latestBmkgQuake.Dirasakan}`,
        timestamp: quakeTimestampISO,
        isActive: true,
        affectedAreas: latestBmkgQuake.Wilayah.split(",").map((s) => s.trim()),
        actions: [
          "Tetap tenang",
          "Periksa bangunan",
          "Ikuti informasi resmi BMKG",
        ],
      });
    }

    if (waterLevelPosts.length > 0) {
      waterLevelPosts.forEach((post) => {
        let level: FloodAlertItem["level"] = "info";
        let message = `Tinggi muka air di pos ${post.name}: ${
          post.water_level || "N/A"
        } ${post.unit || ""}.`;
        let actions: string[] = [];

        if (post.status) {
          switch (post.status.toLowerCase()) {
            case "siaga":
              level = "warning";
              message += ` Status: SIAGA!`;
              actions.push("Waspada banjir", "Siapkan rencana evakuasi");
              break;
            case "awas":
              level = "danger";
              message += ` Status: AWAS!`;
              actions.push("Segera evakuasi", "Ikuti arahan petugas");
              break;
            case "normal":
              level = "info";
              message += ` Status: Normal.`;
              break;
            default:
              level = "info";
              break;
          }
        } else if (post.water_level !== undefined && post.water_level > 100) {
          level = "warning";
          message += ` Ketinggian air signifikan!`;
          actions.push("Waspada", "Monitor situasi");
        }

        alerts.push({
          id: `tma-${post.id}`,
          regionId: post.name,
          level: level,
          title: `Update Tinggi Muka Air - ${post.name}`,
          message: message,
          timestamp: post.timestamp || new Date().toISOString(),
          isActive: true,
          affectedAreas: [post.name],
          actions: actions.length > 0 ? actions : ["Monitor situasi"],
        });
      });
    }

    if (currentWeatherData) {
      let level: FloodAlertItem["level"] = "info";
      let title = "Update Cuaca";
      let message = `Cuaca saat ini: ${currentWeatherData.description}. Suhu ${currentWeatherData.temperature}°C.`;
      let actions: string[] = [
        "Pantau prakiraan cuaca",
        "Siapkan payung/jas hujan",
      ];

      if (
        currentWeatherData.rain1h !== undefined &&
        currentWeatherData.rain1h > 5
      ) {
        level = "warning";
        title = "Peringatan Hujan Lebat";
        message = `Hujan lebat diperkirakan ${currentWeatherData.rain1h}mm/jam di area Anda. Waspada potensi banjir!`;
        actions.push(
          "Hindari daerah rawan banjir",
          "Pastikan saluran air bersih"
        );
      } else if (
        currentWeatherData.description.toLowerCase().includes("hujan") ||
        currentWeatherData.description.toLowerCase().includes("badai")
      ) {
        level = "info";
        title = `Update Cuaca - ${currentWeatherData.description}`;
      }

      alerts.push({
        id: `weather-${currentWeatherData.description}-${Date.now()}`,
        regionId: selectedLocation?.districtName || "Lokasi Anda",
        level: level,
        title: title,
        message: message,
        timestamp: currentWeatherData.dt
          ? new Date(currentWeatherData.dt * 1000).toISOString()
          : new Date().toISOString(),
        isActive: true,
        affectedAreas: selectedLocation?.districtName
          ? [selectedLocation.districtName]
          : [],
        actions: actions,
      });
    }

    FLOOD_MOCK_ALERTS.forEach((mockAlert) => alerts.push(mockAlert));

    return alerts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [latestBmkgQuake, waterLevelPosts, currentWeatherData, selectedLocation]);

  const heroCards = [
    {
      title: "Total Wilayah",
      description: "Wilayah yang dipantau",
      count: DASHBOARD_STATS_MOCK.totalRegions,
      icon: MapPin,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Peringatan Aktif",
      description: "Peringatan banjir saat ini",
      count: DASHBOARD_STATS_MOCK.activeAlerts,
      icon: Bell,
      color: "text-warning",
      bgColor: "bg-warning/20",
    },
    {
      title: "Zona Banjir",
      description: "Area yang rawan banjir",
      count: DASHBOARD_STATS_MOCK.floodZones,
      icon: Shield,
      color: "text-danger",
      bgColor: "bg-danger/20",
    },
    {
      title: "Orang Berisiko",
      description: "Estimasi populasi berisiko",
      count: formatNumber(DASHBOARD_STATS_MOCK.peopleAtRisk),
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-secondary/20",
    },
  ];

  // === Fungsi untuk Mengirim Pertanyaan Chatbot (UPDATED) ===
  const sendChatMessage = async (customMessage: string | null = null) => {
    const messageToSend = customMessage || chatInput.trim();
    if (!messageToSend || isChatLoading) return;

    const userMessage = {
      sender: "user" as const, // Explicitly cast to "user" literal type
      message: messageToSend,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true); // Set loading to true initially
    setChatError(null);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Gagal mendapatkan respons dari chatbot."
        );
      }

      const data = await response.json();
      // Pass a callback to simulateTyping to set isChatLoading to false after typing
      simulateTyping(data.answer, false, () => setIsChatLoading(false));
    } catch (err: any) {
      console.error("Error sending message to chatbot:", err);
      setChatError(
        err.message || "Terjadi kesalahan saat memproses pertanyaan."
      );
      // Pass a callback to simulateTyping to set isChatLoading to false after typing
      simulateTyping(
        `Maaf, saya tidak dapat memproses permintaan Anda saat ini. (${err.message})`,
        true,
        () => setIsChatLoading(false)
      );
    } finally {
      // Ensure loading state is always reset, even if simulateTyping doesn't run or has issues
      if (isChatLoading) {
        // Only reset if it's still true
        setIsChatLoading(false);
      }
    }
  };
  // ===============================================

  const handleQuickAction = (query: string) => {
    sendChatMessage(query);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-secondary text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-8 w-8" />
                <h1 className="text-4xl md:text-6xl font-bold">
                  Flood<span className="text-secondary">zie</span>
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                Sistem Deteksi Banjir & Monitoring Cuaca Real-time untuk
                Indonesia
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button size="lg" variant="secondary" className="text-primary">
                  <MapPin className="mr-2 h-5 w-5" />
                  Lihat Peta Banjir
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Peringatan Terkini
                </Button>
              </div>
            </motion.div>

            {/* Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {heroCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="glass text-white border-white/20 hover:bg-white/10 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2 rounded-lg", card.bgColor)}>
                          <card.icon className={cn("h-6 w-6", card.color)} />
                        </div>
                        <Badge variant="glass" className="text-white">
                          {card.count}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-white/80">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-16 h-16 bg-secondary/20 rounded-full"
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/10 rounded-full"
              animate={{
                y: [0, -10, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        </section>

        {/* Region Selector Section */}
        <section className="container mx-auto px-4 py-8 space-y-4">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-aqua-400">
                {/* Title content for RegionDropdown if needed */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegionDropdown
                onSelectDistrict={handleRegionSelect}
                selectedLocationCoords={
                  selectedLocation?.latitude != null &&
                  selectedLocation?.longitude != null
                    ? {
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude,
                        name: selectedLocation.districtName,
                      }
                    : null
                }
                currentWeatherData={currentWeatherData}
                loadingWeather={loadingWeather}
                error={weatherError}
              />
            </CardContent>
          </Card>
        </section>

        {/* Main Dashboard */}
        <section className="container mx-auto px-4 py-8 space-y-8">
          {/* Dashboard Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardStats
              stats={DASHBOARD_STATS_MOCK}
              waterLevelPosts={waterLevelPosts}
              loadingWaterLevel={loadingWaterLevel}
              waterLevelError={waterLevelError}
              pumpStatusData={pumpStatusData}
              loadingPumpStatus={loadingPumpStatus}
              pumpStatusError={pumpStatusError}
            />
          </motion.div>

          {/* Main Content Grid: Map, Weather/Actions, and Chatbot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Flood Map - Mengambil 2 kolom di layar besar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>
                      Peta Banjir -{" "}
                      {selectedLocation?.districtName || "Indonesia"}
                    </span>
                    <Badge variant="success" className="ml-auto">
                      Live
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    style={{ height: "600px", width: "100%" }}
                    className="w-full rounded-lg border border-gray-700/30 relative overflow-hidden"
                  >
                    <FloodMap
                      center={
                        selectedLocation?.latitude != null &&
                        selectedLocation?.longitude != null
                          ? [
                              selectedLocation.latitude,
                              selectedLocation.longitude,
                            ]
                          : DEFAULT_MAP_CENTER
                      }
                      zoom={selectedLocation ? 12 : DEFAULT_MAP_ZOOM}
                      className="h-full w-full"
                      floodProneData={disasterProneAreas}
                      loadingFloodData={loadingDisasterData}
                      floodDataError={disasterDataError}
                      onMapBoundsChange={handleMapBoundsChange}
                    />
                    {selectedLocation && (
                      <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                        <div className="text-xs text-gray-300">
                          <div className="font-medium text-white mb-1">
                            📍 {selectedLocation.districtName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">Lat:</span>{" "}
                              {selectedLocation.latitude?.toFixed(6) || "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-400">Lng:</span>{" "}
                              {selectedLocation.longitude?.toFixed(6) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Kolom untuk Weather & Quick Actions */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              {/* Weather Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex-1"
              >
                <WeatherDisplay
                  data={currentWeatherData}
                  loading={loadingWeather}
                  error={weatherError}
                />
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex-1"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-secondary" />
                      <span>Aksi Cepat</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-12 flex-col space-y-1"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Lapor Banjir</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 flex-col space-y-1"
                      >
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Evakuasi</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 flex-col space-y-1"
                      >
                        <CloudRain className="h-4 w-4" />
                        <span className="text-xs">Cuaca</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 flex-col space-y-1"
                      >
                        <Waves className="h-4 w-4" />
                        <span className="text-xs">Sensor</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Flood Alerts Section - Combined real-time alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }} // Menyesuaikan delay
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <span>Peringatan Bencana Terkini</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <span>Lihat Semua</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Menampilkan loading state jika data masih dimuat */}
                {loadingBmkgQuake || loadingWaterLevel || loadingWeather ? (
                  <div className="p-4 text-center text-muted-foreground flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Memuat peringatan...</span>
                  </div>
                ) : (
                  // Jika tidak loading, tampilkan CyclingAlertCard untuk setiap slot
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Slot 1 */}
                    <CyclingAlertCard
                      alerts={realTimeAlerts}
                      initialOffset={0}
                    />
                    {/* Slot 2 */}
                    <CyclingAlertCard
                      alerts={realTimeAlerts}
                      initialOffset={1}
                    />
                    {/* Slot 3 */}
                    <CyclingAlertCard
                      alerts={realTimeAlerts}
                      initialOffset={2}
                    />
                  </div>
                )}

                {/* Display Error State if any API failed */}
                {(bmkgQuakeError || waterLevelError || weatherError) && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Memuat Peringatan!</AlertTitle>
                    <AlertDescription>
                      {bmkgQuakeError ||
                        waterLevelError ||
                        weatherError ||
                        "Terjadi kesalahan saat mengambil data peringatan."}
                    </AlertDescription>
                  </Alert>
                )}
                {/* Display "No active alerts" message if no data loaded and no errors */}
                {!loadingBmkgQuake &&
                  !loadingWaterLevel &&
                  !loadingWeather &&
                  realTimeAlerts.length === 0 &&
                  !(bmkgQuakeError || waterLevelError || weatherError) && (
                    <p className="text-center text-muted-foreground mt-4">
                      Tidak ada peringatan bencana real-time aktif saat ini.
                    </p>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Floating Chatbot Button */}
      <motion.button
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-90 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-75"
        onClick={toggleChatbot}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chatbot Pop-up */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            // Adjusted height and padding for a more compact UI
            className="fixed bottom-24 right-6 w-[320px] h-[400px] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 flex items-center justify-between flex-shrink-0">
              {" "}
              {/* Reduced padding and added flex-shrink-0 */}
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  {" "}
                  {/* Slightly smaller icon container */}
                  <Bot className="w-5 h-5 text-white" />{" "}
                  {/* Slightly smaller icon */}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">
                    {" "}
                    {/* Reduced font size */}
                    Floodzie Assistant
                  </h3>
                  <p className="text-cyan-100 text-xs">
                    {" "}
                    {/* Reduced font size */}
                    Sistem Informasi Banjir Real-time
                  </p>
                </div>
                <div className="ml-auto flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-100 text-xs">Online</span>
                </div>
              </div>
              <button
                onClick={toggleChatbot}
                className="text-white hover:text-gray-200 p-1" // Added padding to button
              >
                <X className="w-5 h-5" /> {/* Slightly smaller icon */}
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {" "}
              {/* Added overflow-hidden to handle content */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-900" // Reduced padding and spacing
              >
                {/* Welcome message and Quick Actions (CONDITIONAL) */}
                {chatHistory.length === 0 && (
                  <>
                    <div className="text-center py-4">
                      {" "}
                      {/* Reduced vertical padding */}
                      <Bot className="w-10 h-10 text-cyan-400 mx-auto mb-2" />{" "}
                      {/* Slightly smaller icon */}
                      <p className="text-gray-400 mb-1 text-sm">
                        {" "}
                        {/* Reduced font size */}
                        Selamat datang di Floodzie Assistant!
                      </p>
                      <p className="text-gray-500 text-xs">
                        {" "}
                        {/* Reduced font size */}
                        Tanyakan tentang status banjir, cuaca, atau kondisi
                        wilayah
                      </p>
                    </div>
                    {/* Quick Actions moved inside this conditional block */}
                    <div className="px-0 pb-2">
                      {" "}
                      {/* Adjusted padding */}
                      <p className="text-gray-400 text-xs mb-1">
                        {" "}
                        {/* Reduced font size and margin */}
                        Pertanyaan Cepat:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {" "}
                        {/* Reduced gap */}
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action.query)}
                            className="flex items-center space-x-1 p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors duration-200 group text-sm" // Reduced padding, spacing, and font size
                            disabled={isChatLoading}
                          >
                            <action.icon className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />{" "}
                            {/* Smaller icon */}
                            <span className="text-gray-300 text-xs">
                              {" "}
                              {/* Smaller font size */}
                              {action.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Chat History Messages */}
                {chatHistory.length > 0 &&
                  chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      } animate-fade-in`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          msg.sender === "user"
                            ? "flex-row-reverse space-x-reverse"
                            : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.sender === "user"
                              ? "bg-blue-600"
                              : msg.isError
                              ? "bg-red-600"
                              : "bg-cyan-600"
                          }`}
                        >
                          {" "}
                          {/* Smaller avatar */}
                          {msg.sender === "user" ? (
                            <User className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-white" />
                          )}{" "}
                          {/* Smaller icon */}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`rounded-xl px-3 py-2 ${
                            msg.sender === "user"
                              ? "bg-blue-600 text-white"
                              : msg.isError
                              ? "bg-red-900/50 text-red-300 border border-red-600"
                              : "bg-gray-800 text-gray-100 border border-gray-700"
                          }`}
                        >
                          {" "}
                          {/* Adjusted padding and border radius */}
                          <p className="text-xs leading-relaxed">
                            {" "}
                            {/* Smaller font size */}
                            {msg.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            {" "}
                            {/* Reduced margin-top */}
                            <span
                              className={`text-xxs ${
                                msg.sender === "user"
                                  ? "text-blue-200"
                                  : msg.isError
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {" "}
                              {/* Smaller font size */}
                              {formatTime(msg.timestamp)}
                            </span>
                            {msg.sender === "user" && (
                              <div className="flex space-x-0.5">
                                {" "}
                                {/* Reduced spacing */}
                                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start space-x-2">
                      <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center">
                        {" "}
                        {/* Smaller avatar */}
                        <Bot className="w-3.5 h-3.5 text-white" />{" "}
                        {/* Smaller icon */}
                      </div>
                      <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
                        {" "}
                        {/* Adjusted padding and border radius */}
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>{" "}
                          {/* Smaller dots */}
                          <div
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Input Area */}
              <div className="border-t border-gray-800 p-3 bg-gray-900 flex-shrink-0">
                {" "}
                {/* Reduced padding */}
                <div className="flex items-center space-x-2">
                  {" "}
                  {/* Reduced spacing */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isChatLoading) {
                          sendChatMessage();
                        }
                      }}
                      placeholder="Tanyakan tentang status banjir, cuaca, atau kondisi wilayah..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-full px-3 py-2.5 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" // Adjusted padding, font size, and pr
                      disabled={isChatLoading}
                    />
                    {isChatLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {" "}
                        {/* Adjusted right position */}
                        <Zap className="w-3.5 h-3.5 text-cyan-400 animate-spin" />{" "}
                        {/* Smaller icon */}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => sendChatMessage()}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95" // Adjusted padding
                  >
                    <Send className="w-3.5 h-3.5" /> {/* Smaller icon */}
                  </button>
                </div>
                {chatError && (
                  <div className="mt-1.5 p-1.5 bg-red-900/50 border border-red-600 rounded-lg">
                    {" "}
                    {/* Reduced margin and padding */}
                    <p className="text-red-300 text-xs">{chatError}</p>{" "}
                    {/* Reduced font size */}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
