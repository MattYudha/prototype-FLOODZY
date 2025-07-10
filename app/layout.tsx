import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Floodzie - Sistem Deteksi Banjir Real-time',
  description: 'Sistem informasi bencana banjir dan cuaca real-time untuk Indonesia',
  keywords: 'banjir, cuaca, peringatan, deteksi, monitoring, Indonesia',
  authors: [{ name: 'Floodzie Team' }],
  openGraph: {
    title: 'Floodzie - Sistem Deteksi Banjir Real-time',
    description: 'Sistem informasi bencana banjir dan cuaca real-time untuk Indonesia',
    type: 'website',
    siteName: 'Floodzie',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Floodzie - Sistem Deteksi Banjir Real-time',
    description: 'Sistem informasi bencana banjir dan cuaca real-time untuk Indonesia',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}