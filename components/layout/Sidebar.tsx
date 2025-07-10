'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Map, 
  Cloud, 
  Bell, 
  BarChart, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Shield,
  Users,
  AlertTriangle,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    href: '/', 
    badge: null,
    color: 'text-primary'
  },
  { 
    id: 'map', 
    label: 'Peta Banjir', 
    icon: Map, 
    href: '/map', 
    badge: null,
    color: 'text-secondary'
  },
  { 
    id: 'weather', 
    label: 'Cuaca', 
    icon: Cloud, 
    href: '/weather', 
    badge: null,
    color: 'text-accent'
  },
  { 
    id: 'alerts', 
    label: 'Peringatan', 
    icon: Bell, 
    href: '/alerts', 
    badge: '7',
    color: 'text-warning'
  },
  { 
    id: 'zones', 
    label: 'Zona Rawan', 
    icon: AlertTriangle, 
    href: '/zones', 
    badge: null,
    color: 'text-danger'
  },
  { 
    id: 'statistics', 
    label: 'Statistik', 
    icon: BarChart, 
    href: '/statistics', 
    badge: null,
    color: 'text-success'
  },
];

const quickActions = [
  { id: 'emergency', label: 'Darurat', icon: Shield, color: 'text-danger' },
  { id: 'report', label: 'Lapor', icon: Activity, color: 'text-warning' },
  { id: 'evacuate', label: 'Evakuasi', icon: Users, color: 'text-success' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: isMobile ? -280 : -200, opacity: isMobile ? 0 : 1 }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 flex flex-col',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'border-r border-border shadow-xl',
          isMobile ? 'w-70' : isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold">Navigasi</h2>
              <p className="text-sm text-muted-foreground">Sistem Monitoring</p>
            </motion.div>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-12 font-medium transition-all duration-200',
                  'hover:bg-muted hover:translate-x-1',
                  isCollapsed && 'justify-center'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="danger"
                        size="sm"
                        className="ml-auto"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t">
          {!isCollapsed && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-muted-foreground mb-3"
            >
              Aksi Cepat
            </motion.h3>
          )}
          
          <div className={cn(
            'space-y-2',
            isCollapsed && 'flex flex-col items-center'
          )}>
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Button
                  variant="outline"
                  size={isCollapsed ? "icon" : "sm"}
                  className="w-full justify-start hover:scale-105"
                >
                  <action.icon className={cn('h-4 w-4', action.color)} />
                  {!isCollapsed && <span className="ml-2">{action.label}</span>}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start h-10',
              isCollapsed && 'justify-center'
            )}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            {!isCollapsed && <span className="ml-3">Pengaturan</span>}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}