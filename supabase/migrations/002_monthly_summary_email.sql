alter table profiles
  add column if not exists monthly_summary_email_enabled boolean not null default false;

create index if not exists idx_profiles_monthly_summary_email
  on profiles (monthly_summary_email_enabled)
  where monthly_summary_email_enabled = true and email is not null;

create index if not exists idx_usage_logs_profile_action_created
  on usage_logs (profile_id, action, created_at desc);
