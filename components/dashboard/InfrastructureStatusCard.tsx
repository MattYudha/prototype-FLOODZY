'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Zap, Clock, ShieldCheck, ShieldAlert, Shield, Activity, TrendingUp, AlertTriangle, ChevronsUpDown, Search, CircleDot, CircleOff, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WaterLevelPost, PumpData } from '@/lib/api';
import { getTimeAgo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
// Removed Table components as we are using CSS Grid for layout
import { useVirtualizer } from '@tanstack/react-virtual';

// Props interface
interface InfrastructureStatusCardProps {
  waterLevelPosts: WaterLevelPost[];
  pumpStatusData: PumpData[];
}

// Helper functions
const getBadgeVariant = (status: string) => {
  if (!status) return 'default';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('online') || lowerStatus.includes('normal')) {
    return 'success'; // Hijau
  }
  if (lowerStatus.includes('offline') || lowerStatus.includes('siaga i')) {
    return 'destructive'; // Merah
  }
  if (lowerStatus.includes('maintenance') || lowerStatus.includes('warning') || lowerStatus.includes('siaga ii')) {
    return 'warning'; // Kuning
  }
  if (lowerStatus.includes('siaga iii')) {
    return 'secondary'; // Abu-abu
  }
  return 'default'; // Warna default jika tidak ada yang cocok
};

const getStatusIcon = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('online') || lowerStatus.includes('aktif')) return <CircleDot className="h-3 w-3 text-emerald-500" />;
  if (lowerStatus.includes('offline')) return <CircleOff className="h-3 w-3 text-red-500" />;
  if (lowerStatus.includes('maintenance')) return <Wrench className="h-3 w-3 text-amber-500" />;
  return null;
};

const getWaterLevelIcon = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('bahaya') || lowerStatus.includes('awas')) {
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  }
  if (lowerStatus.includes('siaga') || lowerStatus.includes('waspada')) {
    return <TrendingUp className="h-5 w-5 text-amber-400" />;
  }
  return <Waves className="h-5 w-5 text-blue-400" />;
};

const getPumpStatusIcon = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'aktif') return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
  if (lowerStatus === 'siaga') return <ShieldAlert className="h-4 w-4 text-amber-500" />;
  return <Shield className="h-4 w-4 text-gray-500" />;
};

