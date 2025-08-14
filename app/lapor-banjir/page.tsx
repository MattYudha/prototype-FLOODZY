'use client'; // WAJIB: Menandakan ini adalah Client Component

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  MapPin,
  Camera,
  Send,
  AlertTriangle,
  Droplets,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js'; // Import tipe data untuk Supabase
import MapPicker from '@/components/map/MapPicker'; // Add this import
import { motion } from 'framer-motion'; // Import motion
import Image from 'next/image';

export default function LaporBanjirPage() {
  // --- STATE MANAGEMENT ---
  const [location, setLocation] = useState<string>('');
  const [manualLocationInput, setManualLocationInput] = useState<string>(''); // New state for manual input
  const [latitude, setLatitude] = useState<number>(-6.2088); // Default: Jakarta
  const [longitude, setLongitude] = useState<number>(106.8456); // Default: Jakarta
  const [waterLevel, setWaterLevel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [selectedPhoto, setSelectedPhoto] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  // ✅ PERBAIKAN: Inisialisasi Supabase hanya satu kali saat komponen pertama kali dimuat.
  const [supabase] = useState<SupabaseClient>(() =>
    createSupabaseBrowserClient(),
  );

  // Opsi tinggi air
  const waterLevelOptions = [
    {
      value: 'semata_kaki',
      label: 'Semata Kaki',
      color: 'text-green-400',
      height: '< 30cm',
    },
    {
      value: 'selutut',
      label: 'Selutut',
      color: 'text-yellow-400',
      height: '30-50cm',
    },
    {
      value: 'sepaha',
      label: 'Sepaha',
      color: 'text-orange-400',
      height: '50-80cm',
    },
    {
      value: 'sepusar',
      label: 'Sepusar',
      color: 'text-red-400',
      height: '80-120cm',
    },
    {
      value: 'lebih_dari_sepusar',
      label: 'Lebih dari Sepusar',
      color: 'text-red-600',
      height: '> 120cm',
    },
  ];

  // Fungsi untuk mencari lokasi berdasarkan input teks
  const handleSearchLocation = async () => {
    if (!manualLocationInput) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocationInput)}&format=json&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lon));
        setLocation(display_name);
        setMessage('Lokasi ditemukan di peta.');
        setMessageType('success');
      } else {
        setMessage('Lokasi tidak ditemukan. Coba kata kunci lain.');
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Error searching location:', error);
      setMessage(`Gagal mencari lokasi: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER UNGGAH FOTO ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  // --- FUNGSI SUBMIT ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Change event type
    e.preventDefault(); // Always prevent default for form submission
    if (!location || !waterLevel || latitude === 0 || longitude === 0) {
      // Update validation
      setMessage('Lokasi kejadian, tinggi air, dan titik peta wajib diisi.'); // Update message
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      let photoUrl = '';

      // 1. Proses unggah foto jika ada
      if (selectedPhoto) {
        const file = selectedPhoto.file;
        const filePath = `${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('laporan-banjir') // Nama bucket di Supabase Storage
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Gagal mengunggah foto: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('laporan-banjir')
          .getPublicUrl(filePath);

        photoUrl = publicUrlData.publicUrl;
      }

      // 2. Simpan data laporan ke tabel
      const { error: insertError } = await supabase
        .from('laporan_banjir')
        .insert([
          {
            location: location,
            latitude: latitude, // Use new state
            longitude: longitude, // Use new state
            water_level: waterLevel,
            description: description,
            photo_url: photoUrl,
            reporter_name: reporterName,
            reporter_contact: reporterContact,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      // 3. Berhasil
      setMessage('Laporan banjir berhasil dikirim! Terima kasih.');
      setMessageType('success');

      // Reset form
      setLocation('');
      setManualLocationInput(''); // Reset manual input
      setLatitude(-6.2088); // Reset to default Jakarta
      setLongitude(106.8456); // Reset to default Jakarta
      setWaterLevel('');
      setDescription('');
      setReporterName('');
      setReporterContact('');
      setSelectedPhoto(null);
    } catch (error: any) {
      console.error('Error submitting report:', error.message);
      setMessage(`Gagal mengirim laporan: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi waktu
  const getCurrentTime = () => {
    return new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Floodzie</h1>
            <p className="text-cyan-400 text-sm">Sistem Deteksi Banjir</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">Lapor Banjir</h2>
          </div>
          <p className="text-slate-400">
            Laporkan kondisi banjir di wilayah Anda untuk membantu monitoring
            real-time
          </p>
        </motion.div>
      </motion.div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Map Picker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Lokasi Kejadian <span className="text-red-400">*</span>
                </label>
                <MapPicker
                  currentPosition={[latitude, longitude]} // Pass current lat/lng
                  onPositionChange={({ lat, lng }) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    // Optionally, reverse geocode here to get location name from coordinates
                  }}
                  onLocationNameChange={setLocation}
                />
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={manualLocationInput}
                    onChange={(e) => setManualLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        handleSearchLocation();
                      }
                    }}
                    placeholder="Cari lokasi secara manual (contoh: Jakarta Pusat)"
                    className="w-full bg-slate-700/80 border border-slate-500/50 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-200"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Geser marker di peta, klik tombol GPS, atau cari lokasi secara
                  manual.
                </p>
              </motion.div>

              {/* Water Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  Tinggi Air <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {waterLevelOptions.map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        name="waterLevel"
                        value={option.value}
                        checked={waterLevel === option.value}
                        onChange={(e) => setWaterLevel(e.target.value)}
                        className="sr-only"
                        required
                      />
                      <div
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${waterLevel === option.value ? 'border-cyan-400 bg-cyan-400/20' : 'border-slate-500/50 bg-slate-700/50 hover:border-slate-400/70'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium ${waterLevel === option.value ? 'text-white' : 'text-slate-300'}`}
                          >
                            {option.label}
                          </span>
                          <span className={`text-sm ${option.color}`}>
                            {option.height}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Photo Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Camera className="w-4 h-4 text-green-400" />
                  Unggah Foto (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    {selectedPhoto ? (
                      <div className="flex items-center gap-3">
                        <Image
                          src={selectedPhoto.preview}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">
                            {selectedPhoto.file.name}
                          </p>
                          <p className="text-slate-400 text-sm">
                            Klik untuk mengganti foto
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-400">
                          Klik untuk memilih foto
                        </p>
                        <p className="text-slate-500 text-sm">
                          PNG, JPG hingga 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-slate-300">
                  Deskripsi Singkat
                </label>
                <textarea
                  placeholder="Berikan detail tambahan tentang kondisi banjir (arus air, penyebab, dll)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                />
              </motion.div>

              {/* Reporter Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <User className="w-4 h-4 text-purple-400" /> Nama Pelapor
                    (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Phone className="w-4 h-4 text-orange-400" /> Kontak
                    (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="No. HP atau Email"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                type="submit" // Change type to submit
                disabled={loading || !location || !waterLevel}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                    Mengirim Laporan...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Kirim Laporan
                  </>
                )}
              </motion.button>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-4 rounded-lg border ${messageType === 'success' ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-red-900/30 border-red-600 text-red-400'}`}
                >
                  <div className="flex items-center gap-2">
                    {messageType === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <p className="font-medium">{message}</p>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="font-medium text-white">Waktu Saat Ini</h3>
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              {getCurrentTime()}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              WIB - Zona Waktu Indonesia
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4"
          >
            <h3 className="font-medium text-white mb-3">Panduan Pelaporan</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                Pastikan lokasi yang dilaporkan akurat
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                Pilih tinggi air sesuai kondisi sebenarnya
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                Sertakan foto untuk validasi data
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                Deskripsi detail membantu tim respons
              </motion.li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-r from-green-900/20 to-green-600/20 border border-green-600/30 rounded-xl p-4"
          >
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-green-400" />
              Kontak Darurat
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">BPBD Jakarta:</span>
                <span className="text-white font-medium">
                  {' '}
                  164 / (021) 386 5090
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Damkar:</span>
                <span className="text-white font-medium">
                  113 / (021) 386 5555
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Polri:</span>
                <span className="text-white font-medium">
                  {' '}
                  110 / (021) 721 8741{' '}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
