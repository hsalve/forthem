// ─────────────────────────────────────────────────────────────────────────────
// ForThem — Database Types
// Auto-maintain this file whenever the schema changes.
// These types match supabase/schema.sql exactly.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ─────────────────────────────────────────────────────────────────────

export type FamilyMemberRole   = 'parent' | 'guardian';
export type InvitationStatus   = 'pending' | 'accepted' | 'declined' | 'expired';
export type EventCategory      = 'School' | 'Medical' | 'Daycare' | 'Activity' | 'Exchange' | 'Other';
export type SwapStatus         = 'pending' | 'approved' | 'rejected';
export type ExpenseCategory    = 'Daycare' | 'School' | 'Medical' | 'Sport' | 'Food' | 'Clothing' | 'Transport' | 'Activity' | 'Other';
export type ExpenseSplitType   = '50/50' | 'percentage' | 'exact' | 'plan';
export type ExpenseRecurring   = 'none' | 'weekly' | 'monthly';
export type ExpenseStatus      = 'pending' | 'approved' | 'settled';
export type DocumentCategory   = 'Medical' | 'Insurance' | 'School' | 'Legal' | 'Passport' | 'Other';

// ── Row types (what you get back from SELECT) ─────────────────────────────────

export type Profile = {
  id:         string;
  full_name:  string | null;
  avatar_url: string | null;
  phone:      string | null;
  timezone:   string;
  created_at: string;
  updated_at: string;
};

export type Family = {
  id:         string;
  name:       string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  id:           string;
  family_id:    string;
  user_id:      string;
  role:         FamilyMemberRole;
  display_name: string | null;
  joined_at:    string;
};

export type Child = {
  id:            string;
  family_id:     string;
  full_name:     string;
  date_of_birth: string | null;
  school_name:   string | null;
  photo_url:     string | null;
  notes:         string | null;
  created_at:    string;
  updated_at:    string;
};

export type Invitation = {
  id:         string;
  family_id:  string;
  invited_by: string;
  email:      string;
  token:      string;
  status:     InvitationStatus;
  expires_at: string;
  created_at: string;
};

export type ParentingPlanRules = {
  [category: string]: {
    payer_pct:   number;
    partner_pct: number;
    notes?:      string;
  };
};

export type ParentingPlan = {
  id:           string;
  family_id:    string;
  uploaded_by:  string;
  file_name:    string | null;
  file_url:     string | null;
  file_path:    string | null;
  rules:        ParentingPlanRules;
  ai_extracted: boolean;
  created_at:   string;
  updated_at:   string;
};

export type CustodySchedule = {
  id:             string;
  family_id:      string;
  child_id:       string;
  parent_id:      string;
  start_date:     string;
  end_date:       string;
  is_exchange:    boolean;
  recurring_rule: string | null;
  notes:          string | null;
  created_at:     string;
  updated_at:     string;
};

export type CalendarEvent = {
  id:         string;
  family_id:  string;
  child_id:   string | null;
  created_by: string;
  title:      string;
  event_date: string;
  event_time: string | null;
  category:   EventCategory;
  notes:      string | null;
  created_at: string;
  updated_at: string;
};

export type Swap = {
  id:           string;
  family_id:    string;
  requested_by: string;
  giving_date:  string;
  wanting_date: string;
  reason:       string | null;
  note:         string | null;
  status:       SwapStatus;
  responded_by: string | null;
  responded_at: string | null;
  created_at:   string;
  updated_at:   string;
};

export type Expense = {
  id:            string;
  family_id:     string;
  child_id:      string | null;
  paid_by:       string;
  title:         string;
  category:      ExpenseCategory;
  amount:        number;
  split_type:    ExpenseSplitType;
  payer_percent: number;
  recurring:     ExpenseRecurring;
  status:        ExpenseStatus;
  receipt_url:   string | null;
  notes:         string | null;
  expense_date:  string;
  created_at:    string;
  updated_at:    string;
};

export type Document = {
  id:          string;
  family_id:   string;
  uploaded_by: string;
  name:        string;
  category:    DocumentCategory;
  file_url:    string | null;
  file_path:   string | null;
  file_type:   string | null;
  file_size:   number | null;
  starred_by:  string[];
  created_at:  string;
  updated_at:  string;
};

// ── Insert types (what you pass to INSERT) ────────────────────────────────────

