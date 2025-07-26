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
  Eye, // Eye ikon untuk visibility jika ada di WeatherData
  Gauge,
  ArrowUp, // Ikon untuk UV Index
  Loader2,
  Frown,
  CloudDrizzle, // Digunakan juga untuk salju sementara
  CloudSnow, // Jika ada ikon salju yang lebih spesifik
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WeatherData } from '@/lib/api';
import { WEATHER_CONDITIONS } from '@/lib/constants'; // Pastikan ini relevan atau bisa dihapus jika tidak dipakai

import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface WeatherDisplayProps {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

// Mapper untuk ikon cuaca OpenWeatherMap
const getOpenWeatherIcon = (iconCode: string) => {
  if (!iconCode) return Cloud;

  if (iconCode.startsWith('01')) return Sun; // Clear sky
  if (
    iconCode.startsWith('02') || // Few clouds
    iconCode.startsWith('03') || // Scattered clouds
    iconCode.startsWith('04') // Broken clouds
  )
    return Cloud;
  if (
    iconCode.startsWith('09') || // Shower rain
    iconCode.startsWith('10') // Rain
  )
    return CloudRain;
  if (iconCode.startsWith('11')) return Zap; // Thunderstorm
  // Perbaikan: Ikon untuk salju
  if (iconCode.startsWith('13')) return CloudSnow || CloudDrizzle; // Prefer CloudSnow if available, else CloudDrizzle
  if (iconCode.startsWith('50')) return Cloud; // Mist / Haze

  return Cloud; // Default fallback
};

const weatherMetrics = [
  { key: 'humidity', label: 'Kelembaban', icon: Droplets, unit: '%' },
  { key: 'windSpeed', label: 'Kecepatan Angin', icon: Wind, unit: 'km/h' },
  { key: 'pressure', label: 'Tekanan', icon: Gauge, unit: 'hPa' },
  // Tambahkan visibility jika data API Anda menyediakannya dan Anda ingin menampilkannya
  // { key: "visibility", label: "Jarak Pandang", icon: Eye, unit: "km" },
];

export function WeatherDisplay({
  data,
  loading,
  error,
  className,
}: WeatherDisplayProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden h-[250px] flex items-center justify-center',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat cuaca...</p>
          <Skeleton className="h-8 w-48 bg-gray-700" />
          <Skeleton className="h-6 w-32 bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden h-[250px] flex items-center justify-center bg-red-900/30 border-red-700/50 text-red-300',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
          <Frown className="h-10 w-10" />
          <p className="font-semibold">Error memuat cuaca</p>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden h-[250px] flex items-center justify-center',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
          <Thermometer className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Pilih wilayah untuk melihat cuaca.
          </p>
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = getOpenWeatherIcon(data.icon);

  // Helper function to safely get and round a numeric value
  const getRoundedValue = (
    value: number | undefined | null,
  ): string | number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.round(value);
    }
    return 'N/A'; // Return a string if the value is not a valid number
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('space-y-4', className)}
    >
      {/* Main Weather Card */}
      <Card
        className={cn(
          'relative overflow-hidden',
          'bg-gray-800 border-gray-700',
          'text-white',
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Cuaca Saat Ini</CardTitle>
            <Badge variant="glass" className="text-white">
              {new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <WeatherIcon className="h-16 w-16" />
              </motion.div>

              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold">
                    {/* Perbaikan: Menggunakan helper function */}
                    {getRoundedValue(data.temperature)}
                  </span>
                  <span className="text-xl">°C</span>
                </div>
                <p className="text-white/90 capitalize">{data.description}</p>
              </div>
            </div>

            <div className="text-right">
              {/* Perbaikan: Menggunakan helper function untuk uvIndex juga */}
              {data.uvIndex != null && (
                <div className="flex items-center space-x-1 text-sm mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>UV Index: {getRoundedValue(data.uvIndex)}</span>
                </div>
              )}
              {/* Menambahkan Feels Like */}
              <div className="flex items-center space-x-1 text-sm mt-1">
                <Thermometer className="h-4 w-4" />
                <span>Terasa: {getRoundedValue(data.feelsLike)}°C</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Animated background elements (tetap sama) */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-6 h-6 bg-white rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </div>
      </Card>

      {/* Weather Metrics Grid */}
      <div
        className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4')}
      >
        {weatherMetrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center text-center w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold">
                      {/* Perbaikan: Menggunakan helper function */}
                      {getRoundedValue(
                        data[metric.key as keyof WeatherData] as number,
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {/* Perbaikan: Pastikan data.rain1h adalah angka valid sebelum menampilkan */}
        {typeof data?.rain1h === 'number' &&
          !isNaN(data.rain1h) &&
          data.rain1h > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center text-center w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudRain className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">
                        Curah Hujan (1h)
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold">
                        {getRoundedValue(data.rain1h)}
                      </span>
                      <span className="text-sm text-muted-foreground">mm</span>
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
