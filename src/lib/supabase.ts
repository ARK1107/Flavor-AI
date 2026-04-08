import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Only create the real client when properly configured
let _supabase: SupabaseClient;

if (isConfigured) {
  _supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
} else {
  // Minimal stub client that won't crash but won't work either
  // The UI handles this gracefully via AuthContext
  _supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: { message: "Supabase not configured. Please add environment variables." } }),
      signUp: () => Promise.resolve({ data: {}, error: { message: "Supabase not configured. Please add environment variables." } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
  } as unknown as SupabaseClient;
}

export const supabase = _supabase;
export const isSupabaseConfigured = isConfigured;
