'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Activity,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardStats as DashboardStatsType } from '@/types';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  className?: string;
}

const statsConfig = [
  {
    key: 'totalRegions',
    label: 'Total Wilayah',
    icon: MapPin,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    trend: { value: 2, isUp: true }
  },
  {
    key: 'activeAlerts',
    label: 'Peringatan Aktif',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    trend: { value: 5, isUp: false }
  },
  {
    key: 'floodZones',
    label: 'Zona Banjir',
    icon: Shield,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    trend: { value: 3, isUp: true }
  },
  {
    key: 'peopleAtRisk',
    label: 'Orang Berisiko',
    icon: Users,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    trend: { value: 12, isUp: false }
  },
  {
    key: 'weatherStations',
    label: 'Stasiun Cuaca',
    icon: Activity,
    color: 'text-success',
    bgColor: 'bg-success/10',
    trend: { value: 1, isUp: true }
  },
];

export function DashboardStats({ stats, className }: DashboardStatsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsConfig.map((config, index) => {
          const value = stats[config.key as keyof DashboardStatsType] as number;
          const StatIcon = config.icon;
          
          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        config.bgColor
                      )}>
                        <StatIcon className={cn('h-5 w-5', config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {config.label}
                        </p>
                        <motion.p
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: 'spring', 
                            damping: 20, 
                            stiffness: 300,
                            delay: index * 0.1 + 0.2
                          }}
                          className="text-2xl font-bold"
                        >
                          {formatNumber(value)}
                        </motion.p>
                      </div>
                    </div>
                    
                    {/* Trend Indicator */}
                    <div className="flex items-center space-x-1">
                      {config.trend.isUp ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-danger" />
                      )}
                      <span className={cn(
                        'text-xs font-medium',
                        config.trend.isUp ? 'text-success' : 'text-danger'
                      )}>
                        {config.trend.value}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Status Sistem</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoring Aktif</span>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Konektivitas Sensor</span>
                  <Badge variant="success">98%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Akurasi Prediksi</span>
                  <Badge variant="info">94%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <Badge variant="success">{"<2s"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-secondary" />
                <span>Aktivitas Terkini</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Peringatan banjir Jakarta Utara</p>
                    <p className="text-xs text-muted-foreground">
                      {getTimeAgo(new Date(Date.now() - 3600000))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Sensor Ciliwung online</p>
                    <p className="text-xs text-muted-foreground">
                      {getTimeAgo(new Date(Date.now() - 7200000))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-info rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Update data cuaca</p>
                    <p className="text-xs text-muted-foreground">
                      {getTimeAgo(new Date(Date.now() - 10800000))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}