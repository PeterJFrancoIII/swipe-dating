import Foundation

/// Adult identity fields are deliberately separated: gender is not orientation,
/// and neither field changes the privacy defaults for proximity or location.
enum GenderIdentity: String, CaseIterable, Codable, Hashable, Identifiable {
    case woman = "Woman"
    case man = "Man"
    case nonbinary = "Nonbinary"
    case agender = "Agender"
    case genderfluid = "Genderfluid"
    case transWoman = "Trans woman"
    case transMan = "Trans man"
    case questioning = "Questioning"
    case selfDescribe = "Self-describe"
    case preferNotToSay = "Prefer not to say"

    var id: String { rawValue }
}

enum SexualOrientation: String, CaseIterable, Codable, Hashable, Identifiable {
    case straight = "Straight"
    case gay = "Gay"
    case lesbian = "Lesbian"
    case bisexual = "Bisexual"
    case pansexual = "Pansexual"
    case asexual = "Asexual"
    case queer = "Queer"
    case questioning = "Questioning"
    case selfDescribe = "Self-describe"
    case preferNotToSay = "Prefer not to say"

    var id: String { rawValue }
}

enum LookingForMode: String, CaseIterable, Codable, Hashable, Identifiable {
    case longTerm = "Long-term relationship"
    case dating = "Dating"
    case casualSex = "Sex"
    case groupEncounter = "Group sex"
    case cuddles = "Cuddles"
    case movieNight = "Movie night"
    case dinnerDrinks = "Dinner / drinks"
    case concertEvent = "Concert / event"
    case gaming = "Gaming"
    case activityPartner = "Activity partner"
    case soberHangout = "Sober hangout"
    case conversation = "Conversation"
    case friendsFirst = "Friends first"
    case nonMonogamous = "Non-monogamous connection"
    case figuringItOut = "Still figuring it out"

    var id: String { rawValue }

    var isSexual: Bool {
        switch self {
        case .casualSex, .groupEncounter, .nonMonogamous:
            return true
        default:
            return false
        }
    }
}

/// Same default for every adult, regardless of gender: ask before disclosure.
enum ProximityDisclosurePolicy: String, CaseIterable, Codable, Hashable, Identifiable {
    case off = "Do not share"
    case prompt = "Prompt before sharing"
    case automaticCompatible = "Auto-share with compatible nearby adults"

    var id: String { rawValue }
}

struct ProximityPreferences: Equatable {
    var enabled = false
    var disclosurePolicy: ProximityDisclosurePolicy = .prompt
    var compatibleGenders: Set<GenderIdentity> = [.woman, .man, .nonbinary]
    var compatibleIntents: Set<LookingForMode> = [.dating, .cuddles, .movieNight, .conversation]
    var hapticCooldownSeconds: Int = 300

    static let adultDefault = ProximityPreferences()
}

enum LocationShareMode: String, CaseIterable, Codable, Hashable, Identifiable {
    case approximateMatchArea = "Approximate area where we matched"
    case meetingPin = "Meeting pin"
    case live15Minutes = "Live location · 15 minutes"
    case live1Hour = "Live location · 1 hour"
    case live4Hours = "Live location · 4 hours"

    var id: String { rawValue }

    var duration: TimeInterval {
        switch self {
        case .approximateMatchArea:
            return 24 * 60 * 60
        case .meetingPin:
            return 4 * 60 * 60
        case .live15Minutes:
            return 15 * 60
        case .live1Hour:
            return 60 * 60
        case .live4Hours:
            return 4 * 60 * 60
        }
    }

    var isPrecise: Bool {
        switch self {
        case .meetingPin, .live15Minutes, .live1Hour, .live4Hours:
            return true
        case .approximateMatchArea:
            return false
        }
    }
}

struct MatchLocationShare: Identifiable, Equatable {
    let id: String
    let profileId: String
    let mode: LocationShareMode
    let latitude: Double
    let longitude: Double
    let createdAt: Date
    let expiresAt: Date

    var isActive: Bool { expiresAt > Date() }
}

enum ActivityLevel: String, CaseIterable, Codable, Hashable, Identifiable {
    case low = "Low-key"
    case moderate = "Moderately active"
    case high = "Very active"
    case athlete = "Competitive / athlete"
    case noPreference = "No preference"

    var id: String { rawValue }
}

enum ConversationPreference: String, CaseIterable, Codable, Hashable, Identifiable {
    case playful = "Playful"
    case practical = "Practical"
    case curious = "Curious / deep"
    case debate = "Debate-friendly"
    case quiet = "Quiet / low-pressure"
    case noPreference = "No preference"

    var id: String { rawValue }
}

enum BodyHairPreference: String, CaseIterable, Codable, Hashable, Identifiable {
    case natural = "Natural"
    case trimmed = "Trimmed"
    case mostlyRemoved = "Mostly removed"
    case noPreference = "No preference"

