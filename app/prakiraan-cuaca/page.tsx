"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  Filter,
  Layers,
  RotateCcw,
  Maximize2,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { RegionDropdown } from "@/components/region-selector/RegionDropdown";
import { WeatherMap } from "@/components/weather/WeatherMap";

import {
  fetchWeatherData,
  geocodeLocation,
  WeatherData,
  NominatimResult,
} from "@/lib/api";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const OPEN_WEATHER_API_KEY = "b48e2782f52bd9c6783ef14a35856abc";

interface SelectedLocationDetails {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
}

interface WeatherLayers {
  clouds: boolean;
  precipitation: boolean;
  temperature: boolean;
  wind: boolean;
  pressure: boolean;
}

export default function PrakiraanCuacaPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Location and map states
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationDetails | null>(null);
  const [currentMapCenter, setCurrentMapCenter] = useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [currentMapZoom, setCurrentMapZoom] = useState(DEFAULT_MAP_ZOOM);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchLocationError, setSearchLocationError] = useState<string | null>(null);

  // Weather data states
  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Weather layers control
  const [weatherLayers, setWeatherLayers] = useState<WeatherLayers>({
    clouds: true,
    precipitation: false,
    temperature: false,
    wind: false,
    pressure: false,
  });

  // UI states
  const [showFilters, setShowFilters] = useState(true);

  // Handle region selection from dropdown
  const handleRegionSelect = (
    districtCode: string,
    districtName: string,
    regencyCode: string,
    provinceCode: string,
    latitude?: number,
    longitude?: number
  ) => {
    const newLocation: SelectedLocationDetails = {
      districtCode,
      districtName,
      regencyCode,
      provinceCode,
      latitude,
      longitude,
    };
    setSelectedLocation(newLocation);
    
    if (latitude != null && longitude != null) {
      setCurrentMapCenter([latitude, longitude]);
      setCurrentMapZoom(12);
      fetchWeatherForLocation(latitude, longitude);
    } else {
      setCurrentMapCenter(DEFAULT_MAP_CENTER);
      setCurrentMapZoom(DEFAULT_MAP_ZOOM);
    }
  };

  // Handle search location
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    setSearchLocationError(null);

    try {
      const results: NominatimResult[] = await geocodeLocation(searchQuery);
      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);

        setSelectedLocation({
          districtCode: "",
          districtName: display_name,
          regencyCode: "",
          provinceCode: "",
          latitude: newLat,
          longitude: newLon,
        });
        setCurrentMapCenter([newLat, newLon]);
        setCurrentMapZoom(13);
        setSearchQuery("");
        
        // Fetch weather data for the new location
        fetchWeatherForLocation(newLat, newLon);
      } else {
        setSearchLocationError("Lokasi tidak ditemukan.");
      }
    } catch (error: any) {
      console.error("Geocoding error:", error);
      setSearchLocationError(error.message || "Gagal mencari lokasi. Coba lagi.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Fetch weather data for specific coordinates
  const fetchWeatherForLocation = async (lat: number, lon: number) => {
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      const weatherData = await fetchWeatherData(lat, lon, OPEN_WEATHER_API_KEY);
      setCurrentWeatherData(weatherData);
    } catch (error: any) {
      console.error("Error fetching weather data:", error);
      setWeatherError(error.message || "Gagal memuat data cuaca.");
      setCurrentWeatherData(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Toggle weather layer
  const toggleWeatherLayer = (layerName: keyof WeatherLayers) => {
    setWeatherLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Weather layer configurations
  const weatherLayerConfigs = [
    {
      key: "clouds" as keyof WeatherLayers,
      label: "Awan",
      icon: Cloud,
      color: "text-gray-400",
      description: "Tutupan awan"
    },
    {
      key: "precipitation" as keyof WeatherLayers,
      label: "Curah Hujan",
      icon: CloudRain,
      color: "text-blue-400",
      description: "Intensitas hujan"
    },
    {
      key: "temperature" as keyof WeatherLayers,
      label: "Suhu",
      icon: Thermometer,
      color: "text-red-400",
      description: "Distribusi suhu"
    },
    {
      key: "wind" as keyof WeatherLayers,
      label: "Angin",
      icon: Wind,
      color: "text-green-400",
      description: "Kecepatan angin"
    },
    {
      key: "pressure" as keyof WeatherLayers,
      label: "Tekanan",
      icon: Gauge,
      color: "text-purple-400",
      description: "Tekanan atmosfer"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Prakiraan Cuaca
              </h1>
              <p className="text-slate-400 mt-1">
                Monitoring cuaca real-time dengan visualisasi interaktif
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Controls and Weather Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn("lg:w-1/3 flex-shrink-0", isMobile && "w-full")}
          >
            <div className="space-y-6">
              {/* Search Section */}
              <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    <span>Cari Lokasi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Masukkan nama kota atau wilayah..."
                        className="w-full pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSearchLocation();
                          }
                        }}
                        disabled={isSearchingLocation}
                      />
                      {isSearchingLocation && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
                      )}
                    </div>
                    <Button
                      onClick={handleSearchLocation}
                      disabled={isSearchingLocation || !searchQuery.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Cari
                    </Button>
                  </div>
                  {searchLocationError && (
                    <Alert variant="destructive">
                      <AlertDescription>{searchLocationError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Region Dropdown Alternative */}
              <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <span>Pilih Wilayah</span>
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
                  />
                </CardContent>
              </Card>

              {/* Weather Display */}
              <WeatherDisplay
                data={currentWeatherData}
                loading={loadingWeather}
                error={weatherError}
              />

              {/* Weather Layers Control */}
              <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span>Layer Cuaca</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4">
                        {weatherLayerConfigs.map((layer) => (
                          <div
                            key={layer.key}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-600/40 transition-colors duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <layer.icon className={cn("w-4 h-4", layer.color)} />
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
                              onCheckedChange={() => toggleWeatherLayer(layer.key)}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Current Location Info */}
              {selectedLocation && (
                <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                      <span>Lokasi Terpilih</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Nama:</span>
                        <span className="text-white font-medium text-sm">
                          {selectedLocation.districtName}
                        </span>
                      </div>
                      {selectedLocation.latitude && selectedLocation.longitude && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Latitude:</span>
                            <span className="text-white font-medium text-sm">
                              {selectedLocation.latitude.toFixed(6)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Longitude:</span>
                            <span className="text-white font-medium text-sm">
                              {selectedLocation.longitude.toFixed(6)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Right Panel - Weather Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-2/3 flex-1"
          >
            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-lg rounded-xl overflow-hidden h-full">
              <CardHeader className="bg-slate-700/30 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <span>Peta Cuaca Interaktif</span>
                    {selectedLocation?.districtName && (
                      <Badge variant="outline" className="ml-2">
                        {selectedLocation.districtName}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: "700px", width: "100%" }}>
                  <WeatherMap
                    center={currentMapCenter}
                    zoom={currentMapZoom}
                    weatherLayers={weatherLayers}
                    selectedLocation={selectedLocation}
                    currentWeatherData={currentWeatherData}
                    className="h-full w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}