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
                    description: Text("Authenticated mutual interest is required before messaging.")
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(model.matches) { match in
                    NavigationLink(value: match) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(match.displayName).font(.headline)
                            Text(match.about)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                            if let share = model.activeLocationShare(for: match.id) {
                                Label(
                                    "\(share.mode.rawValue) · until \(share.expiresAt.formatted(date: .omitted, time: .shortened))",
                                    systemImage: "location.fill"
                                )
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
    }
}

struct ConversationView: View {
    @EnvironmentObject private var model: AppModel
    let profile: SyntheticProfile
    @State private var draft = ""
    @State private var showReport = false
    @State private var showLocationConsent = false

    var body: some View {
        VStack(spacing: 0) {
            Text("Screenshots can’t be fully prevented. Meet in public if you meet at all.")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .padding(8)
                .frame(maxWidth: .infinity)
                .background(Color.orange.opacity(0.12))

            locationStrip

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
                NavigationLink {
                    MatchMapView(profile: profile)
                } label: {
                    Image(systemName: "map")
                }
                .accessibilityLabel("Location map with \(profile.displayName)")
            }

            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("Share location…") {
                        showLocationConsent = true
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
                .accessibilityLabel("Conversation safety actions")
            }
        }
        .sheet(isPresented: $showReport) {
            NavigationStack { ReportFlowView(profile: profile) }
        }
        .sheet(isPresented: $showLocationConsent) {
            NavigationStack { MatchLocationConsentSheet(profile: profile) }
        }
    }

    @ViewBuilder
    private var locationStrip: some View {
        if let share = model.activeLocationShare(for: profile.id) {
            HStack {
                Label(share.mode.rawValue, systemImage: "location.fill")
                    .font(.caption)
                Spacer()
                Text("Expires \(share.expiresAt.formatted(date: .omitted, time: .shortened))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Button("Stop", role: .destructive) {
                    model.revokeLocationShare(profileId: profile.id)
                }
                .font(.caption)
            }
            .padding(8)
            .background(Color.blue.opacity(0.08))
        } else {
            Button {
                showLocationConsent = true
            } label: {
                Label("Location off · share only when you choose", systemImage: "location.slash")
                    .font(.caption)
            }
            .padding(8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.gray.opacity(0.08))
        }
    }
}
