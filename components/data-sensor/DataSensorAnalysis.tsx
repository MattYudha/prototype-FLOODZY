'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, 
  Database as TableIcon, 
  CloudRain, 
  MapPin, 
  Clock, 
  Droplets, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  ChevronRight,
  Activity,
  Thermometer,
  Wind,
  Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useWeatherData } from '@/hooks/useWeatherData';
import FloodReportChart from './FloodReportChart';

interface LaporanBanjir {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  water_level: string; // Changed to string
  description?: string;
  photo_url?: string;
  reporter_name?: string;
  reporter_contact?: string;
  created_at: string; // ISO string
}

const classifyWaterLevelString = (waterLevelString: string): {
  label: string;
  level: 'low' | 'medium' | 'high';
  colorClass: string;
  icon: React.ReactNode;
} => {
  switch (waterLevelString) {
    case 'semata_kaki':
      return { label: 'Semata Kaki', level: 'low', colorClass: 'text-green-400 bg-green-500/20', icon: <Activity className="h-4 w-4" /> };
    case 'selutut':
      return { label: 'Selutut', level: 'medium', colorClass: 'text-yellow-440 bg-yellow-500/20', icon: <Droplets className="h-4 w-4" /> };
    case 'sepaha':
      return { label: 'Sepaha', level: 'medium', colorClass: 'text-orange-400 bg-orange-500/20', icon: <Droplets className="h-4 w-4" /> };
    case 'sepusar':
      return { label: 'Sepusar', level: 'high', colorClass: 'text-red-400 bg-red-500/20', icon: <AlertCircle className="h-4 w-4" /> };
    case 'lebih_dari_sepusar':
      return { label: 'Lebih dari Sepusar', level: 'high', colorClass: 'text-red-600 bg-red-700/20', icon: <AlertCircle className="h-4 w-4" /> };
    default:
      return { label: 'Tidak diketahui', level: 'low', colorClass: 'text-gray-400 bg-gray-500/20', icon: <Activity className="h-4 w-4" /> };
  }
};

