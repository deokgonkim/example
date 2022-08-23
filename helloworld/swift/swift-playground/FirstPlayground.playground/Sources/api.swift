import Foundation
import Combine

/// provides HTTP API client service
///
///
public struct APIClient {
    struct APIResponse<T> {
        let value: T
        let response: URLResponse
    }
    
    enum RequestError : Error {
        case NoUrlProvided
        case customError(_ message: String)
    }
    
    /// run API request
    ///
    /// usage
    ///
    ///     let apiClient: APIClient = APIClient()
    ///
    ///     let request: URLRequest = URLRequest()
    ///
    ///     apiClient.run(request)
    ///
    /// - Parameters:
    ///     
    func run<T: Decodable>(_ request: URLRequest) throws -> AnyPublisher<APIResponse<T>, Error> {
        let method: String = request.httpMethod ?? "GET"
        guard let url = request.url else {
            throw RequestError.NoUrlProvided
        }
        print("\(method) \(url)")
        
        if let body = request.httpBody {
            let str = String(decoding: body, as: UTF8.self)
            print("BODY \(str)")
        }
        
        let headers = request.allHTTPHeaderFields ?? [:]
        
        print("Headers \(headers)")
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .tryMap {
                data, response -> APIResponse<T> in
                
                print("Received response")
                
//                let str_data = String(decoding: data, as: UTF8.self)
//                print(str_data)
                
                let value = try JSONDecoder().decode(T.self, from: data)
                return APIResponse(value: value, response: response)
            }
            .receive(on: DispatchQueue.global())
            .eraseToAnyPublisher()
    }
}

public struct TemperatureData: Codable, CustomStringConvertible {
    var temperature: Double?
    var createdAt: String?
    var updatedAt: String?
    
    public var description: String {
        "{temperature: \(temperature!), createdAt: \(createdAt!)}"
    }
}

//typealias TemperatureResponse = [TemperatureData]
public struct TemperatureResponse: Codable {
    var message: String
    var data: [TemperatureData]
}

public func testAPIClient() {
    let url_string = "https://public-api.dgkim.net/v1/temperatures/"
    guard let url = URL(string: url_string) else {
        fatalError("Failed to build URL from \(url_string)")
    }
    let request: URLRequest = URLRequest(url: url)
    let apiClient: APIClient = APIClient()
    
    do {
        let response: AnyPublisher<APIClient.APIResponse<TemperatureResponse>, Error> = try apiClient.run(request)
        response.subscribe(on: DispatchQueue.global())
            .sink { completion in
                print("The SINK thread: \(Thread.current)");
                switch completion {
                case .failure(let error):
                    print(error)
                case .finished:
                    print("Success")
                }
            } receiveValue: { response in
                print("received \(response.value)")
            }
    } catch {
        print("Got error \(error)")
    }
}


public func testStringToApiResponse() {
    guard let data = """
        [{
            "temperature": 28.0,
            "createdAt": "2022-08-23T06:00:00.000Z"
        }, {
            "temperature": 28.1,
            "createdAt": "2022-08-23T06:00:01.000Z"
        }]
        """.data(using: .utf8)
    else {
        fatalError("Failed to build data from JSON string")
    }
    print(data)
    
    let value = try? JSONDecoder().decode(Array<TemperatureData>.self, from: data)
    
    print(value)
}


public func testCombine1() {
    let cancellable = Timer.publish(every: 1, on: .main, in: .default)
        .autoconnect()
        .sink() { date in
            print ("Date now: \(date)")
        }
    sleep(10)
    print("DONE")
}


public func testSimpleCombine() {
    // 1
    let publisher = Just(1)
    // 2
    publisher.sink(receiveCompletion: { _ in
        print("Thread \(Thread.current)")
        print("finished")
    }, receiveValue: { value in
        print("Thread \(Thread.current)")
        print(value)
    })
    print("DONE")
}

public func testSimpleCombine2() {
    // 1
    let subject = PassthroughSubject<String, Never>()
    // 2
    subject.print()
        .receive(on: RunLoop.main)
        .sink(receiveCompletion: { _ in
            print("Thread \(Thread.current)")
            print("finished")
        }, receiveValue: { value in
            print("Thread \(Thread.current)")
            print(value)
        })
    // 3
    subject.send("Hello,")
    subject.send("World!")
    subject.send(completion: .finished) // 4
    
    sleep(2)
    print("DONE")
}
