"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FLOOD_RISK_COLORS } from "@/lib/constants";

const legendItems = [
  {
    color: FLOOD_RISK_COLORS.low,
    label: "Risiko Rendah",
    description: "Zona aman dari banjir",
  },
  {
    color: FLOOD_RISK_COLORS.medium,
    label: "Risiko Sedang",
    description: "Berpotensi banjir ringan",
  },
  {
    color: FLOOD_RISK_COLORS.high,
    label: "Risiko Tinggi",
    description: "Rawan banjir berat",
  },
  {
    color: FLOOD_RISK_COLORS.critical,
    label: "Risiko Kritis",
    description: "Zona bahaya ekstrim",
  },
];

const markerItems = [
  {
    icon: "🌊",
    label: "Sensor Banjir",
    color: "#EF4444",
  },
  {
    icon: "⛅",
    label: "Stasiun Cuaca",
    color: "#3B82F6",
  },
  {
    icon: "🚨",
    label: "Peringatan Aktif",
    color: "#F59E0B",
  },
];

export function MapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute bottom-4 left-4 z-[1000]"
    >
      <Card variant="glass" className="p-4 max-w-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Legenda Peta</h3>

          {/* Flood Risk Zones */}
          <div className="space-y-2">
            <h4 className="text-xs text-white/80">Zona Risiko Banjir</h4>
            <div className="space-y-1">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-sm border border-white/20"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Markers */}
          <div className="space-y-2">
            <h4 className="text-xs text-white/80">Marker</h4>
            <div className="space-y-1">
              {markerItems.map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center text-xs">
                    {item.icon}
                  </div>
                  <span className="text-xs text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Update Time */}
          <div className="pt-2 border-t border-white/20">
            <p className="text-xs text-white/70">
              Diperbarui: {new Date().toLocaleTimeString("id-ID")}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
