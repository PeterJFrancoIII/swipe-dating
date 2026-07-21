import SwiftUI
import MapKit
#if os(iOS)
import UIKit
#endif

struct GetFkdControlView: View {
    @EnvironmentObject private var model: AppModel
    @State private var showSettings = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Toggle(
                    "Get fk'd",
                    isOn: Binding(
                        get: { model.proximityPreferences.enabled },
                        set: { model.setProximityEnabled($0) }
                    )
                )
                .font(.headline)
                .accessibilityHint("Turns adult-only nearby encounter alerts on or off")

                Button {
                    showSettings = true
                } label: {
                    Image(systemName: "slider.horizontal.3")
                }
                .buttonStyle(.borderless)
                .accessibilityLabel("Get fk'd privacy settings")
            }

            Text("Consent-based nearby alerts. Bluetooth advertisements must never include your name, gender, sexual intent, profile ID, or photos.")
                .font(.caption)
                .foregroundStyle(.secondary)

            if model.proximityPreferences.enabled {
                HStack {
                    Button("Simulate nearby adult") {
                        model.simulateNearbyEncounter()
                        #if os(iOS)
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                        #endif
                    }
                    .buttonStyle(.bordered)

                    Spacer()

                    Text(model.proximityPreferences.disclosurePolicy.rawValue)
                        .font(.caption2)
                        .multilineTextAlignment(.trailing)
                        .foregroundStyle(.secondary)
                }

                Text(model.proximityStatus)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .background(Color.pink.opacity(0.08), in: RoundedRectangle(cornerRadius: 14))
        .padding(.horizontal)
        .sheet(isPresented: $showSettings) {
            NavigationStack { ProximitySettingsView() }
        }
    }
}

struct ProximitySettingsView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        List {
            Section("Profile disclosure") {
                Picker("When a compatible adult is nearby", selection: $model.proximityPreferences.disclosurePolicy) {
                    ForEach(ProximityDisclosurePolicy.allCases) { policy in
                        Text(policy.rawValue).tag(policy)
                    }
                }

                Text("Prompt before sharing is the default for everyone. Gender never causes automatic profile disclosure.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Compatible genders") {
                ForEach(GenderIdentity.allCases.filter { $0 != .preferNotToSay }) { gender in
                    Toggle(gender.rawValue, isOn: proximityGenderBinding(gender))
                }
            }

            Section("Compatible intentions") {
                ForEach(LookingForMode.allCases) { mode in
                    Toggle(mode.rawValue, isOn: proximityIntentBinding(mode))
                }
            }

            Section("Haptic cooldown") {
                Picker("Repeat alert after", selection: $model.proximityPreferences.hapticCooldownSeconds) {
                    Text("1 minute").tag(60)
                    Text("5 minutes").tag(300)
                    Text("15 minutes").tag(900)
                    Text("Never in same session").tag(86_400)
                }
            }

            Section("Staging boundary") {
                Text("BLE scanning, rotating encounter IDs, attestation, replay defense, blocked-user suppression, and background battery tests are not yet wired. This screen is a consent and UX prototype only.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Get fk'd settings")
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Done") { dismiss() }
            }
        }
    }

    private func proximityGenderBinding(_ gender: GenderIdentity) -> Binding<Bool> {
        Binding(
            get: { model.proximityPreferences.compatibleGenders.contains(gender) },
            set: { enabled in
                var copy = model.proximityPreferences
                if enabled {
                    copy.compatibleGenders.insert(gender)
                } else {
                    copy.compatibleGenders.remove(gender)
                }
                model.proximityPreferences = copy
            }
        )
    }

    private func proximityIntentBinding(_ mode: LookingForMode) -> Binding<Bool> {
        Binding(
            get: { model.proximityPreferences.compatibleIntents.contains(mode) },
            set: { enabled in
                var copy = model.proximityPreferences
                if enabled {
                    copy.compatibleIntents.insert(mode)
                } else {
                    copy.compatibleIntents.remove(mode)
                }
                model.proximityPreferences = copy
            }
        )
    }
}

