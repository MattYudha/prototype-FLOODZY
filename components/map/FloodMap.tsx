// src/components/map/FloodMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap, // Pastikan useMap diimpor
} from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import {
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  MapPin,
  AlertTriangle,
  Droplets,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  FLOOD_RISK_COLORS,
  FLOOD_ZONES_MOCK,
  WEATHER_MOCK_DATA,
} from "@/lib/constants";
import { FloodZone, WeatherData } from "@/types";
import { cn } from "@/lib/utils";

// Custom marker icons
const createCustomIcon = (color: string, icon: string) => {
  const svgString = `
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="12" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="12.5" y="17" text-anchor="middle" fill="white" font-size="12">${icon}</text>
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

const floodIcon = createCustomIcon(FLOOD_RISK_COLORS.high, "🌊");
const weatherIcon = createCustomIcon("#3B82F6", "☀️");

// Komponen Helper untuk mengupdate view peta
interface MapUpdaterProps {
  center: LatLngExpression; // center bisa berupa [number, number] atau LatLngExpression
  zoom: number;
}
function MapUpdater({ center, zoom }: MapUpdaterProps) {
  const map = useMap(); // Hook untuk mengakses instance peta

  useEffect(() => {
    // Pastikan koordinat valid dan berbeda dari default sebelum mengupdate
    // Asumsi [0,0] atau DEFAULT_MAP_CENTER bukan lokasi valid untuk setView jika belum dipilih
    if (center[0] !== 0 || center[1] !== 0) {
      // Cek apakah koordinat bukan [0,0]
      map.setView(center, zoom);
    }
  }, [center, zoom, map]); // Dependencies untuk useEffect
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
    map.setView(center, zoom);
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

interface FloodMapProps {
  className?: string;
  height?: string;
  onLocationSelect?: (location: LatLngExpression) => void;
  // Menambahkan props center dan zoom untuk mengontrol peta
  center?: [number, number]; // Latitude dan Longitude untuk pusat peta
  zoom?: number; // Zoom level peta
}

export function FloodMap({
  className,
  height = "600px",
  onLocationSelect,
  // Menggunakan default value dari DEFAULT_MAP_CENTER jika tidak diberikan
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
}: FloodMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("street");
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showWeatherStations, setShowWeatherStations] = useState(true);
  const [floodZones] = useState<FloodZone[]>(FLOOD_ZONES_MOCK);
  const [weatherData] = useState<WeatherData>(WEATHER_MOCK_DATA);
  const mapRef = useRef<L.Map | null>(null); // Gunakan mapRef jika perlu akses langsung instance Leaflet

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getPolygonColor = (riskLevel: FloodZone["riskLevel"]) => {
    return FLOOD_RISK_COLORS[riskLevel];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-lg overflow-hidden shadow-lg",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      <MapContainer
        // Menggunakan props center dan zoom untuk nilai awal
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef as any} // Menambahkan 'as any' untuk menghindari error type jika ref dipakai secara langsung
        zoomControl={false} // Kontrol zoom default Leaflet disembunyikan
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* MapUpdater akan memusatkan ulang peta saat props center/zoom berubah */}
        <MapUpdater center={center} zoom={zoom} />

        {/* Tombol Reset Map (akan mereset ke DEFAULT_MAP_CENTER) */}
        <MapReset center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} />

        {/* Marker di lokasi yang dipilih (jika koordinat valid) */}
        {center[0] !== 0 &&
          center[1] !== 0 && ( // Tampilkan marker hanya jika koordinat bukan [0,0]
            <Marker position={center} icon={floodIcon}>
              {" "}
              {/* Gunakan floodIcon atau custom icon lain */}
              <Popup>
                Lokasi Terpilih. <br /> Anda bisa menambahkan detail wilayah di
                sini.
              </Popup>
            </Marker>
          )}

        {/* Flood Zones (menggunakan mock data) */}
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
                          zone.riskLevel === "high"
                            ? "danger"
                            : zone.riskLevel === "medium"
                            ? "warning"
                            : "success"
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
                      <p className="font-medium">{weatherData.temperature}°C</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Kelembaban</p>
                      <p className="font-medium">{weatherData.humidity}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Angin</p>
                      <p className="font-medium">
                        {weatherData.windSpeed} km/h
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Tekanan</p>
                      <p className="font-medium">{weatherData.pressure} hPa</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                    <Droplets size={16} className="text-secondary" />
                    <span className="text-sm">{weatherData.description}</span>
                  </div>
                </div>
              </Card>
            </Popup>
          </Marker>
        )}
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
}
