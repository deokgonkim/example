//
//  Intent.swift
//
//  Created by Deokgon Kim on 6/19/24.
//

import Foundation
import AppIntents

func apiCall(method: String, url: String, payload: [String: String]?, authorization: String? = nil) async throws -> Any {
    // Create a URL object from the string
    
    if let apiUrl = URL(string: url) {
        // Create a URLSession instance
        let session = URLSession.shared
        
        // Convert the JSON payload to Data
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: payload, options: [])
            
            // Create a URLRequest with the URL and set the HTTP method to POST
            var request = URLRequest(url: apiUrl)
            request.httpMethod = method
            if let authorization = authorization {
                request.setValue(authorization, forHTTPHeaderField: "Authorization")
            }
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
//                request.httpBody = jsonData
            
            // Create an upload task using URLSessionUploadTask
            let (data, response) = try await session.upload(for: request, from: jsonData ?? Data())

            // Check for HTTP response and status code
            guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                throw URLError(.badServerResponse)
            }
            
            // Parse the JSON response data
            do {
                let json = try JSONSerialization.jsonObject(with: data, options: [])
//                print("returning \(json) \(data)")
                return json
            } catch {
                throw error
            }
            
        } catch {
            print("Error in JSON data: \(error)")
            return error
        }
        
    } else {
        print("URL is invalid")
    }
    return ""
}


@available(iOS 16.0, macOS 13.0, watchOS 9.0, tvOS 16.0, *)
struct Intent: AppIntent, CustomIntentMigratedAppIntent, PredictableIntent {
    static let intentClassName = "IntentIntent"

    static var title: LocalizedStringResource = "Intent"
    static var description = IntentDescription("")

    @Parameter(title: "Parameter")
    var parameter: String?

    static var parameterSummary: some ParameterSummary {
        Summary("parameter1") {
            \.$parameter
        }
    }

    static var predictionConfiguration: some IntentPredictionConfiguration {
        IntentPrediction(parameters: (\.$parameter)) { parameter in
            DisplayRepresentation(
                title: "parameter1",
                subtitle: ""
            )
        }
    }
    
    func login() async throws -> String {
        do {
            let response = try await apiCall(method: "POST", url: "https://api.dgkim.net/auth/login", payload: ["username": "username", "password": "password"])
            if let res = response as? [String: Any] {
                print("res \(res)")
                if let accessToken = res["accessToken"] as? String {
                    return accessToken
                }
            }
        } catch {
            print("Error \(error)")
            throw error
        }
        return ""
    }
    
    func callApi() async throws -> Any {
        // Define the URL you want to request
        let apiUrlStr = "https://api.dgkim.net/ainlp/"
        
        var accessToken: String?
        do {
            accessToken = try await login()
            print("Bearer \(accessToken!)")
            let authorization = "Bearer \(accessToken!)"
            
            var jsonPayload: [String: String]
            if let parameterValue = parameter {
                print("Parameter value: \(parameterValue)")
                // Use the parameter value as needed
                jsonPayload = ["input": parameterValue]
            } else {
                print("Parameter is nil")
                jsonPayload = ["input": "뭘 할 수 있어?"]
            }
            
            let response = try await apiCall(method: "POST", url: apiUrlStr, payload: jsonPayload, authorization: authorization)
            if let res = response as? [String: Any] {
                print("response \(res)")
                return res
            }
        } catch {
            print(error)
        }
        return "ERROR"
    }

    func perform() async throws -> some ReturnsValue<String> & IntentResult {
        // TODO: Place your refactored intent handler code here.
        do {
            let response = try await callApi()
            if let res = response as? [String: Any] {
                print("success")
                if let output = res as? [String: String] {
                    print("output \(output["output"]!)")
                    return .result(value: output["output"]!)
                }
            }
        } catch {
            print("error \(error)")
            return .result(value: "\(error)")
        }
        return .result(value: "no response")
    }
}



