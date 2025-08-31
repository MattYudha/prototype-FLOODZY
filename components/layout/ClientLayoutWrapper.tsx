'use client';

import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
      setIsCollapsed(true);
    }
  }, [isDesktop]);

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapsedState = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={toggleCollapsedState}
      />

      <div
        className={`flex flex-col flex-1 transition-all duration-300
        ${
          isDesktop
            ? isCollapsed
              ? 'ml-16'
              : 'ml-64'
            : 'ml-0'
        }
      `}
      >
        <Header
          onMenuToggle={toggleMobileSidebar}
          isMenuOpen={isSidebarOpen}
        />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}