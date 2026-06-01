# เงินจด (Ngern Jod)

ผู้ช่วยจดรายรับรายจ่ายส่วนตัวผ่าน LINE สำหรับบันทึกรายการเร็ว ๆ ดูรายงาน ตั้งงบประมาณ และรับสรุปรายเดือนเป็นไฟล์ Excel ทางอีเมล

## Overview

เงินจด is a mobile-first personal finance tracker built as a LINE LIFF app. Users can record income and expenses from LINE text messages, manage categories and budgets, view monthly reports, export data, scan payment slips, and opt in to an automatic previous-month email summary.

**Design**: warm, friendly, mobile-first UI with earth-tone accents.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Database | Supabase PostgreSQL |
| Auth | LINE LIFF profile auth |
| Messaging | LINE Messaging API webhook |
| Email | Resend |
| Scheduled jobs | Vercel Cron |
| AI OCR | Gemini 2.5 Flash Lite |
| Charts | Recharts |
| Export | xlsx |
| Icons | lucide-react |

## Features

| Feature | Status |
|---|---|
| LINE LIFF app with mock-mode development | Done |
| LINE webhook text entry | Done |
| Thai natural text parsing, including `วันที่ N` | Done |
| Auto category from keyword rules | Done |
| LINE Flex confirmation card with monthly totals | Done |
| Undo latest transaction from LINE | Done |
| Monthly summary command from LINE | Done |
| Payment slip image OCR with Gemini | Done |
| Manual transaction CRUD | Done |
| Category management | Done |
| Budget tracking | Done |
| Recurring transactions | Done |
| Monthly reports with charts | Done |
| CSV export | Done |
| Excel export | Done |
| Automatic previous-month email summary with Excel attachment | Done |
| Read-only Backoffice dashboard | Done |
| Daily LINE reminders | Scaffold / not wired |
| Voice input | Scaffold / not wired |

## Project Structure

```text
app/
├── page.tsx                 # Landing page
├── features/page.tsx        # Public feature page
├── liff/                    # LIFF app screens
│   ├── page.tsx             # Dashboard
│   ├── transactions/        # Transaction list and edit flow
│   ├── categories/          # Category management
│   ├── budgets/             # Budgets
│   ├── reports/             # Monthly reports and exports
│   ├── recurring/           # Recurring transactions
│   └── settings/            # Settings, export, email summary opt-in
├── backoffice/              # Read-only admin dashboard
└── api/
    ├── auth/line/           # LINE profile upsert
    ├── webhook/             # LINE Messaging webhook
    ├── cron/monthly-summary # Vercel Cron email job
    ├── backoffice/          # Backoffice auth/session/summary APIs
    ├── export/              # CSV/Excel download
    ├── reports/             # Monthly aggregation
    ├── transactions/        # Transaction CRUD
    ├── categories/          # Category CRUD
    ├── budgets/             # Budget CRUD
    ├── recurring/           # Recurring CRUD
    └── profiles/            # Profile settings

lib/
├── ai/gemini.ts             # Payment slip OCR
├── email/monthly-summary.ts # Email summary and Excel attachment
├── line/reply.ts            # LINE reply/push/Flex messages
├── nlp/                     # Parser and category keyword rules
├── export/                  # Client-side export helpers
└── supabase/                # Supabase clients
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret/service key for server routes, webhooks, and cron jobs | Yes |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF ID | Yes in production |
| `NEXT_PUBLIC_APP_URL` | App base URL | Yes |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API token for profile fetch, image download, reply, and push | Yes for LINE bot |
| `LINE_CHANNEL_SECRET` | LINE Messaging API channel secret for webhook signature verification | Yes for LINE bot |
| `GEMINI_API_KEY` | Gemini API key for payment slip OCR | Yes for OCR |
| `RESEND_API_KEY` | Resend API key for monthly summary emails | Yes for email summary |
| `EMAIL_FROM` | Verified sender email, e.g. `noreply@wannarat.cc` | Yes for email summary |
| `CRON_SECRET` | Secret used by Vercel Cron Authorization header | Yes for scheduled jobs |
| `BACKOFFICE_PASSWORD` | Password for `/backoffice` login | Yes for Backoffice |
| `BACKOFFICE_SESSION_SECRET` | Random secret used to sign Backoffice session cookies | Yes for Backoffice |

Do not commit real secrets. Put them in `.env.local` for local development and Vercel Environment Variables for production.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in the required values. For production, set the same values in Vercel.

### 3. Set Up Database

Run migrations in Supabase SQL Editor in order:

```sql
-- 1. Initial schema
-- Copy and run:
-- supabase/migrations/001_initial_schema.sql

