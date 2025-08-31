'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Zap, Clock, ShieldCheck, ShieldAlert, Shield, Activity, TrendingUp, AlertTriangle, ChevronsUpDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WaterLevelPost, PumpData } from '@/lib/api';
import { getTimeAgo } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/Button'; // Ensure Button is imported
import { Input } from '@/components/ui/input'; // Import Input
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'; // Import Table components

// Props interface
interface InfrastructureStatusCardProps {
  waterLevelPosts: WaterLevelPost[];
  pumpStatusData: PumpData[];
}

// Helper functions
const getStatusBadgeVariant = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('normal') || lowerStatus.includes('aman')) return 'success';
  if (lowerStatus.includes('siaga') || lowerStatus.includes('waspada')) return 'warning';
  if (lowerStatus.includes('bahaya') || lowerStatus.includes('awas')) return 'danger';
  return 'default';
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

const ITEMS_PER_LOAD = 10; // Define how many items to load at once

// Main component with new layout
export function InfrastructureStatusCard({ waterLevelPosts, pumpStatusData }: InfrastructureStatusCardProps) {
  // State for Water Level section
  const [waterLevelSearchTerm, setWaterLevelSearchTerm] = useState('');
  const [waterLevelVisibleCount, setWaterLevelVisibleCount] = useState(ITEMS_PER_LOAD);

  // State for Pump Status section
  const [pumpSearchTerm, setPumpSearchTerm] = useState('');
  const [pumpVisibleCount, setPumpVisibleCount] = useState(ITEMS_PER_LOAD);

  // Filtered data for Water Level
  const filteredWaterLevelPosts = waterLevelPosts.filter(post =>
    post.name.toLowerCase().includes(waterLevelSearchTerm.toLowerCase()) ||
    post.status?.toLowerCase().includes(waterLevelSearchTerm.toLowerCase())
  );

  // Filtered data for Pump Status
  const filteredPumpData = pumpStatusData.filter(pump =>
    pump.nama_infrastruktur.toLowerCase().includes(pumpSearchTerm.toLowerCase()) ||
    pump.kondisi_bangunan?.toLowerCase().includes(pumpSearchTerm.toLowerCase())
  );

  // Handlers for "Load More"
  const loadMoreWaterLevels = () => {
    setWaterLevelVisibleCount(prevCount => prevCount + ITEMS_PER_LOAD);
  };

  const loadMorePumps = () => {
    setPumpVisibleCount(prevCount => prevCount + ITEMS_PER_LOAD);
  };

  if (!waterLevelPosts || !pumpStatusData) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
          <Collapsible defaultOpen={false}> {/* Changed to false for initial closed state */}
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 cursor-pointer transition-colors border border-slate-700">
                <div className="flex items-center space-x-3">
                  <Waves className="h-6 w-6 text-sky-400" />
                  <h3 className="text-lg font-semibold text-white">Lihat Status Tinggi Air</h3>
                </div>
                <ChevronsUpDown className="h-5 w-5 text-slate-400" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
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
              <div className="overflow-x-auto"> {/* Added overflow-x-auto for table responsiveness */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-400">Pos</TableHead>
                      <TableHead className="text-slate-400">Tinggi</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWaterLevelPosts.slice(0, waterLevelVisibleCount).map((post) => (
                      <TableRow key={post.id} className="border-slate-700/50">
                        <TableCell className="font-medium text-white">{post.name}</TableCell>
                        <TableCell className="text-white">{post.water_level} {post.unit}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(post.status)}>{post.status}</Badge></TableCell>
                        <TableCell className="text-slate-400 text-sm">{getTimeAgo(post.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredWaterLevelPosts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400">Tidak ada data pos air.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredWaterLevelPosts.length > waterLevelVisibleCount && (
                <Button onClick={loadMoreWaterLevels} variant="outline" className="w-full mt-4 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  Muat Lebih Banyak ({filteredWaterLevelPosts.length - waterLevelVisibleCount} tersisa)
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Right Column: Pump Status */}
          <Collapsible defaultOpen={false}> {/* Changed to false for initial closed state */}
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 cursor-pointer transition-colors border border-slate-700">
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Lihat Status Pompa Banjir</h3>
                </div>
                <ChevronsUpDown className="h-5 w-5 text-slate-400" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
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
              <div className="overflow-x-auto"> {/* Added overflow-x-auto for table responsiveness */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-400">Nama Pompa</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPumpData.slice(0, pumpVisibleCount).map((pump) => (
                      <TableRow key={pump.id} className="border-slate-700/50">
                        <TableCell className="font-medium text-white">{pump.nama_infrastruktur}</TableCell>
                        <TableCell>
                          <Badge variant={pump.kondisi_bangunan?.toLowerCase() === 'aktif' ? 'success' : 'default'}>
                            {pump.kondisi_bangunan || 'Tidak Diketahui'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPumpData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-slate-400">Tidak ada data pompa.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredPumpData.length > pumpVisibleCount && (
                <Button onClick={loadMorePumps} variant="outline" className="w-full mt-4 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  Muat Lebih Banyak ({filteredPumpData.length - pumpVisibleCount} tersisa)
                </Button>
              )}
            </CollapsibleContent>
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
