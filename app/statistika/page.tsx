// FILE: app/statistika/page.tsx

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
  RefreshCw,
  Loader2,
  AlertTriangle,
  History,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HistoricalIncident, ChartDataPoint, StatCard } from './statistika.types';
import { generateChartData } from './statistika.utils';
import GeminiChatSection from './components/GeminiChatSection';
import StatistikOverview from './components/StatistikOverview';
import StatistikHistorical from './components/StatistikHistorical';

export default function StatistikPage() {
  // State utama
  const [activeTab, setActiveTab] = useState<'overview' | 'historical'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State data
  const [historicalIncidents, setHistoricalIncidents] = useState<HistoricalIncident[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // State filter & sort
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State Gemini
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Fetch data insiden
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/statistika/incidents');
      if (!response.ok) throw new Error('Gagal mengambil data insiden');
      const data: HistoricalIncident[] = await response.json();
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

  // Update chart berdasarkan tanggal
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

  // Stat cards
  const statCards: StatCard[] = [
    {
      title: 'Total Insiden',
      value: historicalIncidents.length,
      change: 12,
      changeType: 'increase',
      icon: <Activity className="w-6 h-6" />,
      color: 'blue',
      trend: [],
      description: 'Insiden tercatat',
    },
    {
      title: 'Pengungsi',
      value: historicalIncidents
        .reduce((acc, curr) => acc + (curr.evacuees || 0), 0)
        .toLocaleString('id-ID'),
      change: 20,
      changeType: 'increase',
      icon: <Shield className="w-6 h-6" />,
      color: 'cyan',
      trend: [],
      description: 'Orang dievakuasi',
    },
  ];

  // Filter & sort
  const filteredIncidents = historicalIncidents
    .filter((incident) => filterType === 'all' || incident.type.toLowerCase() === filterType.toLowerCase())
    .filter(
      (incident) =>
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'severity') {
        return sortOrder === 'desc' ? b.severity - a.severity : a.severity - b.severity;
      } else {
        return sortOrder === 'desc' ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type);
      }
    });

  // Gemini handler
  const handleGeminiAnalysis = useCallback(async () => {
    if (!geminiQuestion.trim()) {
      setGeminiResponse('Silakan masukkan pertanyaan Anda.');
      return;
    }
    setIsGeminiLoading(true);
    setGeminiResponse(null);

    try {
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: geminiQuestion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal terhubung ke Gemini API');
      }

      const data = await response.json();
      setGeminiResponse(data.response);
    } catch (err: any) {
      setGeminiResponse(`Terjadi kesalahan saat menganalisis: ${err.message}`);
    } finally {
      setIsGeminiLoading(false);
    }
  }, [geminiQuestion]);

  // Render loading & error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <p className="text-red-500 font-semibold">Terjadi kesalahan: {error}</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard Statistika</h1>
          <div className="flex gap-3">
            <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'outline'}>
              Overview
            </Button>
            <Button onClick={() => setActiveTab('historical')} variant={activeTab === 'historical' ? 'default' : 'outline'}>
              Historical
            </Button>
            <Button onClick={() => setShowFilters((prev) => !prev)} variant="outline">
              <Filter className="w-4 h-4 mr-1" /> Filter
            </Button>
          </div>
        </div>

        {/* Gemini Section */}
        <GeminiChatSection
          geminiQuestion={geminiQuestion}
          setGeminiQuestion={setGeminiQuestion}
          geminiResponse={geminiResponse}
          isGeminiLoading={isGeminiLoading}
          handleGeminiAnalysis={handleGeminiAnalysis}
        />

        {/* Filters (toggle) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800 rounded-lg p-4 mb-6"
            >
              {/* Filter Panel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-700 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-700 rounded"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StatistikOverview statCards={statCards} chartData={chartData} />
            </motion.div>
          )}

          {activeTab === 'historical' && (
            <motion.div
              key="historical"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StatistikHistorical
                filteredIncidents={filteredIncidents}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
