'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const classifyWaterLevel = (waterLevel: number): string => {
  if (waterLevel <= 10) {
    return 'Semata kaki';
  } else if (waterLevel <= 40) {
    return 'Selutut';
  } else if (waterLevel <= 70) {
    return 'Sepaha';
  } else if (waterLevel <= 100) {
    return 'Sepusar';
  } else {
    return 'Lebih dari sepusar';
  }
};

interface FloodReport {
  id: string;
  reporterName: string;
  location: string;
  waterLevel: number;
  timestamp: string;
  status: string;
}

const FloodReportList: React.FC = () => {
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/laporan');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FloodReport[] = await response.json();
        setReports(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8"><CardContent>Loading reports...</CardContent></Card>;
  }

  if (error) {
    return <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8"><CardContent>Error: {error}</CardContent></Card>;
  }

  const filteredReports = reports.filter(report => {
    if (filter === 'all') {
      return true;
    }
    return classifyWaterLevel(report.waterLevel) === filter;
  });

  return (
    <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Laporan Banjir Terbaru</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Ketinggian Air" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ketinggian</SelectItem>
            <SelectItem value="Semata kaki">Semata kaki</SelectItem>
            <SelectItem value="Selutut">Selutut</SelectItem>
            <SelectItem value="Sepaha">Sepaha</SelectItem>
            <SelectItem value="Sepusar">Sepusar</SelectItem>
            <SelectItem value="Lebih dari sepusar">Lebih dari sepusar</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredReports.length === 0 ? (
          <p>Tidak ada laporan banjir saat ini.</p>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                <p className="text-lg font-semibold">Lokasi: {report.location}</p>
                <p>Pelapor: {report.reporterName}</p>
                <p>Deskripsi Singkat: {report.status}</p>
                <p>Tinggi Air: {report.waterLevel} cm ({classifyWaterLevel(report.waterLevel)})</p>
                <p>Waktu Laporan: {format(new Date(report.timestamp), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloodReportList;
