import UIKit

var greeting = "Hello, playground"

struct Player {
    var name: String
    var highScore: Int = 0
    var history: [Int] = []
    
    init(_ name: String) {
        self.name = name
    }
}

//print(greeting)

/// prints string representation of `str`
///
/// balbla
///
///     new_print("New String")
///
/// - Parameters
///     - str: String Space(`" "`)
func new_print(str: String?) -> Any {
    print(str)
    return str!
}

//var name: String?
//name = "dgkim"
//name = "dgkim2"
//var name2 = new_print(str: name)
//print(name2)

/// Increases variable by 1
///
/// Usage
///
///     var i = 10
///     var new_i = increment(i)
///
///     print(new_i)
///
/// - Parameters:
///     - 1: variable to increase
func increment(i: Int32) -> Int32 {
    let j = i + 1
    return j
}

var i :Int32 = 10
var i2 = increment(i: i)

//print(i)
//print(i2)
//print(i)

/// add element to array and returns `array`
///
/// Usage
///
///     var name1 = "Deokgon Kim"
///     var name2 = "Deokgon Kim2"
///     var arr = add_element(name1)
///     print(arr)
///     var arr2 = add_element(name2)
///     print(arr2)
///
/// - Parameters:
///     - string: to be added
///     - arr: Array to add element
func add_element(_ val: String, arr: [String]) -> Array<String> {
//    var array: [String] = []
//    arr.append(val)
    return arr
}

//var name1 = "Deokgon Kim"
//var name2 = "Deokgon Kim2"
//var arr0: [String] = []
//var arr = add_element(name1, arr: arr0)
//print(arr)
//var arr2 = add_element(name2, arr: arr0)
//print(arr2)

//let minInt: UInt = UInt.min
//let maxInt: UInt = UInt.max
//
//print(minInt)
//print(maxInt)

//let maxUint32: UInt32 = UInt32.max
//print(maxUint32)

//var int1 = 3
//var flt1: Double = 3.14
//var tot = Double(int1) + flt1
//print(tot)
//var str1 = "Str1"
//var str2 = "Str2"
//var int1 = 123
//var str3 = str1 + str2 + String(int1)
//print(str3)
//var str1 = "123"
//var str2 = "456"
//var int1 = Int(str1)! + Int(str2)!
//print(int1)

//typealias Age = UInt8
//
//var age: Age = 8
//print(age)

//var str1 = "1_000"
//var str1 = "0x100"
//var str1 = "1000"
//var int1 = Int(str1)
//if let ii = int1 {
//    print("I Found \(ii)")
//} else {
//    print("I Not found is nil \(int1)")
//}
//print(int1)

//var str1: String? = "Str1"
//var str2: String = "Str2"
//var str3: String! = "Str3"
//var str4: String = str1!
//var str5: String = str3
//print(str1)
//print(str2)
//print(str3)
//print(str4)
//print(str5)

//var age: Int = 40
//
//assert(age > 0, "Age is under 0")
//print(age)
//
//age -= 41

//assert(age > 0, "Age is under 0")
//precondition(age > 0, "Age must be greater than zero.")
//print(age)
//assertionFailure("Should not be happening")
//fatalError("HAHAHA")

/// Testing operators
func testOperators() {
    var number: Int = 0
    var number2: Int = 0
    
    print(number)
    number = 1
    print(number)
    number = -number
    print(number)
    number = -number
    print(number)
    
    number2 = Int.max
    
//    number = 2 + number2
    number = 9 % -4
    print(number)
}
//testOperators()


func testMultilineString() {
    let threeMoreDoubleQuotationMarks = ##"""
    Here are three more double quotes: """
    """##
    print(threeMoreDoubleQuotationMarks)
    let anotherString = ###"Line1\###nLine2"###
    print(anotherString)
}

//testMultilineString()


