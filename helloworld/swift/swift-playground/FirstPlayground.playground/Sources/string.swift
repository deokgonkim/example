import Foundation

public func testMultilineString() {
    let threeMoreDoubleQuotationMarks = ##"""
    Here are three more double quotes: """
    """##
    print(threeMoreDoubleQuotationMarks)
    let anotherString = ###"Line1\###nLine2"###
    print(anotherString)
}

public func testStringMutation() {
    var str = "New String"
    print(str)
//    str[0] = "n"
//    print(str)
//    for c in str {
//        print(c)
//    }
    
//    str.append("!")
    print(str)
//    print(str.indices)
//    print(str[..<str.index(str.startIndex, offsetBy: 5)])
    
    var newStr: Substring = str[...str.firstIndex(of: "S")!]
    print(newStr)
    newStr.insert(contentsOf: "KKK", at: newStr.startIndex)
//    print(str[...str.firstIndex(of: "S")!].insert(contentsOf: "KKK", at: str.startIndex))
    print(newStr)
    print(str)
}

public func testHan() {
    let precomposed: String = "\u{D55C}"                  // 한
    let decomposed: String = "\u{1112}\u{1161}\u{11AB}"   // ᄒ, ᅡ, ᆫ
    print("precomposed \(precomposed) \(precomposed.count)")
    print("decomposed \(decomposed) \(decomposed.count)")
}


/// tests all string test cases
public func testString() {
    testMultilineString()
    testStringMutation()
    testHan()
}
