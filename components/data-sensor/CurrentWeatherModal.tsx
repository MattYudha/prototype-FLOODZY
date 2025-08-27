'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Cloud, Droplets, Wind, Thermometer, Eye, Clock } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { format } from 'date-fns';

const CurrentWeatherModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { weatherData, isLoading, error, fetchWeather } = useWeatherData();

  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (geoError) => {
            console.error("Error getting geolocation:", geoError);
            alert("Gagal mendapatkan lokasi Anda. Pastikan GPS diaktifkan dan berikan izin lokasi.");
          }
        );
      } else {
        alert("Geolocation tidak didukung oleh browser Anda.");
      }
    }
  }, [isOpen, fetchWeather]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-left">
          <Cloud className="mr-2 h-4 w-4" />
          Cuaca Sekarang
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cuaca Sekarang</DialogTitle>
          <DialogDescription>
            Informasi cuaca terkini berdasarkan lokasi Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-400">Memuat data cuaca...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400">Gagal memuat cuaca: {error}</p>
            </div>
          ) : weatherData ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Lokasi: {weatherData.current.name}</p>
                <div className="text-5xl font-bold text-white mt-2">{Math.round(weatherData.current.main.temp)}°C</div>
                <p className="text-gray-400 text-lg">{weatherData.current.weather[0].description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <Droplets className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{weatherData.current.main.humidity}%</p>
                  <p className="text-xs text-gray-400">Kelembaban</p>
                </div>
                <div>
                  <Wind className="h-6 w-6 text-green-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{weatherData.current.wind.speed} m/s</p>
                  <p className="text-xs text-gray-400">Angin</p>
                </div>
                <div>
                  <Thermometer className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{weatherData.current.main.pressure} hPa</p>
                  <p className="text-xs text-gray-400">Tekanan</p>
                </div>
                <div>
                  <Eye className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{weatherData.current.visibility / 1000} km</p>
                  <p className="text-xs text-gray-400">Jarak Pandang</p>
                </div>
                <div>
                  <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{format(new Date(weatherData.current.sys.sunrise * 1000), 'HH:mm')}</p>
                  <p className="text-xs text-gray-400">Matahari Terbit</p>
                </div>
                <div>
                  <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{format(new Date(weatherData.current.sys.sunset * 1000), 'HH:mm')}</p>
                  <p className="text-xs text-gray-400">Matahari Terbenam</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Data cuaca tidak tersedia.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CurrentWeatherModal;
