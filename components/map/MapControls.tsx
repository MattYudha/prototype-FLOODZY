'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Eye,
  EyeOff,
  Cloud,
  MapPin,
  Navigation,
  Maximize2,
  Minimize2,
  Settings,
  AlertTriangle, // Import AlertTriangle untuk ikon peringatan
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
  onLayerChange: (layer: string) => void;
  selectedLayer: string;
  onFloodZonesToggle: () => void;
  showFloodZones: boolean;
  onWeatherToggle: () => void;
  showWeatherStations: boolean;
  onRealtimeAlertsToggle: () => void; // Properti baru untuk toggle peringatan real-time
  showRealtimeAlerts: boolean; // Properti baru untuk status peringatan real-time
}

const mapLayers = [
  { id: 'street', name: 'Jalan', icon: MapPin },
  { id: 'satellite', name: 'Satelit', icon: Navigation },
  { id: 'terrain', name: 'Terrain', icon: Layers },
];

export function MapControls({
  onFullscreenToggle,
  isFullscreen,
  onLayerChange,
  selectedLayer,
  onFloodZonesToggle,
  showFloodZones,
  onWeatherToggle,
  showWeatherStations,
  onRealtimeAlertsToggle, // Destrukturisasi properti baru
  showRealtimeAlerts, // Destrukturisasi properti baru
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute top-4 left-4 z-[1000] space-y-2"
    >
      {/* Main Controls */}
      <Card variant="glass" className="p-2">
        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 w-10"
          >
            <Settings size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreenToggle}
            className="h-10 w-10"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </Card>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* Layer Selection */}
            <Card variant="glass" className="p-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Lapisan Peta</h4>
                <div className="space-y-1">
                  {mapLayers.map((layer) => (
                    <Button
                      key={layer.id}
                      variant={
                        selectedLayer === layer.id ? 'secondary' : 'ghost'
                      }
                      size="sm"
                      onClick={() => onLayerChange(layer.id)}
                      className="w-full justify-start h-8"
                    >
                      <layer.icon size={14} className="mr-2" />
                      {layer.name}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Overlay Toggles */}
            <Card variant="glass" className="p-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Overlay</h4>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFloodZonesToggle}
                    className="w-full justify-between h-8"
                  >
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2" />
                      Zona Banjir
                    </div>
                    {showFloodZones ? (
                      <Eye size={14} className="text-success" />
                    ) : (
                      <EyeOff size={14} className="text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onWeatherToggle}
                    className="w-full justify-between h-8"
                  >
                    <div className="flex items-center">
                      <Cloud size={14} className="mr-2" />
                      Stasiun Cuaca
                    </div>
                    {showWeatherStations ? (
                      <Eye size={14} className="text-success" />
                    ) : (
                      <EyeOff size={14} className="text-muted-foreground" />
                    )}
                  </Button>

                  {/* Tombol Toggle Peringatan Real-time Baru */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRealtimeAlertsToggle}
                    className="w-full justify-between h-8"
                  >
                    <div className="flex items-center">
                      <AlertTriangle size={14} className="mr-2" />
                      Peringatan Real-time
                    </div>
                    {showRealtimeAlerts ? (
                      <Eye size={14} className="text-success" />
                    ) : (
                      <EyeOff size={14} className="text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card variant="glass" className="p-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Status</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Zona Aktif</span>
                    <Badge variant="warning" size="sm">
                      12
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Peringatan</span>
                    <Badge variant="danger" size="sm">
                      3
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Stasiun Online</span>
                    <Badge variant="success" size="sm">
                      89
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
