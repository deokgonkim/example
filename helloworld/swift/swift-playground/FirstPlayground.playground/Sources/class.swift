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