export type InsertProfile = Omit<Profile, 'created_at' | 'updated_at'>;
export type InsertFamily = { name?: string; created_by?: string; };
export type InsertFamilyMember = { family_id: string; user_id: string; role?: FamilyMemberRole; display_name?:string; };
export type InsertChild = { family_id: string; full_name: string; date_of_birth?: string; school_name?: string; photo_url?: string; notes?: string; };
export type InsertInvitation = { family_id: string; invited_by: string; email: string; };
export type InsertParentingPlan = { family_id: string; uploaded_by: string; file_name?: string; file_url?: string; file_path?: string; rules?: ParentingPlanRules; ai_extracted?:boolean; };
export type InsertCustodySchedule = { family_id: string; child_id: string; parent_id: string; start_date: string; end_date: string; is_exchange?: boolean; recurring_rule?: string; notes?: string; };
export type InsertCalendarEvent = { family_id: string; child_id?: string; created_by: string; title: string; event_date: string; event_time?:string; category?: EventCategory; notes?: string; };
export type InsertSwap = { family_id: string; requested_by: string; giving_date: string; wanting_date: string; reason?: string; note?: string; };
export type InsertExpense = { family_id: string; child_id?: string; paid_by: string; title: string; category?: ExpenseCategory; amount: number; split_type?: ExpenseSplitType; payer_percent?: number; recurring?: ExpenseRecurring; receipt_url?: string; notes?: string; expense_date?: string; };
export type InsertDocument = { family_id: string; uploaded_by: string; name: string; category?: DocumentCategory; file_url?: string; file_path?: string; file_type?: string; file_size?: number; };

// ── Update types (partial, for PATCH/UPDATE) ──────────────────────────────────

export type UpdateProfile        = Partial<Pick<Profile,        'full_name' | 'avatar_url' | 'phone' | 'timezone'>>;
export type UpdateFamily         = Partial<Pick<Family,         'name'>>;
export type UpdateFamilyMember   = Partial<Pick<FamilyMember,   'role' | 'display_name'>>;
export type UpdateChild          = Partial<Pick<Child,          'full_name' | 'date_of_birth' | 'school_name' | 'photo_url' | 'notes'>>;
export type UpdateInvitation     = Partial<Pick<Invitation,     'status'>>;
export type UpdateParentingPlan  = Partial<Pick<ParentingPlan,  'file_name' | 'file_url' | 'file_path' | 'rules' | 'ai_extracted'>>;
export type UpdateCustodySchedule= Partial<Pick<CustodySchedule,'parent_id' | 'start_date' | 'end_date' | 'is_exchange' | 'recurring_rule' | 'notes'>>;
export type UpdateCalendarEvent  = Partial<Pick<CalendarEvent,  'title' | 'event_date' | 'event_time' | 'category' | 'notes'>>;
export type UpdateSwap           = Partial<Pick<Swap,           'reason' | 'note' | 'status' | 'responded_by' | 'responded_at'>>;
export type UpdateExpense        = Partial<Pick<Expense,        'title' | 'category' | 'amount' | 'split_type' | 'payer_percent' | 'recurring' | 'status' | 'receipt_url' | 'notes' | 'expense_date'>>;
export type UpdateDocument       = Partial<Pick<Document,       'name' | 'category' | 'file_url' | 'file_path' | 'file_type' | 'file_size' | 'starred_by'>>;

// ── Database interface (for typed Supabase client) ────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: InsertProfile; Update: UpdateProfile; };
      families: { Row: Family; Insert: InsertFamily; Update: UpdateFamily; };
      family_members: { Row: FamilyMember; Insert: InsertFamilyMember; Update: UpdateFamilyMember; };
      children: { Row: Child; Insert: InsertChild; Update: UpdateChild; };
      invitations: { Row: Invitation; Insert: InsertInvitation; Update: UpdateInvitation; };
      parenting_plans: { Row: ParentingPlan; Insert: InsertParentingPlan; Update: UpdateParentingPlan; };
      custody_schedule: { Row: CustodySchedule; Insert: InsertCustodySchedule; Update: UpdateCustodySchedule; };
      calendar_events: { Row: CalendarEvent; Insert: InsertCalendarEvent; Update: UpdateCalendarEvent; };
      swaps: { Row: Swap; Insert: InsertSwap; Update: UpdateSwap; };
      expenses: { Row: Expense; Insert: InsertExpense; Update: UpdateExpense; };
      documents: { Row: Document; Insert: InsertDocument; Update: UpdateDocument; };
    };
    Views: {
      my_family: {
        Row: { family_id: string; family_name: string | null; user_id: string; role: FamilyMemberRole; display_name: string | null; full_name: string | null; avatar_url: string | null; };
      };
    };
    Functions: {
      is_family_member: { Args: { fam_id: string }; Returns: boolean; };
      my_family_id: { Args: Record<string, never>; Returns: string | null; };
    };
    Enums: Record<string, never>;
  };
};
