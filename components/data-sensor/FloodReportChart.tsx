'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // REMOVED
import { format, subHours, getHours } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, AlertCircle } from 'lucide-react';
import { normalizeSeries, ChartRow } from '@/lib/utils';
import { safeFetch, UserFriendlyError } from '@/lib/error-utils'; // ADDED: Import safeFetch and UserFriendlyError

interface FloodReportData {
  hour: string;
  count: number;
}

const DATA_KEYS = ['count'];

const FloodReportChart: React.FC = () => {
  const [chartData, setChartData] = useState<FloodReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHourlyFloodReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // const supabase = createSupabaseBrowserClient(); // REMOVED
      const twentyFourHoursAgo = subHours(new Date(), 24); // Keep as Date object for comparison

      // Fetch data from the new /api/laporan endpoint
      const reports: { id: string; timestamp: string; }[] = await safeFetch(
        '/api/laporan',
        undefined,
        'Gagal memuat data laporan banjir.'
      );

      // Filter reports for the last 24 hours
      const recentReports = reports.filter(report => {
        const reportDate = new Date(report.timestamp);
        return !isNaN(reportDate.getTime()) && reportDate >= twentyFourHoursAgo;
      });

      const hourlyCounts: { [key: string]: number } = {};
      // Initialize counts for the last 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = getHours(subHours(new Date(), 23 - i)); // Get hours from 23 hours ago to current hour
        hourlyCounts[hour.toString().padStart(2, '0')] = 0;
      }

      recentReports.forEach(report => {
        const reportDate = new Date(report.timestamp);
        if (!isNaN(reportDate.getTime())) { // Check if date is valid
          const hour = getHours(reportDate);
          const formattedHour = hour.toString().padStart(2, '0');
          if (hourlyCounts[formattedHour] !== undefined) {
            hourlyCounts[formattedHour]++;
          }
        }
      });

      const formattedData = Object.keys(hourlyCounts).sort().map(hour => ({
        hour: `${hour}:00`, // Keep this format for XAxis tickFormatter
        count: hourlyCounts[hour],
      }));

      const safeData = normalizeSeries(formattedData as ChartRow[], DATA_KEYS) as FloodReportData[];

      console.log('[Chart] range=24h len=', Array.isArray(safeData) ? safeData.length : 0);
      if (safeData.length > 0) {
        console.table(safeData.slice(0, 3));
      }

      setChartData(safeData);
    } catch (err: any) {
      if (err instanceof UserFriendlyError) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan tidak terduga saat memuat data.');
      }
      console.error('Error fetching hourly flood reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHourlyFloodReports();
    // Refresh every 1 hour instead of 24 hours for more dynamic data
    const interval = setInterval(fetchHourlyFloodReports, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-cyan-400 mx-auto mb-3" />
        <p className="text-sm sm:text-base text-gray-400">Memuat data statistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm sm:text-base text-red-400">Gagal memuat statistik: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Laporan Banjir 24 Jam Terakhir</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartData && chartData.length > 0 ? (
          <BarChart data={chartData} margin={{
            top: 5, right: 10, left: 10, bottom: 5,
          }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis
              dataKey="hour"
              stroke="#CBD5E0"
              tickFormatter={(tick) => format(new Date().setHours(parseInt(tick.split(':')[0])), 'HH:mm', { locale: id })}
            />
            <YAxis stroke="#CBD5E0" />
            <Tooltip
              contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#E2E8F0' }}
              itemStyle={{ color: '#A0AEC0' }}
              formatter={(value: number) => [`${value} Laporan`, 'Jumlah']}
            />
            <Bar dataKey="count" fill="#06B6D4" />
          </BarChart>
        ) : (
          <div className="flex items-center justify-center h-full text-sm sm:text-base text-gray-500">
            Tidak ada data laporan banjir tersedia.
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default FloodReportChart;