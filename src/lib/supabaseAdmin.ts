import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * PERINGATAN: File ini HANYA boleh dipakai di server (Route Handler / Server
 * Action). Service Role Key mem-bypass Row Level Security sepenuhnya.
 * Jangan pernah import file ini dari komponen 'use client' — paket
 * 'server-only' akan menyebabkan build gagal kalau ada yang mencoba.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
