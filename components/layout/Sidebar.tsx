// components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useAlertCount } from "@/components/contexts/AlertCountContext";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  color?: string;
  badge?: string | number;
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color?: string;
  onClick?: () => void;
}

const navigationItems: NavItem[] = [
  {
    id: "home",
    label: "Dashboard",
    href: "/",
    icon: Home,
    color: "text-primary",
  },
  {
    id: "map",
    label: "Peta Banjir",
    href: "/map",
    icon: Map,
    color: "text-blue-500",
  },
  {
    id: "weather",
    label: "Prakiraan Cuaca",
    href: "/weather",
    icon: Cloud,
    color: "text-sky-500",
  },
  {
    id: "alerts",
    label: "Peringatan",
    href: "/peringatan",
    icon: Bell,
    color: "text-warning",
    // badge akan diisi secara dinamis dari context
  },
  {
    id: "stats",
    label: "Statistik Data",
    href: "/stats",
    icon: BarChart,
    color: "text-green-500",
  },
];

const quickActions: QuickActionItem[] = [
  {
    id: "report-flood",
    label: "Lapor Banjir",
    icon: AlertTriangle,
    color: "text-red-500",
    onClick: () => console.log("Lapor Banjir clicked"),
  },
  {
    id: "evacuation-info",
    label: "Info Evakuasi",
    icon: Users,
    color: "text-purple-500",
    onClick: () => console.log("Evakuasi clicked"),
  },
  {
    id: "current-weather",
    label: "Cuaca Sekarang",
    icon: Cloud,
    color: "text-sky-500",
    onClick: () => console.log("Cuaca clicked"),
  },
  {
    id: "sensor-data",
    label: "Data Sensor",
    icon: TrendingUp,
    color: "text-green-500",
    onClick: () => console.log("Sensor clicked"),
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { highAlertCount, loadingAlerts } = useAlertCount();

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: {
      x: isMobile ? -280 : isCollapsed ? -16 : -200,
      opacity: isMobile ? 0 : 1,
    },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
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
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 flex flex-col",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-r border-border shadow-xl",
          isMobile ? "w-70" : isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header sidebar */}
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
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}{" "}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item, index) => {
            // ✅ Tentukan badge secara dinamis untuk item "Peringatan"
            const currentBadge =
              item.id === "alerts" && highAlertCount > 0 && !loadingAlerts
                ? highAlertCount
                : item.badge;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-12 font-medium transition-all duration-200",
                      "hover:bg-muted hover:translate-x-1",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", item.color)} />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3">{item.label}</span>
                        {currentBadge !== undefined && currentBadge > 0 && (
                          <Badge variant="danger" size="sm" className="ml-auto">
                            {currentBadge}
                          </Badge>
                        )}
                        {item.id === "alerts" &&
                          loadingAlerts && ( // Indikator loading untuk alerts
                            <motion.div
                              className="absolute right-3 h-2 w-2 bg-warning rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              // ✅ UBAH TYPE KE "tween"
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                type: "tween",
                              }}
                            />
                          )}
                      </>
                    )}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
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

          <div
            className={cn(
              "space-y-2",
              isCollapsed && "flex flex-col items-center"
            )}
          >
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
                  onClick={action.onClick}
                >
                  <action.icon className={cn("h-4 w-4", action.color)} />
                  {!isCollapsed && (
                    <span className="ml-2">{action.label}</span>
                  )}{" "}
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
              "w-full justify-start h-10",
              isCollapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            {!isCollapsed && <span className="ml-3">Pengaturan</span>}{" "}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
