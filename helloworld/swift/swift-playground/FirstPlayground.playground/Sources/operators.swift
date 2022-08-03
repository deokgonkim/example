import Foundation

/// Testing operators
public func testOperators() {
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
