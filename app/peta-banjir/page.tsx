'use client';
import React, { useState } from 'react';
// 1. Impor motion dan AnimatePresence dari framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Bell,
  Search,
  Loader2,
  ChevronLeft,
  Eye,
  EyeOff,
  Layers,
  Waves,
  Wrench,
  CloudRain,
  Zap,
  Settings,
  Maximize2,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle,
  Activity,
  Droplets,
  Wind,
  Thermometer,
} from 'lucide-react';

// 2. Varian animasi (tidak ada perubahan)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const FloodMapInterface = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [activeLayer, setActiveLayer] = useState('street');
  const [isLoading, setIsLoading] = useState(false);

  const [layers, setLayers] = useState({
    floodZones: true,
    waterLevel: true,
    pumpStatus: true,
    reports: true,
    weather: false,
    sensors: true,
  });

  const toggleLayer = (layerName) => {
    setLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  const mockData = {
    alerts: [
      {
        id: 1,
        type: 'warning',
        location: 'Kemang',
        message: 'Peringatan banjir sedang',
        time: '2 menit lalu',
      },
      {
        id: 2,
        type: 'critical',
        location: 'Kelapa Gading',
        message: 'Banjir tinggi terdeteksi',
        time: '5 menit lalu',
      },
      {
        id: 3,
        type: 'warning',
        location: 'Ciledug',
        message: 'Ketinggian air naik',
        time: '15 menit lalu',
      },
    ],
    sensors: { active: 89, total: 100, offline: 11 },
    weather: { temp: 29, humidity: 80, wind: 4, pressure: 1015 },
  };

  const layerControls = [
    {
      key: 'floodZones',
      label: 'Zona Rawan Banjir',
      icon: MapPin,
      color: 'text-red-400',
    },
    {
      key: 'waterLevel',
      label: 'Pos Duga Air',
      icon: Waves,
      color: 'text-blue-400',
    },
    {
      key: 'pumpStatus',
      label: 'Status Pompa',
      icon: Wrench,
      color: 'text-green-400',
    },
    {
      key: 'reports',
      label: 'Laporan Warga',
      icon: Bell,
      color: 'text-yellow-400',
    },
    {
      key: 'weather',
      label: 'Cuaca Real-time',
      icon: CloudRain,
      color: 'text-purple-400',
    },
    {
      key: 'sensors',
      label: 'Sensor Network',
      icon: Activity,
      color: 'text-cyan-400',
    },
  ];

  const baseMapLayers = [
    { key: 'street', label: 'Street Map', icon: Layers },
    { key: 'satellite', label: 'Satellite', icon: Layers },
    { key: 'hybrid', label: 'Hybrid', icon: Layers },
    { key: 'terrain', label: 'Terrain', icon: Layers },
  ];

  return (
    // ### PERBAIKAN 1: Mengubah `overflow-hidden` menjadi `overflow-y-auto` pada kontainer utama ###
    // Ini adalah fallback jika tinggi konten melebihi tinggi layar (berguna untuk layar kecil)
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"
      ></motion.div>

      {/* Header (tidak ada perubahan) */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 50, delay: 0.1 }}
        className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors duration-300 border border-slate-700/50"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Peta Banjir Interaktif
                </h1>
                <p className="text-slate-400 text-sm">
                  Real-time flood monitoring & visualization
                </p>
              </div>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center space-x-4"
            >
              <motion.div
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700/50"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Live</span>
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700/50"
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white font-medium">
                    {mockData.sensors.active}
                  </span>
                  <span className="text-xs text-slate-400">sensors</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Kontainer grid utama tetap menggunakan tinggi viewport */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* ### PERBAIKAN 2: Membuat Kolom Kiri dapat di-scroll ### */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            // Tambahkan `overflow-y-auto` agar konten di dalamnya bisa di-scroll jika melebihi tinggi kolom.
            // `pr-2` memberi sedikit ruang untuk scrollbar.
            className="col-span-3 space-y-6 overflow-y-auto pr-2"
          >
            {/* Semua Card di dalam kolom ini akan ikut ter-scroll */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari lokasi..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Jakarta', 'Bekasi', 'Tangerang', 'Depok'].map((city) => (
                    <motion.button
                      key={city}
                      whileHover={{ y: -2 }}
                      className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm transition-colors duration-300 border border-slate-600/30"
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              layout
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>Map Layers</span>
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors duration-300"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showFilters ? 'eye-off' : 'eye'}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                    >
                      {showFilters ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="space-y-6 overflow-hidden"
                  >
                    {/* Konten filter (tidak diubah) */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        Base Map
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {baseMapLayers.map((layer) => (
                          <motion.button
                            key={layer.key}
                            onClick={() => setActiveLayer(layer.key)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 rounded-xl border transition-all duration-300 ${
                              activeLayer === layer.key
                                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400'
                                : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/50'
                            }`}
                          >
                            <layer.icon className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-xs">{layer.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        Data Overlays
                      </h4>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-2"
                      >
                        {layerControls.map((layer) => (
                          <motion.div
                            key={layer.key}
                            variants={itemVariants}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-600/40 transition-colors duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <layer.icon
                                className={`w-4 h-4 ${layer.color}`}
                              />
                              <span className="text-sm text-slate-200">
                                {layer.label}
                              </span>
                            </div>
                            <motion.button
                              layout
                              onClick={() => toggleLayer(layer.key)}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                                layers[layer.key]
                                  ? 'bg-cyan-500'
                                  : 'bg-slate-600'
                              }`}
                            >
                              <motion.div
                                layout
                                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full"
                                transition={{
                                  type: 'spring',
                                  stiffness: 700,
                                  damping: 30,
                                }}
                                style={{ x: layers[layer.key] ? 20 : 0 }}
                              ></motion.div>
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                <CloudRain className="w-5 h-5 text-blue-400" />
                <span>Weather</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-slate-300">Temperature</span>
                  </div>
                  <span className="text-white font-medium">
                    {mockData.weather.temp}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Humidity</span>
                  </div>
                  <span className="text-white font-medium">
                    {mockData.weather.humidity}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">Wind</span>
                  </div>
                  <span className="text-white font-medium">
                    {mockData.weather.wind} km/h
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Kolom Tengah - Peta (tidak ada perubahan) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-6"
          >
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 h-full overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-medium">
                    Jakarta - Real-time View
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-300"
                  >
                    <Maximize2 className="w-4 h-4 text-slate-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-300"
                  >
                    <Settings className="w-4 h-4 text-slate-300" />
                  </motion.button>
                </div>
              </div>
              <div className="relative h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-grow">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 text-lg">
                    Interactive Map Placeholder
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ### PERBAIKAN 3: Membuat Kolom Kanan dapat di-scroll ### */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            // Tambahkan `overflow-y-auto` di sini juga
            className="col-span-3 space-y-6 overflow-y-auto pr-2"
          >
            <motion.div
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <span>Live Alerts</span>
                </h3>
                <span className="text-xs text-slate-400 bg-red-500/20 px-2 py-1 rounded-full">
                  {mockData.alerts.length} New
                </span>
              </div>
              <div className="space-y-3">
                {mockData.alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    whileHover={{
                      borderColor:
                        alert.type === 'critical'
                          ? 'rgba(239, 68, 68, 0.5)'
                          : 'rgba(245, 158, 11, 0.5)',
                      scale: 1.02,
                    }}
                    className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/30 transition-colors duration-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          alert.type === 'critical'
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-yellow-500'
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">
                            {alert.location}
                          </span>
                          <span className="text-xs text-slate-400">
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-green-400" />
                <span>System Status</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">
                      Sensors Online
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {mockData.sensors.active}/{mockData.sensors.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-slate-300">
                      Sensors Offline
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {mockData.sensors.offline}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">Data Stream</span>
                  </div>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl border border-cyan-400/30 text-cyan-400 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Send Alert</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl border border-slate-600/30 text-slate-300 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Reports</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl border border-slate-600/30 text-slate-300 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FloodMapInterface;
