# ForThem Database Notes

Supabase is the backend for the MVP.

## Backend Responsibilities

- Supabase Auth: email/password login.
- Supabase Postgres: app data.
- Supabase Storage: documents and parenting plan files.
- Row Level Security: protect shared and private data.

## Core Data Concepts

### profiles
Stores parent/user profile information.

Suggested fields:
- id uuid primary key references auth.users(id)
- full_name text
- email text
- phone text
- avatar_url text
- created_at timestamptz
- updated_at timestamptz

### families
Represents one co-parenting family unit.

Suggested fields:
- id uuid primary key
- name text
- created_by uuid references profiles(id)
- created_at timestamptz
- updated_at timestamptz

### family_members
Connects parents/caregivers to families.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- user_id uuid references profiles(id)
- role text -- parent, co_parent, caregiver
- status text -- active, invited, removed
- created_at timestamptz

### children
Stores child profile data.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- first_name text
- last_name text
- date_of_birth date
- school_name text
- pediatrician text
- insurance_notes text
- avatar_url text
- created_at timestamptz
- updated_at timestamptz

### calendar_events
Stores shared and private calendar events.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- child_id uuid references children(id)
- created_by uuid references profiles(id)
- title text
- category text -- school, medical, daycare, activity, travel, other
- start_at timestamptz
- end_at timestamptz
- location text
- notes text
- visibility text -- shared, private
- created_at timestamptz
- updated_at timestamptz

### personal_items
Stores private reminders, notes, and personal parent-only tasks.

Suggested fields:
- id uuid primary key
- user_id uuid references profiles(id)
- family_id uuid references families(id)
- child_id uuid references children(id)
- type text -- reminder, note, personal_event
- title text
- notes text
- due_at timestamptz
- is_completed boolean
- created_at timestamptz
- updated_at timestamptz

### swaps
Stores custody swap requests.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- child_id uuid references children(id)
- requested_by uuid references profiles(id)
- requested_from_date date
- requested_to_date date
- reason text
- comment text
- status text -- pending, approved, declined, cancelled
- responded_by uuid references profiles(id)
- responded_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### expenses
Stores expense records.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- child_id uuid references children(id)
- created_by uuid references profiles(id)
- title text
- category text -- daycare, medical, school, activity, clothing, travel, other
- amount numeric
- paid_by uuid references profiles(id)
- split_type text -- fifty_fifty, percentage, exact, parenting_plan_rule
- split_details jsonb
- recurring_rule jsonb
- receipt_url text
- status text -- pending, approved, settled
- created_at timestamptz
- updated_at timestamptz

### documents
Stores uploaded file metadata.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- child_id uuid references children(id)
- uploaded_by uuid references profiles(id)
- title text
- category text -- medical, insurance, school, legal, passport, other
- file_url text
- file_type text
- visibility text -- shared, private
- created_at timestamptz

### parenting_plans
Stores parenting plan file and manually extracted rules.

Suggested fields:
- id uuid primary key
- family_id uuid references families(id)
- uploaded_by uuid references profiles(id)
- file_url text
- rules jsonb
- created_at timestamptz
- updated_at timestamptz

## RLS Principles

- A user can read shared family data only if they are an active family member.
- A user can read private data only if they created it.
- A user can update/delete their own private data.
- Shared updates should require active family membership.

## MVP Rule

Prefer simple, secure tables first. Avoid over-optimizing before real usage.
