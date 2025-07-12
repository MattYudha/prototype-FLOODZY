// app/layout.tsx
"use client"; // <-- Keep this here because useState is used

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/hooks/useTheme";
import { Toaster } from "react-hot-toast";

import { useState } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AlertCountProvider } from "@/components/contexts/AlertCountContext"; // <--- IMPORT INI

const inter = Inter({ subsets: ["latin"] });

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
          {/* Bungkus dengan AlertCountProvider */}
          <AlertCountProvider>
            {" "}
            {/* <--- TAMBAHKAN INI */}
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
          </AlertCountProvider>{" "}
          {/* <--- TUTUP DI SINI */}
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
