import Foundation

/// Equal for every gender. Real Bluetooth behavior remains disabled in staging.
enum ProximityDisclosurePolicy: String, CaseIterable, Identifiable, Codable {
    case promptBeforeSharing
    case autoShareCompatible

    var id: String { rawValue }

    var title: String {
        switch self {
        case .promptBeforeSharing: return "Prompt before sharing"
        case .autoShareCompatible: return "Auto-share with compatible users"
        }
    }

    var detail: String {
        switch self {
        case .promptBeforeSharing:
            return "A nearby signal may buzz, but your profile stays hidden until you approve it."
        case .autoShareCompatible:
            return "Your profile may be shared only with nearby adults who independently chose compatible settings."
        }
    }
}

enum LookingForMode: String, CaseIterable, Identifiable, Hashable, Codable {
    case longTermRelationship
    case dating
    case casualSex
    case groupEncounter
    case cuddles
    case movieNight
    case dinnerOrDrinks
    case concertOrEvent
    case gaming
    case activityPartner
    case soberHangout
    case conversation
    case friendsFirst
    case nonMonogamousConnection
    case figuringItOut

    var id: String { rawValue }

    var title: String {
        switch self {
        case .longTermRelationship: return "Long-term relationship"
        case .dating: return "Dating"
        case .casualSex: return "Casual sex"
        case .groupEncounter: return "Group encounter"
        case .cuddles: return "Cuddles"
        case .movieNight: return "Movie night"
        case .dinnerOrDrinks: return "Dinner or drinks"
        case .concertOrEvent: return "Concert or event"
        case .gaming: return "Gaming"
        case .activityPartner: return "Gym or activity partner"
        case .soberHangout: return "Sober hangout"
        case .conversation: return "Conversation"
        case .friendsFirst: return "Friends first"
        case .nonMonogamousConnection: return "Non-monogamous connection"
        case .figuringItOut: return "Still figuring it out"
        }
    }

    var isSexualIntent: Bool {
        self == .casualSex || self == .groupEncounter
    }
}

enum GenderDiscoveryCategory: String, CaseIterable, Identifiable, Hashable, Codable {
    case women
    case men
    case nonbinaryPeople
    case additionalIdentities

    var id: String { rawValue }

    var title: String {
        switch self {
        case .women: return "Women"
        case .men: return "Men"
        case .nonbinaryPeople: return "Nonbinary people"
        case .additionalIdentities: return "Additional self-described identities"
        }
    }
}

enum MatchLocationShareChoice: String, CaseIterable, Identifiable, Codable {
    case none
    case approximateMatchArea
    case meetingPin
    case live15Minutes
    case live1Hour
    case live4Hours

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none: return "Not now"
        case .approximateMatchArea: return "Approximate match area"
        case .meetingPin: return "Meeting pin"
        case .live15Minutes: return "Live location — 15 minutes"
        case .live1Hour: return "Live location — 1 hour"
        case .live4Hours: return "Live location — 4 hours"
        }
    }

    var isPrecise: Bool {
        switch self {
        case .meetingPin, .live15Minutes, .live1Hour, .live4Hours: return true
        case .none, .approximateMatchArea: return false
        }
    }
}

struct AlignmentQuestion: Identifiable, Hashable {
    let id: String
    let category: String
    let prompt: String
    let options: [AlignmentOption]
    let sensitive: Bool

