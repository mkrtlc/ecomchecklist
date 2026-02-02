import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Server-side client with service role key (full access)
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Singleton for server-side operations
let serverClient: ReturnType<typeof createServerClient> | null = null;

export function getServerClient() {
  if (!serverClient) {
    serverClient = createServerClient();
  }
  return serverClient;
}
