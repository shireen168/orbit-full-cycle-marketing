import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton -- deferred to first request, not evaluated at build time
let _instance: SupabaseClient | null = null;

function getInstance(): SupabaseClient {
  if (!_instance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    _instance = createClient(url, key);
  }
  return _instance;
}

// Proxy maintains the same `supabase.from(...)` call sites without change
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    return (getInstance() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
