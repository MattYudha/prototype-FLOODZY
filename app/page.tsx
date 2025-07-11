"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar"; // <--- BARIS INI YANG DIKOREKSI
import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { FloodAlert } from "@/components/flood/FloodAlert";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  FLOOD_MOCK_ALERTS, // Digunakan untuk memastikan jumlah berita cukup untuk rotasi
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
  // fetchBmkgFeltQuakes, // DIHAPUS TOTAL IMPORNYA
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
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: string;
  isActive: boolean;
  affectedAreas: string[];
  actions?: string[];
}

// === KOMPONEN CyclingAlertCard ===
const CyclingAlertCard = ({ alerts, initialOffset = 0 }: { alerts: FloodAlertItem[]; initialOffset?: number }) => {
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
            <AlertDescription>Mohon maaf, tidak ada berita atau peringatan yang tersedia saat ini.</AlertDescription>
        </Alert>
    );
  }

  const currentAlert = alerts[currentIndex];

  if (!currentAlert || !currentAlert.id) {
    console.warn("CyclingAlertCard: currentAlert atau currentAlert.id tidak terdefinisi.", currentAlert);
    return (
        <Alert variant="warning" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Peringatan tidak valid</AlertTitle>
            <AlertDescription>Terjadi masalah saat memuat peringatan. Mencoba lagi...</AlertDescription>
        </Alert>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAlert.id + '-' + currentIndex}
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


export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationDetails | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [disasterProneAreas, setDisasterProneAreas] = useState<OverpassElement[]>([]);
  const [loadingDisasterData, setLoadingDisasterData] = useState(false);
  const [disasterDataError, setLoadingDisasterDataError] = useState<string | null>(null);

  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [waterLevelPosts, setWaterLevelPosts] = useState<WaterLevelPost[]>([]);
  const [loadingWaterLevel, setLoadingWaterLevel] = useState(false);
  const [waterLevelError, setWaterLevelError] = useState<string | null>(null);

  const [pumpStatusData, setPumpStatusData] = useState<PumpData[]>([]);
  const [loadingPumpStatus, setLoadingPumpStatus] = useState(false);
  const [pumpStatusError, setPumpStatusError] = useState<string | null>(null);

  const [latestBmkgQuake, setLatestBmkgQuake] = useState<BmkgGempaData | null>(null);
  const [loadingBmkgQuake, setLoadingBmkgQuake] = useState(false);
  const [bmkgQuakeError, setBmkgQuakeError] = useState<string | null>(null);

  // const [feltBmkgQuakes, setFeltBmkgQuakes] = useState<BmkgGempaData[]>([]);
  // const [loadingFeltQuakes, setLoadingFeltQuakes] = useState(false);
  // const [feltQuakesError, setFeltQuakesError] = useState<string | null>(null);


  const [currentMapBounds, setCurrentMapBounds] = useState<{
    south: number;
    west: number;
    north: number;
    east: number;
  } | null>(null);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleMapBoundsChange = (
    south: number,
    west: number,
    north: number,
    east: number
  ) => {
    setCurrentMapBounds({ south, west, north, east });
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
      const quakeTimestampISO = latestBmkgQuake.DateTime.replace(' ', 'T') + '+07:00';

      alerts.push({
        id: `bmkg-quake-${latestBmkgQuake.DateTime}`,
        regionId: latestBmkgQuake.Wilayah,
        level: parseFloat(latestBmkgQuake.Magnitude) >= 5 ? 'danger' : 'info',
        title: `Gempa Bumi M${latestBmkgQuake.Magnitude} di ${latestBmkgQuake.Wilayah}`,
        message: `Terjadi gempa bumi berkekuatan ${latestBmkgQuake.Magnitude} SR pada ${latestBmkgQuake.Tanggal}, Pukul ${latestBmkgQuake.Jam} WIB dengan kedalaman ${latestBmkgQuake.Kedalaman}. ${latestBmkgQuake.Potensi}. Dirasakan: ${latestBmkgQuake.Dirasakan}`,
        timestamp: quakeTimestampISO,
        isActive: true,
        affectedAreas: latestBmkgQuake.Wilayah.split(',').map(s => s.trim()),
        actions: ['Tetap tenang', 'Periksa bangunan', 'Ikuti informasi resmi BMKG']
      });
    }

    if (waterLevelPosts.length > 0) {
      waterLevelPosts.forEach(post => {
        let level: FloodAlertItem['level'] = 'info';
        let message = `Tinggi muka air di pos ${post.name}: ${post.water_level || 'N/A'} ${post.unit || ''}.`;
        let actions: string[] = [];

        if (post.status) {
          switch (post.status.toLowerCase()) {
            case 'siaga':
              level = 'warning';
              message += ` Status: SIAGA!`;
              actions.push('Waspada banjir', 'Siapkan rencana evakuasi');
              break;
            case 'awas':
              level = 'danger';
              message += ` Status: AWAS!`;
              actions.push('Segera evakuasi', 'Ikuti arahan petugas');
              break;
            case 'normal':
              level = 'info';
              message += ` Status: Normal.`;
              break;
            default:
              level = 'info';
              break;
          }
        } else if (post.water_level !== undefined && post.water_level > 100) {
            level = 'warning';
            message += ` Ketinggian air signifikan!`;
            actions.push('Waspada', 'Monitor situasi');
        }

        alerts.push({
          id: `tma-${post.id}`,
          regionId: post.name,
          level: level,
          title: `Update Tinggi Muka Air - ${post.name}`,
          message: message,
          // === KOREKSI: Gunakan timestamp asli dari API jika ada, fallback ke waktu saat ini ===
          timestamp: post.timestamp || new Date().toISOString(),
          isActive: true,
          affectedAreas: [post.name],
          actions: actions.length > 0 ? actions : ['Monitor situasi']
        });
      });
    }

    if (currentWeatherData) {
      let level: FloodAlertItem['level'] = 'info';
      let title = "Update Cuaca";
      let message = `Cuaca saat ini: ${currentWeatherData.description}. Suhu ${currentWeatherData.temperature}°C.`;
      let actions: string[] = ['Pantau prakiraan cuaca', 'Siapkan payung/jas hujan'];

      if (currentWeatherData.rain1h !== undefined && currentWeatherData.rain1h > 5) {
        level = 'warning';
        title = "Peringatan Hujan Lebat";
        message = `Hujan lebat diperkirakan ${currentWeatherData.rain1h}mm/jam di area Anda. Waspada potensi banjir!`;
        actions.push('Hindari daerah rawan banjir', 'Pastikan saluran air bersih');
      } else if (currentWeatherData.description.toLowerCase().includes('hujan') || currentWeatherData.description.toLowerCase().includes('badai')) {
        level = 'info';
        title = `Update Cuaca - ${currentWeatherData.description}`;
      }

      alerts.push({
        id: `weather-${currentWeatherData.description}-${Date.now()}`,
        regionId: selectedLocation?.districtName || "Lokasi Anda",
        level: level,
        title: title,
        message: message,
        // === KOREKSI: Gunakan timestamp asli dari API jika ada, fallback ke waktu saat ini ===
        timestamp: currentWeatherData.dt ? new Date(currentWeatherData.dt * 1000).toISOString() : new Date().toISOString(),
        isActive: true,
        affectedAreas: selectedLocation?.districtName ? [selectedLocation.districtName] : [],
        actions: actions
      });
    }

    FLOOD_MOCK_ALERTS.forEach(mockAlert => alerts.push(mockAlert));

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
        )}
      >
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flood Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-1"
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

            {/* Weather & Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-6"
            >
              {/* Weather Display */}
              <WeatherDisplay
                data={currentWeatherData}
                loading={loadingWeather}
                error={weatherError}
              />

              {/* Quick Actions */}
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

          {/* Flood Alerts Section - Combined real-time alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
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
                {(loadingBmkgQuake || loadingWaterLevel || loadingWeather) ? (
                  <div className="p-4 text-center text-muted-foreground flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Memuat peringatan...</span>
                  </div>
                ) : (
                  // Jika tidak loading, tampilkan CyclingAlertCard untuk setiap slot
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Slot 1 */}
                    <CyclingAlertCard alerts={realTimeAlerts} initialOffset={0} />
                    {/* Slot 2 */}
                    <CyclingAlertCard alerts={realTimeAlerts} initialOffset={1} />
                    {/* Slot 3 */}
                    <CyclingAlertCard alerts={realTimeAlerts} initialOffset={2} />
                  </div>
                )}

                {/* Display Error State if any API failed */}
                {(bmkgQuakeError || waterLevelError || weatherError) && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Memuat Peringatan!</AlertTitle>
                    <AlertDescription>
                      {bmkgQuakeError || waterLevelError || weatherError || "Terjadi kesalahan saat mengambil data peringatan."}
                    </AlertDescription>
                  </Alert>
                )}
                 {/* Display "No active alerts" message if no data loaded and no errors */}
                 {!loadingBmkgQuake && !loadingWaterLevel && !loadingWeather && realTimeAlerts.length === 0 && !(bmkgQuakeError || waterLevelError || weatherError) && (
                  <p className="text-center text-muted-foreground mt-4">
                    Tidak ada peringatan bencana real-time aktif saat ini.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
