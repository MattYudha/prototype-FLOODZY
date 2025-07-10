// src/components/weather/WeatherDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Zap, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye, // Eye (Visibilitas) dihapus jika tidak ada di data baru
  Gauge,
  ArrowUp, // ArrowUp (UV Index) dihapus jika tidak ada di data baru
  Loader2 // Import untuk spinner
} from 'lucide-react'; // Pastikan semua ikon yang digunakan diimpor
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WeatherData } from '@/lib/api'; // === PERHATIKAN INI: Menggunakan WeatherData dari lib/api.ts ===
import { WEATHER_CONDITIONS } from '@/lib/constants'; // Ini mungkin perlu disesuaikan atau dihapus jika tidak lagi relevan

import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton'; // Import Skeleton untuk indikator loading

// === PERUBAHAN PROPS DI SINI ===
interface WeatherDisplayProps {
  data: WeatherData | null; // Data bisa null saat loading atau error
  loading: boolean;
  error: string | null;
  className?: string;
}

// === MAPPER UNTUK IKON CUACA OPENWEATHERMAP ===
// OpenWeatherMap memiliki kode ikon seperti "01d", "02n", dll.
// Kita petakan kode-kode ini ke ikon Lucide yang sesuai.
const getOpenWeatherIcon = (iconCode: string) => {
  if (!iconCode) return Cloud;

  // Lihat dokumentasi OpenWeatherMap untuk daftar kode ikon:
  // https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
  if (iconCode.startsWith('01')) return Sun; // Clear sky
  if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) return Cloud; // Few clouds, scattered clouds, broken clouds
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return CloudRain; // Shower rain, rain
  if (iconCode.startsWith('11')) return Zap; // Thunderstorm
  if (iconCode.startsWith('13')) return SnowIcon; // Snow (perlu import SnowIcon atau gunakan CloudRain)
  if (iconCode.startsWith('50')) return Cloud; // Mist, Fog, Haze (menggunakan Cloud untuk kesederhanaan)

  return Cloud; // Default
};

// Pastikan SnowIcon ada jika Anda ingin menggunakannya, jika tidak, pakai CloudRain atau Cloud
const SnowIcon = CloudRain; // Placeholder, bisa ganti dengan ikon salju jika ada

const weatherMetrics = [
  { key: 'humidity', label: 'Kelembaban', icon: Droplets, unit: '%' },
  { key: 'windSpeed', label: 'Kecepatan Angin', icon: Wind, unit: 'km/h' },
  { key: 'pressure', label: 'Tekanan', icon: Gauge, unit: 'hPa' },
  // === VISIBILITAS DIHAPUS KARENA TIDAK ADA DI API BARU ===
  // { key: 'visibility', label: 'Visibilitas', icon: Eye, unit: 'km' },
];

export function WeatherDisplay({ data, loading, error, className }: WeatherDisplayProps) {
  // Tampilkan loading state
  if (loading) {
    return (
      <Card className={cn('relative overflow-hidden h-[250px] flex items-center justify-center', className)}>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat cuaca...</p>
          <Skeleton className="h-8 w-48 bg-gray-700" />
          <Skeleton className="h-6 w-32 bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <Card className={cn('relative overflow-hidden h-[250px] flex items-center justify-center bg-red-900/30 border-red-700/50 text-red-300', className)}>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
          <Frown className="h-10 w-10" />
          <p className="font-semibold">Error memuat cuaca</p>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Tampilkan pesan default jika tidak ada data dan tidak loading/error
  if (!data) {
    return (
      <Card className={cn('relative overflow-hidden h-[250px] flex items-center justify-center', className)}>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
          <Thermometer className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Pilih wilayah untuk melihat cuaca.</p>
        </CardContent>
      </Card>
    );
  }

  // Ambil ikon cuaca berdasarkan kode ikon dari OpenWeatherMap
  const WeatherIcon = getOpenWeatherIcon(data.icon);
  // WEATHER_CONDITIONS mungkin perlu disesuaikan atau dihapus jika tidak digunakan
  // const weatherConfig = WEATHER_CONDITIONS[data.condition] || { gradient: 'from-gray-700 to-gray-900' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('space-y-4', className)}
    >
      {/* Main Weather Card */}
      <Card className={cn(
        'relative overflow-hidden',
        // 'bg-gradient-to-br', // Hapus ini atau sesuaikan berdasarkan logika cuaca dari OWM
        'bg-gray-800 border-gray-700', // Warna background statis atau sesuaikan
        'text-white'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Cuaca Saat Ini</CardTitle>
            <Badge variant="glass" className="text-white">
              {new Date().toLocaleTimeString('id-ID', { // Menggunakan waktu lokal saat ini
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <WeatherIcon className="h-16 w-16" />
              </motion.div>
              
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold">{Math.round(data.temperature)}</span> {/* Bulatkan suhu */}
                  <span className="text-xl">°C</span>
                </div>
                <p className="text-white/90 capitalize">{data.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              {/* Wind Direction tidak ada di API baru, bisa dihapus atau dihitung */}
              {/* <div className="flex items-center space-x-1 text-sm">
                <Wind className="h-4 w-4" />
                <span>{data.windDirection}</span>
              </div> */}
              {data.uvIndex != null && ( // Tampilkan UV Index jika ada
                <div className="flex items-center space-x-1 text-sm mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>UV Index: {data.uvIndex}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Animated background elements (tetap sama) */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-6 h-6 bg-white rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      </Card>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {weatherMetrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {/* Pastikan data[metric.key] tidak null/undefined sebelum ditampilkan */}
                      {data ? Math.round(data[metric.key as keyof WeatherData] as number) : 'N/A'} {/* Bulatkan nilai metrik */}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {/* Opsional: Tampilkan curah hujan 1 jam jika ada */}
        {data?.rain1h != null && data.rain1h > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CloudRain className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Curah Hujan (1h)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {data.rain1h}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      mm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}