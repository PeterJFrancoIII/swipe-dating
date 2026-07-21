import SwiftUI

struct PreferenceCenterView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                StagingBannerView()
                Text("Adults 18+ only. Sensitive answers stay local in this staging build and are never used for ads or Skin Shop ranking.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Looking For") {
                ForEach(LookingForMode.allCases) { mode in
                    Toggle(mode.title, isOn: lookingForBinding(mode))
                    if mode.isSexualIntent && model.selectedLookingForModes.contains(mode) {
                        Text("Private adult intent. It is disclosed only to independently compatible adults.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Section("Show me") {
                Text("These choices control only your private candidate feed. Other people are not told why they were excluded.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                ForEach(GenderDiscoveryCategory.allCases) { category in
                    Toggle(category.title, isOn: genderBinding(category))
                }
            }

            Section("Filter boundary") {
                Text("Supported preferences are self-reported lifestyle, activity, communication, adult intimacy, grooming, fragrance, distance band, and availability.")
                    .font(.footnote)
                Text("No race, ethnicity, skin color, disability, height, or photo-inferred intelligence, hygiene, sexuality, gender, fitness, grooming, or body-hair filters.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Alignment questionnaire") {
                LabeledContent("Answered", value: "\(model.alignmentAnswers.count) / \(AlignmentQuestion.stagingV1.count)")
                Text("Ranking is local and explainable. Purchases, popularity, and protected traits are excluded.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            ForEach(AlignmentQuestion.stagingV1) { question in
                Section(question.category) {
                    Text(question.prompt)
                        .font(.headline)
                    if question.sensitive {
                        Label("Sensitive — optional", systemImage: "lock.shield")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Picker("Answer", selection: answerBinding(question)) {
                        Text("Skip").tag("")
                        ForEach(question.options) { option in
                            Text(option.label).tag(option.id)
                        }
                    }
                    Stepper(
                        "Importance: \(model.alignmentImportance[question.id] ?? 3)",
                        value: importanceBinding(question),
                        in: 0 ... 5
                    )
                    .disabled(model.alignmentAnswers[question.id] == nil)
                    Toggle("Dealbreaker", isOn: dealbreakerBinding(question))
                        .disabled(model.alignmentAnswers[question.id] == nil)
                }
            }
        }
        .navigationTitle("Preferences & Alignment")
    }

    private func lookingForBinding(_ mode: LookingForMode) -> Binding<Bool> {
        Binding(
            get: { model.selectedLookingForModes.contains(mode) },
            set: { model.setLookingFor(mode, enabled: $0) }
        )
    }

    private func genderBinding(_ category: GenderDiscoveryCategory) -> Binding<Bool> {
        Binding(
            get: { model.selectedGenderCategories.contains(category) },
            set: { model.setGenderCategory(category, enabled: $0) }
        )
    }

    private func answerBinding(_ question: AlignmentQuestion) -> Binding<String> {
        Binding(
            get: { model.alignmentAnswers[question.id] ?? "" },
            set: { model.setAlignmentAnswer(questionId: question.id, answerId: $0) }
        )
    }

    private func importanceBinding(_ question: AlignmentQuestion) -> Binding<Int> {
        Binding(
            get: { model.alignmentImportance[question.id] ?? 3 },
            set: { model.setAlignmentImportance(questionId: question.id, importance: $0) }
        )
    }

    private func dealbreakerBinding(_ question: AlignmentQuestion) -> Binding<Bool> {
        Binding(
            get: { model.alignmentDealbreakers.contains(question.id) },
            set: { model.setAlignmentDealbreaker(questionId: question.id, enabled: $0) }
        )
    }
}

struct SkinShopView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                StagingBannerView()
                Text("Synthetic catalog only. StoreKit, Play Billing, creator uploads, payouts, moderation, and public asset storage are not enabled.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text("Skins are cosmetic. Buying or creating one never changes dating reach, matching rank, message access, report priority, or safety tools.")
                    .font(.footnote)
            }

            ForEach(SkinShopItem.syntheticCatalog.indices, id: \.self) { index in
                let item = SkinShopItem.syntheticCatalog[index]
                Section(item.category) {
                    HStack(spacing: 14) {
                        RoundedRectangle(cornerRadius: 14)
                            .fill(previewGradient(index: index))
                            .frame(width: 72, height: 72)
                            .overlay {
                                Image(systemName: item.category == "Avatar" ? "person.crop.circle" : "paintpalette")
                                    .font(.title)
                            }
                            .accessibilityLabel(item.accessibilityDescription)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title).font(.headline)
                            Text(item.creator).font(.caption).foregroundStyle(.secondary)
                            Text(item.priceLabel).font(.subheadline)
                        }
                        Spacer()
                    }
                    Button(buttonLabel(item)) {
                        model.acquireSyntheticSkin(item)
                    }
                    .disabled(model.selectedSkinID == item.id)
                }
            }
        }
        .navigationTitle("Skin Shop")
    }

    private func buttonLabel(_ item: SkinShopItem) -> String {
        if model.selectedSkinID == item.id { return "Applied" }
        if model.ownedSkinIDs.contains(item.id) { return "Apply" }
        return "Get mock item"
    }

    private func previewGradient(index: Int) -> LinearGradient {
        let gradients: [[Color]] = [
            [.purple.opacity(0.65), .blue.opacity(0.35)],
            [.orange.opacity(0.55), .brown.opacity(0.25)],
            [.indigo.opacity(0.6), .black.opacity(0.35)],
            [.yellow.opacity(0.55), .pink.opacity(0.4)]
        ]
        let colors = gradients[index % gradients.count]
        return LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
    }
}

