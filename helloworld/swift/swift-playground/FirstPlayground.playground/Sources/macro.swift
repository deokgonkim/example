import Foundation

public func testAvailable() {
    if #available(iOS 1.0, macOS 50.0, *) {
        print("Available")
    } else {
        print("Unavailable")
    }
}

public func testMacro() {
    testAvailable()
}
