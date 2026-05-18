import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
  throw new Error("VITE_SUPABASE_URL is missing. Add it to Netlify environment variables.");
}

if (!supabaseKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is missing. Add it to Netlify environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