struct MatchLocationConsentView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss
    let profile: DiscoverProfile

    @State private var choice: MatchLocationShareChoice = .none
    @State private var preciseConfirmation = false

    var body: some View {
        Form {
            Section {
                Text("Matching never shares location automatically. Choose a separate, match-scoped staging consent for \(profile.displayName).")
                    .font(.footnote)
            }

            Section("Location choice") {
                Picker("Share", selection: $choice) {
                    ForEach(MatchLocationShareChoice.allCases) { item in
                        Text(item.title).tag(item)
                    }
                }
                if choice.isPrecise {
                    Toggle("I understand this choice may reveal a precise place", isOn: $preciseConfirmation)
                    Text("Production requires a second confirmation, encryption to this match, expiry, active-share indicators, and immediate revocation.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                } else if choice == .approximateMatchArea {
                    Text("Approximate area is the recommended default. No exact coordinates are collected in this staging build.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            Section {
                Button("Save staging consent") {
                    model.setLocationShareChoice(choice, for: profile)
                    dismiss()
                }
                .disabled(choice.isPrecise && !preciseConfirmation)

                Button("Not now", role: .cancel) {
                    model.setLocationShareChoice(.none, for: profile)
                    dismiss()
                }
            }
        }
        .navigationTitle("Location with \(profile.displayName)")
        .onAppear {
            choice = model.locationShareByMatch[profile.id] ?? .none
        }
        .onChange(of: choice) { _, newChoice in
            if !newChoice.isPrecise {
                preciseConfirmation = false
            }
        }
    }
}

struct MatchMapView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                StagingBannerView()
                Label("Synthetic map foundation", systemImage: "map")
                Text("No coordinates are collected. This screen records consent choices only until MapKit/Core Location and E2EE grant/revocation are implemented.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            if model.matches.isEmpty {
                ContentUnavailableView(
                    "No matched locations",
                    systemImage: "map",
                    description: Text("A mutual match is required before any location prompt.")
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(model.matches) { match in
                    Section(match.displayName) {
                        LabeledContent(
                            "Current grant",
                            value: (model.locationShareByMatch[match.id] ?? .none).title
                        )
                        NavigationLink("Review location consent") {
                            MatchLocationConsentView(profile: match)
                        }
                        if model.locationShareByMatch[match.id] != nil {
                            Button("Stop location share", role: .destructive) {
                                model.stopLocationShare(for: match.id)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Matched Map")
    }
}
