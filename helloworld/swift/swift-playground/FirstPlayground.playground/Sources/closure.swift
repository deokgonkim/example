import Foundation

func closureable(_ ccc: (String, String) -> (String)) -> String {
    print("running closurable")
    let result: String = ccc("abc", "def")
    print("done closurable")
    return result
}

public func testClosure() {
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

public func testIo() {
    func ioFunction(_ inputValue: inout String) -> String {
        inputValue = inputValue.uppercased()
        return inputValue
    }

    var a = "blabla"
    let b = ioFunction(&a)
    
    print(a)
    print(b)
}
