import SwiftUI

/// Root staging shell wired to audited core via `DatingCoreBridge`.
public struct StagingRootView: View {
    public init() {}

    public var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                StagingBannerView()
                Text("Protocol v\(DatingCoreBridge.protocolVersion())")
                    .font(.subheadline.monospaced())
                    .accessibilityIdentifier("protocol_version")
                if DatingCoreBridge.isStagingFallback {
                    Text("Core: STAGING mock (native UniFFI lib not linked)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
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
