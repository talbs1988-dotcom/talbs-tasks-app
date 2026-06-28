-- הרץ את זה ב-Supabase SQL Editor
-- https://app.supabase.com → פרויקט → SQL Editor

create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  task text not null,
  status text default 'פתוח',
  notes text,
  created_at timestamptz default now()
);

-- כל משתמש רואה רק את המשימות שלו
alter table tasks enable row level security;

create policy "users manage own tasks" on tasks
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