    var id: String { rawValue }
}

enum FragrancePreference: String, CaseIterable, Codable, Hashable, Identifiable {
    case fragrance = "Prefer fragrance"
    case fragranceFree = "Prefer fragrance-free"
    case noPreference = "No preference"

    var id: String { rawValue }
}

struct DiscoveryPreferences: Equatable {
    var activityLevel: ActivityLevel = .noPreference
    var conversationStyle: ConversationPreference = .noPreference
    var bodyHair: BodyHairPreference = .noPreference
    var fragrance: FragrancePreference = .noPreference
    var maximumDistanceBand = "Any coarse distance"
}

struct QuestionnaireOption: Identifiable, Hashable {
    let id: String
    let label: String
}

struct CompatibilityQuestion: Identifiable, Hashable {
    enum Category: String, CaseIterable, Hashable {
        case values = "Values"
        case politics = "Politics"
        case education = "Education / work"
        case health = "Money / health"
        case relationships = "Relationships"
        case communication = "Communication"
        case intimacy = "Sex / intimacy"
        case lifestyle = "Lifestyle"
    }

    let id: String
    let version: Int
    let category: Category
    let prompt: String
    let options: [QuestionnaireOption]
    let sensitive: Bool
}

struct QuestionnaireResponse: Equatable {
    var optionId: String
    var importance: Int = 3
    var dealbreaker = false
    var visibleOnProfile = false
}

enum AlignmentQuestionnaire {
    static let version = "2026.07-adult-v1"

