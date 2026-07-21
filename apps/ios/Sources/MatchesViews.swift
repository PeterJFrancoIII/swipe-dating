import SwiftUI

struct MatchesListView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        List {
            Section {
                StagingBannerView()
            }
            if model.matches.isEmpty {
                ContentUnavailableView(
                    "No matches yet",
                    systemImage: "heart",
                    description: Text("Mutual interest required before messaging or location sharing.")
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(model.matches) { match in
                    NavigationLink(value: match) {
                        VStack(alignment: .leading) {
                            Text(match.displayName).font(.headline)
                            Text(match.about)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                            if let share = model.locationShareByMatch[match.id] {
                                Label(share.title, systemImage: "location")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .accessibilityLabel("Conversation with \(match.displayName)")
                }
            }
        }
        .navigationTitle("Matches")
        .navigationDestination(for: SyntheticProfile.self) { match in
            ConversationView(profile: match)
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink {
                    MatchMapView()
                } label: {
                    Image(systemName: "map")
                }
                .accessibilityLabel("Matched location map")
            }
        }
    }
}

struct ConversationView: View {
    @EnvironmentObject private var model: AppModel
    let profile: SyntheticProfile
    @State private var draft = ""
    @State private var showReport = false
    @State private var showLocationShare = false

    var body: some View {
        VStack(spacing: 0) {
            Text("Screenshots can’t be fully prevented. Meet in public if you meet at all. Location is never shared just because you matched.")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .padding(8)
                .frame(maxWidth: .infinity)
                .background(Color.orange.opacity(0.12))

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 8) {
                        ForEach(model.conversations[profile.id] ?? []) { message in
                            HStack {
                                if message.fromMe { Spacer(minLength: 40) }
                                Text(message.body)
                                    .padding(10)
                                    .background(message.fromMe ? Color.accentColor.opacity(0.2) : Color.gray.opacity(0.15))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                if !message.fromMe { Spacer(minLength: 40) }
                            }
                            .id(message.id)
                            .accessibilityLabel(message.fromMe ? "You: \(message.body)" : "\(profile.displayName): \(message.body)")
                        }
                    }
                    .padding()
                }
                .onChange(of: model.conversations[profile.id]?.count ?? 0) { _, _ in
                    if let last = model.conversations[profile.id]?.last {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }

            HStack {
                TextField("Message", text: $draft, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1 ... 4)
                    .accessibilityLabel("Message field")
                Button("Send") {
                    model.sendMessage(to: profile.id, text: draft)
                    draft = ""
                }
                .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding()
        }
        .navigationTitle(profile.displayName)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("Review location sharing") {
                        showLocationShare = true
                    }
                    Button("Block", role: .destructive) {
                        model.block(profileId: profile.id)
                    }
                    Button("Report", role: .destructive) {
                        showReport = true
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
                .accessibilityLabel("Conversation privacy and safety actions")
            }
        }
        .sheet(isPresented: $showReport) {
            NavigationStack { ReportFlowView(profile: profile) }
        }
        .sheet(isPresented: $showLocationShare) {
            NavigationStack { MatchLocationConsentView(profile: profile) }
        }
    }
}