func testStringMutation() {
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

//testStringMutation()

func testHan() {
    let precomposed: String = "\u{D55C}"                  // 한
    let decomposed: String = "\u{1112}\u{1161}\u{11AB}"   // ᄒ, ᅡ, ᆫ
    print("precomposed \(precomposed) \(precomposed.count)")
    print("decomposed \(decomposed) \(decomposed.count)")
}

//testHan()


func closureable(_ ccc: (String, String) -> (String)) -> String {
    print("running closurable")
    let result: String = ccc("abc", "def")
    print("done closurable")
    return result
}

func testClosure() {
    let cc: (String, String) -> String = { (str, suffix) -> String in
        return str + "KKK" + suffix
    }
    
    func kk(_ arg1: String, _ arg2: String) -> String {
        return arg1 + "OOO" + arg2
    }
    
    let a = "a"
//    let b = cc(a, "HAHA")
    let b = closureable { (str: String, suffix: String) -> String in
        return str + "TTT" + suffix
    }
    print(b)
    
    let c = closureable(kk)
    print(c)
}

//testClosure()

func testIo() {
    func ioFunction(_ inputValue: inout String) -> String {
        inputValue = inputValue.uppercased()
        return inputValue
    }

    var a = "blabla"
    let b = ioFunction(&a)
    
    print(a)
    print(b)
}

//testIo()

func testVarArgs() {
    func varArgs(_ args: String...) {
        for (index, arg) in args.enumerated() {
            print("Argument \(index) \(arg)")
        }
    }
    
    varArgs("blabla")
    varArgs("blabla", "abcdef", "hihihi")
}

//testVarArgs()

func testVoidFunction() {
    func voidFunction() -> Void? {
        print("Void Function")
//        return nil
    }
    
    let v: Void? = voidFunction()
    print(v)
    
    if let val = v {
        print("Value exists \(val)")
    }
}

//testVoidFunction()

func testOptionalTupleFunction() {
    func optionalTupleFunction(_ arg: Bool = true) -> (key: String, value: String)? {
        if arg {
            return ("bla", "bla")
        } else {
            return nil
        }
    }
    let (key, value) = optionalTupleFunction(false) ?? ("kkk", "lll")
    print(key, value)
}

//testOptionalTupleFunction()


func testSwapInt() {
    func swapInt(_ a: inout Int, _ b: inout Int) -> Void {
        (a, b) = (b, a)
    }
    var a = 30
    var b = 40
    swapInt(&a, &b)
    print(a, b)
}

//testSwapInt()

func testRange() {
    func range1() {
        for i in 0..<10 {
            print(i)
        }
    }
    func range2() {
        for i in stride(from: 0, to: 10, by: 2) {
            print(i)
        }
    }
    range1()
    range2()
}

//testRange()


func testIfRange() {
    var a = 10
    if 5 < a && a < 20 {
        print("A is between 5 and 20 \(a)")
    } else {
        print("Error")
    }
}

//testIfRange()

func testAvailable() {
    if #available(iOS 1.0, macOS 50.0, *) {
        print("Available")
    } else {
        print("Unavailable")
    }
}

//testAvailable()

/// returns web resource requested
///
/// Usage
///
///     var (statusCode, responseText) = request("/dgkim", method: "GET")
///     print("Status Code : \(statusCode)")
///     print("Response Text : \(responseText)")
///
/// - Parameters:
///     - url: the url to call
///     - method: metod to call
func request(_ url: String, method: String) -> (statusCode: Int, responseText: String) {
    if url == "/" {
        return (200, "GOOD")
    } else {
        return (404, "Not found")
    }
}

//var (status, resp) = request("/dgkim", method: "GET")
var result = request("/", method: "GET")
//print("Status Code : \(result.statusCode)")
//print("Response Text : \(result.responseText)")
    
var player = Player("Deokgon Kim")
player.highScore = 80
player.history.append(30)
player.history.append(80)

print(player)

extension Player {
    mutating func updateStore(_ newScore: Int) {
        self.history.append(newScore)
        
        if highScore < newScore {
            print("\(newScore) A new high score for \(name)")
            highScore = newScore
        }
    }
}

extension Player: Codable, Equatable {}

player.name = "new Deokgon Kim"

player.updateStore(90)

print(player)

import Foundation
let encoder = JSONEncoder()
try encoder.encode(player)

let encoded = try encoder.encode(player)

var players: [Player] = []
players.append(player)
players.append(Player("New Player"))

print(players)

let ranked = players.sorted(by: { a, b in
    return a.highScore < b.highScore
})

print(ranked)
