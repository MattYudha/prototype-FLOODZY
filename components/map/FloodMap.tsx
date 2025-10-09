/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  MapRef,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { LayerProps } from 'react-map-gl';
import type { FillExtrusionLayerSpecification, LineLayerSpecification, SymbolLayerSpecification } from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { WeatherStation } from '@/types';
import { OverpassElement } from '@/lib/api';
import { SelectedLocation } from '@/types/location'; // Import SelectedLocation type
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

// Definisikan tipe untuk data banjir jika belum ada
interface FloodData {
  id: string;
  depth_m: number;
  // tambahkan properti lain yang mungkin ada
}

interface FloodMapProps {
  className?: string;
  officialData?: FeatureCollection;
  unofficialData?: FeatureCollection;
  historicalData?: FeatureCollection;
  showOfficialData: boolean;
  showUnofficialData: boolean;
  showHistoricalData: boolean;
  floodProneData: OverpassElement[];
  loadingFloodData: boolean;
  floodDataError: string | null;
  onMapBoundsChange: (bounds: any) => void;
  globalWeatherStations: WeatherStation[];
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onMapLoad: (map: any) => void;
  showFullscreenButton: boolean;
  // Props baru untuk pencarian lokal
  allRegions: SelectedLocation[];
  onLocationSelect: (location: SelectedLocation) => void;
  selectedLocation: SelectedLocation | null;
  center: [number, number]; // Center prop from DashboardClientPage
  zoom: number; // Zoom prop from DashboardClientPage
}

const floodFillExtrusionLayerStyle: Omit<FillExtrusionLayerSpecification, 'id' | 'source'> = {
  type: 'fill-extrusion',
  paint: {
    'fill-extrusion-color': [
      'interpolate',
      ['linear'],
      ['get', 'depth_m'],
      0.1,
      '#ffffcc',
      0.5,
      '#fcae91',
      1.0,
      '#de2d26',
    ],
    'fill-extrusion-height': ['*', ['get', 'depth_m'], 1000], // Pengali ketinggian bisa disesuaikan
    'fill-extrusion-base': 0,
    'fill-extrusion-opacity': 0.7,
  },
};

const floodLineLayerStyle: Omit<LineLayerSpecification, 'id' | 'source'> = {
  type: 'line',
  paint: {
    'line-color': [
      'interpolate',
      ['linear'],
      ['get', 'depth_m'],
      0.1,
      '#88ccee',
      0.5,
      '#ff8888',
      1.0,
      '#ff0000',
    ],
    'line-width': 2,
    'line-opacity': 0.8,
  },
};

const landmarkLayerStyle: Omit<SymbolLayerSpecification, 'id' | 'source'> = {
    type: 'symbol',
    layout: {
      'icon-image': 'hospital-15', // Contoh ikon dari Mapbox, bisa diganti
      'icon-size': 1.5,
      'text-field': ['get', 'name'],
      'text-offset': [0, 1.25],
      'text-anchor': 'top',
    },
    paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 1,
    }
  };


