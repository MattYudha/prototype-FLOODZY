'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import clsx from 'clsx';
import { Waves, User, Maximize, Minimize, Siren } from 'lucide-react';
import MapEventsHandler from './MapEventsHandler'; // Menggunakan komponen asli

// Tipe data props
interface FloodReport {
  id: string;
  position: [number, number];
  timestamp: string;
  waterLevel: number;
}

interface EvacuationPoint {
  id: string;
  name: string;
  position: [number, number];
}

interface ImpactZone {
  center: [number, number];
  radius: number;
}

interface PetaBanjirClientProps {
  reports: FloodReport[];
  evacuationPoints: EvacuationPoint[];
  routeCoordinates?: [number, number][] | null;
  impactZones?: ImpactZone[];
  userLocation?: [number, number] | null;
  onMapClick: (coords: [number, number]) => void;
  selectedReportId?: string | null;
}

// Komponen untuk memusatkan peta ke marker yang dipilih
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Nama komponen diubah agar sesuai dengan nama file
export default function PetaBanjirClient({
  reports,
  evacuationPoints,
  routeCoordinates,
  impactZones,
  userLocation,
  onMapClick,
  selectedReportId,
}: PetaBanjirClientProps) {
  const jakartaPosition: [number, number] = [-6.2088, 106.8456];
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(jakartaPosition);

  useEffect(() => {
    if (selectedReportId) {
      const report = reports?.find((r) => r.id === selectedReportId);
      if (report) {
        setMapCenter(report.position);
      }
    }
  }, [selectedReportId, reports]);

  const { evacuationIcon, floodIcon, userLocationIcon, selectedFloodIcon } = useMemo(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const baseIconProps = {
      className: 'bg-transparent border-none',
      iconSize: [24, 24] as L.PointExpression,
      iconAnchor: [12, 24] as L.PointExpression,
      popupAnchor: [0, -24] as L.PointExpression,
    };

    const evacuationIcon = new L.Icon({
      iconUrl: '/assets/evacuation_marker.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const floodIcon = new L.DivIcon({
      ...baseIconProps,
      html: ReactDOMServer.renderToString(
        <Waves className="text-blue-600 bg-white rounded-full p-1" size={24} />,
      ),
    });
    
    const selectedFloodIcon = new L.DivIcon({
        ...baseIconProps,
        iconSize: [32, 32] as L.PointExpression,
        iconAnchor: [16, 32] as L.PointExpression,
        html: ReactDOMServer.renderToString(
          <Siren className="text-red-600 animate-pulse bg-white rounded-full p-1" size={32} />,
        ),
      });

    const userLocationIcon = new L.DivIcon({
      ...baseIconProps,
      html: ReactDOMServer.renderToString(
        <User className="text-red-600 bg-white rounded-full p-1" size={24} />,
      ),
    });

    return { evacuationIcon, floodIcon, userLocationIcon, selectedFloodIcon };
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  return (
    <MapContainer
      center={jakartaPosition}
      zoom={12}
      scrollWheelZoom={true}
      zoomControl={false}
      className={clsx(
        'w-full h-full z-10 transition-all duration-300',
        isFullScreen ? 'fixed inset-0 z-[9999]' : 'relative',
      )}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Menggunakan komponen event handler yang asli */}
      <MapEventsHandler onMapClick={onMapClick} />
      <ChangeView center={mapCenter} zoom={14} />

      <div className="leaflet-top leaflet-right z-[1000] p-2">
        <div className="leaflet-control leaflet-bar bg-white rounded shadow">
          <a
            className="flex items-center justify-center w-8 h-8 cursor-pointer"
            href="#"
            title={isFullScreen ? 'Keluar Layar Penuh' : 'Tampilan Layar Penuh'}
            role="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFullScreen();
            }}
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </a>
        </div>
      </div>

      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>Titik Awal Anda</Popup>
        </Marker>
      )}

      {reports?.map((report) => (
        <Marker
          key={report.id}
          position={report.position}
          icon={report.id === selectedReportId ? selectedFloodIcon : floodIcon}
        >
          <Popup>
            <b>Laporan Banjir</b>
            <br />
            Ketinggian: {report.waterLevel} cm
            <br />
            Waktu: {new Date(report.timestamp).toLocaleTimeString('id-ID')}
          </Popup>
        </Marker>
      ))}

      {evacuationPoints?.map((point) => (
        <Marker key={point.id} position={point.position} icon={evacuationIcon}>
          <Popup>
            <b>Posko Evakuasi</b>
            <br />
            {point.name}
          </Popup>
        </Marker>
      ))}

      {routeCoordinates && (
        <Polyline
          pathOptions={{ color: 'blue', weight: 5 }}
          positions={routeCoordinates}
        />
      )}

      {impactZones?.map((zone, index) => (
        <Circle
          key={index}
          center={zone.center}
          radius={zone.radius}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
        />
      ))}
    </MapContainer>
  );
}
