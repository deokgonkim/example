import Foundation

public enum Direction {
    case north
    case south
    case west
    case east
    case up
    case down
    case toward(ns: Int, we: Int, ud: Int)
}

public enum FlyingException: Error {
    case noDirection
    case noStartingAltitude
    case generalException(message: String)
}

public protocol Fly {
    static var congestion: Int { get }
    var altitude: Int? { get set }
    func flyStraight() throws
    
    static func addWind()
}

//TODO: test extension
public protocol Walkable {
    func walk()
}

public struct Hawk: Fly {
    public static var congestion: Int = 0
    
    public var altitude: Int?
    
    public func flyStraight() throws {
        print("Hawk is flying straight")
    }
    
    public static func addWind() {
        print("Hawk addWind")
    }
}

public class Bird {
    var wingSize: Int {
        willSet {
            print("Wing will grow up to \(newValue)")
        }
    }
    
    init(wingSize: Int) {
        self.wingSize = wingSize
    }
    
    func grow() {
        wingSize += 1
    }
    
    class func drop() {
        print("drop")
    }
}

public class Sparrow: Bird, Fly {
    var name: String
    private var direction: Direction?
    
    static public var congestion: Int = 0
    
    public var altitude: Int? {
        didSet {
            print("Setting altitude to \(altitude!)")
        }
    }
    
    init(_ name: String) {
        self.name = name
        Sparrow.congestion += 1
        super.init(wingSize: 1)
    }
    
    deinit {
        print("Removing \(self.name)")
        Sparrow.congestion -= 1
    }
    
    public func setDirection(_ d: Direction) {
        self.direction = d
    }
    
    public func flyStraight() throws {
        guard let altitude = altitude else {
            throw FlyingException.noStartingAltitude
        }
        if let direction = direction {
            print("\(name) is flying straight to \(direction) starting on \(altitude)")
        } else {
            throw FlyingException.noDirection
        }
        wingSize += 1
    }
    
    public static func addWind() {
        print("add wind")
    }
}


public func testSparrow() {
    var jack = Sparrow("Jack")
    print(jack)
    jack.setDirection(.toward(ns: 3, we: 3, ud: 1))
    try? jack.flyStraight()
}

public func testSparrowError() {
    var jack = Sparrow("Jack")
    print(jack)
    jack.altitude = 3
    jack.setDirection(.toward(ns: 3, we: 3, ud: 1))
    try! jack.flyStraight()
    print("Congestion \(Sparrow.congestion)")
    print("Wing size : \(jack.wingSize)")
    
    func someFunc() {
        var harry = Sparrow("Harry")
        print("Congestion \(Sparrow.congestion)")
    }
    someFunc()
    type(of: jack).congestion += 1
    print("Congestion \(Sparrow.congestion)")
    
    
    Sparrow.addWind()
    Sparrow.drop()
}

//MARK: test MutableProtocol

protocol Growable {
    var age: Int { get }
    mutating func grow()
}

struct PersonStruct: Growable {
    var age: Int = 1
    
    mutating func grow() {
        print("grow of PersonStruct")
        age += 1
    }
}

class PersonClass: Growable {
    var age: Int = 1
    
    func grow() {
        print("grow of PersonClass")
        self.age += 1
    }
}

//func incubate(o: Growable) {
//    print("growing \(type(of: o))")
//    //TODO: 이건 안 되는군..
//    o.grow()
//}

public func testMutableProtocol() {
    var ps = PersonStruct()
    ps.grow()
//    incubate(o: ps)
    var pc = PersonClass()
    pc.grow()
//    incubate(o: pc)
}


protocol Togglable {
    var state: Bool { get }
    mutating func toggle()
}

enum RoomLight: Togglable {
    var state: Bool {
        switch self {
        case .on:
            return true
        case .off:
            return false
        }
    }
    
    mutating func toggle() {
        switch self {
        case .on:
            self = .off
        case .off:
            self = .on
        }
    }
    
    case on
    case off
}

public func testToggle() {
    var light = RoomLight.on
    print(light)
    light.toggle()
    print(light)
    print(light.state)
    
    if light == .on {
        print("is on")
    } else if light == .off {
        print("is off")
    } else {
        print("WHAT???")
    }
}

struct Dice {
    
}

protocol DiceGame {
    var dice: Dice { get }
    func play()
}
//TODO: AnyObject is for `class-only` protocol
protocol DiceGameDelegate: AnyObject {
    func gameDidStart(_ game: DiceGame)
    func game(_ game: DiceGame, didStartNewTurnWithDiceRoll diceRoll: Int)
    func gameDidEnd(_ game: DiceGame)
}


extension Sparrow : Walkable {
    public func walk() {
        print("\(name) is walking now")
    }
}

extension Array: Walkable where Element: Fly {
    
    public func walk() {
        print("New WALKING")
    }
    
}

//protocol NewProtocol {
//    func doJob()
//}

//extension Sparrow: NewProtocol where Element: Fly {
//    func doJob() {
//        print("sparrow is doing")
//    }
//}

struct Str: Equatable {
    
}

//TODO: only protocol can be used to `extension`
//extension Sparrow : Bird {
extension Sparrow {
    //TODO: just another extension, without adopting protocol
}

extension Walkable {
    func fastWalk() {
        print("walking fastly")
    }
}

//TODO: Extension of protocol 'Walkable' cannot have an inheritance clause
//extension Walkable: Fly {
//
//}

protocol NewBirdProtocol: Fly, Walkable, Bird {
    func foo()
}

extension Sparrow: NewBirdProtocol {
    func foo() {
        print("Sparrow is fooing")
    }
}

public func testSparrowWalk() {
    var jack = Sparrow("jack")
    jack.walk()
    try? jack.flyStraight()
    print("DONE")
}

public func testSparrowsWalking() {
    var jacks: [Sparrow] = []
    for i in 1...10 {
        jacks.append(Sparrow("jack\(i)"))
        let j = jacks[i-1]
        j.fastWalk()
    }
    jacks.walk()
}


public func testComplexProtocol() {
    var j = Sparrow("jack")
    j.foo()
    j.grow()
}

public func testSparrowIsSparrow() {
    func testJack(_ j: AnyObject) {
        if j is Sparrow {
            print("\(j) is sparrow")
        } else {
            print("NOT")
        }
        if j is Bird {
            print("\(j) is Bird")
        } else {
            print("NOT")
        }
        if j is Walkable {
            print("\(j) is Walkable")
        } else {
            print("NOT")
        }
        if j is Growable {
            print("\(j) is Growable")
        } else {
            print("NOT Growable")
        }
        if let bird = j as? Bird {
            print("type of j is \(type(of: j)) and type of bird is \(type(of: bird))")
            //TODO: bird only has bird's methods
            bird.grow()
            //TODO: Value of type 'Bird' has no member 'walk'
//            bird.walk()
//            j.walk()
        }
    }
    var j = Sparrow("jack")
    testJack(j)
}
