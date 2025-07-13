// app/layout.tsx
"use client"; // <-- Keep this here because useState and useEffect are used

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/hooks/useTheme";
import { Toaster } from "react-hot-toast";

import { useState, useEffect } from "react"; // <-- Import useEffect
import { useMediaQuery } from "@/hooks/useMediaQuery"; // <-- Import useMediaQuery

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AlertCountProvider } from "@/components/contexts/AlertCountContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State untuk mengontrol apakah sidebar mobile terbuka atau tertutup
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default ke false untuk mobile

  // State untuk mengontrol apakah sidebar di-collapse (untuk desktop)
  const [isCollapsed, setIsCollapsed] = useState(false); // Default ke false (tidak di-collapse)

  // Hook untuk mendeteksi ukuran layar
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Efek untuk mengatur perilaku sidebar berdasarkan ukuran layar
  useEffect(() => {
    if (isDesktop) {
      // Di desktop, sidebar selalu terlihat, dan kita atur status collapsed
      setIsSidebarOpen(true); // Pastikan sidebar terbuka di desktop
      // Anda bisa mengatur isCollapsed default di sini jika ingin
      // misalnya, setIsCollapsed(false); // Default tidak di-collapse di desktop
    } else {
      // Di mobile, sidebar harus tertutup secara default
      setIsSidebarOpen(false);
      setIsCollapsed(true); // Di mobile, kita anggap collapsed (atau disembunyikan)
    }
  }, [isDesktop]);

  // Fungsi untuk toggle sidebar mobile
  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fungsi untuk toggle collapsed state (untuk desktop)
  const toggleCollapsedState = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AlertCountProvider>
            <div className="flex min-h-screen bg-background">
              {/* Sidebar */}
              <Sidebar
                isOpen={isSidebarOpen} // Mengontrol visibilitas sidebar secara keseluruhan (terutama mobile)
                onClose={() => setIsSidebarOpen(false)} // Fungsi untuk menutup sidebar mobile
                isCollapsed={isCollapsed} // Meneruskan state collapsed
                setIsCollapsed={toggleCollapsedState} // Meneruskan fungsi setter untuk collapsed
              />

              <div
                className={`flex flex-col flex-1 transition-all duration-300
                  ${
                    isDesktop
                      ? isCollapsed
                        ? "ml-16" // Jika desktop dan collapsed
                        : "ml-64" // Jika desktop dan tidak collapsed
                      : "ml-0" // Jika mobile, margin-left 0 (sidebar akan overlay)
                  }
                `}
              >
                {/* Header */}
                <Header
                  onMenuToggle={toggleMobileSidebar} // Tombol menu di header untuk mobile sidebar
                  isMenuOpen={isSidebarOpen} // Menunjukkan status menu di header
                />
                {/* Main Content */}
                <main className="flex-1 p-4">{children}</main>
              </div>
            </div>
          </AlertCountProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
