'use client'; // Add this line at the very top

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  Lightbulb,
  History,
  TrendingUp,
  MapPin,
  Clock,
  MessageSquare,
  ClipboardList,
  Info,
  Activity,
  Shield,
  Zap,
  Brain,
  Eye,
  BarChart2,
  PieChart,
  Target,
  Database,
  Sparkles,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Gauge,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Search,
  Star,
  Layers,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
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
  Pie, // Add Pie here, as it was used but not imported
} from 'recharts';

// Types
interface HistoricalIncident {
  id: string;
  type: string;
  location: string;
  date: string;
  description: string;
  severity: number;
  impactAreas: string[];
  durationHours?: number;
  reportedLosses?: number;
  casualties?: number;
  evacuees?: number;
  damageLevel?: string;
  responseTime?: number;
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
}

// Mock data
const mockHistoricalIncidents: HistoricalIncident[] = [
  {
    id: 'hist-1',
    type: 'Banjir',
    location: 'Sungai Ciliwung, Jakarta',
    date: '2024-01-15T08:00:00Z',
    description:
      'Banjir parah di bantaran Sungai Ciliwung akibat hujan deras dan luapan waduk. Ketinggian air mencapai 2 meter di beberapa titik.',
    severity: 9,
    impactAreas: ['Kampung Melayu', 'Cawang', 'Rawajati'],
    durationHours: 48,
    reportedLosses: 5000000000,
    casualties: 2,
    evacuees: 1250,
    damageLevel: 'Parah',
    responseTime: 45,
    status: 'resolved',
  },
  {
    id: 'hist-2',
    type: 'Gempa Bumi',
    location: 'Malang, Jawa Timur',
    date: '2023-11-20T14:30:00Z',
    description:
      'Gempa bumi berkekuatan M 6.5 dirasakan kuat di Malang dan sekitarnya. Menyebabkan kerusakan ringan pada beberapa bangunan.',
    severity: 7,
    impactAreas: ['Pusat Kota Malang', 'Kepanjen'],
    reportedLosses: 1000000000,
    casualties: 0,
    evacuees: 450,
    damageLevel: 'Ringan',
    responseTime: 30,
    status: 'resolved',
  },
  {
    id: 'hist-3',
    type: 'Tanah Longsor',
    location: 'Puncak, Bogor',
    date: '2024-03-01T06:00:00Z',
    description:
      'Longsor menutup akses jalan utama Puncak setelah hujan semalaman. Tidak ada korban jiwa, namun lalu lintas terganggu.',
    severity: 6,
    impactAreas: ['Cisarua', 'Megamendung'],
    durationHours: 72,
    reportedLosses: 500000000,
    casualties: 0,
    evacuees: 120,
    damageLevel: 'Sedang',
    responseTime: 60,
    status: 'resolved',
  },
  {
    id: 'hist-4',
    type: 'Banjir',
    location: 'Semarang, Jawa Tengah',
    date: '2023-12-05T11:00:00Z',
    description:
      'Banjir rob di area pesisir Semarang, diperparah dengan curah hujan tinggi. Menggenangi permukiman dan fasilitas publik.',
    severity: 8,
    impactAreas: ['Tugu', 'Genuk', 'Sayung'],
    durationHours: 36,
    reportedLosses: 2500000000,
    casualties: 1,
    evacuees: 800,
    damageLevel: 'Sedang',
    responseTime: 40,
    status: 'resolved',
  },
  {
    id: 'hist-5',
    type: 'Kekeringan',
    location: 'Gunungkidul, Yogyakarta',
    date: '2024-06-10T00:00:00Z',
    description:
      'Kekeringan ekstrem yang berlangsung selama 3 bulan, mengakibatkan krisis air bersih di beberapa desa.',
    severity: 7,
    impactAreas: ['Ponjong', 'Semanu', 'Tepus'],
    durationHours: 2160,
    reportedLosses: 800000000,
    casualties: 0,
    evacuees: 300,
    damageLevel: 'Sedang',
    responseTime: 120,
    status: 'monitoring',
  },
  {
    id: 'hist-6',
    type: 'Tsunami',
    location: 'Pantai Selatan Jawa',
    date: '2024-02-18T15:45:00Z',
    description:
      'Tsunami kecil akibat gempa laut, ketinggian gelombang 1.5 meter. Evakuasi preventif dilakukan dengan sukses.',
    severity: 6,
    impactAreas: ['Cilacap', 'Kebumen', 'Purworejo'],
    durationHours: 6,
    reportedLosses: 300000000,
    casualties: 0,
    evacuees: 2500,
    damageLevel: 'Ringan',
    responseTime: 15,
    status: 'resolved',
  },
  {
    id: 'hist-7',
    type: 'Kebakaran Hutan',
    location: 'Riau',
    date: '2023-09-01T10:00:00Z',
    description:
      'Kebakaran hutan parah menyebabkan kabut asap tebal di beberapa provinsi. Upaya pemadaman masih berlangsung.',
    severity: 9,
    impactAreas: ['Pekanbaru', 'Dumai', 'Pelalawan'],
    durationHours: 720, // Approx 30 days
    reportedLosses: 10000000000,
    casualties: 0,
    evacuees: 5000,
    damageLevel: 'Parah',
    responseTime: 180,
    status: 'ongoing',
  },
  {
    id: 'hist-8',
    type: 'Angin Puting Beliung',
    location: 'Sidoarjo, Jawa Timur',
    date: '2024-04-22T13:00:00Z',
    description:
      'Angin puting beliung merusak puluhan rumah dan fasilitas umum. Tidak ada korban jiwa.',
    severity: 5,
    impactAreas: ['Buduran', 'Candi'],
    durationHours: 1,
    reportedLosses: 150000000,
    casualties: 0,
    evacuees: 50,
    damageLevel: 'Ringan',
    responseTime: 20,
    status: 'resolved',
  },
  {
    id: 'hist-9',
    type: 'Gelombang Tinggi',
    location: 'Pantai Anyer, Banten',
    date: '2024-05-15T09:00:00Z',
    description:
      'Gelombang tinggi menghantam pesisir Anyer, merusak beberapa warung dan fasilitas wisata.',
    severity: 6,
    impactAreas: ['Anyer', 'Carita'],
    durationHours: 24,
    reportedLosses: 200000000,
    casualties: 0,
    evacuees: 0,
    damageLevel: 'Sedang',
    responseTime: 30,
    status: 'resolved',
  },
  {
    id: 'hist-10',
    type: 'Erupsi Gunung Berapi',
    location: 'Gunung Merapi, Yogyakarta',
    date: '2023-10-01T07:00:00Z',
    description:
      'Erupsi freatik Gunung Merapi menyebabkan hujan abu tipis di sekitar lereng. Status siaga tetap.',
    severity: 7,
    impactAreas: ['Sleman', 'Magelang'],
    durationHours: 240, // 10 days
    reportedLosses: 50000000,
    casualties: 0,
    evacuees: 0,
    damageLevel: 'Sangat Ringan',
    responseTime: 10,
    status: 'monitoring',
  },
];

