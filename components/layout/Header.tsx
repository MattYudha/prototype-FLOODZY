// components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link"; // <-- IMPORT Link di sini
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  Sun,
  Moon,
  Monitor,
  MapPin,
  Shield,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useAlertCount } from "@/components/contexts/AlertCountContext";

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { highAlertCount, loadingAlerts } = useAlertCount();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}

          <Link href="/" passHref>
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Shield className="h-8 w-8 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">Floodzie</h1>
                <p className="text-xs text-muted-foreground">
                  Sistem Deteksi Banjir
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              asChild
            >
              <div>
                <Home size={16} />
                <span>Dashboard</span>
              </div>
            </Button>
          </Link>
          <Link href="/peta-banjir" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              asChild
            >
              <div>
                <MapPin size={16} />
                <span>Peta</span>
              </div>
            </Button>
          </Link>
          <Link href="/peringatan" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              asChild
            >
              <div>
                <Bell size={16} />
                <span>Peringatan</span>
              </div>
            </Button>
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari wilayah atau lokasi..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search - Mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const themes: Array<typeof theme> = ["light", "dark", "system"];
              const currentIndex = themes.indexOf(theme);
              const nextIndex = (currentIndex + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
          >
            <ThemeIcon size={20} />
          </Button>

          {/* Notifications - ✅ PERBAIKAN DI SINI */}
          <Link href="/peringatan" passHref>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {highAlertCount > 0 && !loadingAlerts && (
                <Badge
                  variant="danger"
                  size="sm"
                  count={highAlertCount}
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                />
              )}
              {loadingAlerts && (
                <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, type: "tween" }}
                />
              )}
            </Button>
          </Link>

          {/* User Menu */}
          <Button variant="ghost" size="icon">
            <User size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t bg-background/95 backdrop-blur"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari wilayah atau lokasi..."
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-colors"
                autoFocus
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
