//
//  ContentView.swift
//  swiftui-hello
//
//  Created by Deokgon Kim on 2022/07/29.
//

import SwiftUI
import MapKit
import Combine

extension UITextField {
    func textPublisher() -> AnyPublisher<String, Never> {
        print("TEXT")
        return NotificationCenter.default
            .publisher(for: UITextField.textDidChangeNotification, object: self)
            .map { ($0.object as? UITextField)?.text  ?? "" }
            .eraseToAnyPublisher()
    }
}

struct ContentView: View {
    
    @State private var nameField: String = ""
    @State private var showAlert: Bool = false
    
    @State private var mapRect: MKMapRect = MKMapRect(origin: MKMapPoint(CLLocationCoordinate2D(latitude: 35.0, longitude: 127.0)), size: MKMapSize(width: 30, height: 30))
    
    @StateObject private var locationManager = LocationManager.shared
    
    
    var body: some View {
        VStack {
            HStack {
                Text("Hello, world!")
                    .padding()
                Button("Location", action: {
                    () -> Void in
                    self.locationManager.requestLocation()
                })
                Button("APICall") {
                    () -> Void in
                    testAPIClient()
                    sleep(1)
                }
            }
            
            TextField("blabla", text: $nameField)
                .frame(width: 80, height: 80, alignment: .center)
                .padding()
                .onSubmit {
                    showAlert = true
                }
            Map(coordinateRegion: $locationManager.region)
        }
        .alert(isPresented: $showAlert, content: { () -> Alert in
            let alert: Alert = Alert(title: Text("Title"), message: Text("Alert message"), dismissButton: .default(Text("OK")))
            return alert
        })
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
