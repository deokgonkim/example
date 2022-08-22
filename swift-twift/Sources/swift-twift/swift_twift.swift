import Foundation
import Twift
import DotEnv

// import struct Twift.List

// typealias TwitterList = Twift.List


public struct swift_twift {
    public private(set) var text = "Hello, World!"

    private var twitterClientId: String
    private var twitterCallbackUrl: String

    private var client: Twift?

    public init?() {
        do {
            let path = "./.env"
            let env = try DotEnv.read(path: path)
            env.lines // [Line] (key=value pairs)
            env.load()
            twitterClientId = ProcessInfo.processInfo.environment["TWITTER_CLIENT_ID"]!
            twitterCallbackUrl = ProcessInfo.processInfo.environment["TWITTER_CALLBACK_URL"]!
            print("Twitter client id \(twitterClientId)")
        } catch {
            print("Got error while initializing \(error)")
            return nil
        }
    }

    mutating public func login() async throws {
        let oauthUser = try await Twift.Authentication().authenticateUser(
            clientId: twitterClientId,
            redirectUri: URL(string: twitterCallbackUrl)!,
            scope: Set(OAuth2Scope.allCases)
        )
        
        client = await Twift(oauth2User: oauthUser, onTokenRefresh: saveUserCredentials)
        
        // It's recommended that you store your user auth tokens via Keychain or another secure storage method.
        // OAuth2User can be encoded to a data object for storage and later retrieval.
        saveUserCredentials(oauthUser) // Saves the data to Keychain, for example
    }

    public func saveUserCredentials(_ oauth2User: OAuth2User) {
        print("Saving \(oauth2User)")
    }

    public func getMe() async {
        do {
            // User objects always return id, name, and username properties,
            // but additional properties can be requested by passing a `fields` parameter
            let authenticatedUser = try await client!.getMe(fields: [\.description])

            print(authenticatedUser)
            
            // Non-standard properties are optional and require unwrapping
            if let description = authenticatedUser.data.description {
                print("User's description : \(description)")
            }
        } catch {
            print(error.localizedDescription)
        }
    }
    
}
