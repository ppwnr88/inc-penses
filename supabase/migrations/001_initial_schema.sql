-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles table
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  line_user_id text unique not null,
  display_name text not null,
  picture_url text,
  email text,
  budget_cycle_day int default 1 check (budget_cycle_day between 1 and 28),
  timezone text default 'Asia/Bangkok',
  notify_daily boolean default true,
  notify_time time default '20:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- categories table
create table categories (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text default '💰',
  color text default '#84a06e',
  is_default boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- transactions table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  date date not null default current_date,
  receipt_url text,
  input_method text default 'manual' check (input_method in ('manual', 'voice', 'ocr', 'recurring')),
  recurring_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- budgets table
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  month int not null check (month between 1 and 12),
  year int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (profile_id, category_id, month, year)
);

-- recurring_transactions table
create table recurring_transactions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  day_of_month int check (day_of_month between 1 and 31),
  day_of_week int check (day_of_week between 0 and 6),
  next_due_date date not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- monthly_reports table
create table monthly_reports (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  month int not null check (month between 1 and 12),
  year int not null,
  total_income numeric(12,2) default 0,
  total_expense numeric(12,2) default 0,
  net numeric(12,2) generated always as (total_income - total_expense) stored,
  transaction_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (profile_id, month, year)
);

-- reminders table
create table reminders (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text,
  remind_time time not null default '20:00',
  is_active boolean default true,
  days_of_week int[] default '{1,2,3,4,5,6,0}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- attachments table
create table attachments (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  transaction_id uuid references transactions(id) on delete cascade,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  file_size int,
  ocr_text text,
  created_at timestamptz default now()
);

-- usage_logs table
create table usage_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index idx_transactions_profile_date on transactions(profile_id, date desc);
create index idx_transactions_profile_category on transactions(profile_id, category_id);
create index idx_transactions_profile_type on transactions(profile_id, type);
create index idx_budgets_profile_period on budgets(profile_id, year, month);
create index idx_categories_profile on categories(profile_id);
create index idx_recurring_active on recurring_transactions(profile_id, is_active);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all relevant tables
create trigger trg_profiles_updated before update on profiles for each row execute function update_updated_at();
create trigger trg_categories_updated before update on categories for each row execute function update_updated_at();
create trigger trg_transactions_updated before update on transactions for each row execute function update_updated_at();
create trigger trg_budgets_updated before update on budgets for each row execute function update_updated_at();
create trigger trg_recurring_updated before update on recurring_transactions for each row execute function update_updated_at();

-- RLS
alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table recurring_transactions enable row level security;
alter table monthly_reports enable row level security;
alter table reminders enable row level security;
alter table attachments enable row level security;
alter table usage_logs enable row level security;

-- RLS Policies (using app-level auth via anon key — service key bypasses RLS)
-- These open policies allow all operations; tighten with JWT claims when adding Supabase Auth
create policy "profiles_own" on profiles for all using (true) with check (true);
create policy "categories_own" on categories for all using (true) with check (true);
create policy "transactions_own" on transactions for all using (true) with check (true);
create policy "budgets_own" on budgets for all using (true) with check (true);
create policy "recurring_own" on recurring_transactions for all using (true) with check (true);
create policy "reports_own" on monthly_reports for all using (true) with check (true);
create policy "reminders_own" on reminders for all using (true) with check (true);
create policy "attachments_own" on attachments for all using (true) with check (true);
create policy "usage_logs_own" on usage_logs for all using (true) with check (true);
