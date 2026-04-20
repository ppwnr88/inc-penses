import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Using untyped client in server routes to avoid complex type inference issues.
// Runtime safety is handled by Zod validation at the API boundary.
export function createServerClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createSupabaseClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
