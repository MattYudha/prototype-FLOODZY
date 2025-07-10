// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { FloodAlertList } from '@/components/flood/FloodAlert';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  Bell,
  TrendingUp,
  Users,
  Shield,
  Activity,
  ArrowRight,
  AlertTriangle,
  CloudRain,
  Waves,
  Globe,
  Map // Pastikan Map dari lucide-react diimpor
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  WEATHER_MOCK_DATA,
  FLOOD_MOCK_ALERTS,
  DASHBOARD_STATS_MOCK
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import { useRegionData } from '@/hooks/useRegionData'; // Diperlukan untuk allDistricts

// Definisikan tipe untuk lokasi yang dipilih, kini sampai tingkat kecamatan dengan koordinat
interface SelectedLocationDetails {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationDetails | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Untuk menampilkan nama kecamatan di "Peta Siap Dimuat" jika belum ada selectedLocation
  const { data: allDistricts } = useRegionData({ type: 'districts', enabled: true });

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Handler saat RegionDropdown memilih kecamatan
  const handleRegionSelect = (
    districtCode: string,
    districtName: string,
    regencyCode: string,
    provinceCode: string,
    latitude?: number,
    longitude?: number,
    geometry?: string
  ) => {
    const newLocation: SelectedLocationDetails = {
      districtCode,
      districtName,
      regencyCode,
      provinceCode,
      latitude,
      longitude,
      geometry
    };
    setSelectedLocation(newLocation);
    // Log ini tetap penting untuk memastikan data masuk dengan benar
    console.log('DEBUG page.tsx: Lokasi Terpilih (newLocation dari dropdown):', newLocation);
  };