    static let stagingV1: [AlignmentQuestion] = [
        .init(
            id: "relationship_primary_intent",
            category: "Relationship",
            prompt: "What kind of connection matters most right now?",
            options: [
                .init(id: "long_term", label: "Long-term relationship"),
                .init(id: "dating", label: "Dating and seeing where it goes"),
                .init(id: "casual", label: "Casual adult connection"),
                .init(id: "friends_first", label: "Friends first"),
                .init(id: "prefer_not", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "political_alignment_importance",
            category: "Politics",
            prompt: "How important is political alignment?",
            options: [
                .init(id: "not_important", label: "Not important"),
                .init(id: "somewhat", label: "Somewhat important"),
                .init(id: "very", label: "Very important"),
                .init(id: "dealbreaker", label: "Usually a dealbreaker"),
                .init(id: "prefer_not", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "us_2024_presidential_preference",
            category: "Politics",
            prompt: "2024 U.S. presidential preference",
            options: [
                .init(id: "trump", label: "Donald Trump"),
                .init(id: "harris", label: "Kamala Harris"),
                .init(id: "other", label: "Another candidate"),
                .init(id: "did_not_vote", label: "Did not vote / not eligible"),
                .init(id: "prefer_not", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "education_path",
            category: "Education & work",
            prompt: "Which education or training path fits you?",
            options: [
                .init(id: "college", label: "College or university"),
                .init(id: "trade", label: "Trade or apprenticeship"),
                .init(id: "self_taught", label: "Self-taught"),
                .init(id: "mixed", label: "A mix"),
                .init(id: "other", label: "Another path")
            ],
            sensitive: false
        ),
        .init(
            id: "money_health_balance",
            category: "Values",
            prompt: "What do you prioritize when life gets busy?",
            options: [
                .init(id: "money", label: "Financial growth"),
                .init(id: "health", label: "Physical and mental health"),
                .init(id: "balance", label: "A balance of both"),
                .init(id: "relationships", label: "Relationships and community")
            ],
            sensitive: false
        ),
        .init(
            id: "body_hair_preference",
            category: "Grooming",
            prompt: "What body-hair compatibility do you prefer?",
            options: [
                .init(id: "natural", label: "Natural"),
                .init(id: "trimmed", label: "Trimmed"),
                .init(id: "mostly_removed", label: "Mostly removed"),
                .init(id: "no_preference", label: "No preference"),
                .init(id: "prefer_not", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "intimacy_style",
            category: "Adult intimacy",
            prompt: "Which adult intimacy style sounds most compatible?",
            options: [
                .init(id: "vanilla", label: "Mostly vanilla"),
                .init(id: "adventurous", label: "Adventurous"),
                .init(id: "kink_bdsm", label: "Kink or BDSM-aware"),
                .init(id: "varies", label: "Depends on trust and connection"),
                .init(id: "prefer_not", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "preferred_position_style",
            category: "Adult intimacy",
            prompt: "Which current adult sexual preference fits best?",
            options: [
                .init(id: "face_to_face", label: "Face-to-face / missionary"),
                .init(id: "rear_entry", label: "Rear-entry / doggy style"),
                .init(id: "variety", label: "Variety"),
                .init(id: "not_a_priority", label: "Not a priority"),
                .init(id: "prefer_not", label: "Prefer not to say")
            ],
            sensitive: true
        )
    ]
}

struct AlignmentOption: Identifiable, Hashable {
    let id: String
    let label: String
}

struct SkinShopItem: Identifiable, Hashable {
    let id: String
    let title: String
    let creator: String
    let category: String
    let priceLabel: String
    let accessibilityDescription: String

    static let syntheticCatalog: [SkinShopItem] = [
        .init(id: "skin-neon-orbit", title: "Neon Orbit", creator: "Synthetic Creator 01", category: "Profile skin", priceLabel: "$1.99 mock", accessibilityDescription: "Purple and blue neon profile frame"),
        .init(id: "avatar-coffee-fox", title: "Coffee Fox", creator: "Synthetic Creator 02", category: "Avatar", priceLabel: "Free mock", accessibilityDescription: "Illustrated fox holding a coffee cup"),
        .init(id: "chat-midnight", title: "Midnight Chat", creator: "Synthetic Creator 03", category: "Chat skin", priceLabel: "$0.99 mock", accessibilityDescription: "Dark chat theme with stars"),
        .init(id: "reaction-spark", title: "Spark Pack", creator: "Synthetic Creator 04", category: "Reaction pack", priceLabel: "$0.99 mock", accessibilityDescription: "Playful spark reaction icons")
    ]
}
