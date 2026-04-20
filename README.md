# เงินจด (Ngern Jod)

ผู้ช่วยจดรายรับรายจ่ายส่วนตัว ผ่าน LINE — ง่าย เร็ว ไม่ยุ่งยาก

## Overview

เงินจด is a personal finance tracking app built as a LINE LIFF (LINE Front-end Framework) application. Users can log income and expenses, set budgets, view reports with charts, and export data — all from within LINE.

**Design**: Warm, friendly, mobile-first — earth tones (olive/sage/moss/sand/cream)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| Auth | LINE LIFF SDK |
| Forms | react-hook-form + Zod |
| Charts | recharts |
| Date utils | date-fns |
| Export | xlsx |
| Icons | lucide-react |

## Project Structure

```
app/
├── page.tsx              # Landing page (public)
├── features/page.tsx     # Features showcase (public)
├── liff/                 # LIFF app (LINE auth required)
│   ├── layout.tsx        # LiffProvider + BottomNav wrapper
│   ├── page.tsx          # Dashboard
│   ├── transactions/     # Transaction list & management
│   ├── categories/       # Category management
│   ├── budgets/          # Budget tracking
│   ├── reports/          # Monthly reports + charts
│   ├── recurring/        # Recurring transactions
│   └── settings/         # User settings & export
└── api/                  # API routes (server-side Supabase)
    ├── auth/line/        # LINE auth + profile upsert
    ├── transactions/     # CRUD
    ├── categories/       # CRUD
    ├── budgets/          # CRUD + spent calculation
    ├── reports/          # Monthly aggregation
    ├── recurring/        # CRUD
    ├── profiles/         # Profile settings
    └── export/           # CSV + Excel download
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Yes |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF ID from LINE Developers | Yes (for production) |
| `NEXT_PUBLIC_APP_URL` | App base URL | Yes |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### 3. Set up the database

Run the migration in your Supabase dashboard (SQL Editor):

```bash
# Copy and run in Supabase SQL Editor:
supabase/migrations/001_initial_schema.sql
```

Optionally run seed data for development:

```bash
# Copy and run in Supabase SQL Editor:
supabase/seed.sql
```

### 4. Set up LINE LIFF

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider (or use existing)
3. Create a new channel → **LINE Login**
4. Under the channel, go to **LIFF** tab
5. Add a new LIFF app:
   - **Size**: Full
   - **Endpoint URL**: `https://your-domain.com/liff` (or `http://localhost:3000/liff` for dev)
   - **Scopes**: `profile`, `openid`
   - **Bot link feature**: Off (or as needed)
6. Copy the **LIFF ID** and set it in `.env.local`:
   ```
   NEXT_PUBLIC_LIFF_ID=1234567890-abcdefgh
   ```

> **Development note**: If `NEXT_PUBLIC_LIFF_ID` is missing or set to `YOUR_LIFF_ID_HERE`, the app runs in **mock mode** — it will use a fake user profile and skip LINE authentication. This lets you develop and test without a real LIFF ID.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.
Open [http://localhost:3000/liff](http://localhost:3000/liff) for the app (mock mode).

## Build for Production

```bash
npm run build
npm start
```

## Features

| Feature | Status |
|---|---|
| Manual transaction entry | Done |
| Category management | Done |
| Budget tracking with progress bars | Done |
| Monthly reports with pie + bar charts | Done |
| Recurring transactions | Done |
| CSV export | Done |
| Excel export | Done |
| LINE LIFF authentication | Done |
| Receipt scanning (OCR) | Scaffold — needs real OCR API |
| Voice input | Scaffold — needs Web Speech API / Whisper |
| Daily push notifications | Scaffold — needs LINE Messaging API |

## TODO (Real Integrations)

### OCR Receipt Scanning
File: `lib/mock/ocr.ts`
- Integrate with **Google Cloud Vision API**, **AWS Textract**, or **Thai OCR** service
- Replace `processReceiptImage()` implementation

### Voice Input
File: `lib/mock/speech.ts`
- Integrate with **Web Speech API** (built-in browser) for Thai language
- Or integrate with **OpenAI Whisper API** for better Thai support

### LINE LIFF ID
- Register at LINE Developers Console
- Set `NEXT_PUBLIC_LIFF_ID` in `.env.local`

### LINE Daily Notifications
- Set up **LINE Messaging API** channel
- Build a cron job / Edge Function to push daily reminders

### Row-Level Security (RLS)
The current RLS policies are open (allow all). To properly secure data:
- Implement JWT-based auth by passing LINE userId through Supabase custom claims
- Or use a server-side session approach

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

Main tables:
- `profiles` — LINE user profiles
- `categories` — Income/expense categories per user
- `transactions` — All transactions
- `budgets` — Monthly budgets per category
- `recurring_transactions` — Recurring income/expenses
- `monthly_reports` — Aggregated monthly summaries
- `reminders` — Notification settings
- `attachments` — Receipt/document attachments
- `usage_logs` — Analytics

## License

MIT
