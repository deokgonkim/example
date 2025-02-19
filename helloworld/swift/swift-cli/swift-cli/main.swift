//
//  main.swift
//  swift-cli
//
//  Created by Deokgon Kim on 2022/08/22.
//

import Foundation

@main
struct swift_cli {
    static func main() async throws {
        let url = URL(string: "https://hws.dev/users.csv")!

        for try await line in url.lines {
            print("Received user: \(line)")
        }
    }
}
