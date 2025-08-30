'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';

// State Management
import { useAppStore } from '@/lib/store';

// UI Components
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { toast } from 'sonner';

// Icons
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
  MessageSquare,
  X,
  Loader2,
  Eye,
  RotateCcw,
} from 'lucide-react';

// Hooks & Utils
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useDisasterData } from '@/hooks/useDisasterData';
import {
  DASHBOARD_STATS_MOCK,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  WEATHER_STATIONS_GLOBAL_MOCK,
} from '@/lib/constants';
import { cn, formatNumber, getBaseUrl } from '@/lib/utils';

// App Components
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import dynamic from 'next/dynamic';
import { PeringatanBencanaCard } from '@/components/flood/PeringatanBencanaCard';
import { WeatherSummaryCard } from '@/components/dashboard/WeatherSummaryCard';
import { AirQualityCard } from '@/components/dashboard/AirQualityCard';
import { LocationPromptCard } from '@/components/dashboard/LocationPromptCard';

// Types
import type { FloodAlert as FloodAlertType, WeatherStation } from '@/types';
import { SelectedLocation } from '@/types/location';
import { MapBounds } from '@/types';

const FloodMap = dynamic(() => import('@/components/map/FloodMap').then(mod => mod.FloodMap), {
  ssr: false,
});

const FloodReportChart = dynamic(() => import('@/components/data-sensor/FloodReportChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
      <p className="text-gray-400">Memuat grafik laporan...</p>
    </div>
  ),
});

