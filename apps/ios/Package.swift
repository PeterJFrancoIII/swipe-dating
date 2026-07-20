// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SwipeDatingIOS",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(name: "SwipeDatingIOS", targets: ["SwipeDatingIOS"]),
    ],
    targets: [
        .target(
            name: "SwipeDatingIOS",
            path: "Sources",
            swiftSettings: [
                // Uncomment when linking libdating_uniffi_bindings + Generated/:
                // .define("DATING_UNIFFI_LINKED"),
            ]
        ),
    ]
)

// Generated UniFFI Swift lives in apps/ios/Generated/ for review.
// Wire it as a separate target only after the native static/dynamic library is linked
// (see apps/ios/README.md and scripts/generate-uniffi.sh).