const DataSensorAnalysis: React.FC = () => {
  const [laporan, setLaporan] = useState<LaporanBanjir[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('high');
  const [alertMethod, setAlertMethod] = useState('email');
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const { weatherData, isLoading: isWeatherLoading, error: weatherError, fetchWeather } = useWeatherData();

  useEffect(() => {
    const fetchFloodData = async () => {
      try {
        setIsLoading(true);
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('laporan_banjir')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setLaporan(data as LaporanBanjir[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFloodData();
    // Fetch weather data for a default location (e.g., Jakarta)
    fetchWeather(-6.2088, 106.8456); 
  }, [fetchWeather]);

  const latestReports = useMemo(() => {
    let filtered = [...laporan].sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime());
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Level filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(report => {
        const { level } = classifyWaterLevelString(report.water_level);
        return level === selectedFilter;
      });
    }

    return filtered;
  }, [laporan, searchTerm, selectedFilter]);

  const stats = useMemo(() => {
    const total = laporan.length;
    const highLevel = laporan.filter(r => classifyWaterLevelString(r.water_level).level === 'high').length;
    const mediumLevel = laporan.filter(r => classifyWaterLevelString(r.water_level).level === 'medium').length;
    const lowLevel = laporan.filter(r => classifyWaterLevelString(r.water_level).level === 'low').length;
    // Average water level is not directly applicable with string water levels, so we'll omit it or calculate based on a mapping if needed.
    
    return { total, highLevel, mediumLevel, lowLevel, avgLevel: 0 }; // avgLevel set to 0 for now
  }, [laporan]);

  const handleExportData = () => {
    if (latestReports.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'ID', 'Lokasi', 'Latitude', 'Longitude', 'Level Air', 
      'Deskripsi', 'Nama Pelapor', 'Kontak Pelapor', 'Waktu Laporan'
    ];
    
    const csvContent = [
      headers.join(','),
      ...latestReports.map(report => 
        [
          `"${report.id}"`,
          `"${report.location}"`,
          report.latitude,
          report.longitude,
          `"${classifyWaterLevelString(report.water_level).label}"`,
          `"${report.description ? report.description.replace(/"/g, '""') : ''}"`,
          `"${report.reporter_name ? report.reporter_name.replace(/"/g, '""') : ''}"`,
          `"${report.reporter_contact ? report.reporter_contact.replace(/"/g, '""') : ''}"`,
          `"${format(parseISO(report.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'laporan_banjir.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setScheduleEmail('');
    setScheduleFrequency('daily');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Jadwal laporan diatur untuk ${scheduleEmail} dengan frekuensi ${scheduleFrequency}. (Simulasi)`);
    handleCloseScheduleModal();
  };

  const handleOpenAlertModal = () => {
    setIsAlertModalOpen(true);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
    setAlertThreshold('high');
    setAlertMethod('email');
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pengaturan notifikasi: Ambang batas '${alertThreshold}' dengan metode '${alertMethod}'. (Simulasi)`);
    handleCloseAlertModal();
  };

  const handleOpenWeatherModal = () => {
    setIsWeatherModalOpen(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (geoError) => {
          console.error("Error getting geolocation:", geoError);
          alert("Gagal mendapatkan lokasi Anda. Pastikan GPS diaktifkan dan berikan izin lokasi.");
        }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser Anda.");
    }
  };

  const handleCloseWeatherModal = () => {
    setIsWeatherModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Memuat data sensor...</p>
          <p className="text-gray-500 text-sm mt-2">Menganalisis laporan banjir terbaru</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center bg-gray-800 p-8 rounded-xl border border-red-500/20">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Gagal Memuat Data</h3>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <TableIcon className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Analisis Data Sensor</h1>
              <p className="text-gray-400">Monitoring laporan banjir dan data cuaca real-time</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <TableIcon className="h-8 w-8 text-cyan-400" />
              <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full">Total</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Laporan</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">Tinggi</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.highLevel}</div>
            <div className="text-gray-400 text-sm">Level Bahaya (Sepusar/Lebih)</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Droplets className="h-8 w-8 text-yellow-400" />
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Sedang</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.mediumLevel}</div>
            <div className="text-gray-400 text-sm">Level Waspada (Selutut/Sepaha)</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-green-400" />
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Rendah</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.lowLevel}</div>
            <div className="text-gray-400 text-sm">Level Normal (Semata Kaki)</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">Avg</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgLevel}<span className="text-lg text-gray-400">cm</span></div>
            <div className="text-gray-400 text-sm">Rata-rata Level</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari lokasi atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Semua Level</option>
                <option value="low">Semata Kaki</option>
                <option value="medium">Selutut/Sepaha</option>
                <option value="high">Sepusar/Lebih</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                  onClick={handleExportData}
                  className="flex items-center space-x-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              <button className="flex items-center space-x-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Reports Table */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <TableIcon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Laporan Banjir Terbaru</h3>
                      <p className="text-sm text-gray-400">Menampilkan {latestReports.length} dari {laporan.length} laporan</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{latestReports.length}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {latestReports.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {latestReports.map((report, index) => (
                      <div key={report.id || index} className="p-6 hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                              <h4 className="font-semibold text-white truncate">{report.location}</h4>
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${classifyWaterLevelString(report.water_level || '').colorClass}`}>
                                {classifyWaterLevelString(report.water_level || '').icon}
                                <span>{classifyWaterLevelString(report.water_level || '').label}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(parseISO(report.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                              </div>
                              {report.reporter_name && (
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{report.reporter_name}</span>
                                </div>
                              )}
                            </div>
                            
                            {report.description && (
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {report.description.length > 100 
                                  ? `${report.description.substring(0, 100)}...` 
                                  : report.description
                                }
                              </p>
                            )}
                            {report.photo_url && (
                                                            <div className="relative w-48 h-48 mt-2"> {/* Added a relative parent with fixed size */}
                                <Image
                                  src={report.photo_url}
                                  alt="Foto Laporan"
                                  fill // Use fill prop
                                  className="object-cover rounded-md"
                                  unoptimized // Temporary fallback
                                />
                            </div>
                            )}
                          </div>
                          
                          <button className="ml-4 p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <TableIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Tidak Ada Data</h3>
                    <p className="text-gray-500">Belum ada laporan banjir yang sesuai dengan filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weather Analysis Sidebar */}
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <CloudRain className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cuaca Saat Ini</h3>
                    <p className="text-sm text-gray-400">Kondisi weather real-time</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {isWeatherLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
                    <p className="text-gray-400">Memuat data cuaca...</p>
                  </div>
                ) : weatherError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400">Gagal memuat cuaca: {weatherError}</p>
                  </div>
                ) : weatherData ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-white mb-2">{Math.round(weatherData.current.main.temp)}°C</div>
                      <div className="text-gray-400">{weatherData.current.weather[0].description}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <Droplets className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-white">{weatherData.current.main.humidity}%</div>
                        <div className="text-xs text-gray-400">Kelembaban</div>
                      </div>
                      <div className="text-center">
                        <Wind className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-white">{weatherData.current.wind.speed} m/s</div>
                        <div className="text-xs text-gray-400">Angin</div>
                      </div>
                      <div className="text-center">
                        <Thermometer className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-white">{weatherData.current.main.pressure} hPa</div>
                        <div className="text-xs text-gray-400">Tekanan</div>
                      </div>
                      <div className="text-center">
                        <Eye className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-white">{weatherData.current.visibility / 1000} km</div>
                        <div className="text-xs text-gray-400">Jarak Pandang</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">Data cuaca tidak tersedia.</p>
                  </div>
                )}
              </div>
            </div>

            

            {/* Flood Report Chart */}
            <FloodReportChart />

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleOpenScheduleModal}
                  className="w-full flex items-center justify-between p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4" />
                    <span>Jadwal Laporan</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleOpenAlertModal}
                  className="w-full flex items-center justify-between p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4" />
                    <span>Alert Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleOpenWeatherModal}
                  className="w-full flex items-center justify-between p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Cloud className="h-4 w-4" />
                    <span>Cuaca Sekarang</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md mx-auto shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Jadwalkan Laporan</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label htmlFor="scheduleEmail" className="block text-gray-300 text-sm font-medium mb-1">Email Penerima</label>
                <input
                  type="email"
                  id="scheduleEmail"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="scheduleFrequency" className="block text-gray-300 text-sm font-medium mb-1">Frekuensi</label>
                <select
                  id="scheduleFrequency"
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseScheduleModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Jadwalkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAlertModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md mx-auto shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Pengaturan Notifikasi</h3>
            <form onSubmit={handleAlertSubmit} className="space-y-4">
              <div>
                <label htmlFor="alertThreshold" className="block text-gray-300 text-sm font-medium mb-1">Ambang Batas Peringatan</label>
                <select
                  id="alertThreshold"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="low">Semata Kaki</option>
                  <option value="medium">Selutut/Sepaha</option>
                  <option value="high">Sepusar/Lebih</option>
                </select>
              </div>
              <div>
                <label htmlFor="alertMethod" className="block text-gray-300 text-sm font-medium mb-1">Metode Notifikasi</label>
                <select
                  id="alertMethod"
                  value={alertMethod}
                  onChange={(e) => setAlertMethod(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS (Simulasi)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseAlertModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isWeatherModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md mx-auto shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Cuaca Sekarang</h3>
            {isWeatherLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
                <p className="text-gray-400">Memuat data cuaca...</p>
              </div>
            ) : weatherError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-400">Gagal memuat cuaca: {weatherError}</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Lokasi: {weatherData?.current?.name}</p>
                  <div className="text-5xl font-bold text-white mt-2">{Math.round(weatherData?.current?.main?.temp || 0)}°C</div>
                  <p className="text-gray-400 text-lg">{weatherData?.current?.weather?.[0]?.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Droplets className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">{weatherData?.current?.main?.humidity}%</p>
                    <p className="text-xs text-gray-400">Kelembaban</p>
                  </div>
                  <div>
                    <Wind className="h-6 w-6 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">{weatherData?.current?.wind?.speed} m/s</p>
                    <p className="text-xs text-gray-400">Angin</p>
                  </div>
                  <div>
                    <Thermometer className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">{weatherData?.current?.main?.pressure} hPa</p>
                    <p className="text-xs text-gray-400">Tekanan</p>
                  </div>
                  <div>
                    <Eye className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">{weatherData?.current?.visibility ? weatherData.current.visibility / 1000 : 'N/A'} km</p>
                    <p className="text-xs text-gray-400">Jarak Pandang</p>
                  </div>
                  <div>
                    <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">{weatherData?.current?.sys?.sunrise ? format(new Date(weatherData.current.sys.sunrise * 1000), 'HH:mm') : 'N/A'}</p>
                    <p className="text-xs text-gray-400">Matahari Terbit</p>
                  </div>
                  <div>
                    <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">{weatherData?.current?.sys?.sunset ? format(new Date(weatherData.current.sys.sunset * 1000), 'HH:mm') : 'N/A'}</p>
                    <p className="text-xs text-gray-400">Matahari Terbenam</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Data cuaca tidak tersedia.</p>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleCloseWeatherModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSensorAnalysis;