'use client';

import React, { useState, Suspense } from 'react';
import 'leaflet/dist/leaflet.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/Button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { MapIcon, Loader2, Expand, Minimize } from 'lucide-react';

// Lazy load the FloodMap component for better performance
const FloodMap = React.lazy(() =>
  import('@/components/map/FloodMap').then(module => ({ default: module.FloodMap }))
);

// NEW: Types for Crowdsourced and Official BPBD Data (moved here for clarity)
interface CrowdsourcedReport {
  report_id: string;
  type: "Laporan Pengguna";
  severity: "Rendah" | "Sedang" | "Tinggi";
  depth_cm: number;
  timestamp: string;
  notes: string;
  upvotes: number;
  geometry: { type: "Point"; coordinates: [number, number] }; // [longitude, latitude]
}

interface OfficialBPBDData {
  report_id: string;
  type: "Data Resmi BPBD";
  severity: "Rendah" | "Sedang" | "Tinggi" | "Kritis";
  depth_cm: number;
  status: "Naik" | "Stabil" | "Surut";
  timestamp: string;
  geometry: { type: "Polygon"; coordinates: [number[][]] }; // [longitude, latitude]
}

const PetaBanjirPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMapFullScreen, setMapFullScreen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isMapFullScreen) {
          setMapFullScreen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapFullScreen]);

  React.useEffect(() => {
      if (isMapFullScreen) {
          document.body.classList.add('overflow-hidden');
      } else {
          document.body.classList.remove('overflow-hidden');
      }
      return () => document.body.classList.remove('overflow-hidden');
  }, [isMapFullScreen]);

  // Mock data for crowdsourced reports
  const crowdsourcedReports: CrowdsourcedReport[] = [
    {
      report_id: "usr-123",
      type: "Laporan Pengguna",
      severity: "Rendah",
      depth_cm: 20,
      timestamp: "2025-08-26T07:30:00Z",
      notes: "Genangan se-mata kaki, masih bisa dilewati motor.",
      upvotes: 15,
      geometry: { type: "Point", coordinates: [106.827, -6.175] }, // [longitude, latitude]
    },
    {
      report_id: "usr-124",
      type: "Laporan Pengguna",
      severity: "Sedang",
      depth_cm: 50,
      timestamp: "2025-08-26T08:00:00Z",
      notes: "Banjir selutut, motor sulit lewat.",
      upvotes: 8,
      geometry: { type: "Point", coordinates: [106.850, -6.200] },
    },
  ];

  // Mock data for official BPBD data
  const officialBPBDData: OfficialBPBDData[] = [
    {
      report_id: "bpbd-456",
      type: "Data Resmi BPBD",
      severity: "Tinggi",
      depth_cm: 110,
      status: "Naik",
      timestamp: "2025-08-26T08:00:00Z",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.800, -6.150],
            [106.810, -6.150],
            [106.810, -6.160],
            [106.800, -6.160],
            [106.800, -6.150],
          ],
        ],
      },
    },
    {
      report_id: "bpbd-457",
      type: "Data Resmi BPBD",
      severity: "Kritis",
      depth_cm: 150,
      status: "Naik",
      timestamp: "2025-08-26T09:00:00Z",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.830, -6.180],
            [106.840, -6.180],
            [106.840, -6.190],
            [106.830, -6.190],
            [106.830, -6.180],
          ],
        ],
      },
    },
  ];

  const MapLoader = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Memuat Peta...</p>
    </div>
  );

  if (isMobile) {
    return (
      <div className="relative w-full h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/50 z-0"></div>
        <div className="relative z-10 text-center">
          <div className="p-6 bg-background/50 backdrop-blur-md rounded-2xl shadow-lg border border-border/20">
            <MapIcon className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">Peta Banjir Interaktif</h1>
            <p className="text-muted-foreground mb-6">
              Lihat data banjir real-time, zona risiko, dan lainnya.
            </p>
            <Button onClick={() => setMapFullScreen(true)} size="lg">
              Lihat Peta
            </Button>
          </div>
        </div>

        <Drawer open={isMapFullScreen} onOpenChange={setMapFullScreen}>
          <DrawerContent className="h-screen">
            <DrawerHeader className="text-left">
              <DrawerTitle>Peta Banjir</DrawerTitle>
              <DrawerDescription>
                Geser ke bawah untuk menutup peta.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 p-0 overflow-hidden relative bg-slate-900">
              <Suspense fallback={<MapLoader />}>
                <FloodMap crowdsourcedReports={crowdsourcedReports} officialBPBDData={officialBPBDData} />
              </Suspense>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={isMapFullScreen ? "fixed inset-0 z-50 w-screen h-screen bg-slate-900" : "w-full h-screen relative"}>
      <Button
          onClick={() => setMapFullScreen(!isMapFullScreen)}
          variant="outline"
          size="icon"
          className="absolute top-[10px] right-[10px] z-[1000] w-8 h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg"
          aria-label={isMapFullScreen ? 'Keluar dari layar penuh' : 'Masuk ke layar penuh'}
      >
          {isMapFullScreen ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
      </Button>
      <Suspense fallback={<MapLoader />}>
        <FloodMap key={isMapFullScreen ? 'fullscreen' : 'normal'} crowdsourcedReports={crowdsourcedReports} officialBPBDData={officialBPBDData} />
      </Suspense>
    </div>
  );
};

export default PetaBanjirPage;