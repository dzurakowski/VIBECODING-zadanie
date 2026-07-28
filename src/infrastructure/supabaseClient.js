import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { config } from '../config.js';

const unavailable = () => { throw new Error('Brakuje konfiguracji Supabase. Uzupełnij plik .env.'); };

export const supabase = config.supabaseUrl && config.supabaseAnonKey
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: false }, realtime: { transport: WebSocket } })
  : new Proxy({}, { get: unavailable });

export const serviceSupabase = config.supabaseUrl && config.supabaseServiceRoleKey
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false }, realtime: { transport: WebSocket } })
  : new Proxy({}, { get: unavailable });
