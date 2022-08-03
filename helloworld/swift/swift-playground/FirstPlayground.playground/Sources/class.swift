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
