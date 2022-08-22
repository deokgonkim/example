import swift_twift

@main
struct Application {
    static func main() async throws {
        do {
            var tc: swift_twift? = swift_twift()
            if tc != nil {
                try await tc!.login()
                try await tc!.getMe()
            } else {
                fatalError("Failed to initialize")
            }
        } catch {
            print(error.localizedDescription)
        }
    }
}

// print("DONE")
