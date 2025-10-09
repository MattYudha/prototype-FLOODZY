'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2 } from 'lucide-react';

// Dynamically import FloodMap to prevent SSR issues with Leaflet
const FloodMap = dynamic(
  () => import('@/components/map/FloodMap').then((mod) => mod.FloodMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    ),
  },
);

interface InteractiveWeatherMapProps {
  latitude: number;
  longitude: number;
  activeLayer: string | null;
}

export function InteractiveWeatherMap({ latitude, longitude, activeLayer }: InteractiveWeatherMapProps) {

  // Base URL for OpenWeatherMap tiles (assuming your API proxies this)
  const OWM_TILE_BASE_URL = '/api/weather/tiles';

  const getTileLayerUrl = (layer: string) => {
    if (!activeLayer) return undefined; // No active layer, use default map tiles
    return `${OWM_TILE_BASE_URL}/${layer}/{z}/{x}/{y}.png`;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Peta Cuaca Interaktif</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="h-[500px] w-full rounded-lg overflow-hidden">
          <FloodMap
            center={[latitude, longitude]}
            zoom={10} // Adjust initial zoom as needed
            className="h-full w-full"
            // activeLayer={activeLayer} // This prop does not exist on FloodMapProps, removing for now
            floodProneData={[]} // Changed from null to empty array
            loadingFloodData={false}
            floodDataError={null}
            onMapBoundsChange={() => {}}
            selectedLocation={null}
            globalWeatherStations={[]}
            isFullscreen={false}
            onFullscreenToggle={() => {}}
            showFullscreenButton={false}
            // Adding missing required props with default values
            showOfficialData={false}
            showUnofficialData={false}
            showHistoricalData={false}
            onMapLoad={() => {}}
            allRegions={[]}
            onLocationSelect={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}
