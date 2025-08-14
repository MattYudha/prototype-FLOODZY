// src/lib/supabaseAdmin.ts
'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Pastikan variabel lingkungan sudah diatur
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('DEBUG: NEXT_PUBLIC_SUPABASE_URL is undefined.');
} else {
  console.log(
    'DEBUG: NEXT_PUBLIC_SUPABASE_URL:',
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('DEBUG: SUPABASE_SERVICE_ROLE_KEY is undefined.');
} else {
  console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY loaded.'); // Jangan log key aslinya
}

// Inisialisasi Supabase Client untuk Sisi Server (API Routes)
export const supabaseServiceRole: SupabaseClient =
  typeof window === 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, // URL tetap sama
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Gunakan Service Role Key
      )
    : ({} as any); // Placeholder kosong jika di sisi klien
if (typeof window === 'undefined') {
  console.log('DEBUG: supabaseServiceRole initialized on server.');
} else {
  console.log('DEBUG: supabaseServiceRole not initialized on client.');
}

// Function for fetching data with retry and structured logging
export async function fetchSupabaseDataWithRetry<T>(
  queryBuilder: (client: SupabaseClient) => any, // Function that returns a Supabase query builder
  tableName: string, // For logging purposes
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<{ data: T[] | null; error: any }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const maskedKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 6) + '...';
  const runtimeMode = process.env.NEXT_RUNTIME || 'nodejs'; // Default to nodejs if not set

  for (let i = 0; i < maxRetries; i++) {
    try {
      const query = queryBuilder(supabaseServiceRole);
      const { data, error } = await query;

      if (error) {
        console.error(
          `[Supabase Fetch Error] Attempt ${i + 1}/${maxRetries} for ${tableName}:`,
          `Project URL: ${supabaseUrl}, Runtime: ${runtimeMode}, Key: ${maskedKey}`,
          `Error: ${error.message}, Details: ${error.details}, Hint: ${error.hint}`,
          error.cause ? `Cause: ${error.cause}` : ''
        );
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i))); // Exponential backoff
        }
        continue;
      }

      console.log(
        `[Supabase Fetch Success] for ${tableName} on attempt ${i + 1}/${maxRetries}.`,
        `Project URL: ${supabaseUrl}, Runtime: ${runtimeMode}, Key: ${maskedKey}`
      );
      return { data, error: null };
    } catch (e: any) {
      console.error(
        `[Supabase Fetch Exception] Attempt ${i + 1}/${maxRetries} for ${tableName}:`,
        `Project URL: ${supabaseUrl}, Runtime: ${runtimeMode}, Key: ${maskedKey}`,
        `Exception: ${e.message}`,
        e.cause ? `Cause: ${e.cause}` : ''
      );
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i))); // Exponential backoff
      }
    }
  }

  return { data: null, error: new Error(`Failed to fetch ${tableName} after ${maxRetries} attempts.`) };
}
