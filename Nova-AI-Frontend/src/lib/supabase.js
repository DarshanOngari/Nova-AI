import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jasgmwrurlzjywvmvyxs.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphc2dtd3J1cmx6anl3dm12eXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTUxNTksImV4cCI6MjEwMjc5MTE1OX0.5K5CbXc79POs_QktHpEO_8ycSVtz5C9mNN6n9_g0mic";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