const generateChartData = (incidents: HistoricalIncident[]): ChartDataPoint[] => {
  const monthlyData: { [key: string]: { incidents: number; severitySum: number; count: number; resolved: number; ongoing: number; losses: number } } = {};

  incidents.forEach(incident => {
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
    monthlyData[monthYear].losses += incident.reportedLosses || 0;
  });

  const sortedMonths = Object.keys(monthlyData).sort();

  return sortedMonths.map(monthYear => {
    const data = monthlyData[monthYear];
    const [year, month] = monthYear.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('id-ID', { month: 'short' });

    return {
      name: `${monthName} ${year.slice(2)}`,
      incidents: data.incidents,
      severity: parseFloat((data.severitySum / data.count).toFixed(1)),
      resolved: data.resolved,
      ongoing: data.ongoing,
      losses: data.losses,
    };
  });
};

const radarData = [
  { subject: 'Banjir', A: 120, B: 110, fullMark: 150 },
  { subject: 'Gempa', A: 98, B: 130, fullMark: 150 },
  { subject: 'Longsor', A: 86, B: 130, fullMark: 150 },
  { subject: 'Tsunami', A: 99, B: 100, fullMark: 150 },
  { subject: 'Kekeringan', A: 85, B: 90, fullMark: 150 },
  { subject: 'Kebakaran', A: 65, B: 85, fullMark: 150 },
];