export function FloodMap({
  officialData,
  unofficialData,
  historicalData,
  showOfficialData,
  showUnofficialData,
  showHistoricalData,
  allRegions,
  onLocationSelect,
  selectedLocation,
  center,
  zoom,
}: FloodMapProps) {
  console.log('DEBUG FloodMap: Props received:', selectedLocation, center, zoom);

  const mapRef = useRef<MapRef>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Initial view state based on selectedLocation or default props
  const initialMapViewState = useMemo(() => {
    const defaultLongitude = (center && center.length === 2 && !isNaN(center[0])) ? center[0] : 110.3695; // Default to Jakarta if center is invalid
    const defaultLatitude = (center && center.length === 2 && !isNaN(center[1])) ? center[1] : -7.7956; // Default to Jakarta if center is invalid

    const viewState = {
      longitude: selectedLocation?.longitude || defaultLongitude,
      latitude: selectedLocation?.latitude || defaultLatitude,
      zoom: selectedLocation ? 12 : zoom, // Zoom in if a location is selected
      pitch: 45,
      bearing: 0,
    };
    console.log('DEBUG FloodMap: initialMapViewState calculated:', viewState);
    return viewState;
  }, [selectedLocation, center, zoom]);

  const [viewState, setViewState] = useState(initialMapViewState);
  console.log('DEBUG FloodMap: viewState initialized to:', viewState);

  // Effect to update map view when selectedLocation changes
  useEffect(() => {
    console.log('DEBUG FloodMap: useEffect for selectedLocation triggered.');
    if (selectedLocation && mapRef.current) {
      const { latitude, longitude } = selectedLocation;
      console.log('DEBUG FloodMap: selectedLocation coords for flyTo:', { latitude, longitude });
      if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 12, // Keep a consistent zoom level when flying to a selected location
          pitch: 45,
          bearing: 0,
          duration: 3000, // Smooth animation
        });
      } else {
        console.warn('Selected location has invalid coordinates:', selectedLocation);
      }
    } else if (!selectedLocation) {
      console.log('DEBUG FloodMap: selectedLocation is null, resetting viewState.');
      // If no location is selected, reset to default view or passed center/zoom
      setViewState(initialMapViewState);
    }
  }, [selectedLocation, initialMapViewState]);

  const onMouseMove = (event: mapboxgl.MapLayerMouseEvent) => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];

    if (hoveredFeature && hoveredFeature.properties) {
      setHoverInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        properties: hoveredFeature.properties,
      });
    } else {
      setHoverInfo(null);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      toast.info('Silakan masukkan nama lokasi untuk dicari.');
      return;
    }

    const results = allRegions.filter(region =>
      region.districtName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (results.length > 0) {
      const firstResult = results[0];
      onLocationSelect(firstResult);
      toast.success(`Lokasi '${firstResult.districtName}' ditemukan.`);
    } else {
      toast.error(`Lokasi '${searchQuery}' tidak ditemukan di data lokal.`);
    }
  };

  const interactiveLayerIds = useMemo(() => {
    const ids = [];
    if (showOfficialData && officialData) {
        ids.push('official-flood-fill-extrusion-layer', 'official-flood-line-layer');
    }
    if (showUnofficialData && unofficialData) {
        ids.push('unofficial-flood-fill-extrusion-layer', 'unofficial-flood-line-layer');
    }
    if (showHistoricalData && historicalData) {
        ids.push('historical-flood-fill-extrusion-layer', 'historical-flood-line-layer');
    }
    ids.push('landmark-layer'); // landmark layer is always there
    return ids;
  }, [showOfficialData, officialData, showUnofficialData, unofficialData, showHistoricalData, historicalData]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <div className="flex shadow-lg rounded-lg overflow-hidden">
          <Input
            type="text"
            placeholder="Cari lokasi (mis. Jakarta)"
            className="flex-1 bg-white/90 border-none focus:ring-0 text-gray-800 placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => {
          const { longitude, latitude, zoom, pitch, bearing } = evt.viewState;
          console.log('DEBUG FloodMap: onMove viewState:', evt.viewState);
          if (!isNaN(longitude) && !isNaN(latitude) && !isNaN(zoom) && !isNaN(pitch) && !isNaN(bearing)) {
            setViewState(evt.viewState);
          }
        }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v10" // Gaya peta gelap untuk kontras
        interactiveLayerIds={interactiveLayerIds}
        onMouseMove={onMouseMove}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {/* Sumber dan Layer untuk Data Resmi BPBD */}
        {showOfficialData && officialData && (
          <Source id="official-flood-data" type="geojson" data={officialData}>
            <Layer {...floodFillExtrusionLayerStyle} id="official-flood-fill-extrusion-layer" />
            <Layer {...floodLineLayerStyle} id="official-flood-line-layer" />
          </Source>
        )}

        {/* Sumber dan Layer untuk Data Laporan Masyarakat */}
        {showUnofficialData && unofficialData && (
          <Source id="unofficial-flood-data" type="geojson" data={unofficialData}>
            <Layer {...floodFillExtrusionLayerStyle} id="unofficial-flood-fill-extrusion-layer" />
            <Layer {...floodLineLayerStyle} id="unofficial-flood-line-layer" />
          </Source>
        )}

        {/* Sumber dan Layer untuk Data Historis */}
        {showHistoricalData && historicalData && (
          <Source id="historical-flood-data" type="geojson" data={historicalData}>
            <Layer {...floodFillExtrusionLayerStyle} id="historical-flood-fill-extrusion-layer" />
            <Layer {...floodLineLayerStyle} id="historical-flood-line-layer" />
          </Source>
        )}

        {/* Sumber dan Layer untuk Landmark */}
        <Source id="landmark-data" type="geojson" data="/landmarks.json">
          <Layer {...landmarkLayerStyle} id="landmark-layer" />
        </Source>

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            onClose={() => setHoverInfo(null)}
            closeButton={false}
            className="bg-transparent shadow-none"
          >
            <div className="bg-gray-800 bg-opacity-80 text-white p-2 rounded">
              {hoverInfo.properties && typeof hoverInfo.properties.depth_m === 'number' ? (
                <>
                  <h3 className="font-bold">Informasi Banjir</h3>
                  <p>Ketinggian: {hoverInfo.properties.depth_m.toFixed(2)} meter</p>
                </>
              ) : hoverInfo.properties && hoverInfo.properties.name ? (
                <>
                  <h3 className="font-bold">{hoverInfo.properties.type || 'Landmark'}</h3>
                  <p>{hoverInfo.properties.name}</p>
                </>
              ) : (
                <p>Informasi tidak tersedia</p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}