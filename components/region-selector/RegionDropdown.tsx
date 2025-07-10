// src/components/region-selector/RegionDropdown.tsx
// Komponen lengkap dengan Region Selector dan Map dalam satu file

"use client";

import { useState, useEffect } from "react"; // useEffect tidak digunakan di sini, bisa dihapus. Saya biarkan saja untuk berjaga-jaga.
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
  Map, // Ini tidak digunakan karena peta ada di page.tsx, bisa dihapus jika tidak diperlukan
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

// === PERHATIAN: Hapus interface SelectedLocation dan fungsi getMapUrl dari file ini.
// Karena sudah dipindahkan ke page.tsx. Jika Anda tetap menyimpannya di sini,
// itu duplikasi dan bisa menyebabkan kebingungan atau masalah di masa depan.
// Saya akan HAPUS di kode di bawah ini.

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
  // Hapus selectedLocation state dari sini, ini state milik page.tsx
  // const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  // === PENAMBAHAN STATE UNTUK NAMA YANG AKAN DITAMPILKAN PADA SELECTVALUE ===
  const [displayProvinceName, setDisplayProvinceName] = useState<string | null>(null);
  const [displayRegencyName, setDisplayRegencyName] = useState<string | null>(null);
  const [displayDistrictName, setDisplayDistrictName] = useState<string | null>(null);


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
    // Set nama yang akan ditampilkan
    const selectedProv = provinces.find(p => String(p.province_code) === value);
    setDisplayProvinceName(selectedProv?.province_name || null);

    setSelectedRegencyCode(null);
    setDisplayRegencyName(null); // Reset nama kabupaten/kota
    setSelectedDistrictCode(null);
    setDisplayDistrictName(null); // Reset nama kecamatan
    // setSelectedLocation(null); // Ini milik page.tsx
    onSelectDistrict?.("", "", "", ""); // Reset selection di parent
  };

  const handleRegencyChange = (value: string) => {
    setSelectedRegencyCode(value);
    // Set nama yang akan ditampilkan
    const selectedReg = regencies.find(r => String(r.city_code) === value);
    setDisplayRegencyName(selectedReg?.city_name || null);

    setSelectedDistrictCode(null);
    setDisplayDistrictName(null); // Reset nama kecamatan
    // setSelectedLocation(null); // Ini milik page.tsx
    onSelectDistrict?.("", "", "", ""); // Reset selection di parent
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);

    // Pastikan selectedProvinceCode dan selectedRegencyCode tidak null
    if (!selectedProvinceCode || !selectedRegencyCode) {
        setDisplayDistrictName(null); // Reset nama kecamatan
        onSelectDistrict?.("", "", "", "");
        return;
    }

    const selectedDistrict = districts.find(
      (d) => d.sub_district_code === Number(value)
    );

    if (selectedDistrict) {
      // Set nama yang akan ditampilkan
      setDisplayDistrictName(selectedDistrict.sub_district_name || null);

      const locationData = {
        districtCode: String(selectedDistrict.sub_district_code),
        districtName: selectedDistrict.sub_district_name || "",
        regencyCode: selectedRegencyCode,
        provinceCode: selectedProvinceCode,
        latitude: selectedDistrict.sub_district_latitude,
        longitude: selectedDistrict.sub_district_longitude,
        geometry: selectedDistrict.sub_district_geometry,
      };
      
      // setSelectedLocation(locationData); // Ini milik page.tsx

      // DEBUGGING: Cek data koordinat di konsol
      console.log("RegionDropdown DEBUG: Selected District Data before callback:", locationData);
      console.log(
        "RegionDropdown DEBUG: Latitude:",
        locationData.latitude,
        "Longitude:",
        locationData.longitude
      );

      // Panggil callback onSelectDistrict dengan semua data yang relevan
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
      // Jika distrik tidak ditemukan, reset display name dan selection di parent
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

  // === Fungsi renderSelectField disesuaikan untuk menampilkan displayedName ===
  const renderSelectField = (
    value: string | null, // Kode yang dipilih
    onValueChange: (value: string) => void,
    placeholder: string,
    loading: boolean,
    disabled: boolean,
    data: any[],
    icon: React.ReactNode,
    valueKey: string,
    nameKey: string,
    currentDisplayName: string | null // Nama yang akan ditampilkan di SelectValue
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
        {icon}
        <span>{placeholder}</span>
      </div>
      <Select value={value || ""} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className="w-full h-10 bg-gray-800/50 border-gray-700/50 text-white rounded-lg
                             hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200
                             focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                             data-[placeholder]:text-gray-400"
        >
          {/* === Perbaikan Utama: Meneruskan currentDisplayName sebagai children ke SelectValue === */}
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
            {/* Hanya tampilkan nama jika sudah ada yang dipilih, jika tidak, placeholder akan aktif */}
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
      {/* Menggunakan h-full agar Card dapat mengambil tinggi yang cukup */}
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
                displayProvinceName // === KIRIM NAMA INI KE renderSelectField ===
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
                displayRegencyName // === KIRIM NAMA INI KE renderSelectField ===
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
                displayDistrictName // === KIRIM NAMA INI KE renderSelectField ===
              )}

              {/* Selection Summary */}
              {selectedDistrictCode && ( // Tampilkan jika ada lokasi terpilih (berdasarkan kode distrik)
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

        {/* Right Side - Map Container (PETA SUDAH DIPINDAH KE page.tsx) */}
        {/* Hapus div ini jika Anda tidak lagi memerlukan peta di sini */}
        <div className="space-y-4">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden h-full">
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

            <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
              {/* Teks placeholder atau spinner jika diperlukan */}
              <div className="text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p>Peta akan muncul di Dashboard Utama</p>
                <p className="text-xs">Silakan pilih wilayah terlebih dahulu.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}