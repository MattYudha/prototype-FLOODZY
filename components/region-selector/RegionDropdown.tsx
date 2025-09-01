// src/components/region-selector/RegionDropdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRegionData } from '@/hooks/useRegionData';
import { Button } from '@/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Frown,
  MapPin,
  Building2,
  Globe,
  Map,
  ChevronsUpDown,
  CheckCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { WeatherData, CombinedWeatherData } from '@/lib/api';
import { WeatherMapIframe } from '@/components/weather/WeatherMapIframe';

import { SelectedLocation } from '@/types/location';

// Define props for the new component
interface RegionSelectFieldProps {
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  loading: boolean;
  disabled: boolean;
  data: any[];
  icon: React.ReactNode;
  valueKey: string;
  nameKey: string;
  currentDisplayName: string | null;
}

// Create a dedicated component for the select field
function RegionSelectField({
  selectedValue,
  onValueChange,
  placeholder,
  loading,
  disabled,
  data,
  icon,
  valueKey,
  nameKey,
  currentDisplayName,
}: RegionSelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
        {icon}
        <span>{placeholder}</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-9 sm:h-10 bg-gray-800/40 border-gray-700/50 text-white rounded-lg hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            {currentDisplayName ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                <span className="text-white text-xs sm:text-sm truncate">
                  {currentDisplayName}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs sm:text-sm">{`Pilih ${placeholder}`}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-800/95 border-gray-700/50 text-white backdrop-blur-md rounded-lg">
          <Command>
            <CommandInput
              placeholder={`Cari ${placeholder}...`}
              className="h-9 border-0 bg-transparent text-white ring-offset-0 focus:ring-0"
            />
            <CommandEmpty>Tidak ada {placeholder} ditemukan.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {loading ? (
                  <div className="p-2 text-center text-xs text-gray-400">
                    Memuat data...
                  </div>
                ) : data.length === 0 ? (
                  <div className="p-2 text-center text-xs text-gray-400">
                    Tidak ada {placeholder} ditemukan.
                  </div>
                ) : (
                  data.map((item, index) => (
                    <CommandItem
                      key={item[valueKey]}
                      value={item[nameKey]}
                      onSelect={(currentValue) => {
                        const selected = data.find(
                          (d) =>
                            d[nameKey].toLowerCase() === currentValue.toLowerCase(),
                        );
                        if (selected) {
                          onValueChange(String(selected[valueKey]));
                        }
                        setOpen(false);
                      }}
                      className="hover:bg-gray-700/50 focus:bg-gray-700/50 transition-colors duration-200 cursor-pointer py-1.5 sm:py-2 px-2 sm:px-3 rounded-md mx-0.5 my-0.5"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-gray-400 min-w-[20px] sm:min-w-[24px] bg-gray-700/50 px-1 sm:px-1.5 py-0.5 rounded-sm flex-shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs sm:text-sm font-medium truncate">
                          {item[nameKey]}
                        </span>
                      </div>
                      <CheckCircle
                        className={`ml-auto h-4 w-4 ${
                          selectedValue === String(item[valueKey])
                            ? 'opacity-100 text-cyan-400'
                            : 'opacity-0'
                        }`}
                      />
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface RegionDropdownProps {
  onSelectDistrict?: (location: SelectedLocation) => void;
  selectedLocation?: SelectedLocation | null;
  currentWeatherData?: CombinedWeatherData | null;
  loadingWeather?: boolean;
  weatherError?: string | null;
}

export function RegionDropdown({
  onSelectDistrict,
  selectedLocation,
  currentWeatherData,
  loadingWeather,
  weatherError,
}: RegionDropdownProps) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string | null>(
    null,
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);

  const [displayProvinceName, setDisplayProvinceName] = useState<string | null>(
    null,
  );
  const [displayRegencyName, setDisplayRegencyName] = useState<string | null>(
    null,
  );
  const [displayDistrictName, setDisplayDistrictName] = useState<string | null>(
    null,
  );

  const {
    data: provinces,
    loading: loadingProvinces,
    error: errorProvinces,
  } = useRegionData({ type: 'provinces' });

  const {
    data: regencies,
    loading: loadingRegencies,
    error: errorRegencies,
  } = useRegionData({
    type: 'regencies',
    parentCode: selectedProvinceCode,
    enabled: !!selectedProvinceCode,
  });

  const {
    data: districts,
    loading: loadingDistricts,
    error: errorDistricts,
  } = useRegionData({
    type: 'districts',
    parentCode: selectedRegencyCode,
    enabled: !!selectedRegencyCode,
  });

  // Effect to synchronize internal state with the selectedLocation prop
  useEffect(() => {
    if (selectedLocation) {
      // Set codes based on the external prop
      setSelectedProvinceCode(selectedLocation.provinceCode);
      setSelectedRegencyCode(selectedLocation.regencyCode);
      setSelectedDistrictCode(selectedLocation.districtCode);
      setDisplayDistrictName(selectedLocation.districtName);
    } else {
      // If the external prop is null, reset everything
      setSelectedProvinceCode(null);
      setDisplayProvinceName(null);
      setSelectedRegencyCode(null);
      setDisplayRegencyName(null);
      setSelectedDistrictCode(null);
      setDisplayDistrictName(null);
    }
  }, [selectedLocation]); // Only run when the prop changes

  // Effect to update province display name when data is available
  useEffect(() => {
    if (selectedProvinceCode && provinces.length > 0) {
      const provinceName =
        provinces.find((p) => String(p.province_code) === selectedProvinceCode)
          ?.province_name || null;
      setDisplayProvinceName(provinceName);
    }
  }, [selectedProvinceCode, provinces]);

  // Effect to update regency display name when data is available
  useEffect(() => {
    if (selectedRegencyCode && regencies.length > 0) {
      const regencyName =
        regencies.find((r) => String(r.city_code) === selectedRegencyCode)
          ?.city_name || null;
      setDisplayRegencyName(regencyName);
    }
  }, [selectedRegencyCode, regencies]);

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
  };

  const handleRegencyChange = (value: string) => {
    setSelectedRegencyCode(value);
    const name =
      regencies.find((r) => String(r.city_code) === value)?.city_name || null;
    setDisplayRegencyName(name);

    setSelectedDistrictCode(null);
    setDisplayDistrictName(null);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);

    if (!selectedProvinceCode || !selectedRegencyCode) {
      setDisplayDistrictName(null);
      return;
    }

    const selectedDistrict = districts.find(
      (d) => d.sub_district_code === Number(value),
    );

    if (selectedDistrict) {
      const name = selectedDistrict.sub_district_name || null;
      setDisplayDistrictName(name);

      const lat = selectedDistrict.sub_district_latitude;
      const lng = selectedDistrict.sub_district_longitude;

      console.log(`Selected district coordinates: lat=${lat}, lng=${lng}`);

      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
        console.warn(
          `Invalid coordinates for district ${name}: lat=${lat}, lng=${lng}`,
        );
      }

      const locationData = {
        districtCode: String(selectedDistrict.sub_district_code),
        districtName: selectedDistrict.sub_district_name || '',
        regencyCode: selectedRegencyCode,
        provinceCode: selectedProvinceCode,
        latitude: lat,
        longitude: lng,
        geometry: selectedDistrict.sub_district_geometry,
      };

      if (onSelectDistrict) {
        onSelectDistrict(locationData);
      }
    } else {
      setDisplayDistrictName(null);
    }
  };

  const renderError = (errorMessage: string) => (
    <Alert
      variant="destructive"
      className="bg-red-500/10 border-red-500/20 text-red-400 mb-3"
    >
      <Frown className="h-3 w-3" />
      <AlertTitle className="text-sm">Error!</AlertTitle>
      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
    </Alert>
  );

  const isComplete =
    selectedDistrictCode &&
    displayProvinceName &&
    displayRegencyName &&
    displayDistrictName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4 md:p-6 pb-16 sm:pb-6">
      {/* Compact Mobile Header */}
      <div className="mb-3 sm:mb-6 md:mb-8">
        <div className="flex flex-col space-y-2 sm:space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <div className="p-1 sm:p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Globe className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Pilih Lokasi Wilayah
              </span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 px-0.5">
              Tentukan wilayah untuk monitoring sistem deteksi banjir
            </p>
          </div>

          {/* Progress Indicator - Mobile */}
          <div className="md:hidden">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  selectedProvinceCode ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              />
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  selectedRegencyCode ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              />
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  selectedDistrictCode ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              />
              <span className="ml-1.5 text-xs">
                {selectedDistrictCode
                  ? 'Lengkap'
                  : selectedRegencyCode
                    ? '2/3'
                    : selectedProvinceCode
                      ? '1/3'
                      : '0/3'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
        {/* Left Side - Region Selector */}
        <div className="space-y-3 sm:space-y-6">
          {/* Selection Card */}
          <Card className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-gray-700/30 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 sm:p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg">
                    <MapPin className="h-3 w-3 sm:h-5 sm:w-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-xl font-bold text-white">
                      Pilih Wilayah
                    </CardTitle>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 hidden sm:block">
                      Tentukan wilayah monitoring
                    </p>
                  </div>
                </div>

                {/* Progress Indicator - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      selectedProvinceCode ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  />
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      selectedRegencyCode ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  />
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      selectedDistrictCode ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-6">
              {/* Error Display */}
              {errorProvinces && renderError(errorProvinces)}
              {errorRegencies && renderError(errorRegencies)}
              {errorDistricts && renderError(errorDistricts)}

              {/* Selection Fields */}
              <div className="space-y-3 sm:space-y-6">
                {/* Province Selection */}
                <RegionSelectField
                  selectedValue={selectedProvinceCode}
                  onValueChange={handleProvinceChange}
                  placeholder='Provinsi'
                  loading={loadingProvinces}
                  disabled={loadingProvinces}
                  data={provinces}
                  icon={<Globe className="h-3 w-3 text-cyan-400" />}
                  valueKey='province_code'
                  nameKey='province_name'
                  currentDisplayName={displayProvinceName}
                />

                {/* Regency Selection */}
                <RegionSelectField
                  selectedValue={selectedRegencyCode}
                  onValueChange={handleRegencyChange}
                  placeholder='Kabupaten/Kota'
                  loading={loadingRegencies}
                  disabled={!selectedProvinceCode || loadingRegencies}
                  data={regencies}
                  icon={<Building2 className="h-3 w-3 text-cyan-400" />}
                  valueKey='city_code'
                  nameKey='city_name'
                  currentDisplayName={displayRegencyName}
                />

                {/* District Selection */}
                <RegionSelectField
                  selectedValue={selectedDistrictCode}
                  onValueChange={handleDistrictChange}
                  placeholder='Kecamatan'
                  loading={loadingDistricts}
                  disabled={!selectedRegencyCode || loadingDistricts}
                  data={districts}
                  icon={<MapPin className="h-3 w-3 text-cyan-400" />}
                  valueKey='sub_district_code'
                  nameKey='sub_district_name'
                  currentDisplayName={displayDistrictName}
                />
              </div>

              {/* Selection Summary */}
              {isComplete && (
                <div className="mt-3 sm:mt-6 p-2.5 sm:p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5 text-green-400" />
                    <h4 className="text-xs sm:text-sm font-semibold text-green-400">
                      Lokasi Berhasil Dipilih
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Provinsi:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {displayProvinceName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kabupaten/Kota:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {displayRegencyName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kecamatan:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {displayDistrictName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Helper Text - Compact for Mobile */}
              <div className="flex items-start gap-1.5 p-2 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-200">
                  <p className="font-medium mb-1 sm:hidden">Petunjuk:</p>
                  <p className="font-medium mb-1 hidden sm:block">
                    Petunjuk Penggunaan:
                  </p>
                  <div className="text-blue-300 space-y-0.5 sm:space-y-1">
                    <div className="sm:hidden">
                      Pilih provinsi → kabupaten/kota → kecamatan
                    </div>
                    <ul className="hidden sm:block space-y-1">
                      <li>• Pilih provinsi terlebih dahulu</li>
                      <li>• Kemudian pilih kabupaten/kota</li>
                      <li>• Terakhir pilih kecamatan yang diinginkan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Weather Map */}
        <div className="space-y-3 sm:space-y-6">
          <Card className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden h-full min-h-[300px] sm:min-h-[500px] lg:min-h-[600px]">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-gray-700/30 p-3 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg">
                  <Map className="h-3 w-3 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-xl font-bold text-white">
                    Peta Cuaca Wilayah
                  </CardTitle>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5 hidden sm:block">
                    Visualisasi cuaca lokasi yang dipilih
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6 h-full">
              <div className="h-full min-h-[250px] sm:min-h-[400px] lg:min-h-[500px]">
                {selectedLocation &&
                typeof selectedLocation.latitude === 'number' &&
                typeof selectedLocation.longitude === 'number' ? (
                  <WeatherMapIframe
                    selectedLocationCoords={{
                      lat: selectedLocation.latitude,
                      lng: selectedLocation.longitude,
                      name: selectedLocation.districtName,
                    }}
                    currentWeatherData={currentWeatherData}
                    loadingWeather={loadingWeather}
                    weatherError={weatherError}
                    height="100%"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-400">
                    <div>
                      <MapPin className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                      <h3 className="text-lg font-semibold text-white">Pilih Lokasi</h3>
                      <p className="text-sm">Pilih lokasi lengkap untuk melihat peta cuaca.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Action - More Compact */}
      {isComplete && (
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 sm:hidden z-50">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
              <span className="text-xs font-medium text-green-400 truncate">
                Terpilih: {displayDistrictName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}