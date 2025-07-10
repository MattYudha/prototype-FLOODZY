// src/components/region-selector/RegionDropdown.tsx
"use client";
// src/components/region-selector/RegionDropdown.tsx
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
} from "lucide-react"; // Hapus import ikon cuaca yang tidak lagi dipakai di sini
import { WeatherData } from "@/lib/api";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";

// Import komponen baru
import { WeatherMapIframe } from "@/components/weather/WeatherMapIframe"; // <--- IMPORT BARU

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

    onSelectDistrict?.("", "", "", "", undefined, undefined, undefined);
  };

  const handleRegencyChange = (value: string) => {
    setSelectedRegencyCode(value);
    const name =
      regencies.find((r) => String(r.city_code) === value)?.city_name || null;
    setDisplayRegencyName(name);

    setSelectedDistrictCode(null);
    setDisplayDistrictName(null);

    onSelectDistrict?.("", "", "", "", undefined, undefined, undefined);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);

    if (!selectedProvinceCode || !selectedRegencyCode) {
      setDisplayDistrictName(null);
      onSelectDistrict?.("", "", "", "", undefined, undefined, undefined);
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
      onSelectDistrict?.("", "", "", "", undefined, undefined, undefined);
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

  // === FUNGSI generateWeatherMapIframeSrc SUDAH DIPINDAHKAN KE WeatherMapIframe.tsx ===

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
              {/* === GUNAKAN KOMPONEN BARU DI SINI === */}
              <WeatherMapIframe
                selectedLocationCoords={selectedLocationCoords}
                currentWeatherData={currentWeatherData}
                loadingWeather={loadingWeather}
                weatherError={weatherError}
                height="100%" // Pastikan height agar memenuhi container CardContent
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
