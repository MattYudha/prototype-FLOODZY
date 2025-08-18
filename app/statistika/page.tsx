'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
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

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/statistika/incidents');
      if (!response.ok) {
        throw new Error('Gagal mengambil data insiden');
      }
      const data: HistoricalIncident[] = await response.json();
      console.log('[Frontend] Fetched data:', data); // Log data received from API
      setHistoricalIncidents(data);
      setChartData(generateChartData(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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
      icon: <Activity className="w-5 h-5" />,
      color: 'blue',
      trend: [20, 25, 18, 32, 28, 35, 30],
    },
    {
      title: 'Tingkat Keparahan Avg',
      value: (historicalIncidents.reduce((acc, curr) => acc + curr.severity, 0) / (historicalIncidents.length || 1)).toFixed(1),
      change: -5,
      changeType: 'decrease',
      icon: <Gauge className="w-5 h-5" />,
      color: 'orange',
      trend: [8, 7.5, 7.8, 7.2, 6.9, 7.2, 7.1],
    },
    {
      title: 'Kerugian Total',
      value: `Rp ${(historicalIncidents.reduce((acc, curr) => acc + (curr.reported_losses || 0), 0) / 1e9).toFixed(1)}T`,
      change: 8,
      changeType: 'increase',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'red',
      trend: [5, 6, 7, 8, 9, 9.5, 9.8],
    },
    {
      title: 'Waktu Respons Avg',
      value: `${(historicalIncidents.reduce((acc, curr) => acc + (curr.response_time_minutes || 0), 0) / (historicalIncidents.length || 1)).toFixed(0)} menit`,
      change: -15,
      changeType: 'decrease',
      icon: <Clock className="w-5 h-5" />,
      color: 'green',
      trend: [60, 55, 50, 45, 42, 40, 42],
    },
    {
      title: 'Korban Jiwa',
      value: historicalIncidents.reduce((acc, curr) => acc + (curr.casualties || 0), 0),
      change: -50,
      changeType: 'decrease',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
      trend: [8, 6, 4, 3, 2, 1, 3],
    },
    {
      title: 'Pengungsi',
      value: historicalIncidents.reduce((acc, curr) => acc + (curr.evacuees || 0), 0).toLocaleString('id-ID'),
      change: 20,
      changeType: 'increase',
      icon: <Shield className="w-5 h-5" />,
      color: 'cyan',
      trend: [4000, 4500, 5000, 5200, 5400, 5420, 5400],
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

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white">Memuat Data Statistik...</h2>
                <p className="text-slate-400 mt-2">Silakan tunggu sebentar.</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
            <div className="text-center bg-slate-800 p-8 rounded-2xl border border-red-500/30">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white">Gagal Memuat Data</h2>
                <p className="text-slate-400 mt-2">Terjadi kesalahan: {error}</p>
                <Button onClick={fetchIncidents} className="mt-6">Coba Lagi</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ... (rest of the JSX remains the same) */}
    </div>
  );
}