export function DashboardClientPage({ initialData }) {
  const { selectedLocation, mapBounds, setSelectedLocation, setMapBounds } = useAppStore();

  const [weatherSummary, setWeatherSummary] = useState(initialData.weatherSummary || null);
  const [airQuality, setAirQuality] = useState(initialData.airQuality || null);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  const {
    weatherData,
    isLoading: isLoadingWeather,
    error: weatherError,
    fetchWeather,
  } = useWeatherData();
  const {
    disasterProneAreas,
    isLoading: isLoadingDisaster,
    error: disasterError,
    fetchDisasterAreas,
  } = useDisasterData();

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMapDrawerOpen, setMapDrawerOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboardWidgets = async () => {
      if (selectedLocation && selectedLocation.latitude != null && selectedLocation.longitude != null) {
        try {
          const response = await fetch(`${getBaseUrl()}/api/dashboard-widgets?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}&locationName=${encodeURIComponent(selectedLocation.districtName || '')}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setWeatherSummary(data.weatherSummary);
          setAirQuality(data.airQuality);
        } catch (error) {
          console.error('Error fetching dashboard widgets data:', error);
          setWeatherSummary(null);
          setAirQuality(null);
        }
      } else {
        setWeatherSummary(null);
        setAirQuality(null);
      }
    };

    fetchDashboardWidgets();
  }, [selectedLocation]);

  const handleRegionSelect = useCallback(
    (location) => {
      setSelectedLocation(location);
      if (location && location.latitude != null && location.longitude != null) {
        const { latitude, longitude } = location;
        fetchWeather(latitude, longitude);
        const buffer = 0.05;

        const south = latitude - buffer;
        const west = longitude - buffer;
        const north = latitude + buffer;
        const east = longitude + buffer;

        const newMapBounds: MapBounds = {
          center: [latitude, longitude],
          zoom: 12,
          bounds: [[south, west], [north, east]],
        };
        setMapBounds(newMapBounds);
        fetchDisasterAreas({ south, west, north, east });
      } else {
        setMapBounds(null);
        fetchDisasterAreas({ south: DEFAULT_MAP_CENTER[0] - 0.1, west: DEFAULT_MAP_CENTER[1] - 0.1, north: DEFAULT_MAP_CENTER[0] + 0.1, east: DEFAULT_MAP_CENTER[1] + 0.1 });
      }
    },
    [fetchWeather, setSelectedLocation, setMapBounds, fetchDisasterAreas],
  );

  

  const refreshDisasterData = useCallback(() => {
    if (mapBounds && mapBounds.bounds) {
      fetchDisasterAreas({ south: mapBounds.bounds[0][0], west: mapBounds.bounds[0][1], north: mapBounds.bounds[1][0], east: mapBounds.bounds[1][1] });
      toast.success('Data bencana diperbarui!');
    } else {
      toast.error('Tidak dapat memperbarui data: Peta belum dimuat.');
    }
  }, [mapBounds, fetchDisasterAreas]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleMapBoundsChange = useCallback((bounds) => {
    setMapBounds(bounds);
  }, [setMapBounds]);

  const heroCards = useMemo(
    () => [
      {
        title: 'Total Wilayah',
        description: 'Wilayah yang dipantau',
        count: initialData.stats.totalRegions,
        icon: MapPin,
        color: 'text-primary',
        bgColor: 'bg-primary/20',
      },
      {
        title: 'Peringatan Aktif',
        description: 'Peringatan banjir saat ini',
        count: initialData.stats.activeAlerts,
        icon: Bell,
        color: 'text-warning',
        bgColor: 'bg-warning/20',
      },
      {
        title: 'Zona Rawan',
        description: 'Area yang teridentifikasi',
        count: initialData.stats.floodZones,
        icon: Shield,
        color: 'text-danger',
        bgColor: 'bg-danger/20',
      },
      {
        title: 'Orang Berisiko',
        description: 'Estimasi populasi berisiko',
        count: formatNumber(initialData.stats.peopleAtRisk),
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-secondary/20',
      },
    ],
    [initialData.stats],
  );

  const sendChatMessage = async (customMessage: string) => {
    // Implementasi logika pengiriman pesan
    console.log('Sending chat message:', customMessage);
  };
  const toggleChatbot = () => setIsChatbotOpen((prev) => !prev);

  return (
    <div className="bg-background">
      <main className="flex-1">
        <section className="relative overflow-hidden text-white">
            <div className="absolute inset-0">
              <Image
                src="/assets/banjir.png"
                alt="Latar belakang banjir"
                fill
                priority
                quality={80}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 md:py-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                    Flood<span className="text-secondary">zie</span>
                  </h1>
                </div>

                <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mt-4">
                  Sistem Deteksi Banjir & Monitoring Cuaca Real-time untuk
                  Indonesia
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 max-w-xs sm:max-w-md mx-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Lihat Peta Banjir
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white/50 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <Bell className="mr-2 h-5 w-5" />
                    Peringatan Terkini
                  </Button>
                </div>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16 md:mt-20">
                {heroCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white hover:bg-white/10 transition-colors h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className={cn('p-2 rounded-lg', card.bgColor)}>
                            <card.icon className={cn('h-6 w-6', card.color)} />
                          </div>
                          <Badge
                            variant="outline"
                            className="text-white border-white/20"
                          >
                            {card.count}
                          </Badge>
                        </div>
                        <h3 className="text-md font-semibold mb-1">
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
          </section>

        <section className="container mx-auto px-4 py-8 space-y-4">
          <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
            <CardContent className="p-4">
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
                currentWeatherData={weatherData}
                loadingWeather={isLoadingWeather}
                weatherError={weatherError}
              />
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 py-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardStats {...initialData} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {isMobile ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-8 w-8 text-primary" />
                      <span className="text-2xl">Peta Banjir Interaktif</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Visualisasikan data banjir, zona rawan, dan peringatan secara real-time. Buka peta untuk eksplorasi mendalam.
                    </p>
                    <Button size="lg" onClick={() => setMapDrawerOpen(true)}>
                      <Eye className="mr-2 h-5 w-5" />
                      Buka Peta
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
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
                      <span className="text-gray-900 dark:text-gray-100">
                        Peta Banjir -{' '}
                        {selectedLocation?.districtName || 'Indonesia'}
                      </span>
                      <Badge variant="success" className="ml-auto">
                        Live
                      </Badge>
                      <Button
                        onClick={refreshDisasterData}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Perbarui Data
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-72 lg:h-[600px] w-full rounded-lg border border-slate-800/50 relative overflow-hidden"
                    >
                      <FloodMap
                        center={mapBounds?.center || DEFAULT_MAP_CENTER}
                        zoom={mapBounds?.zoom || DEFAULT_MAP_ZOOM}
                        className="h-full w-full"
                        floodProneData={disasterProneAreas}
                        loadingFloodData={isLoadingDisaster}
                        floodDataError={disasterError}
                        onMapBoundsChange={handleMapBoundsChange}
                        selectedLocation={selectedLocation}
                        globalWeatherStations={WEATHER_STATIONS_GLOBAL_MOCK as WeatherStation[]}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="lg:col-span-1 flex flex-col gap-8">
              {selectedLocation ? (
                <>
                  {weatherSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex-1"
                    >
                      <WeatherSummaryCard weatherSummary={weatherSummary} />
                    </motion.div>
                  )}
                  {airQuality && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex-1"
                    >
                      <AirQualityCard airQuality={airQuality} />
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex-1"
                  >
                    <LocationPromptCard />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex-1"
                  >
                    <LocationPromptCard />
                  </motion.div>
                </>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <span>Peringatan Bencana Terkini</span>
                  </CardTitle>
                  <Link href="/peringatan">
                    <Button variant="outline" size="sm">
                      <span>Lihat Detail</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialData.realTimeAlerts && initialData.realTimeAlerts.length > 0 ? (
                    initialData.realTimeAlerts.map((alert: any) => (
                      <PeringatanBencanaCard key={alert.id} alert={alert} />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-muted-foreground p-4">
                      Tidak ada peringatan bencana saat ini.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <FloodReportChart />
          </motion.div>
        </section>
      </main>
      <Drawer open={isMapDrawerOpen} onOpenChange={setMapDrawerOpen}>
        <DrawerContent className="h-screen">
          <DrawerHeader className="text-left">
            <DrawerTitle>Peta Interaktif</DrawerTitle>
            <DrawerDescription>
              Gunakan dua jari untuk navigasi. Geser ke bawah untuk menutup.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 p-0 overflow-hidden" vaul-no-drag>
            <FloodMap
              center={mapBounds?.center || DEFAULT_MAP_CENTER}
              zoom={mapBounds?.zoom || DEFAULT_MAP_ZOOM}
              className="h-full w-full"
              floodProneData={disasterProneAreas}
              loadingFloodData={isLoadingDisaster}
              floodDataError={disasterError}
              onMapBoundsChange={handleMapBoundsChange}
              selectedLocation={selectedLocation}
              globalWeatherStations={WEATHER_STATIONS_GLOBAL_MOCK as WeatherStation[]}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}