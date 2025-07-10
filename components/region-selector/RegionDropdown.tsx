// src/components/region-selector/RegionDropdown.tsx
// Komponen lengkap dengan Region Selector dan Map dalam satu file

"use client";

import { useState, useEffect } from "react"; // Tambahkan useEffect
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
  ChevronDown, // Ini tidak digunakan, bisa dihapus jika tidak diperlukan
  Building2,
  Globe,
  Map,
} from "lucide-react";

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
}

interface SelectedLocation {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
}

export function RegionDropdown({ onSelectDistrict }: RegionDropdownProps) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string | null>(
    null
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

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
    setSelectedRegencyCode(null);
    setSelectedDistrictCode(null);
    setSelectedLocation(null);
    onSelectDistrict?.("", "", "", ""); // Reset selection
  };

  const handleRegencyChange = (value: string) => {
    setSelectedRegencyCode(value);
    setSelectedDistrictCode(null);
    setSelectedLocation(null);
    onSelectDistrict?.("", "", "", ""); // Reset selection
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);

    if (onSelectDistrict && selectedProvinceCode && selectedRegencyCode) {
      const selectedDistrict = districts.find(
        (d) => d.sub_district_code === Number(value)
      );
      if (selectedDistrict) {
        const locationData = {
          districtCode: String(selectedDistrict.sub_district_code),
          districtName: selectedDistrict.sub_district_name || "",
          regencyCode: selectedRegencyCode,
          provinceCode: selectedProvinceCode,
          latitude: selectedDistrict.sub_district_latitude,
          longitude: selectedDistrict.sub_district_longitude,
          geometry: selectedDistrict.sub_district_geometry,
        };

        setSelectedLocation(locationData);

        // DEBUGGING: Cek data koordinat di konsol
        console.log("Selected Location Data:", locationData);
        console.log(
          "Latitude:",
          locationData.latitude,
          "Longitude:",
          locationData.longitude
        );

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
        // Jika distrik tidak ditemukan, reset lokasi terpilih
        setSelectedLocation(null);
        onSelectDistrict?.("", "", "", "");
      }
    } else {
      // Jika parent codes tidak lengkap, reset lokasi terpilih
      setSelectedLocation(null);
      onSelectDistrict?.("", "", "", "");
    }
  };

  // Generate map URL berdasarkan koordinat yang dipilih
  const getMapUrl = () => {
    if (selectedLocation?.latitude != null && selectedLocation?.longitude != null) {
      const lat = selectedLocation.latitude;
      const lng = selectedLocation.longitude;
      const zoom = 12;

      // HTML untuk peta dengan lokasi spesifik
      return `data:text/html;charset=utf-8,
        <!DOCTYPE html>
        <html>
        <head>
          <title>Peta Wilayah Monitoring</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #1f2937; }
            #map { height: 100%; width: 100%; } /* Mengubah 100vh menjadi 100% */
            .location-info {
              position: absolute;
              top: 10px;
              left: 10px;
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 12px;
              border-radius: 8px;
              font-size: 12px;
              z-index: 1000;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="location-info">
            <div style="font-weight: bold; color: #06b6d4; margin-bottom: 5px;">📍 ${selectedLocation.districtName}</div>
            <div style="color: #9ca3af; font-size: 11px;">
              Lat: ${lat.toFixed(6)}<br>
              Lng: ${lng.toFixed(6)}
            </div>
          </div>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([${lat}, ${lng}], ${zoom});
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            var marker = L.marker([${lat}, ${lng}]).addTo(map);
            marker.bindPopup('<div style="text-align: center;"><b>${selectedLocation.districtName}</b><br><small>Wilayah monitoring banjir</small></div>').openPopup();
            
            var circle = L.circle([${lat}, ${lng}], {
              color: '#06b6d4',
              fillColor: '#06b6d4',
              fillOpacity: 0.2,
              radius: 5000
            }).addTo(map);
            circle.bindPopup('<div style="text-align: center;"><b>Area Monitoring</b><br><small>Radius 5km</small></div>');
            
            // Invalidate size to ensure map tiles load correctly if container size changes after init
            setTimeout(() => { map.invalidateSize(); }, 200); 
          </script>
        </body>
        </html>
      `;
    } else {
      // HTML untuk peta default (tanpa lokasi spesifik)
      return `data:text/html;charset=utf-8,
        <!DOCTYPE html>
        <html>
        <head>
          <title>Peta Indonesia</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #1f2937; }
            #map { height: 100%; width: 100%; } /* Mengubah 100vh menjadi 100% */
            .welcome-info {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              z-index: 1000;
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
            }
            .welcome-info h3 { margin: 0 0 10px 0; color: #06b6d4; }
            .welcome-info p { margin: 0; color: #9ca3af; font-size: 14px; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <div class="welcome-info">
            <h3>🗺️ Peta Indonesia</h3>
            <p>Pilih wilayah di sebelah kiri untuk<br>menampilkan lokasi di peta</p>
          </div>
          <script>
            var map = L.map('map').setView([-2.5, 118], 5); // Default view untuk seluruh Indonesia
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            setTimeout(() => { map.invalidateSize(); }, 200); 
          </script>
        </body>
        </html>
      `;
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
    value: string,
    onValueChange: (value: string) => void,
    placeholder: string,
    loading: boolean,
    disabled: boolean,
    data: any[],
    icon: React.ReactNode,
    valueKey: string,
    nameKey: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
        {icon}
        <span>{placeholder}</span>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
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
          />
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

  return (
    <div className="w-full h-full"> {/* Pastikan container utama memiliki tinggi */}
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
      {/* Pastikan div grid memiliki tinggi yang memadai */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]"> {/* Contoh tinggi relatif */}
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
                selectedProvinceCode || "",
                handleProvinceChange,
                "Provinsi",
                loadingProvinces,
                loadingProvinces,
                provinces,
                <Globe className="h-4 w-4 text-cyan-400" />,
                "province_code",
                "province_name"
              )}

              {/* Regency Selection */}
              {renderSelectField(
                selectedRegencyCode || "",
                handleRegencyChange,
                "Kabupaten/Kota",
                loadingRegencies,
                !selectedProvinceCode || loadingRegencies,
                regencies,
                <Building2 className="h-4 w-4 text-cyan-400" />,
                "city_code",
                "city_name"
              )}

              {/* District Selection */}
              {renderSelectField(
                selectedDistrictCode || "",
                handleDistrictChange,
                "Kecamatan",
                loadingDistricts,
                !selectedRegencyCode || loadingDistricts,
                districts,
                <MapPin className="h-4 w-4 text-cyan-400" />,
                "sub_district_code",
                "sub_district_name"
              )}

              {/* Selection Summary */}
              {selectedLocation && ( // Tampilkan jika ada lokasi terpilih
                <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <h4 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    Lokasi Terpilih
                  </h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Provinsi:</span>
                      <span className="text-white font-medium text-xs">
                        {provinces.find(
                          (p) => p.province_code === Number(selectedLocation.provinceCode)
                        )?.province_name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kabupaten/Kota:</span>
                      <span className="text-white font-medium text-xs">
                        {regencies.find(
                          (r) => r.city_code === Number(selectedLocation.regencyCode)
                        )?.city_name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kecamatan:</span>
                      <span className="text-white font-medium text-xs">
                        {selectedLocation.districtName || "-"}
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
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden h-full"> {/* Card ini harus punya tinggi */}
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-gray-800/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Map className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    Peta Wilayah
                  </CardTitle>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Visualisasi lokasi yang dipilih
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Pastikan CardContent memiliki tinggi, dan div peta di dalamnya juga */}
            <CardContent className="p-4 h-[calc(100%-80px)] flex flex-col"> {/* Tambahkan h-[calc(100%-80px)] dan flex flex-col */}
              <div className="w-full h-full min-h-[500px] rounded-lg border border-gray-700/30 relative overflow-hidden">
                <iframe
                  src={getMapUrl()}
                  className="w-full h-full border-0 rounded-lg" // h-full di sini akan bekerja jika parentnya punya tinggi
                  title="Peta Indonesia"
                  loading="lazy"
                />
                {selectedLocation && (
                  <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-300">
                      <div className="font-medium text-white mb-1">
                        📍 {selectedLocation.districtName}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Lat:</span>{" "}
                          {selectedLocation.latitude?.toFixed(6)}
                        </div>
                        <div>
                          <span className="text-gray-400">Lng:</span>{" "}
                          {selectedLocation.longitude?.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}