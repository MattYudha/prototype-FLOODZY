// src/components/map/FloodMap.tsx
'use client';

import React from 'react'; // Add this line

// Impor React-Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L, { Icon, LatLngExpression } from 'leaflet';

// Konfigurasi ikon default Leaflet




// Impor dari file proyek Anda
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  MapPin,
  AlertTriangle,
  Droplets,
  Navigation,
  Mountain, // ICON untuk longsor
  Waves as WavesIcon, // Rename Waves untuk menghindari konflik dengan komponen Waves
  CircleDot, // Icon untuk risiko umum/rendah
  Info, // Icon untuk level info
  XCircle, // Icon untuk level danger/critical
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  FLOOD_RISK_COLORS, // Menggunakan konstanta ini untuk warna
  FLOOD_ZONES_MOCK,
  WEATHER_MOCK_DATA,
} from '@/lib/constants';
import { FloodZone, WeatherData, FloodAlert, MapBounds } from '@/types'; // Import FloodAlert
import { SelectedLocation } from '@/types/location';

import { cn } from '@/lib/utils';
import { OverpassElement } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getCoordsByLocationName,
  getLocationNameByCoords,
} from '@/lib/geocodingService';
import { GeocodingResponse } from '@/types/geocoding';

// Custom marker icons
const createCustomIcon = (color: string, iconHtml: string) => {
  // Ganti icon menjadi iconHtml
  const svgString = `
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="12" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="12.5" y="17" text-anchor="middle" fill="white" font-size="12">${iconHtml}</text>
    </svg>
  `;

  const encodedSvg = btoa(unescape(encodeURIComponent(svgString)));

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });
};

const floodIcon = createCustomIcon(FLOOD_RISK_COLORS.high, '🌊');
const weatherIcon = createCustomIcon('#3B82F6', '☀️');

// Komponen Helper untuk mengupdate view peta
interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
}
function MapUpdater({ center, zoom }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    const isCenterChanged =
      currentCenter.lat !== center[0] || currentCenter.lng !== center[1];
    const isZoomChanged = currentZoom !== zoom;

    if (isCenterChanged || isZoomChanged) {
      map.setView(center, zoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Map reset component (tetap sama)
function MapReset({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();

  const resetView = () => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.5,
    });
  };

  return (
    <Button
      variant="glass"
      size="icon"
      onClick={resetView}
      className="absolute top-20 right-4 z-[1000]"
    >
      <RotateCcw size={16} />
    </Button>
  );
}

interface MapEventsProps {
  onLocationSelect: (latlng: LatLngExpression) => void;
  onReverseGeocode: (latlng: LatLngExpression, locationName: GeocodingResponse) => void;
}

function MapEvents({ onLocationSelect, onReverseGeocode }: MapEventsProps) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(e.latlng);
      const locationName = await getLocationNameByCoords(lat, lng);
      if (locationName) {
        onReverseGeocode(e.latlng, locationName);
      }
    },
  });
  return null;
}

interface MapBoundsUpdaterProps {
  onMapBoundsChange?: (bounds: MapBounds) => void;
  selectedLocation?: SelectedLocation; // Add this prop
}

function MapBoundsUpdater({ onMapBoundsChange }: MapBoundsUpdaterProps) {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      if (onMapBoundsChange) {
        const bounds = map.getBounds();
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMapBoundsChange({
          center: [center.lat, center.lng],
          zoom: zoom,
          bounds: [[bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]],
        });
      }
    },
  });
  return null;
}

interface FloodMapProps {
  className?: string;
  height?: string;
  onLocationSelect?: (location: LatLngExpression) => void;
  center?: [number, number];
  zoom?: number;
  floodProneData?: OverpassElement[];
  loadingFloodData?: boolean;
  floodDataError?: string | null;
  realtimeFloodAlerts?: FloodAlert[]; // Properti baru untuk peringatan real-time
  loadingRealtimeAlerts?: boolean; // Properti baru untuk status loading
  realtimeAlertsError?: string | null; // Properti baru untuk error
  weatherLayers?: { [key: string]: boolean };
  apiKey?: string;
  onMapBoundsChange?: (bounds: MapBounds) => void;
  selectedLocation?: SelectedLocation;

}

