import { createClient } from "@supabase/supabase-js";

const supabaseUrl = __api.env.SVELTE_APP_SUPABASE_URL;
const supabaseAnnonKey = __api.env.SVELTE_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnnonKey);