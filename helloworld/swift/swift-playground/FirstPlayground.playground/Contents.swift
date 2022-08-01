import UIKit

var greeting = "Hello, playground"

struct Player {
    var name: String
    var highScore: Int = 0
    var history: [Int] = []
    
    init(_ name: String) {
        self.name = name
    }
}

//print(greeting)

var player = Player("Deokgon Kim")
player.highScore = 80
player.history.append(30)
player.history.append(80)

print(player)

player.name = "new Deokgon Kim"

print(player.name)