export const FloodMap = React.memo(function FloodMap({
  className,
  height,
  onLocationSelect,
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  floodProneData = [],
  loadingFloodData = false,
  floodDataError = null,
  realtimeFloodAlerts = [], // Inisialisasi
  loadingRealtimeAlerts = false, // Inisialisasi
  realtimeAlertsError = null, // Inisialisasi
  weatherLayers = {}, // Inisialisasi
  apiKey, // Inisialisasi
  onMapBoundsChange, // Add this line
  selectedLocation, // Add this prop
}: FloodMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('street');
  const [showFloodZones, setShowFloodZones] = useState(true); // Untuk mock data FLOOD_ZONES_MOCK
  const [showWeatherStations, setShowWeatherStations] = useState(true);
  const [showRealtimeAlerts, setShowRealtimeAlerts] = useState(true); // State baru untuk toggle peringatan real-time
  const [floodZones] = useState<FloodZone[]>(FLOOD_ZONES_MOCK); // Mock data asli
  const [weatherData] = useState<WeatherData>(WEATHER_MOCK_DATA);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
      iconUrl: '/leaflet/images/marker-icon.png',
      shadowUrl: '/leaflet/images/marker-shadow.png',
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] =
    useState<GeocodingResponse | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{
    latlng: LatLngExpression;
    name: string;
  } | null>(null);

  const handleSearch = async () => {
    if (searchQuery.trim() !== '') {
      const result = await getCoordsByLocationName(searchQuery);
      if (result) {
        setSearchedLocation(result);
        const map = mapRef.current;
        if (map) {
          map.setView([result.lat, result.lon], 13);
        }
      }
    }
  };

  const handleMapClick = (latlng: LatLngExpression, locationName: GeocodingResponse) => {
    setClickedLocation({
      latlng,
      name: locationName?.name || 'Lokasi tidak diketahui',
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getPolygonColor = (riskLevel: FloodZone['riskLevel']) => {
    return FLOOD_RISK_COLORS[riskLevel];
  };

  // Fungsi helper untuk mendapatkan warna dan judul popup berdasarkan tags elemen Overpass
  // Fungsi ini sekarang mengembalikan objek info bencana yang lebih spesifik
  const getDisasterInfo = (element: OverpassElement) => {
    let iconToUse;
    let color;
    let cardTitle;
    let cardTitleColor;
    let riskLabel = 'Tidak Dikategorikan'; // Label risiko di Legenda
    const detailText =
      element.tags.name ||
      element.tags.description ||
      element.tags.note ||
      `ID: ${element.id}`;

    // === LOGIKA PEMETAAN RISIKO DARI TAGS OVERPASS (PRIORITAS TINGGI KE RENDAH) ===

    // Prioritas 1: Risiko Kritis
    if (
      element.tags.flood_prone === 'critical' ||
      element.tags.hazard === 'critical_flood' ||
      element.tags.disaster_type === 'extreme_flood'
    ) {
      iconToUse = createCustomIcon(FLOOD_RISK_COLORS.critical, '💀'); // Cokelat gelap (sesuai constants.ts)
      color = FLOOD_RISK_COLORS.critical; // Cokelat gelap (sesuai constants.ts)
      cardTitle = 'Risiko Kritis (Bencana Ekstrim)';
      cardTitleColor = 'text-red-800';
      riskLabel = 'Risiko Kritis';
    }
    // Prioritas 2: Risiko Tinggi (Banjir Konkret) - MERAH
    else if (
      element.tags.hazard === 'flood' ||
      element.tags.flood_prone === 'yes' ||
      (element.tags.waterway === 'river' &&
        element.tags.seasonal === 'yes' &&
        element.tags.flood_risk === 'high')
    ) {
      // Tambahan tag river, seasonal, flood_risk
      iconToUse = createCustomIcon(FLOOD_RISK_COLORS.high, '🚨'); // Merah (sesuai constants.ts)
      color = FLOOD_RISK_COLORS.high; // Merah (sesuai constants.ts)
      cardTitle = 'Risiko Tinggi Banjir';
      cardTitleColor = 'text-red-500';
      riskLabel = 'Risiko Tinggi';
    }
    // Prioritas 3: Risiko Sedang (Longsor atau Area Rawan Lain) - KUNING
    else if (
      element.tags.natural === 'landslide' ||
      element.tags.hazard === 'landslide' ||
      element.tags.natural === 'mudflow' ||
      element.tags.landuse === 'landslide_prone'
    ) {
      // Tambahan mudflow, landslide_prone
      iconToUse = createCustomIcon('#FFFF00', '⛰️'); // KUNING (explicit hex code)
      color = '#FFFF00'; // KUNING (explicit hex code)
      cardTitle = 'Risiko Sedang Longsor';
      cardTitleColor = 'text-yellow-500';
      riskLabel = 'Risiko Sedang';
    }
    // Prioritas 4: Risiko Rendah (Fitur Air Umum yang Berpotensi) - HIJAU
    // Hanya dirender jika tidak ada tag risiko yang lebih tinggi, dan tetap dengan warna hijau
    else if (
      element.tags.waterway ||
      element.tags.natural === 'water' ||
      element.tags.man_made === 'dyke' ||
      element.tags.landuse === 'basin' ||
      element.tags.natural === 'wetland'
    ) {
      iconToUse = createCustomIcon(FLOOD_RISK_COLORS.low, '💧'); // HIJAU (sesuai constants.ts)
      color = FLOOD_RISK_COLORS.low; // HIJAU (sesuai constants.ts)
      cardTitle = 'Risiko Rendah (Fitur Air)';
      cardTitleColor = 'text-green-500';
      riskLabel = 'Risiko Rendah';
    }
    // Jika tidak ada tag bencana spesifik yang terdeteksi di atas, fungsi akan mengembalikan null
    else {
      return null; // Mengembalikan null agar elemen ini tidak dirender
    }

    return {
      iconToUse,
      color,
      cardTitle,
      cardTitleColor,
      detailText,
      riskLabel,
    };
  };

  // FUNGSI HELPER BARU: untuk mendapatkan info visual dari FloodAlert
  const getAlertInfo = (alert: FloodAlert) => {
    let iconToUse;
    let color;
    let cardTitle;
    let cardTitleColor;
    let badgeVariant: 'info' | 'warning' | 'danger' | 'success' = 'info';

    switch (alert.level) {
      case 'critical':
        iconToUse = createCustomIcon(FLOOD_RISK_COLORS.critical, '💀');
        color = FLOOD_RISK_COLORS.critical;
        cardTitle = 'Peringatan KRITIS!';
        cardTitleColor = 'text-red-800';
        badgeVariant = 'danger';
        break;
      case 'danger':
        iconToUse = createCustomIcon(FLOOD_RISK_COLORS.high, '🚨');
        color = FLOOD_RISK_COLORS.high;
        cardTitle = 'Peringatan BAHAYA!';
        cardTitleColor = 'text-red-500';
        badgeVariant = 'danger';
        break;
      case 'warning':
        iconToUse = createCustomIcon(FLOOD_RISK_COLORS.medium, '⚠️');
        color = FLOOD_RISK_COLORS.medium;
        cardTitle = 'Peringatan!';
        cardTitleColor = 'text-yellow-500';
        badgeVariant = 'warning';
        break;
      case 'info':
      default:
        iconToUse = createCustomIcon(FLOOD_RISK_COLORS.low, 'ℹ️');
        color = FLOOD_RISK_COLORS.low;
        cardTitle = 'Informasi';
        cardTitleColor = 'text-blue-500';
        badgeVariant = 'info';
        break;
    }

    return {
      iconToUse,
      color,
      cardTitle,
      cardTitleColor,
      badgeVariant,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative rounded-lg overflow-hidden shadow-lg',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className,
      )}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xs sm:max-w-sm md:max-w-md px-4">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Cari nama kota atau wilayah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full pl-10 pr-20 py-2 rounded-full bg-slate-900/80 border-slate-700/50 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-lg backdrop-blur-md transition-colors duration-300"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 h-8 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
          >
            Cari
          </Button>
        </div>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef as any}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} zoom={zoom} />
        <MapReset center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} />
        <MapEvents
          onLocationSelect={() => {}}
          onReverseGeocode={handleMapClick}
        />
        {onMapBoundsChange && <MapBoundsUpdater onMapBoundsChange={onMapBoundsChange} />}

        {Object.entries(weatherLayers).map(
          ([key, value]) =>
            value &&
            apiKey && (
              <TileLayer
                key={key}
                url={`https://tile.openweathermap.org/map/${key}_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                opacity={0.7}
              />
            ),
        )}

        {searchedLocation && (
          <Marker position={[searchedLocation.lat, searchedLocation.lon]}>
            <Popup>{searchedLocation.name}</Popup>
          </Marker>
        )}

        {clickedLocation && (
          <Marker position={clickedLocation.latlng}>
            <Popup>{clickedLocation.name}</Popup>
          </Marker>
        )}

        {/* Marker di lokasi yang dipilih (dari RegionDropdown) */}
        {selectedLocation?.latitude != null && selectedLocation?.longitude != null ? (
          <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} icon={floodIcon}>
            <Popup>
              Lokasi Terpilih: {selectedLocation.districtName || 'Tidak Diketahui'} <br /> Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{' '}
              {selectedLocation.longitude.toFixed(6)}
            </Popup>
          </Marker>
        ) : null}

        {/* Flood Zones (menggunakan mock data yang sudah ada) */}
        {/* Ini tetap ada sebagai layer terpisah, bisa di toggle jika perlu */}
        {showFloodZones &&
          floodZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: getPolygonColor(zone.riskLevel),
                fillColor: getPolygonColor(zone.riskLevel),
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <Card className="min-w-[200px] p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{zone.name}</h3>
                      <Badge
                        variant={
                          zone.riskLevel === 'high'
                            ? 'danger'
                            : zone.riskLevel === 'medium'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {zone.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span>Luas: {zone.area} km²</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span>
                          Populasi: {zone.population.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {zone.description}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
                      <Button size="sm" variant="secondary">
                        Rute Evakuasi
                      </Button>
                    </div>
                  </div>
                </Card>
              </Popup>
            </Polygon>
          ))}

        {/* Weather Stations (menggunakan mock data) */}
        {showWeatherStations && (
          <Marker position={[-6.2, 106.816]} icon={weatherIcon}>
            <Popup>
              <Card className="min-w-[250px] p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Stasiun Cuaca Jakarta</h3>
                    <Badge variant="info">Aktif</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Suhu</p>
                      <p className="font-medium">
                        {weatherData.temperature !== undefined
                          ? `${weatherData.temperature}°C`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Kelembaban</p>
                      <p className="font-medium">
                        {weatherData.humidity !== undefined
                          ? `${weatherData.humidity}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Angin</p>
                      <p className="font-medium">
                        {weatherData.windSpeed !== undefined
                          ? `${weatherData.windSpeed} km/h`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Tekanan</p>
                      <p className="font-medium">
                        {weatherData.pressure !== undefined
                          ? `${weatherData.pressure} hPa`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                    <Droplets size={16} className="text-secondary" />
                    <span className="text-sm">
                      {weatherData.description || 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            </Popup>
          </Marker>
        )}

        {/* === MENAMPILKAN DATA RAWAN BANJIR/BENCANA DARI OVERPASS API === */}
        {loadingFloodData && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-gray-800/70 p-4 rounded-lg text-white text-sm">
            Memuat data rawan bencana...
            <LoadingSpinner className="ml-2 inline-block" />
          </div>
        )}
        {floodDataError && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-red-800/70 p-4 rounded-lg text-white text-sm">
            Error memuat data bencana: {floodDataError}
          </div>
        )}
        {!loadingFloodData &&
          !floodDataError &&
          floodProneData.length > 0 &&
          showFloodZones &&
          floodProneData.map((element) => {
            const disasterInfo = getDisasterInfo(element); // Panggil fungsi

            // HANYA RENDER JIKA FUNGSI MENGEMBALIKAN OBJEK (bukan null)
            if (!disasterInfo) {
              return null; // Tidak merender jika kategori tidak spesifik
            }

            const { iconToUse, color, cardTitle, cardTitleColor, detailText } =
              disasterInfo;

            // RENDER POLYGON UNTUK ELEMENT DENGAN GEOMETRI (WAY/RELATION)
            if (element.geometry && element.geometry.length > 0) {
              const positions = element.geometry.map(
                (coord) => [coord.lat, coord.lon] as LatLngExpression,
              );

              return (
                <Polygon
                  key={`overpass-poly-${element.id}`}
                  positions={positions}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.3, // Lebih transparan untuk area
                    weight: 2,
                  }}
                >
                  <Popup>
                    <Card className="min-w-[200px] p-3">
                      <h4 className={`font-semibold ${cardTitleColor}`}>
                        {cardTitle}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ID OSM: {element.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tipe OSM: {element.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Detail: {detailText}
                      </p>
                      {Object.keys(element.tags).length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          <strong>Tags:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(element.tags).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {key}: {value}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  </Popup>
                </Polygon>
              );
            }
            // RENDER MARKER UNTUK NODE
            else if (element.type === 'node' && element.lat && element.lon) {
              return (
                <Marker
                  key={`overpass-node-${element.id}`}
                  position={[element.lat, element.lon]}
                  icon={iconToUse}
                >
                  <Popup>
                    <Card className="min-w-[180px] p-3">
                      <h4 className={`font-semibold ${cardTitleColor}`}>
                        {cardTitle}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Detail: {detailText}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tipe OSM: {element.type}
                      </p>
                      {Object.keys(element.tags).length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          <strong>Tags:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(element.tags).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {key}: {value}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}

        {/* === MENAMPILKAN DATA PERINGATAN BANJIR REAL-TIME === */}
        {loadingRealtimeAlerts && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-gray-800/70 p-4 rounded-lg text-white text-sm">
            Memuat peringatan banjir...
            <LoadingSpinner className="ml-2 inline-block" />
          </div>
        )}
        {realtimeAlertsError && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-red-800/70 p-4 rounded-lg text-white text-sm">
            Error memuat peringatan banjir: {realtimeAlertsError}
          </div>
        )}
        {!loadingRealtimeAlerts &&
          !realtimeAlertsError &&
          realtimeFloodAlerts.length > 0 &&
          showRealtimeAlerts &&
          realtimeFloodAlerts.map((alert) => {
            const {
              iconToUse,
              color,
              cardTitle,
              cardTitleColor,
              badgeVariant,
            } = getAlertInfo(alert);

            // Render Polygon jika ada polygonCoordinates
            if (
              alert.polygonCoordinates &&
              alert.polygonCoordinates.length > 0
            ) {
              // Flattern array jika nested ([[lat,lng],[lat,lng]]) -> [[lat,lng],[lat,lng]]
              const flatCoordinates = alert.polygonCoordinates
                .flat()
                .map((coords) => [coords[0], coords[1]] as LatLngExpression);

              return (
                <Polygon
                  key={`alert-poly-${alert.id}`}
                  positions={flatCoordinates}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <Card className="min-w-[200px] p-3">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${cardTitleColor}`}>
                          {cardTitle}
                        </h4>
                        <Badge variant={badgeVariant}>
                          {alert.level.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">
                        {alert.title || 'Tidak ada judul'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.message || 'Tidak ada deskripsi'}
                      </p>
                      {alert.affectedAreas &&
                        alert.affectedAreas.length > 0 && (
                          <div className="mt-2 text-xs text-gray-400">
                            <strong>Wilayah Terdampak:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {alert.affectedAreas.map((area, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      {alert.actions && alert.actions.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          <strong>Tindakan Disarankan:</strong>
                          <ul className="list-disc list-inside ml-2">
                            {alert.actions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Pembaruan terakhir:{' '}
                        {alert.timestamp
                          ? new Date(alert.timestamp).toLocaleString()
                          : 'N/A'}
                      </p>
                    </Card>
                  </Popup>
                </Polygon>
              );
            }
            // Render Marker jika ada coordinates (dan tidak ada polygon)
            else if (alert.coordinates) {
              return (
                <Marker
                  key={`alert-marker-${alert.id}`}
                  position={alert.coordinates}
                  icon={iconToUse}
                >
                  <Popup>
                    <Card className="min-w-[180px] p-3">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${cardTitleColor}`}>
                          {cardTitle}
                        </h4>
                        <Badge variant={badgeVariant}>
                          {alert.level.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">
                        {alert.title || 'Tidak ada judul'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.message || 'Tidak ada deskripsi'}
                      </p>
                      {alert.affectedAreas &&
                        alert.affectedAreas.length > 0 && (
                          <div className="mt-2 text-xs text-gray-400">
                            <strong>Wilayah Terdampak:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {alert.affectedAreas.map((area, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Pembaruan terakhir:{' '}
                        {alert.timestamp
                          ? new Date(alert.timestamp).toLocaleString()
                          : 'N/A'}
                      </p>
                    </Card>
                  </Popup>
                </Marker>
              );
            }
            return null; // Jangan render jika tidak ada data geografis
          })}
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        onFullscreenToggle={toggleFullscreen}
        isFullscreen={isFullscreen}
        onLayerChange={setSelectedLayer}
        selectedLayer={selectedLayer}
        onFloodZonesToggle={() => setShowFloodZones(!showFloodZones)}
        showFloodZones={showFloodZones}
        onWeatherToggle={() => setShowWeatherStations(!showWeatherStations)}
        showWeatherStations={showWeatherStations}
        onRealtimeAlertsToggle={() =>
          setShowRealtimeAlerts(!showRealtimeAlerts)
        } // Properti baru
        showRealtimeAlerts={showRealtimeAlerts} // Properti baru
      />

      {/* Map Legend */}
      <MapLegend />

      {/* Fullscreen Toggle */}
      <Button
        variant="glass"
        size="icon"
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000]"
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </Button>
    </motion.div>
  );
});
