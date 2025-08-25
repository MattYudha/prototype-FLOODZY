
'use client';

import React, { useState, Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/Button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { MapIcon, Loader2 } from 'lucide-react';

// Lazy load the FloodMap component for better performance
const FloodMap = React.lazy(() =>
  import('@/components/map/FloodMap').then(module => ({ default: module.FloodMap }))
);

const PetaBanjirPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMapFullScreen, setMapFullScreen] = useState(false);

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
            <div className="flex-1 p-0 overflow-hidden">
              <Suspense fallback={<MapLoader />}>
                <FloodMap />
              </Suspense>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Suspense fallback={<MapLoader />}>
        <FloodMap />
      </Suspense>
    </div>
  );
};

export default PetaBanjirPage;
