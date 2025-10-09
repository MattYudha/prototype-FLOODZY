/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { FloodMap } from '../map/FloodMap'; // Mengimpor FloodMap baru kita
import type { Feature, FeatureCollection, Polygon } from 'geojson';

// Tipe data props yang ada
interface FloodReport {
  id: string;
  position: [number, number];
  timestamp: string;
  waterLevel: number; // dalam cm
}

interface EvacuationPoint {
  id: string;
  name: string;
  position: [number, number];
}

interface PetaBanjirClientProps {
  reports: FloodReport[];
  evacuationPoints: EvacuationPoint[];
  onMapClick: (coords: [number, number]) => void;
  selectedReportId: string | null;
  // Properti lain yang tidak digunakan dalam konteks peta 3D baru bisa diabaikan untuk saat ini
}

/**
 * Membuat poligon lingkaran GeoJSON dari sebuah titik pusat.
 * @param center - [longitude, latitude]
 * @param radiusInMeters - Radius lingkaran dalam meter.
 * @param properties - Properti untuk ditambahkan ke fitur GeoJSON.
 * @param points - Jumlah titik untuk membentuk lingkaran.
 * @returns Feature<Polygon>
 */
function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  properties: any,
  points: number = 64
): Feature<Polygon> {
  const [lon, lat] = center;
  const coords = {
    latitude: lat,
    longitude: lon,
  };

  const km = radiusInMeters / 1000;
  const ret: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  let theta, x, y;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret],
    },
    properties: properties,
  };
}

export default function PetaBanjirClient({ reports }: PetaBanjirClientProps) {
  // State untuk mengontrol visibilitas layer di FloodMap
  const [showOfficialData, setShowOfficialData] = useState(true);
  // State lain bisa ditambahkan di sini jika ada sumber data lain

  // Mengubah data laporan (titik) menjadi GeoJSON poligon untuk ekstrusi
  const floodDataGeoJSON: FeatureCollection | undefined = useMemo(() => {
    if (!reports || reports.length === 0) {
      return undefined;
    }

    const features = reports.map((report) => {
      const depth_m = report.waterLevel / 100; // Konversi cm ke meter
      // Radius lingkaran bisa dibuat dinamis berdasarkan ketinggian air
      const radius = 50 + depth_m * 50; // Contoh: radius dasar 50m + 50m per meter kedalaman

      return createGeoJSONCircle(report.position.reverse() as [number, number], radius, {
        ...report,
        depth_m: depth_m, // Menambahkan properti depth_m untuk digunakan di layer Mapbox
      });
    });

    return {
      type: 'FeatureCollection',
      features: features,
    };
  }, [reports]);

  // Di sini kita bisa menambahkan toolbar atau kontrol lain untuk mengubah state `showOfficialData`

  return (
    <div className="w-full h-full relative">
      {/* 
        Toolbar bisa ditambahkan di sini, di atas peta.
        Contoh: <PetaBanjirToolbar onToggleOfficialData={() => setShowOfficialData(!showOfficialData)} />
      */}
      <FloodMap
        officialData={floodDataGeoJSON}
        showOfficialData={showOfficialData}
        showUnofficialData={false}
        showHistoricalData={false}
        floodProneData={[]}
        loadingFloodData={false}
        floodDataError={null}
        onMapBoundsChange={() => {}}
        globalWeatherStations={[]}
        isFullscreen={false}
        onFullscreenToggle={() => {}}
        onMapLoad={() => {}}
        showFullscreenButton={true}
        allRegions={[]}
        onLocationSelect={() => {}}
        selectedLocation={null}
        center={[110.3695, -7.7956]}
        zoom={10}
      />
    </div>
  );
}