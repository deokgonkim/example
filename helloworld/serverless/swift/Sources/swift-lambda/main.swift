import AWSLambdaRuntime
import AWSLambdaEvents


typealias In = APIGateway.V2.Request

// struct Input: Codable {
//     let name: String
// }

struct Output: Codable {
    let message: String
}

Lambda.run { (context, input: In, completion: @escaping (Result<Output, Error>) -> Void) in
    guard let name = input.queryStringParameters?["name"] else {
        completion(.success(Output(message: "Hello Stranger!")))
        return
    }
    completion(.success(Output(message: "Hello \(name)")))
}
