import Foundation

public struct StructIsImutable {
    var name: String
}


public class ClassAreReferenceType: CustomStringConvertible {
    var name: String
    
    init(_ name: String) {
        self.name = name
    }
    
    public var description: String { return "ClassAreReferenceType: \(name)" }
}

public class ChildClass: CustomStringConvertible, Equatable {
    var name: String
    
    init(_ name: String) {
        self.name = name
    }
    
    public static func == (lhs: ChildClass, rhs: ChildClass) -> Bool {
        return lhs.name == rhs.name
    }
    
    public var description: String { return "ChildClass: \(name)"}
}

public struct Parent {
    var name: String
    var child: ChildClass?
    
    init(_ name: String) {
        self.name = name
    }
    
//    public var description: String { return "ParentClass: \(name)"}
}

extension Parent: Equatable {}


public func testStructMutate() {
    let const = StructIsImutable(name: "Struct1")
    print(const)
    //TODO: const can't be updated
//    const.name = "New Struct2"
//    print(const)
}

public func testClassModify() {
    let c1 = ClassAreReferenceType("Class1")
    
    print(c1)
    c1.name = "testing"
    print(c1)
}

public func testClassReassignment() {
    func replaceClass(_ o: ClassAreReferenceType) {
        print("Received \(o)")
        //TODO: o can't be replaced
//        o = ClassAreReferenceType("test2")
    }
    
    var o1 = ClassAreReferenceType("test")
    print(o1)
    replaceClass(o1)
    print(o1)
}

public func testClassComparison() {
    let c1 = ClassAreReferenceType("test1")
    let c2 = ClassAreReferenceType("test1")
    //TODO: Binary operator '==' cannot be applied to two 'ClassAreReferenceType' operands
//    if c1 == c2 {
//        print("c1 and c2 are same")
//    } else {
//        print("c1 and c2 are not same")
//    }
    if c1 === c2 {
        print("c1 and c2 are identical")
    } else {
        print("c1 and c2 are not identical")
    }
    
    var c3 = ClassAreReferenceType("test2")
    var c4 = ClassAreReferenceType("")
    if c3 === c4 {
        print("c3 and c4 are identical")
    } else {
        print("c3 and c4 are not identical")
    }
    
    var c5 = ClassAreReferenceType("test3")
    var c6 = ClassAreReferenceType("")
    c6.name = "test3"
    if c5 === c6 {
        print("c5 and c6 are identical")
    } else {
        print("c5 and c6 are not identical")
    }
    
    var p1 = Parent("parent1")
    var p2 = Parent("parent1")
    if p1 == p2 {
        print("p1 and p2 are same")
    } else {
        print("p1 and p2 are not same")
    }
    
    var child = ChildClass("blabla")
    
    var p3 = Parent("parent2")
    var p4 = Parent("")
    p4.name = "parent2"
    p4.child = child
    
    if p3 == p4 {
        print("p3 and p4 are same")
    } else {
        print("p3 and p4 are not same")
    }
    
    p3.child = child
    if p3 == p4 {
        print("p3 and p4 are same")
    } else {
        print("p3 and p4 are not same")
    }
    
    p4.child = ChildClass("blabla")
    if p3 == p4 {
        print("p3 and p4 are same")
    } else {
        print("p3 and p4 are not same")
    }
    
    var ch1 = ChildClass("name1")
    var ch2 = ChildClass("name1")
    if ch1 === ch2 {
        print("ch1 and ch2 are identical")
    } else {
        print("ch1 and ch2 are not identical")
    }
    if ch1 == ch2 {
        print("ch1 and ch2 are same")
    } else {
        print("ch1 and ch2 are not same")
    }
}

public class RequiredClass: CustomStringConvertible {
    var name: String
    required init(_ name: String) {
        self.name = name
    }
    required init() {
        self.name = "NO NAME"
    }
    
    public var description: String {
        self.name
    }
}

