import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isUrlValid = supabaseUrl.startsWith('http');

if (!isUrlValid || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials invalid or missing in .env. Real-time sync disabled.');
}

export const isSupabaseConfigured = Boolean(isUrlValid && supabaseAnonKey);
export const supabase = createClient(
  isUrlValid ? supabaseUrl : 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
