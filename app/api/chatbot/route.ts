// app/api/chatbot/route.ts (MODIFIED: Improved Weather Location Handling & Debugging)

import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  Tool,
  FunctionDeclaration,
  SchemaType,
} from '@google/generative-ai';
import {
  fetchWaterLevelData,
  fetchPumpStatusData,
  fetchBmkgLatestQuake,
  fetchPetabencanaReports,
  fetchWeatherData,
  geocodeLocation,
  WaterLevelPost,
  PumpData,
  BmkgGempaData,
  PetabencanaReport,
  WeatherData,
  NominatimResult,
  FetchPetabencanaReportsArgs,
  FetchWeatherDataArgs,
  GeocodeLocationArgs,
  DisplayNotificationArgs,
} from '@/lib/api'; // Pastikan path ini benar

// Inisialisasi Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// API Key untuk OpenWeatherMap (harus diatur di .env)
const OPEN_WEATHER_API_KEY =
  process.env.OPEN_WEATHER_API_KEY || 'b48e2782f52bd9c6783ef14a35856abc'; // Fallback jika tidak diatur

// ===============================================
// DEFINISI FUNGSI/TOOLS YANG BISA DIAKSES GEMINI
// ===============================================

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'fetchWaterLevelData',
        description: 'Mendapatkan data tinggi muka air dari pos-pos hidrologi.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
          required: [] as string[],
        },
      },
      {
        name: 'fetchPumpStatusData',
        description: 'Mendapatkan status operasional pompa-pompa banjir.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
          required: [] as string[],
        },
      },
      {
        name: 'fetchBmkgLatestQuake',
        description: 'Mendapatkan informasi gempa bumi terkini dari BMKG.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
          required: [] as string[],
        },
      },
      {
        name: 'fetchPetabencanaReports',
        description:
          'Mendapatkan laporan bencana (banjir, gempa, dll.) dari PetaBencana.id.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            hazardType: {
              type: SchemaType.STRING,
              description:
                "Jenis bencana (misal: 'flood', 'earthquake', 'haze', 'volcano'). Default 'flood'.",
              enum: [
                'flood',
                'earthquake',
                'haze',
                'volcano',
                'wind',
                'fire',
                'landslide',
              ],
              format: 'enum',
            },
            timeframe: {
              type: SchemaType.STRING,
              description:
                "Rentang waktu laporan (misal: '1h', '6h', '24h', '3d', '7d'). Default '24h'.",
              enum: ['1h', '6h', '24h', '3d', '7d'],
              format: 'enum',
            },
          }, // This closes the properties object
          required: [] as string[], // This is now at the correct level
        },
      },
      {
        // Tool for geocoding location names to coordinates (still available for other uses, but weather will handle its own geocoding)
        name: 'geocodeLocation',
        description:
          'Mengubah nama lokasi (kota, kabupaten, kecamatan) menjadi koordinat Latitude dan Longitude. Gunakan ini jika Anda perlu koordinat spesifik untuk fungsi lain.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description:
                "Nama lokasi yang ingin dicari koordinatnya (contoh: 'Tangerang', 'Surabaya').",
            },
          },
          required: ['query'],
        },
      },
      {
        // Tool for fetching weather data (lat/lon/locationName are now OPTIONAL for Gemini)
        name: 'fetchWeatherData',
        description:
          "Mendapatkan kondisi cuaca saat ini untuk lokasi tertentu. Jika 'locationName' diberikan (misal: 'Bandung', 'Surabaya', 'Jakarta'), sistem akan otomatis mencari koordinatnya. Jika 'lat' dan 'lon' diberikan, gunakan itu. Jika tidak ada lokasi spesifik, akan menggunakan lokasi default (Jakarta). Contoh penggunaan: 'fetchWeatherData(locationName: \"Tangerang\")' atau 'fetchWeatherData(lat: -6.2, lon: 106.8)'",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            lat: {
              type: SchemaType.NUMBER,
              description: 'Latitude lokasi.',
            },
            lon: {
              type: SchemaType.NUMBER,
              description: 'Longitude lokasi.',
            },
            locationName: {
              // Gemini can now provide a location name directly to this tool
              type: SchemaType.STRING,
              description:
                "Nama lokasi yang disebutkan pengguna (misal: 'Bandung', 'Surabaya', 'Jakarta').",
            },
          },
          required: [] as string[], // Make all parameters optional for Gemini's initial call
        },
      },
      {
        name: 'displayNotification',
        description:
          'Menampilkan notifikasi popup kepada pengguna di antarmuka aplikasi.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            message: {
              type: SchemaType.STRING,
              description: 'Pesan yang akan ditampilkan dalam notifikasi.',
            },
            type: {
              type: SchemaType.STRING,
              description:
                "Jenis notifikasi (misal: 'success', 'error', 'warning', 'info', 'default').",
              enum: ['success', 'error', 'warning', 'info', 'default'],
              format: 'enum',
            },
            duration: {
              type: SchemaType.NUMBER,
              description:
                'Durasi notifikasi dalam milidetik sebelum menghilang secara otomatis. Default 5000ms.',
            },
          },
          required: ['message'],
        },
      },
    ],
  },
];

