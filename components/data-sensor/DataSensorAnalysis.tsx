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
  Wind
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface LaporanBanjir {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  water_level: number;
  description?: string;
  photo_url?: string;
  reporter_name?: string;
  reporter_contact?: string;
  created_at: string; // ISO string
}

const DataSensorAnalysis: React.FC = () => {
  const [laporan, setLaporan] = useState<LaporanBanjir[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Menggunakan data mock lokal untuk menghindari masalah API
        const mockLaporanBanjir: LaporanBanjir[] = [
          {
            id: '1',
            location: 'Jl. Merdeka No. 10, Jakarta',
            latitude: -6.2088,
            longitude: 106.8456,
            water_level: 60,
            description: 'Banjir setinggi lutut di area ini.',
            reporter_name: 'Andi',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            location: 'Perumahan Indah, Bekasi',
            latitude: -6.2388,
            longitude: 107.0000,
            water_level: 30,
            description: 'Genangan air di jalan utama.',
            reporter_name: 'Budi',
            created_at: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
          },
          {
            id: '3',
            location: 'Desa Sejahtera, Bogor',
            latitude: -6.5950,
            longitude: 106.7970,
            water_level: 10,
            description: 'Air mulai surut.',
            reporter_name: 'Citra',
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
          },
        ];
        setLaporan(mockLaporanBanjir);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        if (selectedFilter === 'high') return report.water_level >= 50;
        if (selectedFilter === 'medium') return report.water_level >= 20 && report.water_level < 50;
        if (selectedFilter === 'low') return report.water_level < 20;
        return true;
      });
    }

    return filtered;
  }, [laporan, searchTerm, selectedFilter]);

  const stats = useMemo(() => {
    const total = laporan.length;
    const highLevel = laporan.filter(r => r.water_level >= 50).length;
    const mediumLevel = laporan.filter(r => r.water_level >= 20 && r.water_level < 50).length;
    const lowLevel = laporan.filter(r => r.water_level < 20).length;
    const avgLevel = total > 0 ? Math.round(laporan.reduce((sum, r) => sum + r.water_level, 0) / total) : 0;
    
    return { total, highLevel, mediumLevel, lowLevel, avgLevel };
  }, [laporan]);

  const getWaterLevelColor = (level: number) => {
    if (level >= 50) return 'text-red-400 bg-red-500/20';
    if (level >= 20) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getWaterLevelIcon = (level: number) => {
    if (level >= 50) return <AlertCircle className="h-4 w-4" />;
    if (level >= 20) return <Droplets className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
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
            <div className="text-gray-400 text-sm">Level Bahaya</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Droplets className="h-8 w-8 text-yellow-400" />
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Sedang</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.mediumLevel}</div>
            <div className="text-gray-400 text-sm">Level Waspada</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-green-400" />
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Rendah</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.lowLevel}</div>
            <div className="text-gray-400 text-sm">Level Normal</div>
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
                <option value="high">Bahaya (≥50cm)</option>
                <option value="medium">Waspada (20-49cm)</option>
                <option value="low">Normal (&lt;20cm)</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
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
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getWaterLevelColor(report.water_level)}`}>
                                {getWaterLevelIcon(report.water_level)}
                                <span>{report.water_level}cm</span>
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
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">28°C</div>
                  <div className="text-gray-400">Berawan</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Droplets className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">72%</div>
                    <div className="text-xs text-gray-400">Kelembaban</div>
                  </div>
                  <div className="text-center">
                    <Wind className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">1.7 m/s</div>
                    <div className="text-xs text-gray-400">Angin</div>
                  </div>
                  <div className="text-center">
                    <Thermometer className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">1012</div>
                    <div className="text-xs text-gray-400">Tekanan</div>
                  </div>
                  <div className="text-center">
                    <Eye className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-white">10km</div>
                    <div className="text-xs text-gray-400">Jarak Pandang</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather History Placeholder */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Riwayat Curah Hujan</h3>
                    <p className="text-sm text-gray-400">Data historis 7 hari terakhir</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <CloudRain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">Fitur Akan Datang</p>
                  <p className="text-gray-500 text-sm">Integrasi dengan API cuaca untuk data historis</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4" />
                    <span>Jadwal Laporan</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4" />
                    <span>Alert Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSensorAnalysis;