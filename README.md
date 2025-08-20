# 🌊 Floodzy - Real-time Flood Detection & Weather Monitoring System

<div align="center">
  <img src="public/assets/banjir.png" alt="Floodzy Logo" width="200"/>
  
  <p align="center">
    <strong>Comprehensive flood monitoring, weather tracking, and early warning platform for Indonesia</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
  </p>
</div>

---

## 🚀 Overview
Floodzy adalah sistem pemantauan banjir dan peringatan dini real-time yang memanfaatkan teknologi modern seperti **Next.js**, **TypeScript**, **Tailwind CSS**, dan **Supabase**.  
Platform ini menyediakan data ketinggian air, status pompa, prakiraan cuaca, analisis bencana, dan peta interaktif untuk mendukung mitigasi bencana di Indonesia.

---

## ✨ Features

### 🗺️ Mapping & Visualization
- Peta interaktif berbasis Leaflet dengan marker sensor.
- Layer banjir, cuaca, dan titik evakuasi.
- Map legend dan kontrol interaktif.

### 🌡️ Weather & Flood Data
- Data cuaca real-time (temperatur, kelembapan, kecepatan angin).
- Integrasi OpenWeatherMap.
- Riwayat cuaca & banjir.

### 🚨 Alerts & Analysis
- Peringatan bencana dengan sumber data terintegrasi.
- Analisis bencana otomatis menggunakan Gemini API.
- Ringkasan berita bencana.

### 📍 Region & Evacuation
- Pilihan wilayah hingga tingkat kota/kecamatan.
- Informasi jalur & titik evakuasi.

### 💬 User Interaction
- Laporan banjir langsung dari pengguna.
- Chatbot informasi banjir & cuaca.

### 🛠 Developer Friendly
- API publik (`/api`) untuk integrasi data.
- Custom hooks untuk pengelolaan state & UI.


## 📁 Project Structure

```plaintext
floodzy/
├── app/                                   # Halaman utama & API Routes (Next.js App Router)
│   ├── api/                               # Endpoint API (Server Actions / API Routes)
│   │   ├── analysis/route.ts              # Analisis bencana berbasis AI
│   │   ├── alerts-data/route.ts           # Data peringatan bencana dari sumber eksternal
│   │   ├── chatbot/route.ts               # Chatbot banjir & cuaca
│   │   ├── evakuasi/route.ts               # Titik evakuasi terdekat
│   │   ├── gemini-alerts/route.ts         # Peringatan otomatis berbasis Gemini AI
│   │   ├── gemini-analysis/route.ts       # Analisis banjir otomatis dengan AI
│   │   ├── laporan/route.ts               # Laporan banjir dari pengguna
│   │   ├── pump-status-proxy/route.ts     # Status pompa air banjir
│   │   ├── regions/route.ts               # Data wilayah monitoring
│   │   ├── summarize-news-batch/route.ts  # Ringkasan berita bencana
│   │   ├── water-level-proxy/route.ts     # Data ketinggian air
│   │   ├── weather/route.ts               # Cuaca saat ini
│   │   ├── weather-history/route.ts       # Riwayat cuaca historis
│   │   └── ...
│   ├── peta-banjir/page.tsx               # Halaman peta banjir interaktif
│   ├── lapor-banjir/page.tsx              # Form laporan banjir pengguna
│   ├── prakiraan-cuaca/page.tsx           # Halaman prakiraan cuaca
│   ├── statistika/page.tsx                # Statistik & analisis banjir
│   └── ...
│
├── components/                            # Komponen UI & modul aplikasi
│   ├── dashboard/                         # Statistik, grafik, dan analisis data
│   ├── flood/                             # Kartu informasi & alert banjir
│   ├── map/                               # Komponen peta (Leaflet, Mapbox)
│   ├── weather/                           # Tampilan data cuaca real-time
│   ├── ui/                                # Reusable UI components (Shadcn/UI)
│   └── ...
│
├── hooks/                                 # Custom React Hooks
│   ├── useAirPollutionData.ts             # Data kualitas udara
│   ├── useBmkgQuakeData.ts                # Data gempa dari BMKG
│   ├── useDisasterData.ts                 # Data bencana umum
│   ├── usePumpStatusData.ts               # Status pompa banjir
│   ├── useRegionData.ts                   # Data wilayah & monitoring
│   ├── useWaterLevelData.ts               # Data ketinggian air
│   ├── useTheme.ts                        # Manajemen tema UI
│   ├── useDebounce.ts                     # Debouncing untuk input
│   └── ...
│
├── lib/                                   # Utility functions & service API
│   ├── supabase/                          # Client & server Supabase
│   │   ├── client.ts                      # Supabase client-side instance
│   │   ├── server.ts                      # Supabase server-side instance
│   │   └── ...
│   ├── api.client.ts                      # Helper untuk request API dari client
│   ├── api.server.ts                      # Helper untuk request API dari server
│   ├── geocodingService.ts                # Layanan geocoding (Mapbox / OSM)
│   └── ...
│
├── public/                                # Aset publik (gambar, ikon, logo)
│   ├── assets/                            # Gambar & ikon aplikasi
│   └── ...
│
├── types/                                 # Definisi TypeScript types & interfaces
│   ├── weather.d.ts                       # Tipe data cuaca
│   ├── flood.d.ts                         # Tipe data banjir
│   └── ...
│
└── ...
```
## 🌟 Roadmap

