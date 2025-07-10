// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Pastikan variabel lingkungan sudah diatur
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("DEBUG: NEXT_PUBLIC_SUPABASE_URL is undefined.");
} else {
  console.log(
    "DEBUG: NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined.");
} else {
  console.log("DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY loaded."); // Jangan log key aslinya
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("DEBUG: SUPABASE_SERVICE_ROLE_KEY is undefined.");
} else {
  console.log("DEBUG: SUPABASE_SERVICE_ROLE_KEY loaded."); // Jangan log key aslinya
}

// Inisialisasi Supabase Client untuk Sisi Klien (Frontend)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
console.log("DEBUG: supabaseClient initialized.");

// Inisialisasi Supabase Client untuk Sisi Server (API Routes)
export const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // URL tetap sama
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan Service Role Key
);
console.log("DEBUG: supabaseServiceRole initialized.");

// (Kode pengecekan error yang sudah ada bisa dipertahankan)
// if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
//   console.error("Missing Supabase environment variables. Please check your .env.local file.");
// }
