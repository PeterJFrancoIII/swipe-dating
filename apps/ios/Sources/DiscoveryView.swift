import SwiftUI

/// Discovery placeholder — coarse-region matching via shared Rust core (pending UniFFI).
public struct DiscoveryView: View {
    public init() {}

    public var body: some View {
        List {
            Section("Discovery") {
                Text("No candidates — control plane not connected.")
                Text("Coarse regions only; no exact location.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Section("Staging") {
                StagingBannerView()
            }
        }
        .navigationTitle("Discover")
    }
}
