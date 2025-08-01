'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useReducer,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';

// State Management
import { appReducer, initialState, SelectedLocation, MapBounds } from './state';

// UI Components
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
} from 'lucide-react';

// Hooks & Utils
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useDisasterData } from '@/hooks/useDisasterData';
import { useWaterLevelData } from '@/hooks/useWaterLevelData';
import { usePumpStatusData } from '@/hooks/usePumpStatusData';
import { useBmkgQuakeData } from '@/hooks/useBmkgQuakeData';
import {
  FLOOD_MOCK_ALERTS,
  DASHBOARD_STATS_MOCK,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from '@/lib/constants';
import { cn, formatNumber, getTimeAgo } from '@/lib/utils';

// App Components
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import { FloodMap } from '@/components/map/FloodMap';
import { PeringatanBencanaCard } from '@/components/flood/PeringatanBencanaCard';

// Types
import type { FloodAlert as FloodAlertType } from '@/types';

const ROTATION_INTERVAL_MS = 10000;

const CyclingAlertCard = ({
  alerts,
  initialOffset = 0,
}: {
  alerts: FloodAlertType[];
  initialOffset?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (alerts.length > 0) {
      const validInitialIndex = initialOffset % alerts.length;
      setCurrentIndex(validInitialIndex);
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
      }, ROTATION_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [alerts, initialOffset]);

  if (alerts.length === 0) {
    return (
      <Alert
        variant="default"
        className="w-full h-full flex flex-col justify-center"
      >
        <Bell className="h-4 w-4" />
        <AlertTitle>Tidak Ada Peringatan</AlertTitle>
        <AlertDescription>
          Tidak ada berita atau peringatan yang tersedia saat ini.
        </AlertDescription>
      </Alert>
    );
  }

  const currentAlert = alerts[currentIndex];

  if (!currentAlert) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAlert.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <PeringatanBencanaCard
          alert={currentAlert}
          className={`level-${currentAlert.level}`}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { selectedLocation, mapBounds } = state;

  // UI State
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  // Data Fetching Hooks
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
  const {
    waterLevelPosts,
    isLoading: isLoadingWaterLevel,
    error: waterLevelError,
    fetchWaterLevels,
  } = useWaterLevelData();
  const {
    pumpStatusData,
    isLoading: isLoadingPumpStatus,
    error: pumpStatusError,
    fetchPumpStatus,
  } = usePumpStatusData();
  const {
    latestQuake,
    isLoading: isLoadingQuake,
    error: quakeError,
  } = useBmkgQuakeData();

  // Chatbot State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<
    {
      sender: 'user' | 'bot';
      message: string;
      timestamp: Date;
      isError?: boolean;
    }[]
  >([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleRegionSelect = useCallback(
    (location: SelectedLocation) => {
      dispatch({ type: 'SET_LOCATION', payload: location });

      if (location && location.latitude != null && location.longitude != null) {
        const { latitude, longitude } = location;
        fetchWeather(latitude, longitude);
        fetchPumpStatus(location.districtName);
        fetchWaterLevels(location.districtName);

        const buffer = 0.05;
        const newBounds = {
          south: latitude - buffer,
          west: longitude - buffer,
          north: latitude + buffer,
          east: longitude + buffer,
        };
        dispatch({ type: 'SET_MAP_BOUNDS', payload: newBounds });
      } else {
        dispatch({ type: 'SET_MAP_BOUNDS', payload: null });
      }
    },
    [fetchWeather, fetchWaterLevels, fetchPumpStatus],
  );

  // --- Effects ---
  useEffect(() => {
    if (mapBounds) {
      fetchDisasterAreas(mapBounds);
    }
  }, [mapBounds, fetchDisasterAreas]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  useEffect(() => {
    const storedLocation = localStorage.getItem('floodzy-default-location');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        if (location) {
          handleRegionSelect(location);
        }
      } catch (error) {
        console.error("Failed to parse stored location:", error);
      }
    }
  }, [handleRegionSelect]);

  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    dispatch({ type: 'SET_MAP_BOUNDS', payload: bounds });
  }, []);

  // --- Memoized Data ---
  const realTimeAlerts = useMemo(() => {
    const alerts: FloodAlertType[] = [];

    if (latestQuake) {
        const quakeTimestampISO =
          latestQuake.DateTime.replace(' ', 'T') + '+07:00';
        alerts.push({
          id: `bmkg-quake-${latestQuake.DateTime}`,
          regionId: latestQuake.Wilayah,
          level: parseFloat(latestQuake.Magnitude) >= 5 ? 'danger' : 'warning',
          title: `Gempa M${latestQuake.Magnitude} di ${latestQuake.Wilayah}`,
          message: `Pusat gempa di ${latestQuake.Kedalaman}. Dirasakan: ${latestQuake.Dirasakan}`,
          timestamp: quakeTimestampISO,
          isActive: true,
          affectedAreas: latestQuake.Wilayah.split(',').map((s) => s.trim()),
        });
    }

    const combinedAlerts = [...alerts, ...FLOOD_MOCK_ALERTS];
    return combinedAlerts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [latestQuake]);

  const heroCards = useMemo(
    () => [
      {
        title: 'Total Wilayah',
        description: 'Wilayah yang dipantau',
        count: DASHBOARD_STATS_MOCK.totalRegions,
        icon: MapPin,
        color: 'text-primary',
        bgColor: 'bg-primary/20',
      },
      {
        title: 'Peringatan Aktif',
        description: 'Peringatan banjir saat ini',
        count: realTimeAlerts.filter((a) => a.level !== 'info').length,
        icon: Bell,
        color: 'text-warning',
        bgColor: 'bg-warning/20',
      },
      {
        title: 'Zona Rawan',
        description: 'Area yang teridentifikasi',
        count: disasterProneAreas.length,
        icon: Shield,
        color: 'text-danger',
        bgColor: 'bg-danger/20',
      },
      {
        title: 'Orang Berisiko',
        description: 'Estimasi populasi berisiko',
        count: formatNumber(DASHBOARD_STATS_MOCK.peopleAtRisk),
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-secondary/20',
      },
    ],
    [realTimeAlerts, disasterProneAreas.length],
  );

  // Chatbot logic remains the same...
  const quickActions = [
    {
      icon: Droplets,
      text: 'Status Banjir',
      query: 'Bagaimana status banjir saat ini?',
    },
    {
      icon: MapPin,
      text: 'Lokasi Rawan',
      query: 'Dimana lokasi rawan banjir?',
    },
    {
      icon: AlertTriangle,
      text: 'Peringatan',
      query: 'Apakah ada peringatan banjir?',
    },
    {
      icon: Info,
      text: 'Info Cuaca',
      query: 'Bagaimana kondisi cuaca hari ini?',
    },
  ];

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const simulateTyping = (
    message: string,
    isError: boolean = false,
    callback: () => void,
  ) => {
    setIsTyping(true);
    setTimeout(
      () => {
        setIsTyping(false);
        setChatHistory((prev) => [
          ...prev,
          { sender: 'bot', message, timestamp: new Date(), isError },
        ]);
        callback();
      },
      1000 + Math.random() * 1000,
    );
  };

  const sendChatMessage = async (customMessage: string | null = null) => {
    const messageToSend = customMessage || chatInput.trim();
    if (!messageToSend || isChatLoading) return;

    const userMessage = {
      sender: 'user' as const,
      message: messageToSend,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Gagal mendapatkan respons dari chatbot.',
        );
      }

      const data = await response.json();

      // Handle notification payload from chatbot API
      if (data.notification) {
        const { message, type, duration } = data.notification;
        switch (type) {
          case 'success':
            toast.success(message, { duration });
            break;
          case 'error':
            toast.error(message, { duration });
            break;
          case 'warning':
            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-yellow-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">
                        Peringatan
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-yellow-600">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ), { duration });
            break;
          case 'info':
            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-blue-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">
                        Informasi
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-blue-600">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ), { duration });
            break;
          default:
            toast(message, { duration });
        }
      }

      simulateTyping(data.answer, false, () => setIsChatLoading(false));
    } catch (err: any) {
      console.error('Error sending message to chatbot:', err);
      const errorMessage = `Maaf, saya tidak dapat memproses permintaan Anda saat ini. (${err.message})`;
      setChatError(errorMessage);
      simulateTyping(errorMessage, true, () => setIsChatLoading(false));
    }
  };

  const handleQuickAction = (query: string) => {
    sendChatMessage(query);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  return (
    <div className="bg-background">
      <main className="flex-1">
        {/* Hero Section */}
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
                error={weatherError}
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
            <DashboardStats
              stats={DASHBOARD_STATS_MOCK}
              waterLevelPosts={waterLevelPosts}
              loadingWaterLevel={isLoadingWaterLevel}
              waterLevelError={waterLevelError}
              pumpStatusData={pumpStatusData}
              loadingPumpStatus={isLoadingPumpStatus}
              pumpStatusError={pumpStatusError}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      Peta Banjir -{' '}
                      {selectedLocation?.districtName || 'Indonesia'}
                    </span>
                    <Badge variant="success" className="ml-auto">
                      Live
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    style={{ height: '600px', width: '100%' }}
                    className="w-full rounded-lg border border-slate-800/50 relative overflow-hidden"
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
                      loadingFloodData={isLoadingDisaster}
                      floodDataError={disasterError}
                      onMapBoundsChange={handleMapBoundsChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="lg:col-span-1 flex flex-col gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex-1"
              >
                <WeatherDisplay
                  data={weatherData}
                  loading={isLoadingWeather}
                  error={weatherError}
                />
              </motion.div>

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
                  <Button variant="outline" size="sm">
                    <span>Lihat Semua</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingQuake ? (
                  <div className="p-4 text-center text-muted-foreground flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Memuat peringatan...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {realTimeAlerts.length > 0 ? (
                      <>
                        <CyclingAlertCard
                          alerts={realTimeAlerts}
                          initialOffset={0}
                        />
                        {isLargeScreen && realTimeAlerts.length > 1 && (
                          <CyclingAlertCard
                            alerts={realTimeAlerts}
                            initialOffset={1}
                          />
                        )}
                        {isLargeScreen && realTimeAlerts.length > 2 && (
                          <CyclingAlertCard
                            alerts={realTimeAlerts}
                            initialOffset={2}
                          />
                        )}
                      </>
                    ) : (
                      <div className="col-span-full text-center text-muted-foreground p-4">
                        Tidak ada peringatan bencana aktif saat ini.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Sisa kode (Chatbot, etc.) tetap sama */}
      <motion.button
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-90 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-75"
        onClick={toggleChatbot}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-[320px] h-[400px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">
                    Floodzie Assistant
                  </h3>
                  <p className="text-cyan-100 text-xs">
                    Sistem Informasi Banjir Real-time
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChatbot}
                className="text-white hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-900"
              >
                {chatHistory.length === 0 && (
                  <>
                    <div className="text-center py-4">
                      <Bot className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                      <p className="text-gray-400 mb-1 text-sm">
                        Selamat datang di Floodzie Assistant!
                      </p>
                      <p className="text-gray-500 text-xs">
                        Tanyakan tentang status banjir, cuaca, atau kondisi
                        wilayah
                      </p>
                    </div>
                    <div className="px-0 pb-2">
                      <p className="text-gray-400 text-xs mb-1">
                        Pertanyaan Cepat:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action.query)}
                            className="flex items-center space-x-1 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors duration-200 group text-sm"
                            disabled={isChatLoading}
                          >
                            <action.icon className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                            <span className="text-gray-300 text-xs">
                              {action.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'flex-row-reverse space-x-reverse'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600'
                            : msg.isError
                              ? 'bg-red-600'
                              : 'bg-cyan-600'
                        }`}
                      >
                        {msg.sender === 'user' ? (
                          <User className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div
                        className={`rounded-xl px-3 py-2 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : msg.isError
                              ? 'bg-red-900/50 text-red-300 border border-red-600'
                              : 'bg-slate-800 text-gray-100 border border-slate-700'
                        }`}
                      >
                        <p className="text-xs leading-relaxed">{msg.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xxs ${
                              msg.sender === 'user'
                                ? 'text-blue-200'
                                : msg.isError
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start space-x-2">
                      <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-800 p-3 bg-slate-900/50 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isChatLoading) {
                          sendChatMessage();
                        }
                      }}
                      placeholder="Tanyakan sesuatu..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-full px-3 py-2.5 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      disabled={isChatLoading}
                    />
                    {isChatLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => sendChatMessage()}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {chatError && (
                  <div className="mt-1.5 p-1.5 bg-red-900/50 border border-red-600 rounded-lg">
                    <p className="text-red-300 text-xs">{chatError}</p>
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