-- 2. Monthly email summary settings
-- Copy and run:
-- supabase/migrations/002_monthly_summary_email.sql

-- 3. Monthly email summary CC field
-- Copy and run:
-- supabase/migrations/003_monthly_summary_email_cc.sql
```

Optional seed data for local/dev:

```sql
-- supabase/seed.sql
```

### 4. Set Up LINE LIFF

1. Create a LINE Login channel in LINE Developers.
2. Add a LIFF app.
3. Set endpoint URL to `https://your-domain.com/liff`.
4. Enable scopes `profile` and `openid`.
5. Put the LIFF ID in `NEXT_PUBLIC_LIFF_ID`.

If `NEXT_PUBLIC_LIFF_ID` is missing or set to `YOUR_LIFF_ID_HERE`, the app runs in mock mode for local development.

### 5. Set Up LINE Messaging Webhook

1. Create or connect a LINE Messaging API channel.
2. Set webhook URL to:

```text
https://your-domain.com/api/webhook
```

3. Set `LINE_CHANNEL_ACCESS_TOKEN`.
4. Set `LINE_CHANNEL_SECRET`.
5. Enable webhook in LINE Developers.

## Monthly Email Summary

Users can enable automatic previous-month summaries in `Settings`. When enabled, the profile must have an email address. The main email and optional CC field both support multiple addresses separated by `;` or `,`.

The system sends every 1st day of the month at 08:00 Asia/Bangkok. Vercel Cron uses UTC, so the production schedule is:

```json
{
  "path": "/api/cron/monthly-summary",
  "schedule": "0 1 1 * *"
}
```

The email is sent with Resend from `EMAIL_FROM`, and includes an Excel attachment containing:

- previous month label, e.g. `เมษายน 2569`
- total income
- total expense
- net balance
- transaction count
- category breakdown
- transaction list

Operational checklist:

1. Verify the sending domain in Resend.
2. Set `EMAIL_FROM=noreply@wannarat.cc` or another verified sender.
3. Set `RESEND_API_KEY`.
4. Set `CRON_SECRET`.
5. Deploy `vercel.json`.
6. Check Vercel Project Settings → Cron Jobs after deployment.

`CRON_SECRET` is compared against the `Authorization: Bearer <CRON_SECRET>` header. Vercel sends this automatically when the environment variable exists.

## Backoffice

Backoffice is available at:

```text
https://your-domain.com/backoffice
```

It is a read-only dashboard for operational visibility. It shows system KPIs, monthly income/expense totals, monthly email summary status, and user-level summary rows. Admins can switch between the latest 6 months and click a user to view read-only transactions for the selected month. It does not expose receipt files or raw attachments and does not allow editing or deleting user data in v1.

Required environment variables:

```text
BACKOFFICE_PASSWORD=your-backoffice-password
BACKOFFICE_SESSION_SECRET=your-random-backoffice-session-secret
```

Generate a strong session secret with:

```bash
openssl rand -base64 32
```

Backoffice uses a signed `httpOnly` cookie named `backoffice_session` with a 24-hour lifetime.

## Common Commands

```bash
npm run dev
npm run build
npm run type-check
```

Note: `npm run lint` currently uses `next lint`, which is no longer valid for this Next.js version. Update the lint script before relying on it in CI.

## Development URLs

```text
Landing page: http://localhost:3000
LIFF app:     http://localhost:3000/liff
Backoffice:   http://localhost:3000/backoffice
```

## Database Schema

Main tables:

- `profiles` — LINE user profiles, preferences, email, monthly summary opt-in
- `categories` — income/expense categories per user
- `transactions` — all income/expense records
- `budgets` — monthly budgets per category
- `recurring_transactions` — recurring income/expense templates
- `monthly_reports` — aggregated monthly summaries
- `reminders` — notification settings
- `attachments` — receipt/document metadata
- `usage_logs` — analytics and monthly email send logs

See:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_monthly_summary_email.sql`
- `supabase/migrations/003_monthly_summary_email_cc.sql`

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` / Supabase secret key must only be used server-side.
- `RESEND_API_KEY`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `GEMINI_API_KEY`, and `CRON_SECRET` must never be committed.
- Current Supabase RLS policies in the initial migration are permissive for app-level auth. Tighten these before handling sensitive multi-user production data outside trusted server routes.
- Vercel Cron endpoint is protected by `CRON_SECRET`.
- Backoffice is protected by `BACKOFFICE_PASSWORD` and a signed httpOnly session cookie.

## TODO

- Replace deprecated `next lint` script with an ESLint command compatible with the current Next.js version.
- Tighten Supabase RLS policies.
- Wire daily LINE reminders if still needed.
- Wire voice input if still needed.

## License

MIT
