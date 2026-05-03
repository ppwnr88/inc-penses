/**
 * Migration: Add lang column to profiles table.
 * Run: node scripts/migrate-add-lang.mjs
 *
 * If the RPC approach fails, run the SQL manually in your Supabase SQL editor.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envVars = Object.fromEntries(
  readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const supabase = createClient(
  envVars['NEXT_PUBLIC_SUPABASE_URL'],
  envVars['SUPABASE_SERVICE_ROLE_KEY']
)

const { error } = await supabase.rpc('exec_sql', {
  sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lang VARCHAR(5) DEFAULT 'th'",
})

if (error) {
  console.log('rpc failed:', error.message)
  console.log('\nPlease run this SQL manually in your Supabase SQL editor:')
  console.log("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lang VARCHAR(5) DEFAULT 'th';")
} else {
  console.log('lang column added to profiles')
}
