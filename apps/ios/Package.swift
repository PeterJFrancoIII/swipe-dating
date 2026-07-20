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
            path: "Sources"
        ),
    ]
)