    static let questions: [CompatibilityQuestion] = [
        .init(
            id: "politics-2024-us-president",
            version: 1,
            category: .politics,
            prompt: "2024 U.S. presidential preference",
            options: [
                .init(id: "trump", label: "Donald Trump"),
                .init(id: "harris", label: "Kamala Harris"),
                .init(id: "other", label: "Another candidate"),
                .init(id: "not-eligible", label: "Did not vote / not eligible"),
                .init(id: "skip", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "political-alignment-importance",
            version: 1,
            category: .politics,
            prompt: "How important is political alignment in a relationship?",
            options: [
                .init(id: "very", label: "Very important"),
                .init(id: "somewhat", label: "Somewhat important"),
                .init(id: "not", label: "Not important"),
                .init(id: "skip", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "education-path",
            version: 1,
            category: .education,
            prompt: "Which path best describes you?",
            options: [
                .init(id: "college", label: "College / university"),
                .init(id: "trade", label: "Trade / apprenticeship"),
                .init(id: "self-taught", label: "Self-taught / entrepreneurial"),
                .init(id: "other", label: "Another path"),
                .init(id: "skip", label: "Prefer not to say")
            ],
            sensitive: false
        ),
        .init(
            id: "money-health-balance",
            version: 1,
            category: .health,
            prompt: "Which priority feels closest right now?",
            options: [
                .init(id: "money", label: "Financial growth"),
                .init(id: "health", label: "Health and wellbeing"),
                .init(id: "both", label: "Balance both"),
                .init(id: "other", label: "Another priority")
            ],
            sensitive: false
        ),
        .init(
            id: "relationship-structure",
            version: 1,
            category: .relationships,
            prompt: "Which relationship structures are you open to?",
            options: [
                .init(id: "monogamous", label: "Monogamous"),
                .init(id: "open", label: "Open relationship"),
                .init(id: "poly", label: "Polyamorous"),
                .init(id: "casual", label: "Casual / undefined"),
                .init(id: "figuring", label: "Still figuring it out")
            ],
            sensitive: true
        ),
        .init(
            id: "conflict-style",
            version: 1,
            category: .communication,
            prompt: "How do you prefer to handle disagreement?",
            options: [
                .init(id: "talk-now", label: "Talk it through immediately"),
                .init(id: "cool-off", label: "Take time, then talk"),
                .init(id: "write", label: "Write first, then discuss"),
                .init(id: "flexible", label: "Depends on the situation")
            ],
            sensitive: false
        ),
        .init(
            id: "intimacy-style",
            version: 1,
            category: .intimacy,
            prompt: "Which intimacy style sounds most like you?",
            options: [
                .init(id: "vanilla", label: "Mostly vanilla"),
                .init(id: "adventurous", label: "Adventurous"),
                .init(id: "bdsm", label: "BDSM / kink-aware"),
                .init(id: "varied", label: "Varied / depends on trust"),
                .init(id: "skip", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "preferred-position",
            version: 1,
            category: .intimacy,
            prompt: "A preferred sexual style, if you want to share",
            options: [
                .init(id: "missionary", label: "Missionary"),
                .init(id: "doggy", label: "Doggy style"),
                .init(id: "variety", label: "Variety"),
                .init(id: "not-important", label: "Not important"),
                .init(id: "skip", label: "Prefer not to say")
            ],
            sensitive: true
        ),
        .init(
            id: "social-energy",
            version: 1,
            category: .lifestyle,
            prompt: "Your ideal social pace",
            options: [
                .init(id: "home", label: "Mostly at home"),
                .init(id: "balanced", label: "A balanced mix"),
                .init(id: "out", label: "Often out and social"),
                .init(id: "spontaneous", label: "Spontaneous")
            ],
            sensitive: false
        ),
        .init(
            id: "core-value",
            version: 1,
            category: .values,
            prompt: "Which quality matters most in a partner?",
            options: [
                .init(id: "kindness", label: "Kindness"),
                .init(id: "ambition", label: "Ambition"),
                .init(id: "humor", label: "Humor"),
                .init(id: "loyalty", label: "Loyalty"),
                .init(id: "curiosity", label: "Curiosity")
            ],
            sensitive: false
        )
    ]

    /// Transparent, local-only score. It intentionally does not use spending,
    /// attractiveness, race, ethnicity, height, or other protected traits.
    static func score(
        userResponses: [String: QuestionnaireResponse],
        candidateAnswers: [String: String]
    ) -> Int? {
        var earned = 0.0
        var possible = 0.0

        for question in questions {
            guard let mine = userResponses[question.id],
                  mine.optionId != "skip",
                  let theirs = candidateAnswers[question.id],
                  theirs != "skip" else { continue }

            let weight = Double(max(0, min(5, mine.importance)))
            guard weight > 0 else { continue }
            possible += weight

            if mine.optionId == theirs {
                earned += weight
            } else if mine.dealbreaker {
                return 0
            }
        }

        guard possible > 0 else { return nil }
        return Int((earned / possible * 100).rounded())
    }

    static let syntheticCandidateAnswers: [String: [String: String]] = [
        "p1": [
            "politics-2024-us-president": "harris",
            "education-path": "college",
            "money-health-balance": "both",
            "conflict-style": "cool-off",
            "core-value": "kindness"
        ],
        "p2": [
            "politics-2024-us-president": "trump",
            "education-path": "trade",
            "money-health-balance": "money",
            "conflict-style": "talk-now",
            "core-value": "ambition"
        ],
        "p3": [
            "politics-2024-us-president": "other",
            "education-path": "self-taught",
            "money-health-balance": "health",
            "conflict-style": "flexible",
            "core-value": "curiosity"
        ],
        "p4": [
            "politics-2024-us-president": "harris",
            "education-path": "trade",
            "money-health-balance": "both",
            "conflict-style": "write",
            "core-value": "loyalty"
        ],
        "p5": [
            "politics-2024-us-president": "trump",
            "education-path": "college",
            "money-health-balance": "health",
            "conflict-style": "cool-off",
            "core-value": "humor"
        ]
    ]
}

struct SkinAsset: Identifiable, Hashable {
    enum Kind: String, Hashable {
        case avatar = "Avatar"
        case profileSkin = "Profile skin"
        case chatSkin = "Chat skin"
    }

    let id: String
    let title: String
    let creator: String
    let kind: Kind
    let priceLabel: String
    let systemImage: String
    let isUserGenerated: Bool

    static let stagingCatalog: [SkinAsset] = [
        .init(id: "skin-neon-night", title: "Neon Night", creator: "Studio Seed", kind: .profileSkin, priceLabel: "$1.99", systemImage: "sparkles", isUserGenerated: false),
        .init(id: "avatar-orbit", title: "Orbit Avatar", creator: "Mira", kind: .avatar, priceLabel: "$2.99", systemImage: "person.crop.circle.badge.star", isUserGenerated: true),
        .init(id: "chat-soft-glow", title: "Soft Glow", creator: "Jun", kind: .chatSkin, priceLabel: "Free", systemImage: "message.fill", isUserGenerated: true),
        .init(id: "skin-minimal-dark", title: "Minimal Dark", creator: "Studio Seed", kind: .profileSkin, priceLabel: "$0.99", systemImage: "moon.stars.fill", isUserGenerated: false)
    ]
}

enum BotRiskLevel: String, CaseIterable, Equatable {
    case low = "Low"
    case elevated = "Elevated"
    case high = "High"
    case contained = "Contained"
}

struct BotProtectionState: Equatable {
    var appAttestReady = false
    var playIntegrityReady = false
    var passkeyBound = false
    var adultCredentialBound = false
    var requestReplayProtection = true
    var riskLevel: BotRiskLevel = .low
    var challengeCount = 0

    var realUserNetworkReady: Bool {
        passkeyBound && adultCredentialBound && requestReplayProtection
    }

    static let staging = BotProtectionState()
}
