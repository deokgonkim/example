import Foundation

enum EnumTest {
    case case1
    case case2
    case case3
}

//MARK: switch
public func testControlSwitch() {
    func testEnum(_ e: EnumTest) {
        //TODO: Error Case: Switch must be exhaustive
//        switch(e) {
//        case .case1:
//            print("CASE1")
//        case .case2:
//            print("CASE2")
//        }
    }
    
    testEnum(.case1)
}


public func testControl() {
    testControlSwitch()
    print("DONE")
}
