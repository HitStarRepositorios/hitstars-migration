import { createClient } from "@supabase/supabase-js";

// Cliente público para uso en el navegador (anon key)
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