- [x] 🌊 **Monitoring Banjir Dasar** – Peta interaktif & data ketinggian air.
- [x] 🌦 **Integrasi Cuaca & Peta** – Data cuaca real-time, prakiraan, dan visualisasi.
- [x] 📱 **Aplikasi Mobile** – Versi Android & iOS untuk pemantauan di genggaman.
- [x] 🤖 **Prediksi AI Banjir** – Analisis risiko banjir berbasis Machine Learning.
- [x] 📡 **Integrasi IoT Sensor** – Data real-time dari sensor fisik lapangan.
- [x] 🗣 **Laporan Komunitas** – Sistem pelaporan banjir berbasis partisipasi warga.

```plaintext
| Endpoint                 | Deskripsi                              | Parameter            |
| ------------------------ | -------------------------------------- | -------------------- |
| `/api/analysis`          | Analisis data bencana berbasis AI      | -                    |
| `/api/alerts-data`       | Data peringatan bencana                | -                    |
| `/api/chatbot`           | Chatbot informasi banjir & cuaca       | `message`            |
| `/api/evakuasi`          | Titik evakuasi terdekat                | `regionId`           |
| `/api/gemini-alerts`     | Peringatan otomatis berbasis Gemini AI | -                    |
| `/api/gemini-analysis`   | Analisis mendalam banjir berbasis AI   | -                    |
| `/api/laporan`           | Laporan banjir pengguna                | `location`, `status` |
| `/api/pump-status-proxy` | Status pompa banjir                    | `pumpId`             |
| `/api/regions`           | Daftar wilayah monitoring              | -                    |
| `/api/water-level-proxy` | Ketinggian air                         | `stationId`          |
| `/api/weather`           | Cuaca terkini                          | `lat`, `lon`         |
| `/api/weather-history`   | Riwayat cuaca                          | `regionId`           |


```
```plaintext
## Custom Hooks

useRegionData → Data wilayah & monitoring

usePumpStatusData → Status pompa banjir

useWaterLevelData → Data ketinggian air

useAirPollutionData → Data kualitas udara

useBmkgQuakeData → Data gempa dari BMKG

useDisasterData → Data bencana umum

useTheme → Manajemen tema UI

useDebounce → Input debouncing

use-toast → Notifikasi toast

```

```plaintext
💻 Usage

Basic

Jalankan npm run dev

Buka http://localhost:3000

Pilih wilayah di dropdown/map

Lihat data banjir, cuaca, dan analisis

Advanced

Kirim laporan banjir via menu Lapor Banjir

Gunakan chatbot untuk informasi cepat

Lihat analisis bencana di dashboard
```

```plaintext
Buat file .env.local:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENWEATHER_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...

```
```plaintext
📊 Performance

Lighthouse Score: 95+

FCP: < 1.5s

TTI: < 3s

🛡️ Security

Supabase Row Level Security (RLS)

Validasi input di server

API key aman di environment variables
```



```plaintext
🎉 Acknowledgments

OpenWeatherMap

Supabase

Leaflet

BMKG

Kementerian PUPR
```


MIT License

Copyright (c) 2025 Matt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

