-- ForThem calendar exchange category
-- Run this in Supabase SQL Editor only if your calendar_events.category column
-- has a CHECK constraint that rejects 'Exchange'.

-- Common case: category is text with a CHECK constraint.
-- This drops/recreates a permissive category check.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.calendar_events'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%category%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.calendar_events drop constraint %I', constraint_name);
  end if;

  alter table public.calendar_events
    add constraint calendar_events_category_check
    check (category in ('School', 'Medical', 'Daycare', 'Activity', 'Exchange', 'Other'));
end $$;
