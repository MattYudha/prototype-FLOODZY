'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { WeatherMap } from '@/components/weather/WeatherMap';
import {
  Search,
  MapPin,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  Loader2,
  Filter,
  Layers,
  Activity,
  Globe,
  Compass,
  Zap,
  TrendingUp,
  AlertTriangle,
  Wifi,
  Sun,
  CloudSun,
  Moon,
  CloudMoon,
  CloudFog,
  CloudDrizzle,
  Snowflake,
  Sunrise,
  Sunset,
  LocateFixed,
  RefreshCw,
} from 'lucide-react';

// Hapus 'icon' dari leaflet default agar bisa di-override
delete L.Icon.Default.prototype._getIconUrl;

// Atur path ikon marker leaflet secara manual
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

// --- Helper Functions (Tidak ada perubahan) ---
const getWeatherIcon = (iconCode: string, size = 8) => {
  const props = { className: `w-${size} h-${size} text-white` };
  switch (iconCode) {
    case '01d':
      return <Sun {...props} />;
    case '01n':
      return <Moon {...props} />;
    case '02d':
      return <CloudSun {...props} />;
    case '02n':
      return <CloudMoon {...props} />;
    case '03d':
    case '03n':
      return <Cloud {...props} />;
    case '04d':
    case '04n':
      return <Cloud {...props} />;
    case '09d':
    case '09n':
      return <CloudDrizzle {...props} />;
    case '10d':
    case '10n':
      return <CloudRain {...props} />;
    case '11d':
    case '11n':
      return <Zap {...props} />;
    case '13d':
    case '13n':
      return <Snowflake {...props} />;
    case '50d':
    case '50n':
      return <CloudFog {...props} />;
    default:
      return <Cloud {...props} />;
  }
};
const formatDay = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    weekday: 'short',
  });
};

