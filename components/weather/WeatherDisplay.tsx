// src/components/weather/WeatherDisplay.tsx
"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  Sun,
  CloudRain,
  Zap,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  ArrowUp,
  Loader2,
  Frown, // Menambahkan Frown untuk error state
  CloudDrizzle, // Menambahkan CloudDrizzle jika belum ada
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WeatherData } from "@/lib/api";
import { WEATHER_CONDITIONS } from "@/lib/constants";

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface WeatherDisplayProps {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

// Mapper untuk ikon cuaca OpenWeatherMap
const getOpenWeatherIcon = (iconCode: string) => {
  if (!iconCode) return Cloud;

  if (iconCode.startsWith("01")) return Sun;
  if (
    iconCode.startsWith("02") ||
    iconCode.startsWith("03") ||
    iconCode.startsWith("04")
  )
    return Cloud;
  if (iconCode.startsWith("09") || iconCode.startsWith("10")) return CloudRain;
  if (iconCode.startsWith("11")) return Zap;
  if (iconCode.startsWith("13")) return CloudRain;
  if (iconCode.startsWith("50")) return Cloud;

  return Cloud;
};

const weatherMetrics = [
  { key: "humidity", label: "Kelembaban", icon: Droplets, unit: "%" },
  { key: "windSpeed", label: "Kecepatan Angin", icon: Wind, unit: "km/h" },
  { key: "pressure", label: "Tekanan", icon: Gauge, unit: "hPa" },
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
          "relative overflow-hidden h-[250px] flex items-center justify-center",
          className
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
          "relative overflow-hidden h-[250px] flex items-center justify-center bg-red-900/30 border-red-700/50 text-red-300",
          className
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
          "relative overflow-hidden h-[250px] flex items-center justify-center",
          className
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Main Weather Card */}
      <Card
        className={cn(
          "relative overflow-hidden",
          "bg-gray-800 border-gray-700",
          "text-white"
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Cuaca Saat Ini</CardTitle>
            <Badge variant="glass" className="text-white">
              {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
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
                  <span className="text-4xl font-bold">
                    {Math.round(data.temperature)}
                  </span>
                  <span className="text-xl">°C</span>
                </div>
                <p className="text-white/90 capitalize">{data.description}</p>
              </div>
            </div>

            <div className="text-right">
              {data.uvIndex != null && (
                <div className="flex items-center space-x-1 text-sm mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>UV Index: {data.uvIndex}</span>
                </div>
              )}
              {/* Menambahkan Feels Like */}
              <div className="flex items-center space-x-1 text-sm mt-1">
                <Thermometer className="h-4 w-4" />
                <span>Terasa: {Math.round(data.feelsLike)}°C</span>
              </div>
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
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
      </Card>

      {/* Weather Metrics Grid */}
      <div
        className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4")}
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
                {/* === PERBAIKAN DI SINI: PUSATKAN TEKS DAN UBAH UKURAN FONT === */}
                <div className="flex flex-col items-center justify-center text-center w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    {" "}
                    {/* Menambahkan margin-bottom */}
                    <metric.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                      {metric.label}
                    </span>{" "}
                    {/* Label tetap ukuran standar */}
                  </div>
                  <div className="flex items-baseline space-x-1">
                    {" "}
                    {/* Menggunakan flex items-baseline untuk angka dan unit */}
                    <span className="text-2xl font-bold">
                      {" "}
                      {/* Angka menjadi sedikit lebih besar dari sebelumnya */}
                      {data
                        ? Math.round(
                            data[metric.key as keyof WeatherData] as number
                          )
                        : "N/A"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      {/* Unit lebih kecil dari angka */}
                      {metric.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {data?.rain1h != null && data.rain1h > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* === PERBAIKAN DI SINI: PUSATKAN TEKS DAN UBAH UKURAN FONT (untuk Curah Hujan) === */}
                <div className="flex flex-col items-center justify-center text-center w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <CloudRain className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                      Curah Hujan (1h)
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold">{data.rain1h}</span>
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
