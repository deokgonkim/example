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
    print("Congestion \(Sparrow.congestion)")
}
