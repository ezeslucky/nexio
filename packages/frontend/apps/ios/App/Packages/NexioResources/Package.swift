// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "NexioResources",
  products: [
    .library(
      name: "NexioResources",
      targets: ["NexioResources"]
    ),
  ],
  targets: [
    .target(
      name: "NexioResources",
      resources: [
        .process("Resources/Icons.xcassets"),
        .process("Resources/Colors.xcassets"),
      ]
    ),
  ]
)
