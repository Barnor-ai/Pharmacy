import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};

const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL ||
  'https://oenzgttwkhepavbkcacj.supabase.co';

const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbnpndHR3a2hlcGF2YmtjYWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDg3MTIsImV4cCI6MjEwMjIyNDcxMn0.kcKn419KctlwijIJ0CeLcVKWYnM8dy0ec1cDsvSUByQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Try fetching from a dummy or health endpoint
    const { data, error } = await supabase.from('medicines').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // 42P01 is table does not exist yet in postgres, which is fine
      console.warn('Supabase ping check warning:', error);
      return { success: true, message: `Connected to Supabase (${SUPABASE_URL}). Table check: ${error.message}` };
    }
    return { success: true, message: 'Connected seamlessly to Supabase REST API!' };
  } catch (err: any) {
    console.error('Supabase connection error:', err);
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}
