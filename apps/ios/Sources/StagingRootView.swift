import SwiftUI

/// Root staging shell — structural placeholder until UniFFI core is wired.
public struct StagingRootView: View {
    public init() {}

    public var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                StagingBannerView()
                NavigationLink("Age gate") {
                    AgeGateView()
                }
                NavigationLink("Discovery") {
                    DiscoveryView()
                }
            }
            .padding()
            .navigationTitle("Swipe Dating")
        }
    }
}

public struct StagingBannerView: View {
    public init() {}

    public var body: some View {
        Text("STAGING — NOT FOR PRODUCTION")
            .font(.caption.bold())
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.orange)
            .clipShape(Capsule())
            .accessibilityIdentifier("staging_banner")
    }
}
