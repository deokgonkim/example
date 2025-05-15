//
//  main.swift
//  first-coreml
//
//  Created by Deokgon Kim on 5/15/25.
//

import Foundation
import AppKit

func main() {
    let arguments = CommandLine.arguments
    
    if arguments.count < 2 {
        print("Please provide file name as an argument")
        return
    }
    
    let url = URL(fileURLWithPath: arguments[1])
    if let image = NSImage(contentsOf: url) {
        classifyImage(image)
    } else {
        print("Failed to load image")
    }
}

main()
