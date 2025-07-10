// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Perlu mengimport CSS Leaflet secara global di client-side
// Ini PENTING untuk react-leaflet agar styling peta muncul
import 'leaflet/dist/leaflet.css';


import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { FloodAlertList } from '@/components/flood/FloodAlert';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  FLOOD_MOCK_ALERTS,
  DASHBOARD_STATS_MOCK,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM
} from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import { FloodMap } from '@/components/map/FloodMap';

// Import untuk memanggil Overpass API dan OpenWeatherMap API
import { fetchDisasterProneData, OverpassElement, fetchWeatherData, WeatherData } from '@/lib/api';

// API Key OpenWeatherMap Anda
const OPEN_WEATHER_API_KEY = 'b48e2782f52bd9c6783ef14a35856abc';

// Definisikan tipe untuk lokasi yang dipilih, kini sampai tingkat kecamatan dengan koordinat
interface SelectedLocationDetails {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationDetails | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State untuk data bencana dari Overpass API
  const [disasterProneAreas, setDisasterProneAreas] = useState<OverpassElement[]>([]);
  const [loadingDisasterData, setLoadingDisasterData] = useState(false);
  const [disasterDataError, setDisasterDataError] = useState<string | null>(null);

  // State untuk data cuaca dari OpenWeatherMap API
  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);


  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Handler saat RegionDropdown memilih kecamatan
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
      geometry
    };
    setSelectedLocation(newLocation);
    console.log('DEBUG page.tsx: Lokasi Terpilih (newLocation dari dropdown):', newLocation);

    if (latitude != null && longitude != null) {
      // Panggil Overpass API untuk data bencana
      const buffer = 0.05; // sekitar 5.5 km, sesuaikan jika perlu
      const south = latitude - buffer;
      const west = longitude - buffer;
      const north = latitude + buffer;
      const east = longitude + buffer;

      setLoadingDisasterData(true);
      setDisasterDataError(null);
      fetchDisasterProneData(south, west, north, east)
        .then(data => {
          setDisasterProneAreas(data.elements);
          console.log("Disaster Prone Data from Overpass:", data.elements);
        })
        .catch(err => {
          console.error("Error fetching disaster prone data:", err);
          setDisasterDataError(err.message);
          setDisasterProneAreas([]);
        })
        .finally(() => {
          setLoadingDisasterData(false);
        });

      // Panggil OpenWeatherMap API untuk data cuaca
      setLoadingWeather(true);
      setWeatherError(null);
      fetchWeatherData(latitude, longitude, OPEN_WEATHER_API_KEY)
        .then(data => {
          setCurrentWeatherData(data);
          console.log("Weather Data from OpenWeatherMap:", data);
        })
        .catch(err => {
          console.error("Error fetching weather data:", err);
          setWeatherError(err.message);
          setCurrentWeatherData(null);
        })
        .finally(() => {
          setLoadingWeather(false);
        });

    } else {
      // Reset data bencana dan cuaca jika tidak ada koordinat
      setDisasterProneAreas([]);
      setLoadingDisasterData(false);
      setCurrentWeatherData(null);
      setLoadingWeather(false);
    }
  };

  const heroCards = [
    {
      title: 'Total Wilayah',
      description: 'Wilayah yang dipantau',
      count: DASHBOARD_STATS_MOCK.totalRegions,
      icon: MapPin,
      color: 'text-primary',
      bgColor: 'bg-primary/20'
    },
    {
      title: 'Peringatan Aktif',
      description: 'Peringatan banjir saat ini',
      count: DASHBOARD_STATS_MOCK.activeAlerts,
      icon: Bell,
      color: 'text-warning',
      bgColor: 'bg-warning/20'
    },
    {
      title: 'Zona Banjir',
      description: 'Area yang rawan banjir',
      count: DASHBOARD_STATS_MOCK.floodZones,
      icon: Shield,
      color: 'text-danger',
      bgColor: 'bg-danger/20'
    },
    {
      title: 'Orang Berisiko',
      description: 'Estimasi populasi berisiko',
      count: formatNumber(DASHBOARD_STATS_MOCK.peopleAtRisk),
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={cn(
        'transition-all duration-300 ease-in-out',
        isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
      )}>
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
                Sistem Deteksi Banjir & Monitoring Cuaca Real-time untuk Indonesia
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button size="lg" variant="secondary" className="text-primary">
                  <MapPin className="mr-2 h-5 w-5" />
                  Lihat Peta Banjir
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
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
                        <div className={cn('p-2 rounded-lg', card.bgColor)}>
                          <card.icon className={cn('h-6 w-6', card.color)} />
                        </div>
                        <Badge variant="glass" className="text-white">
                          {card.count}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                      <p className="text-sm text-white/80">{card.description}</p>
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
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/10 rounded-full"
              animate={{
                y: [0, -10, 0],
                x: [0, 10, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        </section>

        {/* Region Selector Section */}
        <section className="container mx-auto px-4 py-8 space-y-4">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-aqua-400">
                <Globe className="h-5 w-5" />
                <span>Pilih Lokasi Wilayah Anda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegionDropdown onSelectDistrict={handleRegionSelect} />
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
            <DashboardStats stats={DASHBOARD_STATS_MOCK} />
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
                    <span>Peta Banjir - {selectedLocation?.districtName || 'Indonesia'}</span>
                    <Badge variant="success" className="ml-auto">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    style={{ height: '600px', width: '100%' }}
                    className="w-full rounded-lg border border-gray-700/30 relative overflow-hidden"
                  >
                    <FloodMap
                      center={
                        selectedLocation?.latitude != null && selectedLocation?.longitude != null
                          ? [selectedLocation.latitude, selectedLocation.longitude]
                          : DEFAULT_MAP_CENTER
                      }
                      zoom={selectedLocation ? 12 : DEFAULT_MAP_ZOOM}
                      className="h-full w-full"
                      // === TERUSKAN DATA BANJIR/BENCANA DARI OVERPASS KE FLOODMAP ===
                      floodProneData={disasterProneAreas}
                      loadingFloodData={loadingDisasterData}
                      floodDataError={disasterDataError}
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
                // === TERUSKAN DATA CUACA NYATA KE WEATHERDISPLAY ===
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
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Lapor Banjir</span>
                    </Button>
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Evakuasi</span>
                    </Button>
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <CloudRain className="h-4 w-4" />
                      <span className="text-xs">Cuaca</span>
                    </Button>
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <Waves className="h-4 w-4" />
                      <span className="text-xs">Sensor</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Flood Alerts */}
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
                    <span>Peringatan Banjir Terkini</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <span>Lihat Semua</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FloodAlertList alerts={FLOOD_MOCK_ALERTS} />
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  );
}