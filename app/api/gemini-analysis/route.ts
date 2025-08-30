
import { NextResponse } from 'next/server';
import axios from 'axios';

// Fungsi untuk menghasilkan angka acak dalam rentang
const getRandom = (min: number, max: number, decimals = 0) => {
  return (Math.random() * (max - min) + min).toFixed(decimals);
};

// Data mock untuk berbagai skenario
const mockData = {
  'Status banjir wilayah saya': () => {
    const locations = ['Jakarta Utara', 'Bekasi', 'Tangerang', 'Bandung Selatan'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const waterLevel = getRandom(20, 150);
    const status = waterLevel > 100 ? 'Siaga 1' : waterLevel > 50 ? 'Siaga 2' : 'Aman';
    return `Status banjir di **${randomLocation}** saat ini adalah **${status}** dengan ketinggian air sekitar **${waterLevel} cm**. 

Beberapa titik yang tergenang:
- Jalan Protokol (30-50 cm)
- Area perumahan dekat sungai (60-80 cm)

Tim SAR sudah berada di lokasi untuk evakuasi warga.`;
  },
  'Prediksi cuaca hari ini': async () => {
    try {
      // Mengambil data dari API OpenWeather
      const response = await axios.get('http://localhost:3000/api/weather?lat=-6.2088&lon=106.8456');
      const weather = response.data;

      const { current } = weather;
      const temp = Math.round(current.main?.temp || 0);
      const humidity = current.main?.humidity ?? 'N/A';
      const weatherDesc = current.weather?.[0]?.description || 'Tidak diketahui';

      return `Prediksi cuaca hari ini untuk wilayah Jakarta Pusat:

- **Cuaca**: ${weatherDesc}
- **Suhu**: ${temp}°C
- **Kelembapan**: ${humidity}%
- **Angin**: ${current.wind?.speed.toFixed(1)} m/s

Waspada potensi banjir dan genangan di area dataran rendah.`;
    } catch (error) {
      console.error('Error fetching weather data for assistant:', error);
      return 'Maaf, terjadi kesalahan saat mengambil data cuaca terkini.';
    }
  },
  'Tingkat risiko banjir': () => {
    const riskLevels = ['Tinggi', 'Sedang', 'Rendah'];
    const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    return `Berdasarkan analisis data satelit dan curah hujan, tingkat risiko banjir untuk area Anda dalam 24 jam ke depan adalah **${randomRisk}**. 

**Faktor Pendorong Risiko:**
- Curah hujan tinggi di area hulu
- Drainase perkotaan yang kurang optimal
- Ketinggian permukaan tanah di bawah permukaan laut`;
  },
  'Rekomendasi evakuasi': () => {
    return `Melihat kondisi terkini, berikut adalah rekomendasi evakuasi:

1.  **Prioritaskan kelompok rentan**: Lansia, anak-anak, dan ibu hamil.
2.  **Lokasi evakuasi terdekat**: 
    - Kantor Kelurahan (Kapasitas: 200 orang)
    - Sekolah Negeri 01 (Kapasitas: 350 orang)
3.  **Barang yang perlu dibawa**: Dokumen penting, obat-obatan, pakaian ganti, dan makanan siap saji.

Harap tetap tenang dan ikuti arahan dari petugas di lapangan.`;
  },
  'Analisis trend 5 hari': () => {
    return `Analisis tren dalam 5 hari terakhir menunjukkan **peningkatan volume air** di Pintu Air Manggarai sebesar **15%**. 

- **Hari 1-2**: Curah hujan ringan, level air stabil.
- **Hari 3**: Hujan lebat di area Bogor, level air mulai naik.
- **Hari 4-5**: Kenaikan signifikan, status Siaga 3 ditetapkan.

Diprediksi level air akan terus naik jika hujan tidak berhenti.`;
  },
  'Kondisi stasiun pompa': () => {
    const pumpStatus = ['Beroperasi Normal', 'Mengalami Gangguan Minor', 'Memerlukan Perawatan'];
    const randomStatus = pumpStatus[Math.floor(Math.random() * pumpStatus.length)];
    const activePumps = getRandom(8, 10);
    return `Berikut adalah kondisi stasiun pompa air Pluit saat ini:

- **Status Operasional**: ${randomStatus}
- **Pompa Aktif**: ${activePumps} dari 10 unit
- **Kapasitas Pompa**: 45.000 liter/detik

Catatan: ${randomStatus === 'Beroperasi Normal' ? 'Semua sistem berjalan lancar.' : 'Tim teknis sedang menangani masalah pada 2 pompa.'}`;
  },
  'default': () => {
    return 'Maaf, saya tidak mengerti pertanyaan Anda. Bisa coba tanyakan hal lain terkait analisis banjir?';
  }
};

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Cari fungsi mock data yang cocok dengan prompt
    const handler = mockData[prompt as keyof typeof mockData] || mockData.default;
    const responseText = await handler();

    // Simulasi delay jaringan
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ response: responseText });

  } catch (error) {
    console.error('Error in Gemini Analysis API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server analisis' },
      { status: 500 }
    );
  }
}
