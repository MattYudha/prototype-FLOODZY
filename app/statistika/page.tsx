'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Gauge,
  TrendingUp,
  Clock,
  Users,
  Shield,
  BarChart3,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Search,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  MapPin,
  Calendar,
  Zap,
  DollarSign,
  Grid,
  List,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Lightbulb,
  History,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bot, // Added for Gemini icon
  Send, // Added for send button icon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart as RechartsPieChart,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Pie,
} from 'recharts';

// Types
interface HistoricalIncident {
  id: string;
  type: string;
  location: string;
  date: string;
  description: string;
  severity: number;
  impact_areas: string[];
  duration_hours?: number;
  reported_losses?: number;
  casualties?: number;
  evacuees?: number;
  damage_level?: string;
  response_time_minutes?: number;
  status: 'resolved' | 'ongoing' | 'monitoring';
}

interface ChartDataPoint {
  name: string;
  incidents: number;
  severity: number;
  resolved: number;
  ongoing: number;
  losses: number;
}

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  trend: number[];
  description?: string;
}

const generateChartData = (
  incidents: HistoricalIncident[],
): ChartDataPoint[] => {
  const monthlyData: { [key: string]: { incidents: number; severitySum: number; count: number; resolved: number; ongoing: number; losses: number; } } = {};
  incidents.forEach((incident) => {
    const date = new Date(incident.date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { incidents: 0, severitySum: 0, count: 0, resolved: 0, ongoing: 0, losses: 0 };
    }
    monthlyData[monthYear].incidents++;
    monthlyData[monthYear].severitySum += incident.severity;
    monthlyData[monthYear].count++;
    if (incident.status === 'resolved') monthlyData[monthYear].resolved++;
    if (incident.status === 'ongoing') monthlyData[monthYear].ongoing++;
    monthlyData[monthYear].losses += incident.reported_losses || 0;
  });
  const sortedMonths = Object.keys(monthlyData).sort();
  return sortedMonths.map((monthYear) => {
    const data = monthlyData[monthYear];
    const [year, month] = monthYear.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('id-ID', { month: 'short' });
    return {
      name: `${monthName} ${year.slice(2)}`,
      incidents: data.incidents,
      severity: data.count === 0 ? 0 : parseFloat((data.severitySum / data.count).toFixed(1)),
      resolved: data.resolved,
      ongoing: data.ongoing,
      losses: data.losses,
    };
  });
};

const pieData = [
  { name: 'Banjir', value: 35, color: '#06B6D4' },
  { name: 'Gempa', value: 25, color: '#EF4444' },
  { name: 'Longsor', value: 20, color: '#F59E0B' },
  { name: 'Tsunami', value: 10, color: '#10B981' },
  { name: 'Lainnya', value: 10, color: '#8B5CF6' },
];

