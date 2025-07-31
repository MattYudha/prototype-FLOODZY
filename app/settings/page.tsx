'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  MapPin,
  Bell,
  Palette,
  Settings,
  Monitor,
  Smartphone,
  Wifi,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Globe,
  Database,
  Accessibility,
  Eye,
  Type,
  MousePointer,
  ChevronDown,
  Map,
} from 'lucide-react';

// Impor asli dari kode lama Anda. Pastikan path ini benar.
import { useTheme } from '@/hooks/useTheme';
import { SelectedLocation } from '../state'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const NOTIFICATION_LEVELS = [
  {
    id: 'danger',
    label: 'Bahaya (Siaga 1 & 2)',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'warning',
    label: 'Peringatan (Siaga 3)',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'info',
    label: 'Informasi',
    color: 'from-blue-500 to-cyan-500',
  },
];

export default function SettingsPage() {
  // --- BLOK LOGIKA INTI (DIAMBIL DARI KODE ASLI, TIDAK DIUBAH) ---

  const { theme, setTheme, isDark } = useTheme();
  const [defaultLocation, setDefaultLocation] = useState<SelectedLocation | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>({});
  const [fontSize, setFontSize] = useState('normal');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dataUpdateInterval, setDataUpdateInterval] = useState(15);
  const [syncOnlyOnWifi, setSyncOnlyOnWifi] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [markerClustering, setMarkerClustering] = useState(true);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [favoriteLocations, setFavoriteLocations] = useState<SelectedLocation[]>([]);
  const [newFavoriteLocationName, setNewFavoriteLocationName] = useState('');
  const [newFavoriteLocationCoords, setNewFavoriteLocationCoords] = useState<SelectedLocation | null>(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const storedLocation = localStorage.getItem('floodzy-default-location');
    if (storedLocation) setDefaultLocation(JSON.parse(storedLocation));

    const storedPrefs = localStorage.getItem('floodzy-notification-prefs');
    if (storedPrefs) {
      setNotificationPrefs(JSON.parse(storedPrefs));
    } else {
      const defaultPrefs = NOTIFICATION_LEVELS.reduce(
        (acc, level) => {
          acc[level.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      setNotificationPrefs(defaultPrefs);
    }

    const storedFontSize = localStorage.getItem('floodzy-font-size');
    if (storedFontSize) {
      setFontSize(storedFontSize);
      document.documentElement.style.fontSize =
        storedFontSize === 'large' ? '18px' : storedFontSize === 'small' ? '14px' : '16px';
    }

    const storedReduceMotion = localStorage.getItem('floodzy-reduce-motion');
    if (storedReduceMotion) {
      const motion = JSON.parse(storedReduceMotion);
      setReduceMotion(motion);
      if (motion) document.documentElement.classList.add('reduce-motion');
    }
    
    const storedDataUpdateInterval = localStorage.getItem('floodzy-data-update-interval');
    if (storedDataUpdateInterval) setDataUpdateInterval(JSON.parse(storedDataUpdateInterval));

    const storedSyncOnlyOnWifi = localStorage.getItem('floodzy-sync-only-on-wifi');
    if (storedSyncOnlyOnWifi) setSyncOnlyOnWifi(JSON.parse(storedSyncOnlyOnWifi));
    
    const storedOfflineMode = localStorage.getItem('floodzy-offline-mode');
    if (storedOfflineMode) setOfflineMode(JSON.parse(storedOfflineMode));

    const storedMarkerClustering = localStorage.getItem('floodzy-marker-clustering');
    if (storedMarkerClustering) setMarkerClustering(JSON.parse(storedMarkerClustering));

    const storedNotificationSoundEnabled = localStorage.getItem('floodzy-notification-sound');
    if (storedNotificationSoundEnabled) setNotificationSoundEnabled(JSON.parse(storedNotificationSoundEnabled));

    const storedFavoriteLocations = localStorage.getItem('floodzy-favorite-locations');
    if (storedFavoriteLocations) setFavoriteLocations(JSON.parse(storedFavoriteLocations));
    
    setIsMounted(true);
  }, []);

  const handleLocationSelect = (location: SelectedLocation) => {
    setDefaultLocation(location);
    localStorage.setItem('floodzy-default-location', JSON.stringify(location));
  };

  const handleNotificationPrefChange = (levelId: string, isChecked: boolean) => {
    const newPrefs = { ...notificationPrefs, [levelId]: isChecked };
    setNotificationPrefs(newPrefs);
    localStorage.setItem('floodzy-notification-prefs', JSON.stringify(newPrefs));
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('floodzy-font-size', size);
    document.documentElement.style.fontSize = size === 'large' ? '18px' : size === 'small' ? '14px' : '16px';
  };

  const handleReduceMotionChange = (enabled: boolean) => {
    setReduceMotion(enabled);
    localStorage.setItem('floodzy-reduce-motion', JSON.stringify(enabled));
    document.documentElement.classList.toggle('reduce-motion', enabled);
  };
  
  const handleDataUpdateIntervalChange = (interval: number) => {
    setDataUpdateInterval(interval);
    localStorage.setItem('floodzy-data-update-interval', JSON.stringify(interval));
  };

  const handleSyncOnlyOnWifiChange = (enabled: boolean) => {
    setSyncOnlyOnWifi(enabled);
    localStorage.setItem('floodzy-sync-only-on-wifi', JSON.stringify(enabled));
  };

  const handleOfflineModeChange = (enabled: boolean) => {
    setOfflineMode(enabled);
    localStorage.setItem('floodzy-offline-mode', JSON.stringify(enabled));
  };
  
  const handleMarkerClusteringChange = (enabled: boolean) => {
    setMarkerClustering(enabled);
    localStorage.setItem('floodzy-marker-clustering', JSON.stringify(enabled));
  };

  const handleNotificationSoundChange = (enabled: boolean) => {
    setNotificationSoundEnabled(enabled);
    localStorage.setItem('floodzy-notification-sound', JSON.stringify(enabled));
  };

  const handleAddFavoriteLocation = () => {
    if (newFavoriteLocationName && newFavoriteLocationCoords && newFavoriteLocationCoords.latitude != null && newFavoriteLocationCoords.longitude != null) {
      const newLocation = { ...newFavoriteLocationCoords, name: newFavoriteLocationName };
      const updatedLocations = [...favoriteLocations, newLocation];
      setFavoriteLocations(updatedLocations);
      localStorage.setItem('floodzy-favorite-locations', JSON.stringify(updatedLocations));
      setNewFavoriteLocationName('');
      setNewFavoriteLocationCoords(null);
    }
  };

  const handleLoadFavoriteLocation = (location: SelectedLocation) => {
    setDefaultLocation(location);
    localStorage.setItem('floodzy-default-location', JSON.stringify(location));
  };

  const handleRemoveFavoriteLocation = (index: number) => {
    const updatedLocations = favoriteLocations.filter((_, i) => i !== index);
    setFavoriteLocations(updatedLocations);
    localStorage.setItem('floodzy-favorite-locations', JSON.stringify(updatedLocations));
  };

  const startEditing = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingName.trim()) {
      const updatedLocations = favoriteLocations.map((loc, i) =>
        i === editingIndex ? { ...loc, name: editingName.trim() } : loc
      );
      setFavoriteLocations(updatedLocations);
      localStorage.setItem('floodzy-favorite-locations', JSON.stringify(updatedLocations));
    }
    setEditingIndex(-1);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditingName('');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Memuat pengaturan...</div>
      </div>
    );
  }

  // --- UI BARU DENGAN TATA LETAK YANG SUDAH DIPERBAIKI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200">
      <div className="relative overflow-hidden bg-slate-900/50 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Pengaturan
              </h1>
              <p className="text-slate-400 text-sm mt-1">Personalisasi pengalaman Floodzie Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">

          {/* LOKASI DEFAULT (FULL-WIDTH) */}
          <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
            <CardHeader className="border-b border-slate-700/30 p-6">
              <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Tentukan Lokasi Wilayah Yang Akan Ditampilkan Saat Aplikasi Dimulai
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            
              </p>
              <div className="space-y-4">
                <RegionDropdown
                  onSelectDistrict={handleLocationSelect}
                  selectedLocationCoords={defaultLocation ? { lat: defaultLocation.latitude, lng: defaultLocation.longitude, name: defaultLocation.districtName } : null}
                />
                {defaultLocation && (
                  <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                      <span className="text-emerald-400 text-sm font-medium">Tersimpan: {defaultLocation.districtName}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* LOKASI FAVORIT (FULL-WIDTH) */}
          <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
            <CardHeader className="border-b border-slate-700/30 p-6">
              <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                <div className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Lokasi Favorit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">Tambahkan lokasi favorit Anda untuk akses cepat.</p>
              <div className="space-y-3 mb-6">
                {favoriteLocations.map((loc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all">
                    {editingIndex === index ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 bg-slate-600/50 border border-slate-500 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" autoFocus />
                        <button onClick={saveEdit} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-md"><Check className="w-4 h-4" /></button>
                        <button onClick={cancelEdit} className="p-1.5 text-slate-400 hover:bg-slate-400/10 rounded-md"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-200 truncate">{loc.districtName}</div>
                          <div className="text-xs text-slate-400 truncate">{loc.districtName}</div>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <button onClick={() => startEditing(index, loc.name || '')} className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded-md"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleLoadFavoriteLocation(loc)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md" title="Muat Lokasi"><Map className="w-4 h-4" /></button>
                          <button onClick={() => handleRemoveFavoriteLocation(index)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-3 p-4 bg-slate-700/10 border border-slate-600/20 rounded-lg">
                <input type="text" placeholder="Nama Lokasi (mis. Rumah, Kantor)" value={newFavoriteLocationName} onChange={(e) => setNewFavoriteLocationName(e.target.value)} className="w-full p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none" />
                <RegionDropdown onSelectDistrict={setNewFavoriteLocationCoords} selectedLocationCoords={newFavoriteLocationCoords ? { lat: newFavoriteLocationCoords.latitude, lng: newFavoriteLocationCoords.longitude, name: newFavoriteLocationCoords.districtName } : null} />
                <button onClick={handleAddFavoriteLocation} disabled={!newFavoriteLocationName || !newFavoriteLocationCoords} className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4" />
                  <span>Tambah Lokasi Favorit</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* GRID UNTUK PENGATURAN LAINNYA */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* TAMPILAN */}
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <CardHeader className="border-b border-slate-700/30 p-6">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                  <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3"><Palette className="w-5 h-5 text-white" /></div> Tampilan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="theme-toggle" className="flex flex-col space-y-1 cursor-pointer"><span className="flex items-center text-sm font-medium text-slate-200"><Moon className="w-4 h-4 mr-2 text-slate-400" /> Mode Gelap</span><span className="text-xs text-slate-400">Sesuaikan tampilan aplikasi</span></Label>
                  <div className="flex items-center space-x-3"><Sun className="w-4 h-4 text-slate-400" /><Switch id="theme-toggle" checked={isDark} onCheckedChange={(isDark) => setTheme(isDark ? 'dark' : 'light')} /><Moon className="w-4 h-4 text-slate-400" /></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="high-contrast-toggle" className="flex flex-col space-y-1 cursor-pointer"><span className="flex items-center text-sm font-medium text-slate-200"><Monitor className="w-4 h-4 mr-2 text-slate-400" /> Mode Kontras Tinggi</span><span className="text-xs text-slate-400">Tingkatkan kontras warna</span></Label>
                  <Switch id="high-contrast-toggle" checked={theme === 'high-contrast'} onCheckedChange={(checked) => setTheme(checked ? 'high-contrast' : 'system')} />
                </div>
              </CardContent>
            </Card>

            {/* AKSESIBILITAS */}
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <CardHeader className="border-b border-slate-700/30 p-6">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                  <div className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg mr-3"><Accessibility className="w-5 h-5 text-white" /></div> Aksesibilitas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label className="flex flex-col space-y-1"><span className="flex items-center text-sm font-medium text-slate-200"><Type className="w-4 h-4 mr-2 text-slate-400" /> Ukuran Font</span><span className="text-xs text-slate-400">Sesuaikan ukuran teks</span></Label>
                  <div className="flex items-center space-x-1 bg-slate-600/30 rounded-lg p-1">
                    <button onClick={() => handleFontSizeChange('small')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${fontSize === 'small' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-600/50'}`}>Kecil</button>
                    <button onClick={() => handleFontSizeChange('normal')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${fontSize === 'normal' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-600/50'}`}>Normal</button>
                    <button onClick={() => handleFontSizeChange('large')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${fontSize === 'large' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-600/50'}`}>Besar</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="reduce-motion-toggle" className="flex flex-col space-y-1 cursor-pointer"><span className="flex items-center text-sm font-medium text-slate-200"><MousePointer className="w-4 h-4 mr-2 text-slate-400" /> Kurangi Gerakan</span><span className="text-xs text-slate-400">Kurangi animasi dan efek</span></Label>
                  <Switch id="reduce-motion-toggle" checked={reduceMotion} onCheckedChange={handleReduceMotionChange} />
                </div>
              </CardContent>
            </Card>

            {/* PENGATURAN PETA */}
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <CardHeader className="border-b border-slate-700/30 p-6">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                  <div className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3"><Globe className="w-5 h-5 text-white" /></div> Pengaturan Peta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="marker-clustering-toggle" className="flex flex-col space-y-1 cursor-pointer"><span className="flex items-center text-sm font-medium text-slate-200"><Eye className="w-4 h-4 mr-2 text-slate-400" /> Klasterisasi Marker</span><span className="text-xs text-slate-400">Kelompokkan penanda banjir</span></Label>
                  <Switch id="marker-clustering-toggle" checked={markerClustering} onCheckedChange={handleMarkerClusteringChange} />
                </div>
              </CardContent>
            </Card>

            {/* DATA & SINKRONISASI */}
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <CardHeader className="border-b border-slate-700/30 p-6">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                  <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3"><Database className="w-5 h-5 text-white" /></div> Data & Sinkronisasi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="data-update-interval" className="flex flex-col space-y-1"><span className="flex items-center text-sm font-medium text-slate-200"><Database className="w-4 h-4 mr-2 text-slate-400" /> Interval Pembaruan</span><span className="text-xs text-slate-400">Atur frekuensi pembaruan</span></Label>
                  <select id="data-update-interval" value={dataUpdateInterval} onChange={(e) => handleDataUpdateIntervalChange(parseInt(e.target.value))} className="bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
                    <option value={15}>15 Menit</option><option value={30}>30 Menit</option><option value={60}>1 Jam</option><option value={0}>Saat Dibuka</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="sync-only-on-wifi" className="flex flex-col space-y-1 cursor-pointer"><span className="flex items-center text-sm font-medium text-slate-200"><Wifi className="w-4 h-4 mr-2 text-slate-400" /> Hanya via Wi-Fi</span><span className="text-xs text-slate-400">Hemat data seluler</span></Label>
                  <Switch id="sync-only-on-wifi" checked={syncOnlyOnWifi} onCheckedChange={handleSyncOnlyOnWifiChange} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="offline-mode" className="flex flex-col space-y-1 cursor-pointer"><span className="flex items-center text-sm font-medium text-slate-200"><Smartphone className="w-4 h-4 mr-2 text-slate-400" /> Mode Offline</span><span className="text-xs text-slate-400">Akses data tanpa internet</span></Label>
                  <Switch id="offline-mode" checked={offlineMode} onCheckedChange={handleOfflineModeChange} />
                </div>
              </CardContent>
            </Card>

            {/* PREFERENSI NOTIFIKASI (FULL-WIDTH DALAM GRID) */}
            <Card className="xl:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <CardHeader className="border-b border-slate-700/30 p-6">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-100">
                  <div className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg mr-3"><Bell className="w-5 h-5 text-white" /></div> Preferensi Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Pilih jenis peringatan yang ingin Anda lihat di dasbor.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {NOTIFICATION_LEVELS.map((level) => (
                    <div key={level.id} className="p-4 bg-slate-700/10 border border-slate-600/20 rounded-lg hover:border-slate-500/40">
                      <div className="flex items-center space-x-3">
                        <Checkbox id={level.id} checked={notificationPrefs[level.id] ?? true} onCheckedChange={(checked) => handleNotificationPrefChange(level.id, !!checked)} />
                        <div className="flex-1">
                          <Label htmlFor={level.id} className="text-sm font-medium text-slate-200 cursor-pointer">{level.label}</Label>
                          <div className={`h-1 w-full bg-gradient-to-r ${level.color} rounded-full mt-2 opacity-75`}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/10 rounded-lg hover:bg-slate-700/20">
                  <Label htmlFor="notification-sound-toggle" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="flex items-center text-sm font-medium text-slate-200">
                      {notificationSoundEnabled ? <Volume2 className="w-4 h-4 mr-2 text-slate-400" /> : <VolumeX className="w-4 h-4 mr-2 text-slate-400" />}Suara Notifikasi
                    </span>
                    <span className="text-xs text-slate-400">Aktifkan suara untuk notifikasi</span>
                  </Label>
                  <Switch id="notification-sound-toggle" checked={notificationSoundEnabled} onCheckedChange={handleNotificationSoundChange} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}