public func testRequiredClass() {
    var c = RequiredClass()
    print(c)
    var d = RequiredClass("HAHAHA")
    print(d)
    var e = type(of: c).init("NONONONO")
    print(e)
}

//MARK: failable initializer

class NaturalNumberThrowing {
    var n: Int = 0
    init(_ n: Int) throws {
        if n < 1 {
            throw MyError.messageError(message: "\(n) is not Natural number")
        } else {
            self.n = n
        }
    }
}

class NaturalNumber {
    var n: Int = 0
    init?(_ n: Int) {
        if n < 1 {
            print("\(n) is not Natural number")
            return nil
        } else {
            self.n = n
        }
    }
}

public func testFailableInitializer() {
    do {
        var n = try NaturalNumberThrowing(10)
        print(n)
        var n2 = try NaturalNumberThrowing(-1)
        print(n2)
    } catch {
        print("Got error \(error)")
    }
    
    var n3: NaturalNumber? = NaturalNumber(10)
    print(n3)
    var n4 = NaturalNumber(-2)
    print(n4)
}

public func testOpaqueType() {
    class Person {
        var name: String
        init(name: String) {
            self.name = name
        }
    }
    class WhitePerson : Person {
        var new_name: String?
    }
    
//    func willReturnPerson(_ p: WhitePerson) -> some Person {
//        if p is Person {
//            return p
//        } else {
//            return Person(name: p.name)
//        }
//    }
    
    
}

public func testUnowned() {
    class Customer : CustomStringConvertible {
        var name: String
        var creditCard: CreditCard?
        init(name: String) {
            self.name = name
        }
        
        deinit { print("\(name) is being deinitialized") }
        
        var description: String {
            self.name
        }
    }
    
    class CreditCard : CustomStringConvertible {
        var cardNumber: String
        unowned var customer: Customer
        
        init(number cardNumber: String, customer: Customer) {
            self.cardNumber = cardNumber
            self.customer = customer
        }
        
        deinit { print("\(cardNumber) is being deinitialized") }

        
        var description: String {
            return "\(cardNumber) owned by \(customer)"
        }
    }
    
    var customer: Customer?
    var creditCard: CreditCard
    
    customer = Customer(name: "Jack")
    print(customer)
    creditCard = CreditCard(number: "0000-0000", customer: customer!)
    customer = nil
    print(creditCard)
}

public class StackClass<Element> {
    
    var array: [Element] = []
    
    func push(_ element: Element) {
        array.append(element)
    }
    
    func pop() -> Element {
        let lastValue = array[array.endIndex - 1]
        array.remove(at: array.endIndex - 1)
        return lastValue
    }
}

extension StackClass {
    var bottomItem: Element? {
        if !array.isEmpty {
            let firstItem = array[0]
            return firstItem
        } else {
            return nil
        }
    }
}

extension StackClass where Element == String {
    var firstString: Element? {
        if array.isEmpty {
            return nil
        } else {
            return array[0]
        }
    }
}

public func testStackClass() {
    let numberStack = StackClass<Int>()
    let stringStack = StackClass<String>()
    
    numberStack.push(3)
    numberStack.push(1)
    numberStack.push(2)
    
    let lastNumber = numberStack.pop()
    
    print("lastNumber: \(lastNumber)")
//    print("firstString: \(numberStack.firstString)")
    
    stringStack.push("blabla")
    stringStack.push("dgkim")
    stringStack.push("foo")
    
    let lastString = stringStack.pop()
    let secondString = stringStack.pop()
    print("secondString : \(secondString)")
    
    let bottomString = stringStack.bottomItem
    print("bottomString : \(bottomString)")
    print("firstString: \(stringStack.firstString)")
}


protocol Tea {
    associatedtype Identifier
    var id: Identifier { get }
}


struct GreenTea: Tea {
    let id: String
    init(id: String) {
        self.id = id
    }
}


func favoriteTea() -> some Tea {
    return GreenTea(id: "someId")
}
