//
//  LocationHelper.swift
//  swiftui-hello
//
//  Created by Deokgon Kim on 2022/08/15.
//

import Foundation
import CoreLocation
import MapKit

// MARK: - CLLocationManagerDelegate
class LocationManager: NSObject, CLLocationManagerDelegate, ObservableObject {

    static let shared = LocationManager()
    private var locationManager: CLLocationManager = CLLocationManager()
    private var requestLocationAuthorizationCallback: ((CLAuthorizationStatus) -> Void)?
    
    @Published public var location: CLLocationCoordinate2D?
    @Published public var region: MKCoordinateRegion = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37, longitude: 127),
        span: MKCoordinateSpan()
    )
    
    override init() {
        super.init()
        self.requestLocationAuthorization()
//        locationManager.delegate = self
    }

    public func requestLocationAuthorization() {
        self.locationManager.delegate = self
        let currentStatus = locationManager.authorizationStatus
//        self.locationManager.requestLocation()
//        return

        // Only ask authorization if it was never asked before
        guard currentStatus == .notDetermined else { return }

        // Starting on iOS 13.4.0, to get .authorizedAlways permission, you need to
        // first ask for WhenInUse permission, then ask for Always permission to
        // get to a second system alert
        if #available(iOS 13.4, *) {
            self.requestLocationAuthorizationCallback = { status in
                if status == .authorizedWhenInUse {
                    self.locationManager.requestAlwaysAuthorization()
                }
            }
            self.locationManager.requestWhenInUseAuthorization()
        } else {
            self.locationManager.requestAlwaysAuthorization()
        }
    }
    
    public func requestLocation() {
        self.locationManager.requestLocation()
        print("Requested")
    }
    
    // MARK: - CLLocationManagerDelegate
    public func locationManager(_ manager: CLLocationManager,
                                didChangeAuthorization status: CLAuthorizationStatus) {
        self.requestLocationAuthorizationCallback?(status)
        print("didChangeAuthorization \(status)")
    }
    
    public func locationManager(_ manager: CLLocationManager,
                                didUpdateLocations locations: [CLLocation]) {
        print("print didUpdateLocations \(locations)")
        DispatchQueue.main.async {
            self.location = locations[0].coordinate
            self.region = MKCoordinateRegion(center: self.location!, latitudinalMeters: 1000, longitudinalMeters: 1000)
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("print didFailWithError \(error)")
    }
}
