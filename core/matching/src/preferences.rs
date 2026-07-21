//! Adult-only discovery, intent, proximity, and compatibility preference types.
//!
//! These types are deliberately self-reported. The product must not infer protected,
//! intimate, fitness, grooming, or hygiene traits from photographs.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LookingForMode {
    LongTermRelationship,
    Dating,
    CasualSex,
    GroupEncounter,
    Cuddles,
    MovieNight,
    DinnerOrDrinks,
    ConcertOrEvent,
    Gaming,
    ActivityPartner,
    SoberHangout,
    Conversation,
    FriendsFirst,
    NonMonogamousConnection,
    FiguringItOut,
}

impl LookingForMode {
    pub fn is_sexual_intent(self) -> bool {
        matches!(self, Self::CasualSex | Self::GroupEncounter)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IntentVisibility {
    CompatibleUsersOnly,
    MatchesOnly,
    Hidden,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IntentDuration {
    Tonight,
    TwentyFourHours,
    SevenDays,
    Persistent,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GenderDiscoveryCategory {
    Women,
    Men,
    NonbinaryPeople,
    AdditionalSelfDescribedIdentities,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProximityDisclosurePolicy {
    Off,
    PromptBeforeSharing,
    AutoShareCompatible,
}

impl Default for ProximityDisclosurePolicy {
    fn default() -> Self {
        Self::Off
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MatchLocationShareMode {
    None,
    ApproximateMatchArea,
    MeetingPin,
    TemporaryLive,
}

impl Default for MatchLocationShareMode {
    fn default() -> Self {
        Self::None
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActivityLevel {
    Relaxed,
    LightlyActive,
    RegularlyActive,
    AthleticOrTrainingFocused,
    AdaptiveOrVaries,
    PreferNotToSay,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BodyHairPreference {
    Natural,
    Trimmed,
    MostlyRemoved,
    NoPreference,
    PreferNotToSay,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FragrancePreference {
    Fragrance,
    LightFragrance,
    FragranceFree,
    NoPreference,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DiscoveryPreferences {
    pub looking_for: Vec<LookingForMode>,
    pub intent_visibility: IntentVisibility,
    pub intent_duration: IntentDuration,
    pub show_me: Vec<GenderDiscoveryCategory>,
    pub proximity: ProximityDisclosurePolicy,
    pub default_match_location_share: MatchLocationShareMode,
    pub activity_level: Option<ActivityLevel>,
    pub body_hair_preference: Option<BodyHairPreference>,
    pub fragrance_preference: Option<FragrancePreference>,
}

impl Default for DiscoveryPreferences {
    fn default() -> Self {
        Self {
            looking_for: vec![LookingForMode::Dating],
            intent_visibility: IntentVisibility::CompatibleUsersOnly,
            intent_duration: IntentDuration::Persistent,
            show_me: Vec::new(),
            proximity: ProximityDisclosurePolicy::Off,
            default_match_location_share: MatchLocationShareMode::None,
            activity_level: None,
            body_hair_preference: None,
            fragrance_preference: None,
        }
    }
}

/// Filter keys that may be implemented as private, self-reported compatibility fields.
pub const ALLOWED_FILTER_KEYS: &[&str] = &[
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
];

/// Filter/ranking keys rejected by product governance.
pub const PROHIBITED_FILTER_KEYS: &[&str] = &[
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
];

pub fn filter_key_allowed(key: &str) -> bool {
    ALLOWED_FILTER_KEYS.contains(&key) && !PROHIBITED_FILTER_KEYS.contains(&key)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn proximity_is_off_by_default_for_every_user() {
        assert_eq!(
            DiscoveryPreferences::default().proximity,
            ProximityDisclosurePolicy::Off
        );
    }

    #[test]
    fn sexual_intent_is_explicitly_classified() {
        assert!(LookingForMode::CasualSex.is_sexual_intent());
        assert!(LookingForMode::GroupEncounter.is_sexual_intent());
        assert!(!LookingForMode::MovieNight.is_sexual_intent());
    }

    #[test]
    fn protected_and_inferred_traits_are_not_filterable() {
        assert!(!filter_key_allowed("race"));
        assert!(!filter_key_allowed("inferred_intelligence"));
        assert!(filter_key_allowed("activity_level"));
        assert!(filter_key_allowed("fragrance_preference"));
    }
}