struct MatchLocationConsentSheet: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss
    let profile: DiscoverProfile

    var body: some View {
        List {
            Section {
                Text("Share a location with \(profile.displayName)?")
                    .font(.title2.bold())
                Text("Matching never shares location automatically. Grants are recipient-scoped, optional, and expire.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Share") {
                ForEach(LocationShareMode.allCases) { mode in
                    Button {
                        model.shareLocation(with: profile, mode: mode)
                        dismiss()
                    } label: {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(mode.rawValue)
                            Text(mode.isPrecise ? "Requires a second precise-location confirmation in production." : "Shows an approximate area, not an exact point.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            Section {
                Button("Not now", role: .cancel) {
                    model.declineLocationSharePrompt()
                    dismiss()
                }
            }

            Section("Staging boundary") {
                Text("This prototype uses synthetic coordinates and does not read the phone's location. Production requires explicit OS permission, E2EE recipient binding, revocation acknowledgements, and no location in push notifications or analytics.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Location consent")
    }
}

struct MatchMapView: View {
    @EnvironmentObject private var model: AppModel
    let profile: DiscoverProfile

    var body: some View {
        Group {
            if let share = model.activeLocationShare(for: profile.id) {
                VStack(spacing: 12) {
                    Map(
                        initialPosition: .region(
                            MKCoordinateRegion(
                                center: CLLocationCoordinate2D(latitude: share.latitude, longitude: share.longitude),
                                span: MKCoordinateSpan(
                                    latitudeDelta: share.mode.isPrecise ? 0.01 : 0.08,
                                    longitudeDelta: share.mode.isPrecise ? 0.01 : 0.08
                                )
                            )
                        )
                    ) {
                        if share.mode.isPrecise {
                            Marker(
                                profile.displayName,
                                coordinate: CLLocationCoordinate2D(
                                    latitude: share.latitude,
                                    longitude: share.longitude
                                )
                            )
                        } else {
                            MapCircle(
                                center: CLLocationCoordinate2D(
                                    latitude: share.latitude,
                                    longitude: share.longitude
                                ),
                                radius: 2_000
                            )
                            .foregroundStyle(Color.accentColor.opacity(0.2))
                        }
                    }
                    .mapStyle(.standard(elevation: .flat))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(share.mode.rawValue).font(.headline)
                        Text("Expires \(share.expiresAt.formatted(date: .abbreviated, time: .shortened))")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                        Text("STAGING synthetic coordinate — no real user location collected.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                    Button("Stop sharing", role: .destructive) {
                        model.revokeLocationShare(profileId: profile.id)
                    }
                    .buttonStyle(.bordered)

                    Spacer()
                }
                .padding(.top)
            } else {
                ContentUnavailableView(
                    "No active location share",
                    systemImage: "map",
                    description: Text("Location is off by default. Share an approximate area, meeting pin, or temporary live location from this match.")
                )
            }
        }
        .navigationTitle("\(profile.displayName) · Map")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu("Share") {
                    ForEach(LocationShareMode.allCases) { mode in
                        Button(mode.rawValue) {
                            model.shareLocation(with: profile, mode: mode)
                        }
                    }
                }
            }
        }
    }
}

struct SkinShopView: View {
    @EnvironmentObject private var model: AppModel
    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                StagingBannerView()
                Text("Skin Shop")
                    .font(.largeTitle.bold())
                Text("Create, share, and preview avatars, profile skins, and chat themes. Marketplace assets are public and isolated from dating profiles, messages, location, and safety cases.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                NavigationLink {
                    SkinCreatorPrototypeView()
                } label: {
                    Label("Create your own skin", systemImage: "paintbrush.pointed.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(SkinAsset.stagingCatalog) { asset in
                        SkinAssetCard(asset: asset)
                    }
                }

                Text(model.commerceNote)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
        .navigationTitle("Shop")
    }
}

private struct SkinAssetCard: View {
    @EnvironmentObject private var model: AppModel
    let asset: SkinAsset

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: asset.systemImage)
                .font(.system(size: 38))
                .frame(maxWidth: .infinity, minHeight: 90)
                .background(Color.accentColor.opacity(0.12), in: RoundedRectangle(cornerRadius: 12))
            Text(asset.title).font(.headline)
            Text("\(asset.kind.rawValue) · \(asset.creator)")
                .font(.caption)
                .foregroundStyle(.secondary)
            Button(model.skinEntitlements.contains(asset.id) ? "Apply" : "Preview · \(asset.priceLabel)") {
                model.previewOrPurchaseSkin(asset)
            }
            .buttonStyle(.bordered)
            .frame(maxWidth: .infinity)
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .overlay {
            if model.selectedSkinId == asset.id {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.accentColor, lineWidth: 2)
            }
        }
    }
}

struct SkinCreatorPrototypeView: View {
    @State private var title = ""
    @State private var kind: SkinAsset.Kind = .avatar
    @State private var staged = false

