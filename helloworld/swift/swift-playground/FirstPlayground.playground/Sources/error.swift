import Foundation


/// My Error Type
///
/// Usage
///
///     // when unspecified error
///     throw MyError.runtimeError
///     // when number is not in range
///     throw MyError.numberError(minNumber: 1, maxNumber: 10)
///     // when error message is available
///     throw MyError.messageError(message: "You are wrong")
enum MyError: Error {
    case runtimeError
    case numberError(minNumber: Int, maxNumber: Int)
    case messageError(message: String)
}

public func testRuntimeError() {
    func throwingFunc() throws {
        throw MyError.runtimeError
    }
    do {
        try throwingFunc()
    } catch MyError.runtimeError {
        print("Caught runtimeError")
    } catch MyError.numberError(let a, let b) {
        print("Caught numberError \(a) \(b)")
    } catch {
        print("error?")
    }
}

public func testNumberError() {
    func throwingFunc() throws {
        throw MyError.numberError(minNumber: 10, maxNumber: 20)
    }
    do {
        try throwingFunc()
    } catch MyError.runtimeError {
        print("Caught runtimeError")
    } catch MyError.numberError(let a, let b) {
        print("Caught numberError \(a) \(b)")
    } catch {
        print("error?")
    }
}

public func testMessageError() {
    func throwingFunc() throws {
        throw MyError.messageError(message: "HAHAHA")
    }
    do {
        try throwingFunc()
    } catch MyError.runtimeError {
        print("Caught runtimeError")
    } catch MyError.numberError(let a, let b) {
        print("Caught numberError \(a) \(b)")
    } catch {
        print("error?", error)
    }
}

public func testTryQ() {
    func throwingFunc(param: String) throws -> String {
        if param == "VALID" {
            return "VALID"
        } else {
            throw MyError.runtimeError
        }
    }
    
    let result = try? throwingFunc(param: "VALID")
    if let result = result {
        print(result)
    } else {
        print("got no result")
    }
    
    let result2 = try? throwingFunc(param: "INVALID")
    if let result2 = result2 {
        print(result2)
    } else {
        print("got no result")
    }
}

public func testTryE() {
    func throwingFunc(param: String) throws -> String {
        if param == "VALID" {
            return "VALID"
        } else {
            throw MyError.runtimeError
        }
    }
    
    let result = try! throwingFunc(param: "VALID")
    print(result)
    
    let result2 = try! throwingFunc(param: "INVALID")
    print(result2)
}

public func testTryEwithDefer() {
    func throwingFunc(param: String) throws -> String {
        if param == "VALID" {
            return "VALID"
        } else {
            throw MyError.runtimeError
        }
    }
    
    defer {
        print("executing defer block")
        do {
            try throwingFunc(param: "NOTVALID")
        } catch {
            print("got error in defer \(error)")
        }
//        throwingFunc(param: "NOTVALID")
        print("executing defer final")
    }
    
    let result = try! throwingFunc(param: "VALID")
    print(result)
    
//    let result2 = try! throwingFunc(param: "INVALID")
//    print(result2)
}

