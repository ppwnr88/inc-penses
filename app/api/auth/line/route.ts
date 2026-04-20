import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES } from '@/lib/utils/categories'

const bodySchema = z.object({
  lineUserId: z.string().min(1),
  displayName: z.string().min(1),
  pictureUrl: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { lineUserId, displayName, pictureUrl } = parsed.data
    const supabase = createServerClient()

    // Upsert profile
    const { data: profile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        {
          line_user_id: lineUserId,
          display_name: displayName,
          picture_url: pictureUrl ?? null,
        },
        { onConflict: 'line_user_id' }
      )
      .select()
      .single()

    if (upsertError || !profile) {
      console.error('[Auth] Upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // Seed default categories for new users
    const { count } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    if (count === 0) {
      const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        profile_id: profile.id,
      }))
      await supabase.from('categories').insert(categoriesToInsert)
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('[Auth] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