// ===============================================
// FUNGSI UTAMA UNTUK MENANGANI PERTANYAAN CHATBOT
// ===============================================

export async function POST(request: Request) {
  if (!genAI) {
    console.error('[Chatbot API] ❌ GEMINI_API_KEY is missing in environment.');
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is missing in environment.' },
      { status: 500 },
    );
  }

  try {
    const { question, history } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required.' },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: tools,
      // NEW: System Instruction to guide Gemini's behavior
      systemInstruction:
        "Anda adalah asisten informasi Floodzy. Gunakan fungsi yang tersedia untuk mendapatkan data real-time tentang cuaca, banjir, tinggi muka air, dan status pompa. Selalu prioritaskan penggunaan 'locationName' saat mencari cuaca jika pengguna menyebutkan nama lokasi, dan sistem akan mencari koordinatnya secara otomatis. Berikan jawaban yang ringkas, informatif, dan relevan dengan pertanyaan pengguna. Contoh: Untuk 'cuaca di Tangerang', panggil 'fetchWeatherData' dengan 'locationName: \"Tangerang\"'. Gunakan fungsi 'displayNotification' untuk menampilkan pesan popup penting kepada pengguna, misalnya untuk konfirmasi sukses, peringatan, atau informasi yang perlu segera diketahui pengguna. Contoh: 'displayNotification(message: \"Data berhasil diperbarui!\")' atau 'displayNotification(message: \"Terjadi kesalahan saat mengambil data cuaca.\", type: \"error\")'.",
    });

    const chat = model.startChat({
      history: history || [],
    });

    console.log('[Chatbot API] User Question:', question);

    const result = await chat.sendMessage(question);
    const call = result.response.functionCall();
    const directTextResponse = result.response.text();

    let finalAnswer = '';
    let notificationPayload: {
      message: string;
      type?: string;
      duration?: number;
    } | null = null;

    // Memeriksa apakah ada panggilan fungsi yang valid dan namanya tidak kosong
    if (
      call &&
      call.name &&
      typeof call.name === 'string' &&
      call.name.length > 0
    ) {
      console.log(
        `[Chatbot API] 🛠️ Gemini Suggested Function: ${call.name} with args:`,
        call.args,
      );

      let toolResponseData: any;
      let functionExecutedSuccessfully = false;

      try {
        if (call.name === 'fetchWaterLevelData') {
          toolResponseData = await fetchWaterLevelData();
        } else if (call.name === 'fetchPumpStatusData') {
          toolResponseData = await fetchPumpStatusData();
        } else if (call.name === 'fetchBmkgLatestQuake') {
          toolResponseData = await fetchBmkgLatestQuake();
        } else if (call.name === 'fetchPetabencanaReports') {
          const args = call.args as FetchPetabencanaReportsArgs;
          toolResponseData = await fetchPetabencanaReports(
            args.hazardType,
            args.timeframe,
          );
        } else if (call.name === 'geocodeLocation') {
          // Handle geocoding tool
          const args = call.args as GeocodeLocationArgs;
          console.log(
            `[Chatbot API] Executing geocodeLocation for query: ${args.query}`,
          );
          const geocodeResults: NominatimResult[] = await geocodeLocation(
            args.query,
          );
          if (geocodeResults && geocodeResults.length > 0) {
            toolResponseData = geocodeResults[0]; // Ambil hasil pertama
            console.log(
              `[Chatbot API] geocodeLocation success:`,
              toolResponseData,
            );
          } else {
            toolResponseData = {
              error: `Tidak dapat menemukan koordinat untuk '${args.query}'.`,
            };
            console.warn(
              `[Chatbot API] geocodeLocation failed for query: '${args.query}'.`,
            );
          }
        } else if (call.name === 'fetchWeatherData') {
          // Handle weather tool
          const args = call.args as FetchWeatherDataArgs;
          let lat = args.lat;
          let lon = args.lon;
          const locationName = args.locationName; // Dapatkan nama lokasi jika ada

          console.log(
            `[Chatbot API] fetchWeatherData called with lat: ${lat}, lon: ${lon}, locationName: ${locationName}`,
          );

          if (!lat || !lon) {
            // Jika lat/lon tidak disediakan oleh Gemini
            if (locationName) {
              console.log(
                `[Chatbot API] Attempting to geocode '${locationName}' internally for weather.`,
              );
              const geocodeResults: NominatimResult[] =
                await geocodeLocation(locationName);
              if (geocodeResults && geocodeResults.length > 0) {
                lat = parseFloat(geocodeResults[0].lat);
                lon = parseFloat(geocodeResults[0].lon);
                console.log(
                  `[Chatbot API] Internal geocoding success for '${locationName}': lat=${lat}, lon=${lon}`,
                );
              } else {
                console.warn(
                  `[Chatbot API] Internal geocoding failed for '${locationName}'. Falling back to default Jakarta.`,
                );
                lat = -6.2088; // Default Jakarta
                lon = 106.8456; // Default Jakarta
                // toolResponseData ini akan diganti oleh hasil fetchWeatherData, tapi kita bisa tambahkan info error awal
                toolResponseData = {
                  error: `Tidak dapat menemukan lokasi '${locationName}'. Menampilkan cuaca Jakarta.`,
                };
              }
            } else {
              console.log(
                '[Chatbot API] No location specified for weather. Using default Jakarta.',
              );
              lat = -6.2088; // Default Jakarta
              lon = 106.8456; // Default Jakarta
            }
          }

          if (lat && lon) {
            console.log(
              `[Chatbot API] Fetching weather data for lat: ${lat}, lon: ${lon}`,
            );
            toolResponseData = await fetchWeatherData(
              lat,
              lon,
              OPEN_WEATHER_API_KEY,
            );
            // Tambahkan nama lokasi ke respons agar Gemini bisa merujuknya
            if (locationName) {
              toolResponseData = {
                ...toolResponseData,
                locationName: locationName,
              };
            } else if (lat === -6.2088 && lon === 106.8456) {
              toolResponseData = {
                ...toolResponseData,
                locationName: 'Jakarta',
              };
            }
            console.log(
              `[Chatbot API] fetchWeatherData success:`,
              toolResponseData,
            );
          } else {
            console.error(
              '[Chatbot API] Fatal: Could not determine valid coordinates for weather fetch.',
            );
            throw new Error(
              'Tidak dapat menentukan lokasi untuk mencari cuaca.',
            );
          }
        } else if (call.name === 'displayNotification') {
          // Handle displayNotification tool
          const args = call.args as DisplayNotificationArgs;
          notificationPayload = {
            message: args.message,
            type: args.type || 'default',
            duration: args.duration || 5000,
          };
          toolResponseData = { status: 'Notification instruction sent.' };
          console.log(
            '[Chatbot API] Notification payload:',
            notificationPayload,
          );
        } else {
          console.warn(
            `[Chatbot API] ⚠️ Fungsi '${call.name}' tidak dikenal oleh backend.`,
          );
          throw new Error(`Fungsi tidak dikenal: ${call.name}`);
        }
        functionExecutedSuccessfully = true;
        console.log(
          `[Chatbot API] ✅ Tool execution successful. Response Data:`,
          toolResponseData,
        );

        // Kirimkan hasil toolResponse kembali ke Gemini
        const toolResult = await chat.sendMessage([
          {
            functionResponse: {
              name: call.name,
              response: toolResponseData || {}, // Pastikan response adalah objek (bisa kosong)
            },
          },
        ]);
        finalAnswer = toolResult.response.text();
        console.log(
          '[Chatbot API] ✨ Final Answer from Gemini (after tool use):',
          finalAnswer,
        );
      } catch (toolExecutionError: any) {
        console.error(
          `[Chatbot API] ❌ Error executing tool '${call.name}':`,
          toolExecutionError.message,
        );
        try {
          // Kirim error kembali ke Gemini agar bisa merespons dengan tepat
          const errorResponseToGemini = {
            error: toolExecutionError.message || 'Gagal mengambil data.',
          };
          const errorResult = await chat.sendMessage([
            {
              functionResponse: {
                name: call.name,
                response: errorResponseToGemini,
              },
            },
          ]);
          finalAnswer = errorResult.response.text(); // Dapatkan interpretasi Gemini dari error
          console.log(
            "[Chatbot API] ⚠️ Gemini's interpretation of tool error:",
            finalAnswer,
          );
        } catch (geminiErrorInterpretation: any) {
          console.error(
            "[Chatbot API] ‼️ Error getting Gemini's error interpretation:",
            geminiErrorInterpretation.message,
          );
          finalAnswer = `Maaf, saya mengalami kesulitan teknis saat memproses data. (${toolExecutionError.message})`;
        }
      }
    } else {
      finalAnswer = directTextResponse;
      console.log(
        '[Chatbot API] 💬 Direct Answer from Gemini (no tool call or malformed tool call):',
        finalAnswer,
      );
    }

    if (!finalAnswer || finalAnswer.trim() === '') {
      finalAnswer =
        'Maaf, saya tidak dapat menemukan informasi yang relevan saat ini. Bisakah Anda mencoba pertanyaan lain?';
      console.warn('[Chatbot API] 🚨 Fallback: Final answer was empty.');
    }

    return NextResponse.json(
      { answer: finalAnswer, notification: notificationPayload },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(
      '[Chatbot API] Fatal Error in POST handler:',
      error?.message,
      error?.stack,
    );
    const errorMessage =
      'Terjadi kesalahan internal server yang tidak terduga. Mohon coba lagi nanti.';
    return NextResponse.json(
      {
        error: errorMessage,
        message: errorMessage,
        stack:
          process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chatbot API (Flash) is running OK' },
    { status: 200 },
  );
}
