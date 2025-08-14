// mattyudha/floodzy/Floodzy-04cbe0509e23f883f290033cafa7f880e929fe65/app/api/gemini-analysis/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log(
  '[Gemini Analysis API] Key Loaded:',
  GEMINI_API_KEY ? '✅ Yes' : '❌ Missing',
);

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!genAI) {
    console.error('[Gemini Analysis API] ❌ API key not found.');
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is missing in environment.' },
      { status: 500 },
    );
  }

  try {
    const rawBody = await request.text();
    console.log('[Gemini Analysis API] 📥 Raw Request Body:', rawBody);

    const body = JSON.parse(rawBody);
    // ✅ Tambahkan log untuk melihat struktur body yang diterima
    console.log('[Gemini Analysis API] Parsed Request Body:', body);

    const { historicalData, userPrompt } = body?.analysisData || {};

    if (!historicalData || !userPrompt) {
      console.warn(
        "[Gemini Analysis API] ⚠️ 'historicalData' or 'userPrompt' missing in request.",
      );
      return NextResponse.json(
        {
          error:
            "'historicalData' and 'userPrompt' are required in request body.",
        },
        { status: 400 },
      );
    }

    const modelName = 'gemini-1.5-flash';

    const prompt = `
Anda adalah seorang ilmuwan data dan analis bencana yang ahli dalam mengidentifikasi pola dan insight dari data historis.
Berdasarkan data insiden historis berikut, lakukan analisis mendalam dan berikan laporan atau insight penting.

Fokus pada permintaan pengguna: "${userPrompt}"

Data Insiden Historis:
---
${historicalData}
---

Analisis Mendalam (dalam bahasa Indonesia, berformat markdown untuk keterbacaan):
`;

    // ✅ Tambahkan log untuk melihat prompt yang akan dikirim ke Gemini
    console.log(
      `[Gemini Analysis API] ✉️ Sending prompt to Gemini. Prompt length: ${prompt.length}`,
    );
    // console.log("[Gemini Analysis API] Full Prompt:\n", prompt); // Hati-hati dengan logging prompt yang sangat panjang di produksi

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const explanation = await response.text();

    console.log('[Gemini Analysis API] ✅ HISTORICAL ANALYSIS generated.');
    return NextResponse.json(
      {
        explanation,
        metadata: {
          generatedAt: new Date().toISOString(),
          modelUsed: modelName,
          promptVersion: 'historical_analysis_v1.0',
          responseLength: explanation.length,
          requestType: 'historical_analysis',
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    // ✅ Log error secara lebih detail
    console.error(
      '[Gemini Analysis API] ❌ Error generating analysis:',
      error?.message,
    );
    if (error?.stack) {
      console.error('[Gemini Analysis API] Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to generate historical analysis.',
        message: error?.message || 'Unknown error',
        stack: error?.stack || null,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  console.log('[Gemini Analysis API] 🔎 Health check passed.');
  return NextResponse.json(
    { message: 'Gemini Analysis API (Flash) is running OK' },
    { status: 200 },
  );
}
