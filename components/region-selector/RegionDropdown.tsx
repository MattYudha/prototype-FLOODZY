// src/components/region-selector/RegionDropdown.tsx
"use client";

import { useState } from "react";
import { useRegionData } from "@/hooks/useRegionData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Frown,
  MapPin,
  Building2,
  Globe,
  Map, // Map icon for the map card title
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Thermometer,
  Loader2, // Icons for weather display
} from "lucide-react";
import { WeatherData } from "@/lib/api"; // Import WeatherData interface
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants"; // Import default map constants

// Props baru untuk menerima data cuaca dan lokasi terpilih
interface RegionDropdownProps {
  onSelectDistrict?: (
    districtCode: string,
    districtName: string,
    regencyCode: string,
    provinceCode: string,
    latitude?: number,
    longitude?: number,
    geometry?: string
  ) => void;
  // === PROPS BARU INI ===
  selectedLocationCoords?: { lat: number; lng: number; name: string } | null;
  currentWeatherData?: WeatherData | null;
  loadingWeather?: boolean;
  weatherError?: string | null;
}

export function RegionDropdown({
  onSelectDistrict,
  selectedLocationCoords,
  currentWeatherData,
  loadingWeather,
  weatherError,
}: RegionDropdownProps) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string | null>(
    null
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);

  const [displayProvinceName, setDisplayProvinceName] = useState<string | null>(
    null
  );
  const [displayRegencyName, setDisplayRegencyName] = useState<string | null>(
    null
  );
  const [displayDistrictName, setDisplayDistrictName] = useState<string | null>(
    null
  );

  const {
    data: provinces,
    loading: loadingProvinces,
    error: errorProvinces,
  } = useRegionData({ type: "provinces" });

  const {
    data: regencies,
    loading: loadingRegencies,
    error: errorRegencies,
  } = useRegionData({
    type: "regencies",
    parentCode: selectedProvinceCode,
    enabled: !!selectedProvinceCode,
  });

  const {
    data: districts,
    loading: loadingDistricts,
    error: errorDistricts,
  } = useRegionData({
    type: "districts",
    parentCode: selectedRegencyCode,
    enabled: !!selectedRegencyCode,
  });

  const handleProvinceChange = (value: string) => {
    setSelectedProvinceCode(value);
    const name =
      provinces.find((p) => String(p.province_code) === value)?.province_name ||
      null;
    setDisplayProvinceName(name);

    setSelectedRegencyCode(null);
    setDisplayRegencyName(null);
    setSelectedDistrictCode(null);
    setDisplayDistrictName(null);

    onSelectDistrict?.("", "", "", "");
  };

  const handleRegencyChange = (value: string) => {
    setSelectedRegencyCode(value);
    const name =
      regencies.find((r) => String(r.city_code) === value)?.city_name || null;
    setDisplayRegencyName(name);

    setSelectedDistrictCode(null);
    setDisplayDistrictName(null);

    onSelectDistrict?.("", "", "", "");
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);

    if (!selectedProvinceCode || !selectedRegencyCode) {
      setDisplayDistrictName(null);
      onSelectDistrict?.("", "", "", "");
      return;
    }

    const selectedDistrict = districts.find(
      (d) => d.sub_district_code === Number(value)
    );

    if (selectedDistrict) {
      const name = selectedDistrict.sub_district_name || null;
      setDisplayDistrictName(name);

      const locationData = {
        districtCode: String(selectedDistrict.sub_district_code),
        districtName: selectedDistrict.sub_district_name || "",
        regencyCode: selectedRegencyCode,
        provinceCode: selectedProvinceCode,
        latitude: selectedDistrict.sub_district_latitude,
        longitude: selectedDistrict.sub_district_longitude,
        geometry: selectedDistrict.sub_district_geometry,
      };

      onSelectDistrict(
        locationData.districtCode,
        locationData.districtName,
        locationData.regencyCode,
        locationData.provinceCode,
        locationData.latitude,
        locationData.longitude,
        locationData.geometry
      );
    } else {
      setDisplayDistrictName(null);
      onSelectDistrict?.("", "", "", "");
    }
  };

  const renderError = (errorMessage: string) => (
    <Alert
      variant="destructive"
      className="bg-red-900/20 border-red-700/50 text-red-400"
    >
      <Frown className="h-4 w-4" />
      <AlertTitle>Error!</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );

  const renderSelectField = (
    selectedValue: string | null,
    onValueChange: (value: string) => void,
    placeholder: string,
    loading: boolean,
    disabled: boolean,
    data: any[],
    icon: React.ReactNode,
    valueKey: string,
    nameKey: string,
    currentDisplayName: string | null
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
        {icon}
        <span>{placeholder}</span>
      </div>
      <Select
        value={selectedValue || ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-full h-10 bg-gray-800/50 border-gray-700/50 text-white rounded-lg
                             hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200
                             focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                             data-[placeholder]:text-gray-400"
        >
          <SelectValue
            placeholder={
              loading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 bg-gray-600 rounded" />
                  <Skeleton className="h-3 w-20 bg-gray-600 rounded" />
                </div>
              ) : (
                `Pilih ${placeholder}`
              )
            }
          >
            {currentDisplayName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700/50 text-white max-h-48 overflow-y-auto">
          {data.map((item, index) => (
            <SelectItem
              key={item[valueKey]}
              value={String(item[valueKey])}
              className="hover:bg-gray-700/50 focus:bg-gray-700/50 transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 min-w-[30px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm">{item[nameKey]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // === FUNGSI HELPER BARU: untuk menghasilkan string HTML iframe cuaca ===
  const generateWeatherMapIframeSrc = () => {
    const lat = selectedLocationCoords?.lat || DEFAULT_MAP_CENTER[0];
    const lng = selectedLocationCoords?.lng || DEFAULT_MAP_CENTER[1];
    const zoom = selectedLocationCoords ? 10 : 5; // Zoom in if location selected

    let weatherIconSvg = ``;
    let weatherDescription = ``;
    let temperature = ``;

    if (loadingWeather) {
      weatherIconSvg = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:14px;">Memuat cuaca...</div>`;
    } else if (weatherError) {
      weatherIconSvg = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#ef4444; font-size:14px;">Error: ${weatherError}</div>`;
    } else if (currentWeatherData) {
      const iconCode = currentWeatherData.icon;
      let iconChar = "☁️"; // Default cloud
      if (iconCode.startsWith("01")) iconChar = "☀️"; // Clear sky
      else if (iconCode.startsWith("02")) iconChar = "🌤️"; // Few clouds
      else if (iconCode.startsWith("03") || iconCode.startsWith("04"))
        iconChar = "☁️"; // Scattered/broken clouds
      else if (iconCode.startsWith("09") || iconCode.startsWith("10"))
        iconChar = "🌧️"; // Rain/shower rain
      else if (iconCode.startsWith("11")) iconChar = "🌩️"; // Thunderstorm
      else if (iconCode.startsWith("13")) iconChar = "🌨️"; // Snow
      else if (iconCode.startsWith("50")) iconChar = "🌫️"; // Mist/fog

      weatherIconSvg = `<div style="font-size: 50px; text-align: center;">${iconChar}</div>`;
      weatherDescription = currentWeatherData.description;
      temperature = `${Math.round(currentWeatherData.temperature)}°C`;
    } else {
      weatherIconSvg = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:14px;">Pilih lokasi</div>`;
    }

    return `data:text/html;charset=utf-8,
      <!DOCTYPE html>
      <html>
      <head>
        <title>Peta Cuaca</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #1a202c; overflow: hidden; }
          #map { height: 100% !important; width: 100% !important; background: #2d3748; }
          .leaflet-container { background: #2d3748; }
          .weather-overlay {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .weather-overlay .main-info {
              display: flex;
              align-items: center;
              gap: 10px;
          }
          .weather-overlay .temp {
              font-size: 24px;
              font-weight: bold;
              color: #63b3ed; /* Light blue */
          }
          .weather-overlay .desc {
              font-size: 12px;
              color: #cbd5e0; /* Grayish white */
              text-transform: capitalize;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="weather-overlay">
          <div class="main-info">
            <div style="font-size: 30px;">${weatherIconSvg}</div>
            <div>
              <div class="temp">${temperature}</div>
              <div class="desc">${weatherDescription}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #63b3ed;">${
              selectedLocationCoords?.name || "Indonesia"
            }</div>
            <div style="font-size: 11px; color: #cbd5e0;">
              Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}
            </div>
          </div>
        </div>
        <script>
          var map = L.map('map', {zoomControl: false}).setView([${lat}, ${lng}], ${zoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          // Invalidate size to ensure map renders correctly
          setTimeout(() => { map.invalidateSize(); }, 100);
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Globe className="h-6 w-6 text-cyan-400" />
          Pilih Lokasi Wilayah Anda
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tentukan wilayah untuk monitoring sistem deteksi banjir
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Side - Region Selector */}
        <div className="space-y-4">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border-b border-gray-800/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    Pilih Wilayah
                  </CardTitle>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Tentukan wilayah monitoring
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Error Display */}
              {errorProvinces && renderError(errorProvinces)}
              {errorRegencies && renderError(errorRegencies)}
              {errorDistricts && renderError(errorDistricts)}

              {/* Province Selection */}
              {renderSelectField(
                selectedProvinceCode,
                handleProvinceChange,
                "Provinsi",
                loadingProvinces,
                loadingProvinces,
                provinces,
                <Globe className="h-4 w-4 text-cyan-400" />,
                "province_code",
                "province_name",
                displayProvinceName
              )}

              {/* Regency Selection */}
              {renderSelectField(
                selectedRegencyCode,
                handleRegencyChange,
                "Kabupaten/Kota",
                loadingRegencies,
                !selectedProvinceCode || loadingRegencies,
                regencies,
                <Building2 className="h-4 w-4 text-cyan-400" />,
                "city_code",
                "city_name",
                displayRegencyName
              )}

              {/* District Selection */}
              {renderSelectField(
                selectedDistrictCode,
                handleDistrictChange,
                "Kecamatan",
                loadingDistricts,
                !selectedRegencyCode || loadingDistricts,
                districts,
                <MapPin className="h-4 w-4 text-cyan-400" />,
                "sub_district_code",
                "sub_district_name",
                displayDistrictName
              )}

              {/* Selection Summary */}
              {selectedDistrictCode && (
                <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <h4 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    Lokasi Terpilih
                  </h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Provinsi:</span>
                      <span className="text-white font-medium text-xs">
                        {displayProvinceName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kabupaten/Kota:</span>
                      <span className="text-white font-medium text-xs">
                        {displayRegencyName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kecamatan:</span>
                      <span className="text-white font-medium text-xs">
                        {displayDistrictName || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Map Container */}
        <div className="space-y-4">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden h-full">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-gray-800/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Map className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    Peta Cuaca Wilayah
                  </CardTitle>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Visualisasi cuaca lokasi yang dipilih
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 h-full">
              <div className="w-full h-full min-h-[400px] rounded-lg border border-gray-700/30 relative overflow-hidden">
                <iframe
                  src={generateWeatherMapIframeSrc()}
                  className="w-full h-full border-0 rounded-lg"
                  title="Peta Cuaca Wilayah"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
