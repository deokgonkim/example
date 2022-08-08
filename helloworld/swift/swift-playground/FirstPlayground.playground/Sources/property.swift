import Foundation


public func testPropertyWrapper() {
    @propertyWrapper
    struct IntegerHolder {
        private var number: Int = 0
        
        private(set) var projectedValue: Bool = false
        
        var wrappedValue: Int {
            get {
                number
            }
            set {
                number = newValue + 1
                if number > 30 {
                    projectedValue = true
                } else {
                    projectedValue = false
                }
            }
        }
    }
    
    struct NumberHolder {
        @IntegerHolder var n: Int
        
        init() {
            n = 20
        }
    }
    
    var nh = NumberHolder()
    print(nh)
    print(nh.n)
    print(nh.$n)
//    nh.$n.wrappedValue = 303
    print(nh.n)
}
