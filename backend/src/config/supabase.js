import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

// We provide two clients:
// 1. The anon client (for regular operations, subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. The admin client (bypasses RLS, used for creating users, validating roles, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
