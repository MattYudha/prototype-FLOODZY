'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { format, subHours, getHours } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, AlertCircle } from 'lucide-react';
import { normalizeSeries, ChartRow } from '@/lib/utils';

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
      const supabase = createSupabaseBrowserClient();
      const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();

      const { data, error } = await supabase
        .from('laporan_banjir')
        .select('created_at')
        .gte('created_at', twentyFourHoursAgo);

      if (error) {
        throw error;
      }

      const hourlyCounts: { [key: string]: number } = {};
      for (let i = 0; i < 24; i++) {
        const hour = getHours(subHours(new Date(), 23 - i)); // Get hours from 23 hours ago to current hour
        hourlyCounts[hour.toString().padStart(2, '0')] = 0;
      }

      data.forEach(report => {
        const reportDate = new Date(report.created_at);
        if (!isNaN(reportDate.getTime())) { // Check if date is valid
          const hour = getHours(reportDate);
          const formattedHour = hour.toString().padStart(2, '0');
          if (hourlyCounts[formattedHour] !== undefined) {
            hourlyCounts[formattedHour]++;
          }
        }
      });

      const formattedData = Object.keys(hourlyCounts).sort().map(hour => ({
        hour: `${hour}:00`,
        count: hourlyCounts[hour],
      }));

      const safeData = normalizeSeries(formattedData as ChartRow[], DATA_KEYS) as FloodReportData[];

      console.log('[Chart] range=24h len=', Array.isArray(safeData) ? safeData.length : 0);
      if (safeData.length > 0) {
        console.table(safeData.slice(0, 3));
      }

      setChartData(safeData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHourlyFloodReports();
    const interval = setInterval(fetchHourlyFloodReports, 24 * 60 * 60 * 1000); // Refresh every 24 hours
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
        <p className="text-gray-400">Memuat data statistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">Gagal memuat statistik: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Laporan Banjir 24 Jam Terakhir</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartData && chartData.length > 0 ? (
          <BarChart data={chartData} margin={{
            top: 5, right: 10, left: 10, bottom: 5,
          }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="hour" stroke="#CBD5E0" tickFormatter={(tick) => format(new Date().setHours(parseInt(tick.split(':')[0])), 'HH:mm', { locale: id })} />
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
          <div className="flex items-center justify-center h-full text-gray-500">
            Tidak ada data laporan banjir tersedia.
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default FloodReportChart;
