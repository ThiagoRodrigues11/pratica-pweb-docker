import { createClient } from '@supabase/supabase-js';
import env from './env.js';

const { supabaseUrl, supabaseKey } = env.storage;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
