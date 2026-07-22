export const LOOKING_FOR_MODES = Object.freeze([
  "long_term_relationship",
  "dating",
  "casual_sex",
  "group_encounter",
  "cuddles",
  "movie_night",
  "dinner_or_drinks",
  "concert_or_event",
  "gaming",
  "activity_partner",
  "sober_hangout",
  "conversation",
  "friends_first",
  "non_monogamous_connection",
  "figuring_it_out",
]);

export const SEXUAL_INTENT_MODES = Object.freeze(new Set(["casual_sex", "group_encounter"]));

export const GENDER_DISCOVERY_CATEGORIES = Object.freeze([
  "women",
  "men",
  "nonbinary_people",
  "additional_self_described_identities",
]);

export const ALLOWED_FILTER_KEYS = Object.freeze(
  new Set([
    "activity_level",
    "fitness_lifestyle",
    "smoking_vaping",
    "alcohol_sober_lifestyle",
    "sleep_schedule",
    "education_path",
    "trade_path",
    "conversation_depth",
    "curiosity",
    "social_energy",
    "relationship_style",
    "adult_intimacy_interest",
    "body_hair_preference",
    "grooming_style",
    "fragrance_preference",
    "distance_band",
    "availability",
  ]),
);

export const PROHIBITED_FILTER_KEYS = Object.freeze(
  new Set([
    "race",
    "ethnicity",
    "skin_color",
    "disability",
    "height",
    "nationality_as_ethnicity_proxy",
    "inferred_attractiveness",
    "inferred_intelligence",
    "inferred_hygiene",
    "inferred_sexuality",
    "inferred_gender",
    "inferred_fitness",
    "inferred_grooming",
    "inferred_body_hair",
  ]),
);

export function filterKeyAllowed(key) {
  return ALLOWED_FILTER_KEYS.has(key) && !PROHIBITED_FILTER_KEYS.has(key);
}

export function intentsAreCompatible(left, right) {
  const rightSet = new Set(right);
  return left.some((intent) => rightSet.has(intent));
}
