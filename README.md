# Floodzy - Sistem Deteksi Banjir & Monitoring Cuaca Real-time

![Floodzy Logo](https://raw.githubusercontent.com/mattyudha/floodzy/main/public/images/floodzy-logo.png)
*(Gambar ini adalah placeholder, Anda bisa menggantinya dengan logo atau screenshot aplikasi Anda)*

Floodzy adalah platform mutakhir yang dirancang untuk memberikan informasi dan peringatan *real-time* mengenai banjir dan kondisi cuaca di seluruh Indonesia. Dengan antarmuka yang intuitif dan data yang terintegrasi, Floodzy bertujuan untuk membantu masyarakat, pihak berwenang, dan organisasi dalam mitigasi bencana serta pengambilan keputusan yang cepat dan tepat.

## Fitur Utama

* **Peta Interaktif:** Visualisasi data rawan banjir, stasiun cuaca, dan pos duga muka air (TMA) pada peta interaktif berbasis Leaflet.
* **Deteksi & Peringatan Banjir:** Memberikan peringatan dini banjir berdasarkan data yang terintegrasi dari berbagai sumber.
* **Monitoring Cuaca *Real-time*:** Menampilkan data cuaca terkini seperti suhu, kelembaban, kecepatan angin, dan kondisi cuaca di lokasi yang dipilih.
* **Seleksi Wilayah Detail:** Pengguna dapat memilih wilayah mulai dari Provinsi, Kabupaten/Kota, hingga Kecamatan untuk mendapatkan informasi spesifik.
* **Status Pompa Banjir:** Memantau kondisi dan status operasional pompa-pompa banjir yang terdaftar.
* **Antarmuka Responsif & Dinamis:** Dibangun dengan Next.js dan Tailwind CSS untuk pengalaman pengguna yang mulus di berbagai perangkat, dilengkapi animasi halus menggunakan Framer Motion.
* **Integrasi API Eksternal:** Mengambil data dari OpenWeatherMap (cuaca), Overpass API (data OpenStreetMap untuk area rawan bencana), serta API kustom untuk data regional, pos duga air (PUPR/Sihka/GEO API), dan status pompa.

## Teknologi yang Digunakan

* **Framework:** [Next.js 13](https://nextjs.org/) (React Framework)
* **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Komponen UI:** [Shadcn/ui](https://ui.shadcn.com/)
* **Peta:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
* **Animasi:** [Framer Motion](https://www.framer.com/motion/)
* **State Management/Hooks:** Custom Hooks (e.g., `useRegionData`, `useMediaQuery`, `useTheme`, `useDebounce`, `useToast`)
* **Charting:** [Recharts](https://recharts.org/en-US/)
* **Carousel:** [Embla Carousel React](https://www.embla-carousel.com/docs/get-started/react/)
* **Database/Backend as a Service:** [Supabase](https://supabase.io/) (digunakan untuk data regional, pos duga air, dan pompa banjir)

## Instalasi dan Setup

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda:

### Prasyarat

* [Node.js](https://nodejs.org/en/) (versi 16.14.0 atau lebih tinggi, direkomendasikan versi 18 atau lebih tinggi)
* [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)

### Langkah-langkah

1.  **Clone Repositori:**

    ```bash
    git clone [https://github.com/mattyudha/floodzy.git](https://github.com/mattyudha/floodzy.git)
    cd floodzy
    ```

2.  **Instal Dependensi:**

    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Variabel Lingkungan:**

    Buat file `.env.local` di root proyek Anda dengan isi sebagai berikut:

    ```env
    # Supabase (untuk data regional, pos duga air, dan status pompa)
    NEXT_PUBLIC_SUPABASE_URL="URL_SUPABASE_PROYEK_ANDA"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="PUBLIC_ANON_KEY_SUPABASE_ANDA"
    SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY_SUPABASE_ANDA" # Hanya untuk API Route server-side

    # OpenWeatherMap (untuk data cuaca)
    OPENWEATHER_API_KEY="API_KEY_OPENWEATHERMAP_ANDA"

    # Opsional: Konfigurasi lainnya
    # NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="YOUR_MAPBOX_ACCESS_TOKEN"
    ```

    * Anda dapat mendapatkan kredensial Supabase dari *dashboard* proyek Supabase Anda. Pastikan `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di API Route sisi server untuk keamanan.
    * Dapatkan `OPENWEATHER_API_KEY` dari situs [OpenWeatherMap](https://openweathermap.org/api).

4.  **Jalankan Server Pengembangan:**

    ```bash
    npm run dev
    # atau
    yarn dev
    ```

    Aplikasi akan berjalan di `http://localhost:3000`.

## Penggunaan

Setelah aplikasi berjalan:

1.  Akses `http://localhost:3000` di *browser* Anda.
2.  Gunakan *dropdown* di bagian "Pilih Lokasi Wilayah Anda" untuk memilih Provinsi, Kabupaten/Kota, dan Kecamatan yang ingin Anda pantau.
3.  Peta banjir akan menampilkan informasi relevan berdasarkan lokasi yang dipilih.
4.  Lihat "Status Sistem Pompa" dan "Aktivitas Terkini" di *dashboard* untuk mendapatkan *insight* data penting.

## Struktur Proyek (Ringkasan).
├── app/
│   ├── api/                  # API Routes untuk fetching data (regional, water-level, pump-status)
│   ├── globals.css           # Global CSS dan konfigurasi Tailwind
│   ├── layout.tsx            # Layout utama aplikasi Next.js
│   └── page.tsx              # Halaman utama (Dashboard) yang mengintegrasikan komponen
├── components/
│   ├── dashboard/            # Komponen untuk statistik dashboard
│   ├── flood/                # Komponen terkait peringatan banjir
│   ├── layout/               # Header dan Sidebar
│   ├── map/                  # Komponen peta (FloodMap, MapControls, MapLegend)
│   ├── region-selector/      # Dropdown pemilihan wilayah
│   ├── ui/                   # Komponen UI dari Shadcn/ui
│   └── weather/              # Komponen tampilan cuaca
├── hooks/                    # Custom React Hooks (e.g., useRegionData, useTheme)
├── lib/                      # Utilitas dan layanan API (e.g., api.ts, supabase.ts, constants.ts, utils.ts)
├── public/                   # Aset statis (gambar, favicon)
├── types/                    # Definisi tipe TypeScript
├── .env.local                # File konfigurasi lingkungan (tidak di-commit)
├── next.config.js            # Konfigurasi Next.js
├── package.json              # Daftar dependensi dan script
├── postcss.config.js         # Konfigurasi PostCSS
└── tailwind.config.ts        # Konfigurasi Tailwind CSS


## Kontribusi

Kami menyambut kontribusi dari komunitas! Jika Anda tertarik untuk berkontribusi, silakan:

1.  Fork repositori ini.
2.  Buat branch baru (`git checkout -b feature/nama-fitur-baru`).
3.  Lakukan perubahan dan commit (`git commit -m 'Tambahkan fitur baru'`).
4.  Push ke branch Anda (`git push origin feature/nama-fitur-baru`).
5.  Buat Pull Request.

Mohon pastikan kode Anda mengikuti standar yang ada dan tes lulus sebelum membuat *pull request*.

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](#license) untuk detail lebih lanjut.

---

## LICENSE

MIT License

Copyright (c) 2025 [Your Name or Organization/Floodzy Team]

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
