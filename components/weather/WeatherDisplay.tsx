'use client';

import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Zap, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  Gauge,
  ArrowUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WeatherData } from '@/types';
import { WEATHER_CONDITIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface WeatherDisplayProps {
  data: WeatherData;
  className?: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: Zap,
  foggy: Cloud,
};

const weatherMetrics = [
  { key: 'humidity', label: 'Kelembaban', icon: Droplets, unit: '%' },
  { key: 'windSpeed', label: 'Kecepatan Angin', icon: Wind, unit: 'km/h' },
  { key: 'pressure', label: 'Tekanan', icon: Gauge, unit: 'hPa' },
  { key: 'visibility', label: 'Visibilitas', icon: Eye, unit: 'km' },
];

export function WeatherDisplay({ data, className }: WeatherDisplayProps) {
  const WeatherIcon = weatherIcons[data.condition] || Cloud;
  const weatherConfig = WEATHER_CONDITIONS[data.condition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('space-y-4', className)}
    >
      {/* Main Weather Card */}
      <Card className={cn(
        'relative overflow-hidden',
        `bg-gradient-to-br ${weatherConfig.gradient}`,
        'text-white border-none'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Cuaca Saat Ini</CardTitle>
            <Badge variant="glass" className="text-white">
              {new Date(data.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <WeatherIcon className="h-16 w-16" />
              </motion.div>
              
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold">{data.temperature}</span>
                  <span className="text-xl">°C</span>
                </div>
                <p className="text-white/90 capitalize">{data.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm">
                <Wind className="h-4 w-4" />
                <span>{data.windDirection}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm mt-1">
                <ArrowUp className="h-4 w-4" />
                <span>UV Index: {data.uvIndex}</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-6 h-6 bg-white rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      </Card>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {weatherMetrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {data[metric.key as keyof WeatherData]}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}