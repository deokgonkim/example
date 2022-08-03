import Foundation

public enum Sex {
    case men
    case women
}

/// tests enum `Sex`
///
/// Usage
///
///     testSex()
///     // prints 'Done'
///
public func testSex() {
    let man = Sex.men
    print(man)
}

/// tests all enumeration tests
///
/// Usage
///
///     testEnumeration()
///     // prints "Done"
public func testEnumeration() {
    testSex()
}
