import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Client aman dipakai di browser — HANYA anon key, tidak pernah service role key.
// Pakai createBrowserClient (bukan createClient biasa) supaya sesi login
// juga tersimpan di cookie, sehingga middleware.ts (server-side) bisa ikut
// membaca status login untuk proteksi route tambahan.
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
