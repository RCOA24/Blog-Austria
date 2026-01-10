import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client with environment variables.
 * Project ID: vobtydktclebqdvnawyt
 */

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Initialize and export Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
