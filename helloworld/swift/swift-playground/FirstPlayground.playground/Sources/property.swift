import Foundation

@propertyWrapper
struct LogValue {
    private var holder: String
    
    var projectedValue: String
    
    public var wrappedValue: String {
        get {
            print("Getting value on \(self)")
            return holder
        }
        set {
            print("Setting value on \(self)")
            holder = newValue
            projectedValue = holder.uppercased()
        }
    }
    
    public init(wrappedValue: String) {
        holder = wrappedValue
        projectedValue = holder.uppercased()
    }
}

public func testPropertyWrapperLogValue() {
    struct SomeStruct {
        @LogValue var name: String = ""
        
//        init(name: String) {
//            self.name = name
//        }
    }
    
    var ss = SomeStruct(name: "dgkim")
    print(ss)
    
    print("change name of ss")
    ss.name = "new dgkim"
    
    print(ss)
    print(ss.name)
    print(ss.$name)
    ss.$name = "dgkim"
    print(ss.$name)
}


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

public func testPropertyObserver() {
    struct SomeStruct {
        var name: String {
            didSet {
                print("name is set to \(oldValue) => \(name)")
            }
            willSet {
                print("name will be setted to \(newValue) from \(name)")
            }
        }
        
        init(_ name: String) {
            self.name = name
            print("SomeStruct initialized")
        }
        
    }
    
    var s = SomeStruct("name1")
    print(s)
    print("s.name = \(s.name)")
    s.name = "name2"
    print("s.name = \(s.name)")
}

public func testPropertyObserverInherit() {
    class SomeClass {
        var name: String {
            didSet {
                print("name is set to \(oldValue) => \(name)")
            }
            willSet {
                print("name will be setted to \(newValue) from \(name)")
            }
        }
        
        init() {
            self.name = ""
        }
        
        init(_ name: String) {
            self.name = name
            print("SomeStruct initialized")
        }
    }
    
    class SomeOtherClass: SomeClass {
        var age: Int = 0
        override var name: String {
            didSet {
                print("NAME IS SET TO \(oldValue) => \(name)")
            }
//            get {
//                self.name
//            }
//            set {
//                self.name = "NEW NAME \(newValue)"
//            }
        }
        override init(_ name: String) {
            super.init()
            self.name = name
            self.name = "__\(name)__"
        }
    }
    
    var s = SomeOtherClass("name1")
    print(s)
    print("s.name = \(s.name)")
    s.name = "name2"
    print("s.name = \(s.name)")
    print("done")
}


public func testPropertyWrapper2() {
    @propertyWrapper
    struct IntWrapper {
        var number: Int = 0
        var wrappedValue: Int {
            get {
                return number
            }
            set {
                number = newValue
            }
        }
    }
    
    @propertyWrapper
    struct TwelveOrLess {
        private var number = 0
        var wrappedValue: Int {
            get { return number }
            set { number = min(newValue, 12) }
        }
    }
    
    struct Some2Struct {
        var n: Int = 0
        var n2: Int {
            get {
                return n
            }
            set {
                n2 = newValue
            }
        }
    }
    
//    var k2 = Some2Struct()
//    print("k2.n = \(k2.n)")
//    print("k2.n2 = \(k2.n2)")

    @propertyWrapper
    struct Some3Struct {
        var n: Int = 0
        var wrappedValue: Int = 0
        var projectedValue: Bool = false
    }
    
    struct SomeStruct {
        @Some3Struct var n: Int
    }
    
    var k = SomeStruct()
//    k.n = 30
    print(k)
    print(k.n)
    k.n = 80
    print(k.$n)
    k.$n = true
    print(k.$n)
}
