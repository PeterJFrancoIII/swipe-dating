export type Choice = { id: string; label: string; icon: string };

export type Catalogs = {
  gender: Choice[];
  preference: Choice[];
  smoking: Choice[];
  drinking: Choice[];
  drugs: Choice[];
  turn_ons: Choice[];
  looking: Choice[];
  openness: Choice[];
  interests: Choice[];
  hobbies: Choice[];
  personality: Choice[];
  bedroom: Choice[];
};

export type AuthState = {
  token: string;
  account_id?: string;
  adult_accepted: boolean;
  onboarding_complete: boolean;
  onboarding_gaps: string[];
  display_name: string;
  apple_bound?: boolean;
  apple_required?: boolean;
  suspended?: boolean;
  unresolved_matches?: number;
  active_match_limit?: number;
  reliability_score?: number;
  alignment_answered?: number;
  alignment_total?: number;
  location_ready?: boolean;
  get_fkd_enabled?: boolean;
};

export type Bootstrap = AuthState & {
  catalogs: Catalogs;
  section_marks: Record<string, string>;
  turn_limit: number;
  birth_months: string[];
  birth_days: string[];
  birth_years: string[];
  report_options: { id: string; label: string }[];
  feature_proximity: boolean;
  feature_match_map: boolean;
};

export type Candidate = {
  id: string;
  display_name: string;
  age_band: string;
  about: string;
  looking: string;
  habits: string;
  alignment: number | null;
  alignment_answered?: number;
  alignment_total?: number;
  alignment_participating?: boolean;
  region_label: string;
  distance_label?: string;
  distance_km?: number;
  verified_host: boolean;
  boosted: boolean;
  genders: string[];
  interests: Choice[];
  all_interests: Choice[];
  turn_ons: string[];
  smoking: string;
  drinking: string;
  drugs: string;
  photo_index: number;
  photo_count: number;
  photo_url: string;
  photos: string[];
};

export type Reach = {
  boosts: number;
  superlikes: number;
  boost_active: boolean;
  boost_remaining_ms: number;
  swipes_remaining?: number;
  daily_swipe_limit?: number;
};

export type MatchedWith = {
  match_id: string;
  display_name: string;
  age_band: string;
  photo_url: string;
  getfkd?: boolean;
};

export type DiscoverState = {
  candidate: Candidate | null;
  reach: Reach;
  feature_proximity: boolean;
  notice?: string;
  error?: string;
  matched?: boolean;
  match_id?: string | null;
  matched_with?: MatchedWith | null;
};

export type DiscoverPack = DiscoverState & {
  encoding: string;
  catalog: string;
  window: Candidate[];
};

export type MatchLifecycle = {
  status?: string;
  remaining_ms?: number;
  expires_at?: string | null;
  urgency?: "ok" | "soon" | "critical" | "expired" | string;
};

export type MatchRow = {
  id: string;
  display_name: string;
  age_band: string;
  preview: string;
  initial: string;
  candidate_id: string;
  photo_url?: string;
  getfkd?: boolean;
  alignment?: number | null;
  alignment_answered?: number;
  alignment_total?: number;
  alignment_participating?: boolean;
} & MatchLifecycle;

export type ChatState = {
  viewer_id?: string;
  match: {
    id: string;
    display_name: string;
    age_band: string;
    region_label: string;
    distance_label?: string;
    distance_km?: number;
    alignment: number | null;
    alignment_answered?: number;
    alignment_total?: number;
    alignment_participating?: boolean;
    message_count: number;
    message_limit: number;
    extension_used: boolean;
    candidate_id: string;
    getfkd?: boolean;
    photo_url?: string;
    verified_host: boolean;
    boosted: boolean;
    about: string;
    looking: string;
    genders: string[];
    interests: Choice[];
    turn_ons: string[];
    smoking: string;
    drinking: string;
    drugs: string;
    status?: string;
    remaining_ms?: number;
    expires_at?: string | null;
    urgency?: string;
  };
  messages: { id?: string; body: string; mine: boolean; sender: string }[];
  meetup_suggestions: { id: string; title: string }[];
  feature_match_map: boolean;
  report_options: { id: string; label: string }[];
  notice?: string;
};

export type AlignmentQuestion = {
  id: string;
  category: string;
  prompt: string;
  answers: { id: string; label: string }[];
};

export type AlignmentState = {
  questionnaire_id: string;
  questions: AlignmentQuestion[];
  answers: Record<string, string>;
  answered?: number;
  total?: number;
};

export type OnboardingValues = {
  gender_identities: string[];
  show_genders: string[];
  display_name: string;
  about: string;
  home_region: string;
  smoking: string;
  drinking: string;
  drugs: string;
  turn_ons: string[];
  lifestyle_tags: string[];
  hobby_tags: string[];
  personality_tags: string[];
  immediate_intent: string[];
  relational_openness: string[];
  alignment_answers?: Record<string, string>;
  finish?: boolean;
};

export type CommunityCase = {
  id: string;
  status: string;
  contained: boolean;
  review_complete: boolean;
  subject: string;
  age_band: string;
  about: string;
  reason: string;
  evidence_note: string;
  vote_count: number;
  suspicious_votes: number;
  risk_score: number;
  risk_reasons: string[];
  can_appeal: boolean;
  can_adjudicate: boolean;
  reviewers: { id: string; account_age_days: number; reputation: number }[];
};
