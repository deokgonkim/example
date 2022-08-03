import Foundation

public enum Sex {
    case men
    case women
    case lgbt
}

public enum IterableSex: CaseIterable {
    case men
    case women
    case lgbt
}

enum Barcode {
    case upc(Int, Int, Int, Int)
    case qrCode(String)
}

enum BitSex: Int {
    case undefined  = 0b0000
    case women      = 0b0001
    case men        = 0b0010
    case both       = 0b0011
}

enum StrSex: String {
    case undefined  = "UNDEFINED"
    case women      = "WOMEN"
    case men        = "MEN"
    case both       = "BOTH"
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

public func testImplicitEnum() {
    let man: Sex
    
    man = .men
    print(man)
}

public func testEnumWithSwitch() {
    func test(_ e: Sex) {
        switch(e) {
        case .men:
            print("Received men")
        case .women:
            print("Received women")
        default:
            print("other sex")
        }
    }
    
    test(.men)
    test(.women)
    test(.lgbt)
}

public func testEnumIterating() {
    for i in IterableSex.allCases {
        print(i)
    }
}

public func testBarcode() throws {
    func barcodeConsumer(_ bc: Barcode) throws {
        switch(bc) {
        case .upc(let a, let b, let c, let d):
            print("Got upc barcode \(a) \(b) \(c) \(d)")
        case .qrCode(let str):
            print("Got qrcode \(str)")
        }
//        if bc == .upc {
//            print("Got upc barcode \(bc[0]) \(bc[2]) \(bc[3]) \(bc[4])")
//        } else if bc == .qrCode {
//            print("Got qrcode \(bc[0])")
//        } else {
//            fatalError("Unknown barcode")
//        }
    }
    let barcode1: Barcode = .upc(1, 2, 3, 4)
    print(barcode1)
    try barcodeConsumer(barcode1)
}

public func testBitSex() {
    let man: BitSex = .men
    let woman: BitSex = .women
    let lgbt: BitSex = .undefined
    print(man)
    print(woman)
    print(lgbt)
}

public func testStrSex() {
    let man: StrSex = .men
    let woman: StrSex = .women
    let lgbt: StrSex = .undefined
    print(man)
    print(woman)
    print(lgbt)
}

public func testStrSexValue() {
    let man: StrSex = .men
    let woman: StrSex = .women
    let lgbt: StrSex = .undefined
    print(man.rawValue)
    print(woman.rawValue)
    print(lgbt.rawValue)
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
