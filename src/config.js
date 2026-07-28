import 'dotenv/config';

const integer = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = Object.freeze({
  port: integer(process.env.PORT, 3000),
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  adminPath: process.env.ADMIN_PATH ?? '/admin',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  eventCapacity: integer(process.env.EVENT_CAPACITY, 12),
  nodeEnv: process.env.NODE_ENV ?? 'development'
});
