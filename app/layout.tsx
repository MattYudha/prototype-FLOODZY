"use client"; // <-- Keep this here because useState is used

import "./globals.css";
// import type { Metadata } from 'next'; // <--- HAPUS ATAU KOMENTARI INI
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/hooks/useTheme";
import { Toaster } from "react-hot-toast";

import { useState } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

// --- HAPUS ATAU KOMENTARI BLOCK METADATA INI ---
// export const metadata: Metadata = {
//   title: 'Floodzie - Sistem Deteksi Banjir Real-time',
//   description: 'Sistem informasi bencana banjir dan cuaca real-time untuk Indonesia',
//   keywords: 'banjir, cuaca, peringatan, deteksi, monitoring, Indonesia',
//   authors: [{ name: 'Floodzie Team' }],
//   openGraph: {
//     title: 'Floodzie - Sistem Deteksi Banjir Real-time',
//     description: 'Sistem informasi bencana banjir dan cuaca real-time untuk Indonesia',
//     type: 'website',
//     siteName: 'Floodzie',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Floodzie - Sistem Deteksi Banjir Real-time',
//     description: 'Sistem informasi bencana banjir dan cuaca real-time untuk Indonesia',
//   },
//   viewport: 'width=device-width, initial-scale=1',
//   robots: 'index, follow',
// };
// --- AKHIR BLOCK METADATA YANG DIHAPUS/DIKOMENTARI ---

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1">
              <Header
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isMenuOpen={isSidebarOpen}
              />
              <main className="flex-1 p-4 md:ml-64 lg:ml-64">{children}</main>
            </div>
          </div>

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