  // Fungsi getMapUrl (dipindahkan dari RegionDropdown ke sini dan diperbaiki)
  const getMapUrl = () => {
    if (selectedLocation?.latitude != null && selectedLocation?.longitude != null) {
      const lat = selectedLocation.latitude;
      const lng = selectedLocation.longitude;
      const zoom = 12; // Zoom level saat lokasi dipilih

      // HTML untuk peta dengan lokasi spesifik
      // Perbaikan: Style langsung di div id="map" untuk memastikan dimensi Leaflet
      //           Tambahkan display: block;
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
            #map { height: 100% !important; width: 100% !important; display: block; } /* Pastikan height/width 100% dan display:block */
            .leaflet-container { background: #1f2937; } /* Tambahkan background agar tidak transparan */
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
          <div id="map" style="height: 100%; width: 100%;"></div> <script>
            console.log('Leaflet script starting in iframe');
            // Pastikan map id ada sebelum init
            if (document.getElementById('map')) {
              var map = L.map('map').setView([${lat}, ${lng}], ${zoom});
              console.log('Leaflet map initialized'); // Log setelah inisialisasi

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

              // Invalidate size untuk memastikan peta dimuat dengan benar
              setTimeout(() => { map.invalidateSize(); console.log('map.invalidateSize() called (200ms)'); }, 200);
              setTimeout(() => { map.invalidateSize(); console.log('map.invalidateSize() called (1000ms)'); }, 1000); // Panggil lagi untuk robustness
            } else {
              console.error('Div with ID "map" not found in iframe!');
            }
            console.log('Leaflet script finished in iframe');
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
            #map { height: 100%; width: 100%; } /* Ini penting */
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
          <div id="map" style="height: 100%; width: 100%;"></div> <div class="welcome-info">
            <h3>🗺️ Peta Indonesia</h3>
            <p>Pilih wilayah di sebelah kiri untuk<br>menampilkan lokasi di peta</p>
          </div>
          <script>
            console.log('Leaflet script starting in default iframe');
            if (document.getElementById('map')) {
              var map = L.map('map').setView([-2.5, 118], 5); // Default view untuk seluruh Indonesia

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
              }).addTo(map);

              setTimeout(() => { map.invalidateSize(); console.log('map.invalidateSize() called in default iframe'); }, 200);
              setTimeout(() => { map.invalidateSize(); console.log('map.invalidateSize() called again in default iframe after 1s'); }, 1000);
            } else {
              console.error('Div with ID "map" not found in default iframe!');
            }
            console.log('Leaflet script finished in default iframe');
          </script>
        </body>
        </html>
      `;
    }
  };

  const heroCards = [/* ... tidak berubah ... */];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={cn(
        'transition-all duration-300 ease-in-out',
        isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
      )}>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-secondary text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-8 w-8" />
                <h1 className="text-4xl md:text-6xl font-bold">
                  Flood<span className="text-secondary">zie</span>
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                Sistem Deteksi Banjir & Monitoring Cuaca Real-time untuk Indonesia
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button size="lg" variant="secondary" className="text-primary">
                  <MapPin className="mr-2 h-5 w-5" />
                  Lihat Peta Banjir
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  <Bell className="mr-2 h-5 w-5" />
                  Peringatan Terkini
                </Button>
              </div>
            </motion.div>

            {/* Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {heroCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="glass text-white border-white/20 hover:bg-white/10 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn('p-2 rounded-lg', card.bgColor)}>
                          <card.icon className={cn('h-6 w-6', card.color)} />
                        </div>
                        <Badge variant="glass" className="text-white">
                          {card.count}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                      <p className="text-sm text-white/80">{card.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-16 h-16 bg-secondary/20 rounded-full"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/10 rounded-full"
              animate={{
                y: [0, -10, 0],
                x: [0, 10, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        </section>

        {/* Region Selector Section */}
        <section className="container mx-auto px-4 py-8 space-y-4">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-aqua-400">
                <Globe className="h-5 w-5" />
                <span>Pilih Lokasi Wilayah Anda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegionDropdown onSelectDistrict={handleRegionSelect} />
            </CardContent>
          </Card>
        </section>


        {/* Main Dashboard */}
        <section className="container mx-auto px-4 py-8 space-y-8">
          {/* Dashboard Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardStats stats={DASHBOARD_STATS_MOCK} />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flood Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Peta Banjir - {selectedLocation?.districtName || selectedLocation?.regencyCode || selectedLocation?.provinceCode || 'Indonesia'}</span>
                    <Badge variant="success" className="ml-auto">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    // Memberikan tinggi eksplisit yang pasti untuk container iframe
                    style={{ height: '600px', width: '100%' }} // Atur tinggi sesuai kebutuhan
                    className="w-full rounded-lg border border-gray-700/30 relative overflow-hidden"
                  >
                    {/* Mengganti placeholder dengan iframe map */}
                    <iframe
                      src={getMapUrl()}
                      className="w-full h-full border-0 rounded-lg"
                      title="Peta Wilayah"
                      loading="lazy"
                    />
                    {selectedLocation && ( // Tampilkan info lokasi di atas peta
                      <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                        <div className="text-xs text-gray-300">
                          <div className="font-medium text-white mb-1">
                            📍 {selectedLocation.districtName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">Lat:</span>{" "}
                              {selectedLocation.latitude?.toFixed(6) || "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-400">Lng:</span>{" "}
                              {selectedLocation.longitude?.toFixed(6) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weather & Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-6"
            >
              {/* Weather Display */}
              <WeatherDisplay data={WEATHER_MOCK_DATA} />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-secondary" />
                    <span>Aksi Cepat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Lapor Banjir</span>
                    </Button>
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Evakuasi</span>
                    </Button>
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <CloudRain className="h-4 w-4" />
                      <span className="text-xs">Cuaca</span>
                    </Button>
                    <Button variant="outline" className="h-12 flex-col space-y-1">
                      <Waves className="h-4 w-4" />
                      <span className="text-xs">Sensor</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Flood Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <span>Peringatan Banjir Terkini</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <span>Lihat Semua</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FloodAlertList alerts={FLOOD_MOCK_ALERTS} />
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  );
}