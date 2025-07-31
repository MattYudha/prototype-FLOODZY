import { createBrowserClient } from '@supabase/ssr';

// Fungsi ini membuat instance Supabase yang aman untuk digunakan di browser.
// Hanya menggunakan kunci 'anon' yang bersifat publik.
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
