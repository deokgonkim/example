// swift-tools-version: 5.6.2

import PackageDescription

let package = Package(
    name: "HelloWorld",
    products: [
    ],
    dependencies: [
    ],
    targets: [
        .target(
            name: "Helloer"
        ),
        .executableTarget(
            name: "Hello",
            dependencies: [
                "Helloer"
            ]
        )
    ]
)
