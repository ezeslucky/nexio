// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "NexioPaywall",
  platforms: [
    .iOS(.v16),
    .macOS(.v14), // just for build so LLM can verify their code
  ],
  products: [
    .library(
      name: "NexioPaywall",
      targets: ["NexioPaywall"]
    ),
  ],
  dependencies: [
    .package(url: "https://github.com/RevenueCat/purchases-ios-spm.git", from: "5.83.0"),
  ],
  targets: [
    .target(
      name: "NexioPaywall",
      dependencies: [
        .product(name: "RevenueCat", package: "purchases-ios-spm"),
      ]
    ),
  ]
)
