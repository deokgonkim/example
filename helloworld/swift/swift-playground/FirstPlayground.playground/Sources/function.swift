import Foundation

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


public func testVarArgs() {
    func varArgs(_ args: String...) {
        for (index, arg) in args.enumerated() {
            print("Argument \(index) \(arg)")
        }
    }
    
    varArgs("blabla")
    varArgs("blabla", "abcdef", "hihihi")
}

public func testVoidFunction() {
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

public func testOptionalTupleFunction() {
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


public func testSwapInt() {
    func swapInt(_ a: inout Int, _ b: inout Int) -> Void {
        (a, b) = (b, a)
    }
    var a = 30
    var b = 40
    swapInt(&a, &b)
    print(a, b)
}

public func testRange() {
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

public func testIfRange() {
    var a = 10
    if 5 < a && a < 20 {
        print("A is between 5 and 20 \(a)")
    } else {
        print("Error")
    }
}

//MARK: request and tuple test

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
//var result = request("/", method: "GET")
//print("Status Code : \(result.statusCode)")
//print("Response Text : \(result.responseText)")


public func testFunction() {
    testVarArgs()
    testVoidFunction()
    testSwapInt()
    testRange()
    testIfRange()
}


//MARK: async functions

public func testAsyncFunction() {
    func asyncFunc() async -> String {
//        try await Task.sleep(until: .now + .seconds(2), clock: .continuous)
        print("begin async function")
        return "result"
    }
    
//    let result = await asyncFunc()
//    print("result is \(result)")
}
