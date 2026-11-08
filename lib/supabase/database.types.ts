/**
 * Database types for the schema in supabase/migrations.
 * Matches the `supabase gen types typescript` format, so it can be replaced with:
 *   npx supabase gen types typescript --project-id vfdtjkgglxrqqjrdntfl > lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

type CaseStudyRow = Timestamps & {
  id: string;
  slug: string;
  client: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  categories: string[];
  services: string[];
  metric_value: string | null;
  metric_label: string | null;
  live_url: string;
  live_label: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  featured: boolean;
  sort_order: number;
  is_published: boolean;
  published_at: string | null;
};

type TestimonialRow = Timestamps & {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  case_study_id: string | null;
  sort_order: number;
  is_published: boolean;
};

type PostRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "spam";

type LeadRow = Timestamps & {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string;
  budget: string;
  message: string;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
};

export type AnalysisRow = Timestamps & {
  id: string;
  contact_name: string;
  email: string;
  phone: string | null;
  business_name: string;
  industry: string;
  city: string;
  country: string;
  monthly_customers: string;
  walk_in_pct: number;
  budget: string;
  answers: Json;
  report: Json;
  engine: "ai" | "rules";
  model: string | null;
  recommended_service: string;
  currency: "GHS" | "USD";
  estimate_min: number;
  estimate_max: number;
  monthly_min: number;
  monthly_max: number;
  email_sent_at: string | null;
  email_error: string | null;
  status: LeadStatus;
  notes: string | null;
};

type Owned = Timestamps & { id: string; user_id: string };

export type ResearchLogRow = Owned & {
  log_date: string;
  observer: string;
  pain_score: number | null;
  entry: Json;
};

export type ResearchStepRow = Owned & {
  position: number;
  title: string;
  tool: string | null;
  owner: string | null;
  notes: string | null;
  keywords: string[];
};

export type ResearchQuestionRow = Owned & {
  question: string;
  source: "guide" | "weekly" | "map" | "manual";
  status: "open" | "asked" | "answered";
  answer: string | null;
};

export type ResearchWeeklyRow = Owned & { week_start: string; notes: Json };

export type ResearchCandidateRow = Owned & {
  key: string;
  title: string;
  frequency: number | null;
  pain: number | null;
  buildable: number | null;
  safe: number | null;
  dismissed: boolean;
  chosen: boolean;
  summary: Json | null;
};

/** Owned rows: id, timestamps and user_id (defaults to auth.uid()) are optional on insert. */
type OwnedInsert<Row extends Owned, Extra extends keyof Row = never> = InsertOf<Row, Defaults | "user_id" | Extra>;

type SubscriberRow = {
  id: string;
  created_at: string;
  email: string;
  source: string | null;
  status: "subscribed" | "unsubscribed";
  unsubscribed_at: string | null;
};

/** Columns with defaults are optional on insert. */
type Defaults = "id" | "created_at" | "updated_at";
type InsertOf<Row, Optional extends keyof Row> = Omit<Row, Optional> & Partial<Pick<Row, Optional>>;

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admins: Table<{ user_id: string; created_at: string }, { user_id: string; created_at?: string }>;
      leads: Table<
        LeadRow,
        // Only these columns are insertable by the public (column grants in the migration).
        InsertOf<
          Pick<LeadRow, "name" | "email" | "company" | "service" | "budget" | "message" | "source">,
          "company" | "source"
        >
      >;
      business_analyses: Table<
        AnalysisRow,
        InsertOf<
          AnalysisRow,
          | Defaults | "phone" | "model" | "monthly_min" | "monthly_max"
          | "email_sent_at" | "email_error" | "status" | "notes"
        >
      >;
      rit_members: Table<
        { user_id: string; created_at: string; name: string; phone: string },
        { user_id: string; created_at?: string; name: string; phone: string }
      >;
      research_logs: Table<ResearchLogRow, OwnedInsert<ResearchLogRow, "observer" | "pain_score" | "entry">>;
      research_process_steps: Table<
        ResearchStepRow,
        OwnedInsert<ResearchStepRow, "position" | "tool" | "owner" | "notes" | "keywords">
      >;
      research_questions: Table<ResearchQuestionRow, OwnedInsert<ResearchQuestionRow, "source" | "status" | "answer">>;
      research_weekly_reviews: Table<ResearchWeeklyRow, OwnedInsert<ResearchWeeklyRow, "notes">>;
      research_candidates: Table<
        ResearchCandidateRow,
        OwnedInsert<ResearchCandidateRow, "frequency" | "pain" | "buildable" | "safe" | "dismissed" | "chosen" | "summary">
      >;
      newsletter_subscribers: Table<SubscriberRow, { email: string; source?: string | null }>;
      case_studies: Table<
        CaseStudyRow,
        InsertOf<
          CaseStudyRow,
          | Defaults
          | "content" | "tags" | "categories" | "services" | "metric_value" | "metric_label"
          | "live_label" | "image_url" | "mobile_image_url" | "featured" | "sort_order"
          | "is_published" | "published_at"
        >
      >;
      testimonials: Table<
        TestimonialRow,
        InsertOf<TestimonialRow, Defaults | "role" | "company" | "avatar_url" | "case_study_id" | "sort_order" | "is_published">
      >;
      posts: Table<
        PostRow,
        InsertOf<PostRow, Defaults | "content" | "author" | "cover_image_url" | "is_published" | "published_at">
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_rit_member: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
