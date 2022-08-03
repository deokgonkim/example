import Foundation

//MARK: type and optional

public func testStrToInt() {
    var str1 = "123"
    var str2 = "456"
    var int1 = Int(str1)! + Int(str2)!
    print(int1)
}

public func testStrNumberFormat() {
    var str1 = "1_000"
//    var str1 = "0x100"
//    var str1 = "1000"
    var int1 = Int(str1)
    if let ii = int1 {
        print("I Found \(ii)")
    } else {
        print("I Not found is nil \(int1)")
    }
    print(int1)
}

public func testAlias() {
    typealias Age = UInt8
    
    var age: Age = 8
    print(age)
}

public func testOptional() {
    var str1: String? = "Str1"
    var str2: String = "Str2"
    var str3: String! = "Str3"
    var str4: String = str1!
    var str5: String = str3
    print(str1)
    print(str2)
    print(str3)
    print(str4)
    print(str5)
}

public func testTypes() {
    let minInt: UInt = UInt.min
    let maxInt: UInt = UInt.max
    
    print(minInt)
    print(maxInt)

    let maxUint32: UInt32 = UInt32.max
    print(maxUint32)

//    var int1 = 3
//    var flt1: Double = 3.14
//    var tot = Double(int1) + flt1
//    print(tot)
//    var str1 = "Str1"
//    var str2 = "Str2"
////    var int1 = 123
//    var str3 = str1 + str2 + String(int1)
//    print(str3)
    
    testStrToInt()
    testStrNumberFormat()
    
    testAlias()

    testOptional()
}
