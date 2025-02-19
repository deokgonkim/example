//
//  TemperatureChart.swift
//  swiftui-hello
//
//  Created by Deokgon Kim on 2022/08/15.
//

import Foundation
import Combine
import SwiftUI

//struct TemperatureData {
//    var x: Int
//    var y: Int
//}

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
                
                let str_data = String(decoding: data, as: UTF8.self)
                print(str_data)
                
                let value = try JSONDecoder().decode(T.self, from: data)
                return APIResponse(value: value, response: response)
            }
//            .receive(on: DispatchQueue.global())
//            .catch({ e in
//                print("got error \(e)")
//            })
            .eraseToAnyPublisher()
    }
}

struct TemperatureData: Codable, CustomStringConvertible {
    var temperature: Double
    var createdAt: String
    
    var description: String {
        "{temperature: \(temperature), createdAt: \(createdAt)}"
    }
}

struct TemperatureResponse: Codable {
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
    
    DispatchQueue.global().async {
        do {
            let response: AnyPublisher<APIClient.APIResponse<TemperatureResponse>, Error> = try apiClient.run(request)
            
            let result = response.print().subscribe(on: DispatchQueue.global()).sink { error in
                print("error \(error)")
            } receiveValue: { value in
                print("Received \(value)")
            }

            print("response \(response.description)")
            print("result \(result)")
        } catch {
            print("Got error \(error)")
        }
    }
}


//struct TemperatureChart: View {
//
//    @State var data: [TemperatureData] = []
//
//    var body: some View {
//
//    }
//}
