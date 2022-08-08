import Foundation

public func testStruct() {
    print("DONE")
}

var greeting = "Hello, playground"

public struct LazyStruct {
    var name: String
    init(_ name: String) {
        print("LazyStruct is created \(name)")
        self.name = name
    }
}

public struct ParentOfLazyStruct {
    var name: String
    lazy var ccc = LazyStruct("mmm")
    var ddd = LazyStruct("ddd")
    
    //TODO: computed property
    var jsonName: String {
        get {
            return "\"\(self.name)\""
        }
        set(name) {
            self.name = "not implemented yet"
        }
    }
    
    init(_ name: String) {
        self.name = name
    }
    
    func what() {
        print("what?")
    }
}

public struct Player {
    var name: String
    var highScore: Int = 0
    var history: [Int] = []
    
    init(_ name: String) {
        self.name = name
    }
}

public class PlayerClass: CustomStringConvertible {
    var name: String
    var highScore: Int = 0
    var history: [Int] = []
    
    init(_ name: String) {
        self.name = name
    }
    
    public var description: String { return "PlayerClass: \(name)" }
}

extension Player {
    mutating func updateStore(_ newScore: Int) {
        self.history.append(newScore)
        
        if highScore < newScore {
            print("\(newScore) A new high score for \(name)")
            highScore = newScore
        }
    }
}

extension Player: Codable, Equatable {}


public func testNameChange() {
    //TODO: struct(and other types) is constant. and immutable by default.
    func nameModifier(_ p: inout Player) {
        p.name += " MODIFIED"
    }
    let p1 = Player("Player1")
    print(p1)
    
    var p2 = p1
    //TODO: struct is copied
    nameModifier(&p2)
    print(p1)
    print(p2)
}

public func testNameChangeClass() {
    //TODO: classes are reference type. so it is mutable.
    func nameModifier(_ p: PlayerClass) {
        p.name += " MODIFIED"
    }
    let p1 = PlayerClass("Player1")
    print(p1)
    
    var p2 = p1
    //TODO: classes are reference type
    nameModifier(p2)
    print(p1)
    print(p2)
}


/// test struct
public func testStructCreation() {
    var player = Player("Deokgon Kim")
    player.highScore = 80
    player.history.append(30)
    player.history.append(80)

    player.name = "new Deokgon Kim"

    player.updateStore(90)
}

/// test array
public func testStructArray() {
    var player = Player("Deokgon Kim")
    
    var players: [Player] = []
    players.append(player)
    players.append(Player("New Player"))

    print(players)
    
    let ranked = players.sorted(by: { a, b in
        return a.highScore < b.highScore
    })

    print(ranked)
}

/// test json serializing
public func testJson() throws {
    var player = Player("Deokgon Kim")
    
    let encoder = JSONEncoder()
    try encoder.encode(player)

    let encoded = try encoder.encode(player)
}

/// testing comparison of test
public func testStructComparison() {
    let p1: Player = Player("test1")
    let p2: Player = Player("test1")
    if p1 == p2 {
        print("p1 and p2 are same")
    } else {
        print("p1 and p2 are not same")
    }
    
    var p3 = Player("test2")
    var p4 = Player("")
    if p3 == p4 {
        print("p3 and p4 are same")
    } else {
        print("p3 and p4 are not same")
    }
    
    var p5 = Player("test3")
    var p6 = Player("")
    p6.name = "test3"
    if p5 == p6 {
        print("p5 and p6 are same")
    } else {
        print("p5 and p6 are not same")
    }
}

public func testLazyStruct() {
    var c = ParentOfLazyStruct("parent")
    print("c created")
    c.what()
    print("c.what() called")
    print("c.ccc.name = \(c.ccc.name)")
    print("c.jsonName = \(c.jsonName)")
}

public func testMutateMethod() {
    struct Point {
        var x = 0.0, y = 0.0
//        func moveBy(x deltaX: Double, y deltaY: Double) {
        mutating func moveBy(x deltaX: Double, y deltaY: Double) {
            x += deltaX
            y += deltaY
        }
    }
    var somePoint = Point(x: 1.0, y: 1.0)
    somePoint.moveBy(x: 2.0, y: 3.0)
}