// --- Data & Komponen Statis (Tidak ada perubahan) ---
const regionData = [
  { name: 'Jakarta Pusat', lat: -6.1751, lon: 106.865 },
  { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
  { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { name: 'Medan', lat: 3.5952, lon: 98.6722 },
];
const RegionDropdown = ({
  onSelectRegion,
  selectedLocation,
}: {
  onSelectRegion: (region: unknown) => void;
  selectedLocation: unknown;
}) => {
  return (
    <div className="space-y-2">
      {regionData.map((region) => (
        <Button
          key={region.name}
          onClick={() => onSelectRegion(region)}
          className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center space-x-3 ${
            selectedLocation?.name === region.name
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
              : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{region.name}</span>
        </Button>
      ))}
    </div>
  );
};
const MapUpdater = ({ center, zoom }: { center: unknown; zoom: unknown }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};


// --- Komponen Display (Ada Perubahan) ---
const WeatherDisplay = ({
  data,
  loading,
  error,
}: {
  data: unknown;
  loading: unknown;
  error: unknown;
}) => {
  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
        <CardContent>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Memuat data cuaca...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
        <CardContent>
          <Alert
            variant="destructive"
            className="flex items-center space-x-3 p-4 rounded-xl border bg-red-900/20 border-red-500/50 text-red-400"
          >
            <AlertTriangle className="w-5 h-5" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // ✅ PERBAIKAN: Cek data.current yang sekarang berasal dari endpoint 2.5/weather
  if (!data || !data.current) {
    return (
      <Card className="border-slate-600/30 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
        <CardContent>
          <div className="text-center py-8">
            <Cloud className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              Pilih atau cari lokasi untuk melihat cuaca
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current } = data;

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>Cuaca Saat Ini</span>
          <Badge
            variant="success"
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-600/20 text-green-400 border-green-500/30"
          >
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
              {getWeatherIcon(current.weather[0].icon, 10)}
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-1">
                {Math.round(current.main.temp)}°C
              </div>
              <div className="text-slate-300 capitalize">
                {current.weather[0].description}
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Terasa seperti {Math.round(current.main.feels_like)}°C
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20 flex items-center space-x-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-xs text-slate-400">Kelembaban</span>
              <div className="font-semibold text-white">
                {current.main.humidity}%
              </div>
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20 flex items-center space-x-3">
            <Wind className="w-5 h-5 text-green-400" />
            <div>
              <span className="text-xs text-slate-400">Angin</span>
              <div className="font-semibold text-white">
                {current.wind.speed.toFixed(1)} m/s
              </div>
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20 flex items-center space-x-3">
            <Gauge className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-xs text-slate-400">Tekanan</span>
              <div className="font-semibold text-white">
                {current.main.pressure} hPa
              </div>
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20 flex items-center space-x-3">
            <Eye className="w-5 h-5 text-orange-400" />
            <div>
              <span className="text-xs text-slate-400">Visibilitas</span>
              <div className="font-semibold text-white">
                {(current.visibility / 1000).toFixed(1)} km
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-around text-center text-sm">
          <div className="flex items-center space-x-2">
            <Sunrise className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xs text-slate-400">Terbit</div>
              <div className="font-semibold text-white">
                {new Date(current.sys.sunrise * 1000).toLocaleTimeString(
                  'id-ID',
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sunset className="w-6 h-6 text-orange-500" />
            <div>
              <div className="text-xs text-slate-400">Terbenam</div>
              <div className="font-semibold text-white">
                {new Date(current.sys.sunset * 1000).toLocaleTimeString(
                  'id-ID',
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DailyForecast = ({
  data,
  loading,
}: {
  data: unknown;
  loading: unknown;
}) => {
  // ✅ PERBAIKAN: Cek data.daily yang sekarang berasal dari endpoint 2.5/forecast
  if (loading || !data || !data.daily) return null;

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          {/* ✅ PERBAIKAN: Judul menjadi 5 hari */}
          <span>Prakiraan 5 Hari</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* ✅ PERBAIKAN: Iterasi data dari struktur baru */}
        {data.daily.map((day: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <span className="font-medium text-slate-300 w-1/4">
              {formatDay(day.dt)}
            </span>
            <div className="w-1/4 flex justify-center">
              {getWeatherIcon(day.weather[0].icon, 6)}
            </div>
            <span className="text-xs text-slate-400 w-1/4 text-center capitalize">
              {day.weather[0].description}
            </span>
            <span className="font-mono text-sm text-white w-1/4 text-right">
              {Math.round(day.main.temp_max)}° / {Math.round(day.main.temp_min)}
              °
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function PrakiraanCuacaPage() {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

  const [selectedLocation, setSelectedLocation] = useState<null | {
    name: string;
    lat: number;
    lon: number;
  }>(null);
  const [currentMapCenter, setCurrentMapCenter] = useState([-6.1751, 106.865]);
  const [currentMapZoom, setCurrentMapZoom] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchLocationError, setSearchLocationError] = useState<string | null>(
    null,
  );

  const [currentWeatherData, setCurrentWeatherData] = useState<null | {
    current: any;
    daily: any;
  }>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(true);
  const [weatherLayers, setWeatherLayers] = useState({
    clouds: true,
    precipitation: false,
    temperature: false,
    wind: false,
    pressure: false,
  });

  // ✅ PERBAIKAN TOTAL: Menggunakan 2 endpoint gratis dan menggabungkan datanya
  useEffect(() => {
    console.log(
      'useEffect for weather data triggered. selectedLocation:',
      selectedLocation,
    );
    if (selectedLocation) {
      const fetchWeatherData = async () => {
        setLoadingWeather(true);
        setWeatherError(null);
        setCurrentWeatherData(null);

        const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
        const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

        const commonParams = {
          lat: selectedLocation.lat,
          lon: selectedLocation.lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'id',
        };

        try {
          // Lakukan 2 panggilan API secara bersamaan
          const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherUrl, { params: commonParams }),
            axios.get(forecastUrl, { params: commonParams }),
          ]);

          console.log('Weather API Response:', weatherResponse.data);
          console.log('Forecast API Response:', forecastResponse.data);

          // Proses data prakiraan untuk mendapatkan 1 data per hari
          const dailyForecasts = forecastResponse.data.list.filter(
            (forecast: any) => forecast.dt_txt.includes('12:00:00'),
          );

          // Gabungkan hasil dari 2 API menjadi satu objek state
          const formattedData = {
            current: weatherResponse.data,
            daily: dailyForecasts,
          };

          setCurrentWeatherData(formattedData);
          setCurrentMapCenter([selectedLocation.lat, selectedLocation.lon]);
          setCurrentMapZoom(12);
        } catch (error: any) {
          console.error('Error fetching weather data:', error);
          const errorMessage =
            error.response?.data?.message ||
            'Gagal mengambil data cuaca. Coba lagi nanti.';
          setWeatherError(errorMessage);
        } finally {
          setLoadingWeather(false);
        }
      };

      fetchWeatherData();
    }
  }, [selectedLocation, API_KEY]);

  const handleRegionSelect = (region: any) => {
    const newLocation = {
      name: region.name,
      lat: region.lat,
      lon: region.lon,
    };
    setSelectedLocation(newLocation);
    console.log('Selected location via RegionDropdown:', newLocation);
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim() || !API_KEY) return;

    setIsSearchingLocation(true);
    setSearchLocationError(null);
    try {
      const response = await axios.get(
        'https://api.openweathermap.org/geo/1.0/direct',
        {
          params: { q: searchQuery, limit: 1, appid: API_KEY },
        },
      );
      if (response.data && response.data.length > 0) {
        const { name, lat, lon, country, state } = response.data[0];
        const newLocation = { name: `${name}, ${state || country}`, lat, lon };
        setSelectedLocation(newLocation);
        console.log('Selected location via search:', newLocation);
        setSearchQuery('');
      } else {
        setSearchLocationError(`Lokasi "${searchQuery}" tidak ditemukan.`);
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setSearchLocationError('Gagal mencari lokasi. Periksa koneksi Anda.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              'https://api.openweathermap.org/geo/1.0/reverse',
              {
                params: {
                  lat: latitude,
                  lon: longitude,
                  limit: 1,
                  appid: API_KEY,
                },
              },
            );
            if (response.data && response.data.length > 0) {
              const { name, country, state } = response.data[0];
              setSelectedLocation({
                name: `${name}, ${state || country}`,
                lat: latitude,
                lon: longitude,
              });
            } else {
              setSelectedLocation({
                name: 'Lokasi Saat Ini',
                lat: latitude,
                lon: longitude,
              });
            }
          } catch (error) {
            setSearchLocationError('Gagal mendapatkan nama lokasi.');
            setSelectedLocation({
              name: 'Lokasi Saat Ini',
              lat: latitude,
              lon: longitude,
            });
          } finally {
            setIsSearchingLocation(false);
          }
        },
        (error) => {
          setSearchLocationError(
            'Gagal mengakses lokasi. Izinkan akses di browser Anda.',
          );
          setIsSearchingLocation(false);
        },
      );
    } else {
      setSearchLocationError('Geolocation tidak didukung oleh browser ini.');
    }
  };

  const toggleWeatherLayer = (layerName: string) => {
    setWeatherLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const weatherLayerConfigs = [
    {
      key: 'clouds',
      label: 'Awan',
      icon: Cloud,
      color: 'text-gray-400',
      description: 'Tutupan awan',
    },
    {
      key: 'precipitation',
      label: 'Curah Hujan',
      icon: CloudRain,
      color: 'text-blue-400',
      description: 'Intensitas hujan',
    },
    {
      key: 'temperature',
      label: 'Suhu',
      icon: Thermometer,
      color: 'text-red-400',
      description: 'Distribusi suhu',
    },
    {
      key: 'wind',
      label: 'Angin',
      icon: Wind,
      color: 'text-green-400',
      description: 'Kecepatan angin',
    },
    {
      key: 'pressure',
      label: 'Tekanan',
      icon: Gauge,
      color: 'text-purple-400',
      description: 'Tekanan atmosfer',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg">
                <CloudSun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Prakiraan Cuaca
                </h1>
                <p className="text-slate-400 text-xs hidden md:block">
                  Monitoring cuaca real-time dengan visualisasi interaktif
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={API_KEY ? 'success' : 'danger'}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${API_KEY ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'}`}
              >
                {API_KEY ? (
                  <Wifi className="w-3 h-3 mr-1.5" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1.5" />
                )}
                {API_KEY ? 'Online' : 'API Key Error'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  selectedLocation && handleRegionSelect(selectedLocation)
                }
                className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 bg-transparent hover:bg-slate-700/30 text-slate-300 hover:text-white p-2 w-10 h-10"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingWeather ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  <span>Pencarian Lokasi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Cari kota atau wilayah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleSearchLocation()
                    }
                    disabled={isSearchingLocation}
                    className="pl-4 w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                  {isSearchingLocation && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSearchLocation}
                    disabled={isSearchingLocation || !searchQuery.trim()}
                    className="w-full inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 px-4 py-2 text-sm"
                  >
                    <Search className="w-4 h-4 mr-2" /> Cari
                  </Button>
                  <Button
                    onClick={handleGetCurrentLocation}
                    variant="outline"
                    size="icon"
                    disabled={isSearchingLocation}
                    className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 border border-slate-600 bg-transparent hover:bg-slate-700/30 text-slate-300 hover:text-white p-2 w-10 h-10"
                  >
                    <LocateFixed className="w-4 h-4" />
                  </Button>
                </div>
                {searchLocationError && (
                  <Alert
                    variant="destructive"
                    className="p-4 rounded-xl border bg-red-900/20 border-red-500/50 text-red-400"
                  >
                    <AlertDescription className="text-sm">
                      {searchLocationError}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>Lokasi Cepat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RegionDropdown
                  onSelectRegion={handleRegionSelect}
                  selectedLocation={selectedLocation}
                  weatherLayers={weatherLayers}
                  apiKey={API_KEY}
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span>Layer Peta</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 bg-transparent hover:bg-slate-700/30 text-slate-300 hover:text-white p-2 w-10 h-10"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="space-y-3">
                      {weatherLayerConfigs.map((layer) => (
                        <div
                          key={layer.key}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-700/20 border border-slate-600/20"
                        >
                          <div className="flex items-center space-x-3">
                            <layer.icon className={`w-4 h-4 ${layer.color}`} />
                            <div>
                              <span className="text-sm font-medium text-slate-200">
                                {layer.label}
                              </span>
                              <p className="text-xs text-slate-400">
                                {layer.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={weatherLayers[layer.key]}
                            onCheckedChange={() =>
                              toggleWeatherLayer(layer.key)
                            }
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <Card className="h-full bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2 truncate">
                    <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">
                      {selectedLocation?.name || 'Peta Cuaca Interaktif'}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] lg:h-[calc(100vh-140px)]">
                  {API_KEY ? (
                    <>
                      {console.log('Rendering WeatherMap with props:')}
                      {console.log('  center:', currentMapCenter)}
                      {console.log('  zoom:', currentMapZoom)}
                      {console.log('  weatherLayers:', weatherLayers)}
                      {console.log('  selectedLocation:', selectedLocation)}
                      {console.log('  apiKey:', API_KEY)}
                      <WeatherMap
                        center={currentMapCenter}
                        zoom={currentMapZoom}
                        weatherLayers={weatherLayers}
                        selectedLocation={selectedLocation}
                        apiKey={API_KEY}
                      />
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <Alert
                        variant="destructive"
                        className="p-4 rounded-xl border bg-red-900/20 border-red-500/50 text-red-400"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="text-sm">
                          API Key OpenWeatherMap tidak valid. Silakan periksa
                          file .env.local Anda.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 space-y-6"
          >
            <WeatherDisplay
              data={currentWeatherData}
              loading={loadingWeather}
              error={weatherError}
            />
            <DailyForecast data={currentWeatherData} loading={loadingWeather} />
            {selectedLocation && (
              <Card className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <span>Informasi Lokasi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400">Latitude</span>
                    <span className="text-white font-medium font-mono">
                      {selectedLocation.lat.toFixed(4)}°
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Longitude</span>
                    <span className="text-white font-medium font-mono">
                      {selectedLocation.lon.toFixed(4)}°
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.aside>
        </div>
      </main>
    </div>
  );
}