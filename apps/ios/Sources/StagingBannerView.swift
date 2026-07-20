import SwiftUI

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
            .accessibilityLabel("Staging, not for production")
    }
}