    var body: some View {
        Form {
            Section("Asset") {
                TextField("Name", text: $title)
                Picker("Type", selection: $kind) {
                    Text(SkinAsset.Kind.avatar.rawValue).tag(SkinAsset.Kind.avatar)
                    Text(SkinAsset.Kind.profileSkin.rawValue).tag(SkinAsset.Kind.profileSkin)
                    Text(SkinAsset.Kind.chatSkin.rawValue).tag(SkinAsset.Kind.chatSkin)
                }
                Image(systemName: kind == .avatar ? "person.crop.circle.badge.plus" : "paintpalette.fill")
                    .font(.system(size: 72))
                    .frame(maxWidth: .infinity)
                    .padding()
            }

            Section("Safe format") {
                Text("Production accepts bounded declarative assets only—no JavaScript, arbitrary shaders, embedded network requests, or executable plugins. Copyright and marketplace moderation are required before publishing.")
                    .font(.footnote)
            }

            Button(staged ? "Prototype saved locally" : "Save local prototype") {
                staged = true
            }
            .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .navigationTitle("Skin creator")
    }
}

struct ProductPreferencesView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        Form {
            Section("About me") {
                Picker("Gender identity", selection: $model.genderIdentity) {
                    ForEach(GenderIdentity.allCases) { gender in
                        Text(gender.rawValue).tag(gender)
                    }
                }
                Picker("Sexual orientation", selection: $model.sexualOrientation) {
                    ForEach(SexualOrientation.allCases) { orientation in
                        Text(orientation.rawValue).tag(orientation)
                    }
                }
                Text("LGBTQ+ is a community umbrella, not a gender. These fields are separate, optional, and private unless you choose to show them.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Show me") {
                ForEach(GenderIdentity.allCases.filter { $0 != .preferNotToSay }) { gender in
                    Toggle(gender.rawValue, isOn: genderVisibilityBinding(gender))
                }
                Text("This privately controls your own candidate feed. It never creates a public label about people you exclude.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Looking for") {
                ForEach(LookingForMode.allCases) { mode in
                    Toggle(mode.rawValue, isOn: lookingForBinding(mode))
                }
                Text("Sexual intentions are adult-only and should be disclosed only to independently compatible adults, never broadcast to the whole pool.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Compatibility preferences") {
                Picker("Activity / fitness lifestyle", selection: $model.discoveryPreferences.activityLevel) {
                    ForEach(ActivityLevel.allCases) { value in Text(value.rawValue).tag(value) }
                }
                Picker("Conversation style", selection: $model.discoveryPreferences.conversationStyle) {
                    ForEach(ConversationPreference.allCases) { value in Text(value.rawValue).tag(value) }
                }
                Picker("Body-hair preference", selection: $model.discoveryPreferences.bodyHair) {
                    ForEach(BodyHairPreference.allCases) { value in Text(value.rawValue).tag(value) }
                }
                Picker("Fragrance preference", selection: $model.discoveryPreferences.fragrance) {
                    ForEach(FragrancePreference.allCases) { value in Text(value.rawValue).tag(value) }
                }
                Picker("Distance", selection: $model.discoveryPreferences.maximumDistanceBand) {
                    Text("Nearby coarse area").tag("Nearby coarse area")
                    Text("Within 10–25 km band").tag("Within 10–25 km band")
                    Text("Any coarse distance").tag("Any coarse distance")
                }
            }

            Section("Excluded ranking signals") {
                Text("No filtering or ranking by race, skin color, ethnicity, height, disability, spending, inferred attractiveness, or AI-inferred intelligence, hygiene, gender, sexuality, fitness, or grooming.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Dating preferences")
    }

    private func genderVisibilityBinding(_ gender: GenderIdentity) -> Binding<Bool> {
        Binding(
            get: { model.showMeGenders.contains(gender) },
            set: { enabled in
                if enabled { model.showMeGenders.insert(gender) }
                else { model.showMeGenders.remove(gender) }
            }
        )
    }

    private func lookingForBinding(_ mode: LookingForMode) -> Binding<Bool> {
        Binding(
            get: { model.lookingForModes.contains(mode) },
            set: { enabled in
                if enabled { model.lookingForModes.insert(mode) }
                else { model.lookingForModes.remove(mode) }
            }
        )
    }
}

struct AlignmentQuestionnaireView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                Text("Questionnaire \(AlignmentQuestionnaire.version)")
                    .font(.headline)
                Text("Answers and ranking stay on this device in the staging design. Political and sexual questions are optional sensitive data. Spending, popularity, protected traits, and attractiveness never affect the score.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                if let first = model.visibleCandidates.first,
                   let score = model.compatibilityScore(for: first) {
                    LabeledContent("Top synthetic alignment", value: "\(score)%")
                }
            }

            ForEach(AlignmentQuestionnaire.questions) { question in
                Section(question.category.rawValue) {
                    Text(question.prompt).font(.headline)

                    Picker("Answer", selection: optionBinding(for: question)) {
                        Text("Skip").tag("skip")
                        ForEach(question.options.filter { $0.id != "skip" }) { option in
                            Text(option.label).tag(option.id)
                        }
                    }

                    Stepper(
                        "Importance: \(response(for: question).importance) / 5",
                        value: importanceBinding(for: question),
                        in: 0 ... 5
                    )
                    Toggle("Dealbreaker", isOn: dealbreakerBinding(for: question))
                    Toggle("Show answer on profile", isOn: visibilityBinding(for: question))

                    if question.sensitive {
                        Label("Sensitive — optional and never for advertising", systemImage: "lock.shield")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Section {
                Button("Clear all answers", role: .destructive) {
                    model.clearQuestionnaire()
                }
            }
        }
        .navigationTitle("Alignment")
    }

    private func response(for question: CompatibilityQuestion) -> QuestionnaireResponse {
        model.questionnaireResponses[question.id]
            ?? QuestionnaireResponse(optionId: "skip", importance: 3, dealbreaker: false, visibleOnProfile: false)
    }

    private func optionBinding(for question: CompatibilityQuestion) -> Binding<String> {
        Binding(
            get: { response(for: question).optionId },
            set: { value in
                var copy = response(for: question)
                copy.optionId = value
                model.updateQuestionnaireResponse(questionId: question.id, response: copy)
            }
        )
    }

    private func importanceBinding(for question: CompatibilityQuestion) -> Binding<Int> {
        Binding(
            get: { response(for: question).importance },
            set: { value in
                var copy = response(for: question)
                copy.importance = value
                model.updateQuestionnaireResponse(questionId: question.id, response: copy)
            }
        )
    }

    private func dealbreakerBinding(for question: CompatibilityQuestion) -> Binding<Bool> {
        Binding(
            get: { response(for: question).dealbreaker },
            set: { value in
                var copy = response(for: question)
                copy.dealbreaker = value
                model.updateQuestionnaireResponse(questionId: question.id, response: copy)
            }
        )
    }

    private func visibilityBinding(for question: CompatibilityQuestion) -> Binding<Bool> {
        Binding(
            get: { response(for: question).visibleOnProfile },
            set: { value in
                var copy = response(for: question)
                copy.visibleOnProfile = value
                model.updateQuestionnaireResponse(questionId: question.id, response: copy)
            }
        )
    }
}

struct BotProtectionView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                LabeledContent("Risk", value: model.botProtection.riskLevel.rawValue)
                LabeledContent("Replay defense", value: model.botProtection.requestReplayProtection ? "on" : "off")
                LabeledContent("Passkey bound", value: yesNo(model.botProtection.passkeyBound))
                LabeledContent("Adult credential bound", value: yesNo(model.botProtection.adultCredentialBound))
                LabeledContent("iOS App Attest", value: yesNo(model.botProtection.appAttestReady))
                LabeledContent("Android Play Integrity", value: yesNo(model.botProtection.playIntegrityReady))
                LabeledContent("Challenges", value: "\(model.botProtection.challengeCount)")
            }

            Section("Decision") {
                Text(model.botProtection.realUserNetworkReady
                     ? "Core identity prerequisites are present; server-side attestation and abuse operations still require verification."
                     : "Real-user networking is blocked. Staging permits synthetic/local simulations only.")
                    .font(.footnote)

                Button("Simulate suspicious burst") {
                    var state = model.botProtection
                    state.challengeCount += 1
                    state.riskLevel = .elevated
                    model.botProtection = state
                }
            }

            Section("Layered defense") {
                Text("Passkeys + adult credentials + App Attest / Play Integrity + signed request challenges + replay counters + anonymous quotas + velocity and graph signals + progressive friction + human appeal. Device attestation is never treated as proof of a unique human by itself.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Bot protection")
    }

    private func yesNo(_ value: Bool) -> String { value ? "ready" : "not ready" }
}