// Main component with new layout
export function InfrastructureStatusCard({ waterLevelPosts, pumpStatusData }: InfrastructureStatusCardProps) {
  // State for Water Level section
  const [waterLevelSearchTerm, setWaterLevelSearchTerm] = useState('');
  const [isWaterLevelExpanded, setIsWaterLevelExpanded] = useState(false);

  // State for Pump Status section
  const [pumpSearchTerm, setPumpSearchTerm] = useState('');
  const [isPumpExpanded, setIsPumpExpanded] = useState(false);

  // Filtered data for Water Level
  const filteredWaterLevelPosts = waterLevelPosts.filter(post =>
    post.name.toLowerCase().includes(waterLevelSearchTerm.toLowerCase()) ||
    post.status?.toLowerCase().includes(waterLevelSearchTerm.toLowerCase())
  );

  // Filtered data for Pump Status
  const filteredPumpData = pumpStatusData.filter(pump =>
    pump.nama_infrastruktur.toLowerCase().includes(pumpSearchTerm.toLowerCase()) ||
    pump.kondisi_bangunan?.toLowerCase().includes(pumpSearchTerm.toLowerCase()) ||
    pump.lokasi?.toLowerCase().includes(pumpSearchTerm.toLowerCase()) // Added location search
  );

  // Virtualizer for Water Level Table
  const waterLevelParentRef = useRef<HTMLDivElement>(null);
  const waterLevelRowVirtualizer = useVirtualizer({
    count: filteredWaterLevelPosts.length,
    getScrollElement: () => waterLevelParentRef.current,
    estimateSize: () => 48, // Estimate row height in pixels
    overscan: 5, // Render 5 items above and below the visible area
  });

  // Virtualizer for Pump Status Table
  const pumpParentRef = useRef<HTMLDivElement>(null);
  const pumpRowVirtualizer = useVirtualizer({
    count: filteredPumpData.length,
    getScrollElement: () => pumpParentRef.current,
    estimateSize: () => 48, // Estimate row height in pixels
    overscan: 5, // Render 5 items above and below the visible area
  });

  if (!waterLevelPosts || !pumpStatusData) {
    return null;
  }

  const collapsibleContentVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto", transition: { opacity: { duration: 0.3 }, height: { duration: 0.4 } } },
    exit: { opacity: 0, height: 0, transition: { opacity: { duration: 0.2 }, height: { duration: 0.3 } } },
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-700/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pantauan Infrastruktur Kritis</h2>
              <p className="text-sm text-slate-400 mt-1">Klik untuk melihat detail data real-time</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Live Data</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left Column: Water Level */}
          <Collapsible open={isWaterLevelExpanded} onOpenChange={setIsWaterLevelExpanded}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 cursor-pointer transition-colors border border-slate-700">
                <div className="flex items-center space-x-3">
                  <Waves className="h-6 w-6 text-sky-400" />
                  <h3 className="text-lg font-semibold text-white">Lihat Status Tinggi Air</h3>
                </div>
                <ChevronsUpDown className="h-5 w-5 text-slate-400" />
              </div>
            </CollapsibleTrigger>
            <AnimatePresence>
              {isWaterLevelExpanded && (
                <motion.div
                  key="water-level-content"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={collapsibleContentVariants}
                  className="overflow-hidden" // Important for height animation
                >
                  <CollapsibleContent className="pt-4">
                    <div className="mt-4 flex flex-col">
                      {/* Input Pencarian */}
                      <div className="relative mb-4">
                        <Input
                          type="text"
                          placeholder="Cari pos air..."
                          value={waterLevelSearchTerm}
                          onChange={(e) => setWaterLevelSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/80 border-slate-700/50 text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                      {/* Header Tabel (di luar area scroll) */}
                      <div className="grid grid-cols-4 gap-4 px-2 pb-2 text-sm font-semibold text-slate-400 border-b border-slate-700/50">
                        <div className="whitespace-nowrap">Pos</div>
                        <div className="whitespace-nowrap">Tinggi</div>
                        <div className="whitespace-nowrap">Status</div>
                        <div className="whitespace-nowrap">Update</div>
                      </div>
                      {/* Container untuk scroll (PERBAIKAN UTAMA DI SINI) */}
                      <div
                        ref={waterLevelParentRef}
                        className="w-full h-[250px] overflow-y-auto custom-scrollbar rounded-lg border border-slate-700/50" // WAJIB punya tinggi yang pasti, misal: h-[250px]
                      >
                        {/* Container untuk total tinggi, agar scrollbar benar */}
                        <div
                          style={{
                            height: `${waterLevelRowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative', // WAJIB relative untuk positioning anak
                          }}
                        >
                          {/* Render hanya item yang terlihat */}
                          {waterLevelRowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const post = filteredWaterLevelPosts[virtualItem.index];
                            return (
                              <div
                                key={virtualItem.key}
                                style={{
                                  position: 'absolute', // Item diposisikan absolut
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: `${virtualItem.size}px`,
                                  transform: `translateY(${virtualItem.start}px)`,
                                }}
                                className="grid grid-cols-4 items-center gap-4 p-2 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                              >
                                <span className="font-medium text-white whitespace-nowrap truncate">{post.name}</span>
                                <span className="text-white whitespace-nowrap truncate">{post.water_level} {post.unit}</span>
                                <div className="whitespace-nowrap">
                                  <Badge variant={getBadgeVariant(post.status)} className="flex items-center gap-1">
                                    {getStatusIcon(post.status)} {post.status}
                                  </Badge>
                                </div>
                                <span className="text-slate-400 text-sm whitespace-nowrap truncate">{getTimeAgo(post.timestamp)}</span>
                              </div>
                            );
                          })}
                          {filteredWaterLevelPosts.length === 0 && (
                            <div className="grid grid-cols-4 text-center text-slate-400 py-4">
                              <div className="col-span-4 flex flex-col items-center justify-center">
                                <Search className="h-6 w-6 mb-2" />
                                Tidak ada data pos air yang ditemukan.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Collapsible>

          {/* Right Column: Pump Status */}
          <Collapsible open={isPumpExpanded} onOpenChange={setIsPumpExpanded}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 cursor-pointer transition-colors border border-slate-700">
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Lihat Status Pompa Banjir</h3>
                </div>
                <ChevronsUpDown className="h-5 w-5 text-slate-400" />
              </div>
            </CollapsibleTrigger>
            <AnimatePresence>
              {isPumpExpanded && (
                <motion.div
                  key="pump-status-content"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={collapsibleContentVariants}
                  className="overflow-hidden" // Important for height animation
                >
                  <CollapsibleContent className="pt-4">
                    <div className="mt-4 flex flex-col">
                      {/* Input Pencarian */}
                      <div className="relative mb-4">
                        <Input
                          type="text"
                          placeholder="Cari pompa..."
                          value={pumpSearchTerm}
                          onChange={(e) => setPumpSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/80 border-slate-700/50 text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                      {/* Header Tabel (di luar area scroll) */}
                      <div className="grid grid-cols-3 gap-4 px-2 pb-2 text-sm font-semibold text-slate-400 border-b border-slate-700/50">
                        <div className="whitespace-nowrap">Nama Pompa</div>
                        <div className="whitespace-nowrap">Lokasi</div>
                        <div className="whitespace-nowrap">Status</div>
                      </div>
                      {/* Container untuk scroll (PERBAIKAN UTAMA DI SINI) */}
                      <div
                        ref={pumpParentRef}
                        className="w-full h-[250px] overflow-y-auto custom-scrollbar rounded-lg border border-slate-700/50" // WAJIB punya tinggi yang pasti, misal: h-[250px]
                      >
                        {/* Container untuk total tinggi, agar scrollbar benar */}
                        <div
                          style={{
                            height: `${pumpRowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative', // WAJIB relative untuk positioning anak
                          }}
                        >
                          {/* Render hanya item yang terlihat */}
                          {pumpRowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const pump = filteredPumpData[virtualItem.index];
                            return (
                              <div
                                key={virtualItem.key}
                                style={{
                                  position: 'absolute', // Item diposisikan absolut
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: `${virtualItem.size}px`,
                                  transform: `translateY(${virtualItem.start}px)`,
                                }}
                                className="grid grid-cols-3 items-center gap-4 p-2 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                              >
                                <span className="font-medium text-white whitespace-nowrap truncate">{pump.nama_infrastruktur}</span>
                                <span className="text-slate-400 text-sm whitespace-nowrap truncate">{pump.lokasi || 'N/A'}</span>
                                <div className="whitespace-nowrap">
                                  <Badge variant={getBadgeVariant(pump.kondisi_bangunan)} className="flex items-center gap-1">
                                    {getStatusIcon(pump.kondisi_bangunan)} {pump.kondisi_bangunan || 'Tidak Diketahui'}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                          {filteredPumpData.length === 0 && (
                            <div className="grid grid-cols-3 text-center text-slate-400 py-4">
                              <div className="col-span-3 flex flex-col items-center justify-center">
                                <Search className="h-6 w-6 mb-2" />
                                Tidak ada data pompa yang ditemukan.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Collapsible>

        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Pos Air Dipantau</p>
              <p className="text-2xl font-bold text-white">{waterLevelPosts.length}</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Total Pompa</p>
              <p className="text-2xl font-bold text-white">{pumpStatusData.length}</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-400">{pumpStatusData.filter(p => p.kondisi_bangunan?.toLowerCase() === 'aktif').length}</p>
              <div className="text-sm text-slate-400">Aktif</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Lokasi Siaga</p>
              <p className="text-2xl font-bold text-amber-400">{waterLevelPosts.filter(p => p.status?.toLowerCase().includes('siaga')).length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}