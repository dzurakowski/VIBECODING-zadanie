import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const unavailable = () => { throw new Error('Brakuje konfiguracji Supabase. Uzupełnij plik .env.'); };

export const supabase = config.supabaseUrl && config.supabaseAnonKey
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: false } })
  : new Proxy({}, { get: unavailable });

export const serviceSupabase = config.supabaseUrl && config.supabaseServiceRoleKey
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false } })
  : new Proxy({}, { get: unavailable });