const pieData = [
  { name: 'Banjir', value: 35, color: '#3B82F6' },
  { name: 'Gempa', value: 25, color: '#EF4444' },
  { name: 'Longsor', value: 20, color: '#F59E0B' },
  { name: 'Tsunami', value: 10, color: '#10B981' },
  { name: 'Lainnya', value: 10, color: '#8B5CF6' },
];

export default function StatistikPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6m');
  const [startDate, setStartDate] = useState<string>(''); // New state for start date
  const [endDate, setEndDate] = useState<string>('');   // New state for end date
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [customAnalysisPrompt, setCustomAnalysisPrompt] = useState('');
  const [historicalIncidents, setHistoricalIncidents] = useState<
    HistoricalIncident[]
  >([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setHistoricalIncidents(mockHistoricalIncidents);
    // Initial chart data generation based on all mock incidents
    setChartData(generateChartData(mockHistoricalIncidents));
  }, []);

  // Effect to update chart data when historicalIncidents or date filters change
  useEffect(() => {
    const filteredByDate = mockHistoricalIncidents.filter(incident => {
      const incidentDate = new Date(incident.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && incidentDate < start) return false;
      if (end && incidentDate > end) return false;
      return true;
    });
    setChartData(generateChartData(filteredByDate));
  }, [startDate, endDate, mockHistoricalIncidents]);

  const statCards: StatCard[] = [
    {
      title: 'Total Insiden',
      value: historicalIncidents.length,
      change: 12,
      changeType: 'increase',
      icon: <Activity className="w-5 h-5" />,
      color: 'blue',
      trend: [20, 25, 18, 32, 28, 35, 30],
    },
    {
      title: 'Tingkat Keparahan Avg',
      value: '7.2',
      change: -5,
      changeType: 'decrease',
      icon: <Gauge className="w-5 h-5" />,
      color: 'orange',
      trend: [8, 7.5, 7.8, 7.2, 6.9, 7.2, 7.1],
    },
    {
      title: 'Kerugian Total',
      value: 'Rp 9.8T',
      change: 8,
      changeType: 'increase',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'red',
      trend: [5, 6, 7, 8, 9, 9.5, 9.8],
    },
    {
      title: 'Waktu Respons Avg',
      value: '42 menit',
      change: -15,
      changeType: 'decrease',
      icon: <Clock className="w-5 h-5" />,
      color: 'green',
      trend: [60, 55, 50, 45, 42, 40, 42],
    },
    {
      title: 'Korban Jiwa',
      value: 3,
      change: -50,
      changeType: 'decrease',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
      trend: [8, 6, 4, 3, 2, 1, 3],
    },
    {
      title: 'Pengungsi',
      value: '5,420',
      change: 20,
      changeType: 'increase',
      icon: <Shield className="w-5 h-5" />,
      color: 'cyan',
      trend: [4000, 4500, 5000, 5200, 5400, 5420, 5400],
    },
  ];

  const filteredIncidents = historicalIncidents
    .filter(
      (incident) =>
        filterType === 'all' ||
        incident.type.toLowerCase() === filterType.toLowerCase(),
    )
    .filter(
      (incident) =>
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'severity') {
        return sortOrder === 'desc'
          ? b.severity - a.severity
          : a.severity - b.severity;
      } else {
        return sortOrder === 'desc'
          ? b.type.localeCompare(a.type)
          : a.type.localeCompare(b.type);
      }
    });

  const runHistoricalAnalysis = async (presetPrompt?: string) => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    setGeminiAnalysis(null);

    const analysisContext = historicalIncidents
      .map(
        (inc) =>
          `Tipe: ${inc.type}, Lokasi: ${inc.location}, Tanggal: ${inc.date.split('T')[0]}, Deskripsi: ${inc.description}, Keparahan: ${inc.severity}/10`,
      )
      .join('\n---\n');

    const promptText = presetPrompt || customAnalysisPrompt;

    // Simulate API call
    setTimeout(() => {
      const mockAnalysis = `## Analisis Komprehensif Bencana Indonesia

### Pola Utama yang Teridentifikasi:
1. **Banjir** merupakan bencana paling dominan (60% dari total insiden)
2. **Wilayah Jawa** paling rentan dengan 70% insiden terjadi di pulau ini
3. **Pola Musiman**: Peningkatan 40% insiden pada musim hujan (Nov-Mar)

### Tren Keparahan:
- Tingkat keparahan rata-rata: 7.2/10
- Peningkatan kompleksitas bencana dalam 2 tahun terakhir
- Waktu respons membaik dari 60 menit menjadi 42 menit

### Rekomendasi Strategis:
1. **Mitigasi Proaktif**: Fokus pada sistem peringatan dini di area rawan
2. **Infrastruktur Adaptif**: Pembangunan tanggul dan sistem drainase modern
3. **Edukasi Masyarakat**: Program kesadaran bencana yang komprehensif

### Proyeksi Risiko:
Berdasarkan data historis, diproyeksikan peningkatan 15% insiden banjir pada 2025 jika tidak ada intervensi signifikan.
      `;

      setGeminiAnalysis(mockAnalysis);
      setIsLoadingAnalysis(false);
    }, 2000);
  };

  const handlePresetAnalysis = (analysisType: string) => {
    const prompts = {
      pola_banjir:
        'Analisis pola banjir dan faktor pemicu utama berdasarkan data historis',
      dampak_infrastruktur:
        'Evaluasi dampak bencana terhadap infrastruktur kritis',
      efektivitas_respons:
        'Analisis efektivitas waktu respons dan koordinasi penanganan bencana',
    };

    const prompt = prompts[analysisType as keyof typeof prompts] || '';
    setCustomAnalysisPrompt(prompt);
    runHistoricalAnalysis(prompt);
  };

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      cyan: 'from-cyan-500 to-cyan-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ongoing':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'monitoring':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-400';
    if (severity >= 6) return 'text-orange-400';
    if (severity >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Advanced Analytics
                </h1>
                <p className="text-slate-400 mt-1">
                  Sistem Analisis Bencana Berbasis AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
                <Download className="w-5 h-5 text-slate-300" />
              </button>
              <button className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
                <Share2 className="w-5 h-5 text-slate-300" />
              </button>
              <button className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
                <RefreshCw className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-slate-800/30 backdrop-blur-sm p-1 rounded-2xl border border-slate-700/50">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'historical', label: 'Data Historis', icon: Database },
              { id: 'analysis', label: 'AI Analysis', icon: Brain },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-700/40 transition-all duration-300"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getColorClass(card.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    ></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${getColorClass(card.color)} bg-opacity-10`}
                        >
                          {card.icon}
                        </div>
                        <div className="flex items-center space-x-1">
                          {card.changeType === 'increase' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : card.changeType === 'decrease' ? (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          ) : null}
                          <span
                            className={`text-sm font-medium ${
                              card.changeType === 'increase'
                                ? 'text-green-400'
                                : card.changeType === 'decrease'
                                  ? 'text-red-400'
                                  : 'text-slate-400'
                            }`}
                          >
                            {card.change > 0 ? '+' : ''}
                            {card.change}%
                          </span>
                        </div>
                      </div>
                      <h3 className="text-slate-400 text-sm font-medium mb-2">
                        {card.title}
                      </h3>
                      <p className="text-2xl font-bold text-white mb-4">
                        {card.value}
                      </p>
                      <div className="h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={card.trend.map((value, index) => ({
                              value,
                              index,
                            }))}
                          >
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={`url(#gradient-${card.color})`}
                              strokeWidth={2}
                              dot={false}
                            />
                            <defs>
                              <linearGradient
                                id={`gradient-${card.color}`}
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={
                                    card.color === 'blue'
                                      ? '#3B82F6'
                                      : card.color === 'orange'
                                        ? '#F59E0B'
                                        : card.color === 'red'
                                          ? '#EF4444'
                                          : card.color === 'green'
                                            ? '#10B981'
                                            : card.color === 'purple'
                                              ? '#8B5CF6'
                                              : '#06B6D4'
                                  }
                                />
                                <stop
                                  offset="100%"
                                  stopColor={
                                    card.color === 'blue'
                                      ? '#1D4ED8'
                                      : card.color === 'orange'
                                        ? '#D97706'
                                        : card.color === 'red'
                                          ? '#DC2626'
                                          : card.color === 'green'
                                            ? '#059669'
                                            : card.color === 'purple'
                                              ? '#7C3AED'
                                              : '#0891B2'
                                  }
                                />
                              </linearGradient>
                            </defs>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Tren Insiden Bulanan
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white">
                        <option>6 Bulan</option>
                        <option>12 Bulan</option>
                        <option>24 Bulan</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorIncidents"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3B82F6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3B82F6"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorSeverity"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#F59E0B"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#F59E0B"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis yAxisId="left" stroke="#3B82F6" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#F59E0B"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          }}
                        />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="incidents"
                          stroke="#3B82F6"
                          fillOpacity={1}
                          fill="url(#colorIncidents)"
                          name="Jumlah Insiden"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="severity"
                          stroke="#F59E0B"
                          fillOpacity={1}
                          fill="url(#colorSeverity)"
                          name="Avg. Severity"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Incident Type Distribution (Pie Chart) */}
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Distribusi Jenis Insiden
                  </h3>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart for Capability Assessment (Example) */}
                <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Evaluasi Kesiapan Bencana Berdasarkan Jenis
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 150]}
                          stroke="#374151"
                        />
                        <Radar
                          name="Kesiapan Saat Ini"
                          dataKey="A"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Target Kesiapan"
                          dataKey="B"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          }}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Historical Data Tab */}
          {activeTab === 'historical' && (
            <motion.div
              key="historical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari insiden..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                    {showFilters ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 ${viewMode === 'grid' ? 'bg-blue-600/50 text-white' : 'text-slate-300'} hover:bg-slate-700/50 transition-all duration-300`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 ${viewMode === 'list' ? 'bg-blue-600/50 text-white' : 'text-slate-300'} hover:bg-slate-700/50 transition-all duration-300`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
                  >
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-slate-300 mb-1"
                      >
                        Dari Tanggal
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="w-full sm:w-auto bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-slate-300 mb-1"
                      >
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="w-full sm:w-auto bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-slate-300 mb-1"
                      >
                        Dari Tanggal
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="w-full sm:w-auto bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-slate-300 mb-1"
                      >
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="w-full sm:w-auto bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sortBy"
                        className="block text-sm font-medium text-slate-300 mb-1"
                      >
                        Urutkan Berdasarkan
                      </label>
                      <select
                        id="sortBy"
                        className="w-full sm:w-auto bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white"
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as 'date' | 'severity' | 'type',
                          )
                        }
                      >
                        <option value="date">Tanggal</option>
                        <option value="severity">Keparahan</option>
                        <option value="type">Jenis</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="sortOrder"
                        className="block text-sm font-medium text-slate-300 mb-1"
                      >
                        Urutan
                      </label>
                      <select
                        id="sortOrder"
                        className="w-full sm:w-auto bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white"
                        value={sortOrder}
                        onChange={(e) =>
                          setSortOrder(e.target.value as 'asc' | 'desc')
                        }
                      >
                        <option value="desc">Terbaru/Tertinggi</option>
                        <option value="asc">Terlama/Terendah</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Incident List/Grid */}
              {filteredIncidents.length > 0 ? (
                viewMode === 'grid' ? (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredIncidents.map((incident) => (
                      <motion.div
                        key={incident.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-700/40 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-blue-400 flex items-center">
                            <Layers className="w-4 h-4 mr-2" /> {incident.type}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}
                          >
                            {incident.status === 'resolved'
                              ? 'Selesai'
                              : incident.status === 'ongoing'
                                ? 'Berlangsung'
                                : 'Dipantau'}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {incident.location}
                        </h4>
                        <p className="text-slate-400 text-sm line-clamp-2">
                          {incident.description}
                        </p>
                        <div className="mt-4 text-sm text-slate-400">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                            <span>
                              {new Date(incident.date).toLocaleDateString(
                                'id-ID',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-slate-500" />
                            <span>
                              Tingkat Keparahan:{' '}
                              <span
                                className={`font-semibold ${getSeverityColor(incident.severity)}`}
                              >
                                {incident.severity}/10
                              </span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
                  >
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                          >
                            Jenis
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                          >
                            Lokasi
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                          >
                            Tanggal
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                          >
                            Keparahan
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                          >
                            Kerugian
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <AnimatePresence>
                          {filteredIncidents.map((incident) => (
                            <motion.tr
                              key={incident.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="hover:bg-slate-700/30 transition-colors duration-200"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                {incident.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                {incident.location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                {new Date(incident.date).toLocaleDateString(
                                  'id-ID',
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                <span
                                  className={getSeverityColor(
                                    incident.severity,
                                  )}
                                >
                                  {incident.severity}/10
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(incident.status)}`}
                                >
                                  {incident.status === 'resolved'
                                    ? 'Selesai'
                                    : incident.status === 'ongoing'
                                      ? 'Berlangsung'
                                      : 'Dipantau'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                {incident.reportedLosses
                                  ? `Rp ${incident.reportedLosses.toLocaleString('id-ID')}`
                                  : 'N/A'}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </motion.div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl"
                >
                  <Info className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Tidak ada data insiden yang cocok dengan filter Anda.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-blue-400" /> Analisis AI
                  Berbasis Gemini
                </h3>
                <p className="text-slate-400 mb-6">
                  Gunakan kecerdasan buatan untuk mendapatkan wawasan mendalam
                  dari data insiden historis. Anda bisa memilih preset analisis
                  atau menulis prompt Anda sendiri.
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">
                    Pilih Preset Analisis:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => handlePresetAnalysis('pola_banjir')}
                      className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 transition-all duration-300"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Pola Banjir</span>
                    </button>
                    <button
                      onClick={() =>
                        handlePresetAnalysis('dampak_infrastruktur')
                      }
                      className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 transition-all duration-300"
                    >
                      <Target className="w-4 h-4" />
                      <span>Dampak Infrastruktur</span>
                    </button>
                    <button
                      onClick={() =>
                        handlePresetAnalysis('efektivitas_respons')
                      }
                      className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 transition-all duration-300"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Efektivitas Respons</span>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">
                    Atau Tulis Prompt Kustom Anda:
                  </h4>
                  <textarea
                    className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-h-[120px]"
                    placeholder="Contoh: 'Berikan analisis tren kerugian finansial dari insiden gempa bumi selama 5 tahun terakhir.'"
                    value={customAnalysisPrompt}
                    onChange={(e) => setCustomAnalysisPrompt(e.target.value)}
                  ></textarea>
                </div>

                <motion.button
                  onClick={() => runHistoricalAnalysis()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isLoadingAnalysis ||
                    (!customAnalysisPrompt && !geminiAnalysis)
                  }
                >
                  {isLoadingAnalysis ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menganalisis Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Jalankan Analisis AI</span>
                    </>
                  )}
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {isLoadingAnalysis && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center"
                  >
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-300 text-lg font-medium">
                      AI sedang bekerja keras menghasilkan wawasan...
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Ini mungkin memakan waktu beberapa detik.
                    </p>
                  </motion.div>
                )}

                {analysisError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-900/40 backdrop-blur-sm border border-red-700/50 rounded-2xl p-6 flex items-center space-x-4"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div>
                      <h4 className="text-red-300 font-semibold">
                        Terjadi Kesalahan
                      </h4>
                      <p className="text-red-400 text-sm">{analysisError}</p>
                    </div>
                  </motion.div>
                )}

                {geminiAnalysis && !isLoadingAnalysis && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />{' '}
                      Hasil Analisis Gemini
                    </h3>
                    <div className="prose prose-invert max-w-none text-slate-300">
                      {/* Using dangerouslySetInnerHTML for Markdown-like content. Be cautious with untrusted input. */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: geminiAnalysis
                            .replace(/\n/g, '<br/>')
                            .replace(/## (.*)/g, '<h2>$1</h2>')
                            .replace(/### (.*)/g, '<h3>$1</h3>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
