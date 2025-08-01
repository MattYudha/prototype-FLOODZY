'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Clock, Bell, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// UI Components
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// App Components
import DataSensorAnalysis from '@/components/data-sensor/DataSensorAnalysis';
import StatisticsDashboard from '@/components/dashboard/StatisticsDashboard';
import ReportEmergencyModal from '@/components/data-sensor/ReportEmergencyModal';

// Mock data for alert settings
const mockSensors = [
  { id: 'sensor-1', name: 'Sensor Pintu Air Manggarai', level: 750 },
  { id: 'sensor-2', name: 'Sensor Bendung Katulampa', level: 820 },
  { id: 'sensor-3', name: 'Sensor Kali Ciliwung', level: 680 },
];

// --- Modal Components ---

const ExportDataModal = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [fileFormat, setFileFormat] = useState('csv');
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Silakan pilih rentang tanggal terlebih dahulu.');
      return;
    }
    
    try {
      const response = await fetch('/api/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: format(dateRange.from, 'yyyy-MM-dd'),
          to: format(dateRange.to, 'yyyy-MM-dd'),
          format: fileFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_sensor.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Data berhasil diekspor sebagai file ${fileFormat.toUpperCase()}.`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Gagal mengekspor data: ${error instanceof Error ? error.message : 'Terjadi kesalahan.'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-left">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Data Sensor</DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal dan format file untuk mengekspor data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date-range" className="text-right">
              Tanggal
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pilih rentang tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select value={fileFormat} onValueChange={setFileFormat}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xlsx">XLSX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ScheduleReportModal = () => {
  const [frequency, setFrequency] = useState('weekly');
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSchedule = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Silakan masukkan alamat email yang valid.');
      return;
    }
    
    console.log('Scheduling report:', { frequency, email });
    toast.success(`Laporan terjadwal telah diatur untuk dikirim ke ${email}.`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-left">
          <Clock className="mr-2 h-4 w-4" />
          Jadwal Laporan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Jadwalkan Laporan Otomatis</DialogTitle>
          <DialogDescription>
            Atur pengiriman laporan data sensor secara berkala ke email Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frekuensi
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih frekuensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="nama@contoh.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSchedule}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Simpan Jadwal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AlertSettingsModal = () => {
  const [thresholds, setThresholds] = useState<Record<string, number>>(() =>
    Object.fromEntries(mockSensors.map(s => [s.id, s.level]))
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveSettings = () => {
    console.log('Saving alert settings:', thresholds);
    toast.success('Pengaturan notifikasi berhasil disimpan.');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-left">
          <Bell className="mr-2 h-4 w-4" />
          Pengaturan Notifikasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Notifikasi Sensor</DialogTitle>
          <DialogDescription>
            Atur ambang batas ketinggian air untuk menerima notifikasi.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {mockSensors.map(sensor => (
            <div key={sensor.id} className="space-y-2">
              <Label htmlFor={`threshold-${sensor.id}`}>{sensor.name}</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id={`threshold-${sensor.id}`}
                  min={0}
                  max={1500}
                  step={10}
                  value={[thresholds[sensor.id]]}
                  onValueChange={(value) =>
                    setThresholds(prev => ({ ...prev, [sensor.id]: value[0] }))
                  }
                  className="flex-1"
                />
                <span className="text-sm font-medium w-20 text-right">
                  {thresholds[sensor.id]} cm
                </span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSaveSettings}>
            Simpan Pengaturan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page Component ---

const DataSensorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali ke Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Analisis Data Sensor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="container mx-auto px-6 py-8">
        <StatisticsDashboard />
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8">
          <DataSensorAnalysis />
        </div>
        
      </main>
    </div>
  );
};

export default DataSensorPage;