export default function StatistikPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [historicalIncidents, setHistoricalIncidents] = useState<HistoricalIncident[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gemini Chat State
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  const fetchIncidents = useCallback(async () => {
    console.log('fetchIncidents called. Setting isLoading to true.');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/statistika/incidents');
      if (!response.ok) {
        throw new Error('Gagal mengambil data insiden');
      }
      const data: HistoricalIncident[] = await response.json();
      console.log('[Frontend] Fetched data:', data);
      setHistoricalIncidents(data);
      setChartData(generateChartData(data));
      console.log('Data fetched successfully. Setting isLoading to false.');
    } catch (err: any) {
      console.error('Error fetching incidents:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      console.log('Finally block executed. isLoading should be false now.');
    }
  }, []);

  useEffect(() => {
    console.log('useEffect for fetchIncidents triggered.');
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    const filteredByDate = historicalIncidents.filter((incident) => {
      if (!startDate && !endDate) return true;
      const incidentDate = new Date(incident.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && incidentDate < start) return false;
      if (end && incidentDate > end) return false;
      return true;
    });
    setChartData(generateChartData(filteredByDate));
  }, [startDate, endDate, historicalIncidents]);

  const statCards: StatCard[] = [
    {
      title: 'Total Insiden',
      value: historicalIncidents.length,
      change: 12,
      changeType: 'increase',
      icon: <Activity className="w-6 h-6" />,
      color: 'blue',
      trend: [20, 25, 18, 32, 28, 35, 30],
      description: 'Insiden tercatat'
    },
    {
      title: 'Tingkat Keparahan',
      value: (historicalIncidents.reduce((acc, curr) => acc + curr.severity, 0) / (historicalIncidents.length || 1)).toFixed(1),
      change: -5,
      changeType: 'decrease',
      icon: <Gauge className="w-6 h-6" />,
      color: 'orange',
      trend: [8, 7.5, 7.8, 7.2, 6.9, 7.2, 7.1],
      description: 'Rata-rata skor'
    },
    {
      title: 'Kerugian Total',
      value: `Rp ${(historicalIncidents.reduce((acc, curr) => acc + (curr.reported_losses || 0), 0) / 1e9).toFixed(1)}T`,
      change: 8,
      changeType: 'increase',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'red',
      trend: [5, 6, 7, 8, 9, 9.5, 9.8],
      description: 'Estimasi kerusakan'
    },
    {
      title: 'Waktu Respons',
      value: `${(historicalIncidents.reduce((acc, curr) => acc + (curr.response_time_minutes || 0), 0) / (historicalIncidents.length || 1)).toFixed(0)}m`,
      change: -15,
      changeType: 'decrease',
      icon: <Clock className="w-6 h-6" />,
      color: 'green',
      trend: [60, 55, 50, 45, 42, 40, 42],
      description: 'Rata-rata respons'
    },
    {
      title: 'Korban Jiwa',
      value: historicalIncidents.reduce((acc, curr) => acc + (curr.casualties || 0), 0),
      change: -50,
      changeType: 'decrease',
      icon: <Users className="w-6 h-6" />,
      color: 'purple',
      trend: [8, 6, 4, 3, 2, 1, 3],
      description: 'Total casualitas'
    },
    {
      title: 'Pengungsi',
      value: historicalIncidents.reduce((acc, curr) => acc + (curr.evacuees || 0), 0).toLocaleString('id-ID'),
      change: 20,
      changeType: 'increase',
      icon: <Shield className="w-6 h-6" />,
      color: 'cyan',
      trend: [4000, 4500, 5000, 5200, 5400, 5420, 5400],
      description: 'Orang dievakuasi'
    },
  ];

  const filteredIncidents = historicalIncidents
    .filter((incident) => filterType === 'all' || incident.type.toLowerCase() === filterType.toLowerCase())
    .filter((incident) =>
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'severity') {
        return sortOrder === 'desc' ? b.severity - a.severity : a.severity - b.severity;
      } else {
        return sortOrder === 'desc' ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type);
      }
    });

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') return <ArrowUpRight className="w-4 h-4" />;
    if (changeType === 'decrease') return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === 'increase') return 'text-emerald-400';
    if (changeType === 'decrease') return 'text-rose-400';
    return 'text-slate-400';
  };

  // --- Gemini Integration Logic ---
  const handleGeminiAnalysis = useCallback(async () => {
    if (!geminiQuestion.trim()) {
      setGeminiResponse('Silakan masukkan pertanyaan Anda.');
      return;
    }

    setIsGeminiLoading(true);
    setGeminiResponse(null); // Clear previous response

    // Prepare data for Gemini prompt
    const incidentSummary = historicalIncidents.map(inc =>
      `Tipe: ${inc.type}, Lokasi: ${inc.location}, Tanggal: ${new Date(inc.date).toLocaleDateString()}, Keparahan: ${inc.severity}, Deskripsi: ${inc.description.substring(0, 100)}...`
    ).join('\n');

    const statCardSummary = statCards.map(card =>
      `${card.title}: ${card.value} (${card.changeType === 'increase' ? '+' : ''}${card.change}% dari bulan lalu)`
    ).join('\n');

    const prompt = `Anda adalah asisten analisis bencana yang profesional. Jawab pertanyaan pengguna berdasarkan data statistik yang saya berikan.\n    Fokus pada analisis kemungkinan terjadinya bencana dan rekomendasi langkah pencegahan/penanganan.\n    Jika data tidak relevan atau tidak cukup, nyatakan keterbatasan Anda.\n\n    Data Insiden Historis (10 insiden terbaru):\n    ${incidentSummary || 'Tidak ada data insiden historis.'}\n\n    Ringkasan Statistik Utama:\n    ${statCardSummary || 'Tidak ada ringkasan statistik.'}\n\n    Pertanyaan Pengguna: "${geminiQuestion}"\n\n    Analisis Anda:`

    console.log('Gemini Prompt:', prompt); // Log the generated prompt

    // --- SIMULATED GEMINI API CALL ---
    // In a real application, you would send this prompt to your backend API route
    // which then calls the Google Gemini API.
    // Example: const response = await fetch('/api/gemini-chat', { method: 'POST', body: JSON.stringify({ prompt }) });
    // For this exercise, we simulate the response.
    try {
      const simulatedResponse = await new Promise<string>(resolve => {
        setTimeout(() => {
          if (geminiQuestion.toLowerCase().includes('banjir')) {
            resolve(`Berdasarkan data historis, insiden banjir sering terjadi di ${historicalIncidents[0]?.location || 'berbagai lokasi'}.\n            Kemungkinan terjadinya banjir di masa depan tetap ada, terutama di musim hujan.\n            Rekomendasi:\n            1. Tingkatkan sistem peringatan dini di area rawan banjir.\n            2. Lakukan pembersihan saluran air secara berkala.\n            3. Edukasi masyarakat tentang jalur evakuasi dan persiapan darurat.`);
          } else if (geminiQuestion.toLowerCase().includes('gempa')) {
            resolve(`Data insiden gempa menunjukkan keparahan rata-rata ${statCards[1]?.value || 'tidak diketahui'}.\n            Meskipun data spesifik tentang probabilitas gempa tidak tersedia, Indonesia berada di zona rawan gempa.\n            Rekomendasi:\n            1. Pastikan bangunan memenuhi standar tahan gempa.\n            2. Latih masyarakat untuk melakukan 'drop, cover, and hold on' saat gempa.\n            3. Siapkan tas siaga bencana.`);
          } else if (geminiQuestion.toLowerCase().includes('rekomendasi')) {
            resolve(`Berdasarkan pertanyaan Anda, berikut adalah rekomendasi umum berdasarkan data yang tersedia:\n            - Untuk mengurangi kerugian total (saat ini Rp ${statCards[2]?.value || 'tidak diketahui'}), fokus pada mitigasi struktural.\n            - Untuk meningkatkan waktu respons (saat ini ${statCards[3]?.value || 'tidak diketahui'}), optimalkan koordinasi tim darurat.\n            - Untuk mengurangi korban jiwa dan pengungsi, tingkatkan edukasi dan simulasi evakuasi.`);
          } else {
            resolve(`Maaf, saya hanya dapat menganalisis data yang tersedia dalam statistik insiden bencana.\n            Pertanyaan Anda: "${geminiQuestion}" tidak cukup spesifik atau data yang relevan tidak tersedia untuk analisis mendalam.\n            Silakan ajukan pertanyaan terkait tren insiden, tingkat keparahan, kerugian, atau rekomendasi pencegahan.`);
          }
        }, 2000); // Simulate network delay
      });
      setGeminiResponse(simulatedResponse);
    } catch (err) {
      setGeminiResponse('Terjadi kesalahan saat menganalisis. Silakan coba lagi.');
      console.error('Simulated Gemini error:', err);
    } finally {
      setIsGeminiLoading(false);
    }
  }, [geminiQuestion, historicalIncidents, statCards]);
  // --- END SIMULATED GEMINI API CALL ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-spin flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Memuat Data Statistik</h2>
          <p className="text-slate-400">Mengambil data terbaru dari sistem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Gagal Memuat Data</h2>
          <p className="text-slate-400 mb-6">Terjadi kesalahan: {error}</p>
          <Button 
            onClick={fetchIncidents} 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Statistik Insiden Bencana</h1>
              <p className="text-slate-400 text-lg">Dashboard analitik dan laporan komprehensif</p>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Tabs */}
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'overview'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'historical' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('historical')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'historical'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <History className="w-4 h-4 mr-2" />
                  Riwayat
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchIncidents}
                  className="text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gemini Integration Section - Moved and Resized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex justify-center" // Added flex and justify-center for centering
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg"> {/* Adjusted max-w-lg */}
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
              <CardTitle className="text-white flex items-center">
                <Bot className="w-5 h-5 mr-2 text-blue-400" />
                Asisten Analisis Bencana (Gemini)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Tanyakan tentang analisis bencana..."
                    className="flex-1 p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={geminiQuestion}
                    onChange={(e) => setGeminiQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGeminiAnalysis();
                      }
                    }}
                    disabled={isGeminiLoading}
                  />
                  <Button
                    onClick={handleGeminiAnalysis}
                    disabled={isGeminiLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    {isGeminiLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span className="ml-2">{isGeminiLoading ? 'Menganalisis...' : 'Kirim'}</span>
                  </Button>
                </div>
                {/* Example Questions */}
                <div className="text-sm text-slate-400 space-y-1">
                  <p className="font-semibold">Contoh pertanyaan:</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>
                      <button
                        onClick={() => setGeminiQuestion('Bagaimana kemungkinan banjir di musim hujan?')}
                        className="text-blue-400 hover:underline"
                      >
                        Bagaimana kemungkinan banjir di musim hujan?
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setGeminiQuestion('Apa rekomendasi untuk gempa bumi?')}
                        className="text-blue-400 hover:underline"
                      >
                        Apa rekomendasi untuk gempa bumi?
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setGeminiQuestion('Berikan rekomendasi umum.')}
                        className="text-blue-400 hover:underline"
                      >
                        Berikan rekomendasi umum.
                      </button>
                    </li>
                  </ul>
                </div>
                {geminiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/10 border border-white/20 p-4 rounded-xl text-slate-200 whitespace-pre-wrap"
                  >
                    {geminiResponse}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-cyan-400" />
                  Filter Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="filterType" className="block text-sm font-medium text-slate-300 mb-2">
                      Jenis Insiden
                    </label>
                    <select
                      id="filterType"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="banjir">Banjir</option>
                      <option value="gempa">Gempa</option>
                      <option value="longsor">Longsor</option>
                      <option value="tsunami">Tsunami</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-2">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-300 mb-2">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {statCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-500 rounded-2xl group hover:shadow-2xl hover:shadow-cyan-500/10">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br from-${card.color}-500/20 to-${card.color}-600/10 group-hover:from-${card.color}-500/30 group-hover:to-${card.color}-600/20 transition-all duration-300`}>
                            <div className={`text-${card.color}-400`}>{card.icon}</div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(card.changeType)}`}>
                            {getChangeIcon(card.changeType)}
                            <span>{Math.abs(card.change)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-slate-400">Kekeringan</h3>
                          <div className="text-2xl font-bold text-white">{card.value}</div>
                          <p className="text-xs text-slate-500">Kekeringan</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                {/* Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="lg:col-span-4"
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10">
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                        Tren Insiden Bulanan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                          <YAxis stroke="#64748B" fontSize={12} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: '12px',
                              backdropFilter: 'blur(12px)'
                            }}
                            labelStyle={{ color: '#E2E8F0' }}
                            itemStyle={{ color: '#CBD5E1' }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="incidents"
                            stroke="#06B6D4"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorIncidents)"
                            name="Jumlah Insiden"
                          />
                          <Area
                            type="monotone"
                            dataKey="severity"
                            stroke="#10B981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSeverity)"
                            name="Tingkat Keparahan"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="lg:col-span-3"
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10">
                      <CardTitle className="text-white flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-purple-400" />
                        Distribusi Jenis Insiden
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[350px] p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: '12px',
                              backdropFilter: 'blur(12px)'
                            }}
                            labelStyle={{ color: '#E2E8F0' }}
                            itemStyle={{ color: '#CBD5E1' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/10">
                    <CardTitle className="text-white flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
                      Insight & Rekomendasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">Tren Peningkatan Insiden</h4>
                            <p className="text-slate-300 text-sm">Data menunjukkan peningkatan insiden di bulan-bulan tertentu. Pertimbangkan untuk meningkatkan kesiapsiagaan di periode tersebut.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">Area Berisiko Tinggi</h4>
                            <p className="text-slate-300 text-sm">Identifikasi lokasi dengan frekuensi insiden tertinggi untuk fokus pada mitigasi dan pembangunan infrastruktur tahan bencana.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">Efektivitas Respons</h4>
                            <p className="text-slate-300 text-sm">Analisis waktu respons rata-rata dan dampaknya terhadap kerugian. Targetkan peningkatan kecepatan respons di area kritis.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">Edukasi Masyarakat</h4>
                            <p className="text-slate-300 text-sm">Insiden dengan korban jiwa atau pengungsi tinggi menunjukkan perlunya edukasi dan simulasi evakuasi yang lebih intensif.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">Integrasi Data</h4>
                            <p className="text-slate-300 text-sm">Pertimbangkan untuk mengintegrasikan data dari sumber lain (misalnya, BMKG, data demografi) untuk analisis yang lebih komprehensif.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'historical' && (
            <motion.div
              key="historical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <CardTitle className="text-white flex items-center">
                      <History className="w-5 h-5 mr-2 text-indigo-400" />
                      Riwayat Insiden
                    </CardTitle>
                    
                    {/* Search and Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari insiden..."
                          className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'date' | 'severity' | 'type')}
                        >
                          <option value="date">Tanggal</option>
                          <option value="severity">Keparahan</option>
                          <option value="type">Jenis</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="text-slate-300 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-300"
                        >
                          {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <div className="flex rounded-xl overflow-hidden border border-white/20">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-none ${viewMode === 'grid'
                                ? 'bg-cyan-500 text-white'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            } transition-all duration-300`}
                          >
                            <Grid className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-none ${viewMode === 'list'
                                ? 'bg-cyan-500 text-white'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            } transition-all duration-300`}
                          >
                            <List className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {filteredIncidents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                        <Info className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Data</h3>
                      <p className="text-slate-400">Tidak ada insiden yang ditemukan dengan kriteria pencarian ini.</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {viewMode === 'grid' ? (
                        <motion.div
                          key="grid-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {filteredIncidents.map((incident, index) => (
                            <motion.div
                              key={incident.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-500 rounded-2xl group hover:shadow-lg hover:shadow-cyan-500/10 h-full">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                      <span className="text-cyan-400">Kekeringan</span>
                                      <div className="flex items-center gap-1">
                                        {incident.status === 'resolved' && (
                                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        )}
                                        {incident.status === 'ongoing' && (
                                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                        )}
                                        {incident.status === 'monitoring' && (
                                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                        )}
                                      </div>
                                    </CardTitle>
                                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300">
                                      <Zap className="w-3 h-3" />
                                      {incident.severity}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-slate-300 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      {incident.location}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(incident.date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                                    {incident.description}
                                  </p>
                                  
                                  <div className="space-y-2 mb-4">
                                    {incident.reported_losses && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-1">
                                          <DollarSign className="w-3 h-3" />
                                          Kerugian
                                        </span>
                                        <span className="font-medium text-white">
                                          Rp {incident.reported_losses.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    )}
                                    {incident.casualties && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          Korban Jiwa
                                        </span>
                                        <span className="font-medium text-red-300">{incident.casualties}</span>
                                      </div>
                                    )}
                                    {incident.evacuees && (
                                      <div className="text-sm">
                                        <span className="text-slate-400">Pengungsi:</span>{' '}
                                        <span className="font-medium text-amber-300">
                                          {incident.evacuees.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {incident.impact_areas.slice(0, 3).map((area, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                      >
                                        {area}
                                      </span>
                                    ))}
                                    {incident.impact_areas.length > 3 && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                        +{incident.impact_areas.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          {filteredIncidents.map((incident, index) => (
                            <motion.div
                              key={incident.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 p-6 rounded-2xl transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/10"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                      {incident.type} - {incident.location}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300">
                                        <Zap className="w-3 h-3" />
                                        {incident.severity}
                                      </div>
                                      {incident.status === 'resolved' && (
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        )}
                                        {incident.status === 'ongoing' && (
                                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                        )}
                                        {incident.status === 'monitoring' && (
                                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-slate-300 mb-2">{incident.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(incident.date).toLocaleDateString('id-ID', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </span>
                                      {incident.response_time_minutes && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {incident.response_time_minutes} menit
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col lg:text-right space-y-1">
                                    {incident.reported_losses && (
                                      <div className="text-sm text-slate-300">
                                        <span className="text-slate-400">Kerugian:</span>{' '}
                                        <span className="font-medium text-white">
                                          Rp {incident.reported_losses.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    )}
                                    {incident.casualties && (
                                      <div className="text-sm">
                                        <span className="text-slate-400">Korban:</span>{' '}
                                        <span className="font-medium text-red-300">{incident.casualties}</span>
                                      </div>
                                    )}
                                    {incident.evacuees && (
                                      <div className="text-sm">
                                        <span className="text-slate-400">Pengungsi:</span>{' '}
                                        <span className="font-medium text-amber-300">
                                          {incident.evacuees.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gemini Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
              <CardTitle className="text-white flex items-center">
                <Bot className="w-5 h-5 mr-2 text-blue-400" />
                Asisten Analisis Bencana (Gemini)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Tanyakan tentang analisis bencana..."
                    className="flex-1 p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={geminiQuestion}
                    onChange={(e) => setGeminiQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGeminiAnalysis();
                      }
                    }}
                    disabled={isGeminiLoading}
                  />
                  <Button
                    onClick={handleGeminiAnalysis}
                    disabled={isGeminiLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    {isGeminiLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span className="ml-2">{isGeminiLoading ? 'Menganalisis...' : 'Kirim'}</span>
                  </Button>
                </div>
                {/* Example Questions */}
                <div className="text-sm text-slate-400 space-y-1">
                  <p className="font-semibold">Contoh pertanyaan:</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>
                      <button
                        onClick={() => setGeminiQuestion('Bagaimana kemungkinan banjir di musim hujan?')}
                        className="text-blue-400 hover:underline"
                      >
                        Bagaimana kemungkinan banjir di musim hujan?
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setGeminiQuestion('Apa rekomendasi untuk gempa bumi?')}
                        className="text-blue-400 hover:underline"
                      >
                        Apa rekomendasi untuk gempa bumi?
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setGeminiQuestion('Berikan rekomendasi umum.')}
                        className="text-blue-400 hover:underline"
                      >
                        Berikan rekomendasi umum.
                      </button>
                    </li>
                  </ul>
                </div>
                {geminiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/10 border border-white/20 p-4 rounded-xl text-slate-200 whitespace-pre-wrap"
                  >
                    {geminiResponse}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}