import Foundation

public func testStruct() {
    print("DONE")
}

var greeting = "Hello, playground"

public struct Player {
    var name: String
    var highScore: Int = 0
    var history: [Int] = []
    
    init(_ name: String) {
        self.name = name
    }
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
