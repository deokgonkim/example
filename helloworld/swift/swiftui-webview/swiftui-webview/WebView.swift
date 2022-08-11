//
//  WebView.swift
//  swiftui-webview
//
//  Created by Deokgon Kim on 2022/08/01.
//

import Foundation
import UIKit
import SwiftUI
import Combine
import WebKit
import CoreLocation

var isLoadHtmlMode: Bool = true

// MARK: - WebViewHandlerDelegate
// For printing values received from web app
protocol WebViewHandlerDelegate {
    func receivedJsonValueFromWebView(value: [String: Any?])
    func receivedStringValueFromWebView(value: String)
}


// MARK: - WebView
struct WebView: UIViewRepresentable {
    
    @Binding var showAlert: Bool
//    @Binding var isConfirm: Bool
//    @Binding var alertMessage: String
//    @Binding var confirmHandler: (Bool) -> Void
    
    var url: WebUrlType
    // Viewmodel object
    @ObservedObject var viewModel: ViewModel
    
    // Make a coordinator to co-ordinate with WKWebView's default delegate functions
    func makeCoordinator() -> Coordinator {
        let c = Coordinator(self, showAlert: self.$showAlert)
        return c
    }
    
    func makeUIView(context: Context) -> WKWebView {
        // Enable javascript in WKWebView
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true
        
        let configuration = WKWebViewConfiguration()
        // Here "iOSNative" is our delegate name that we pushed to the website that is being loaded
        configuration.userContentController.add(self.makeCoordinator(), name: "iOSNative")
        configuration.preferences = preferences
        
        let webView = WKWebView(frame: CGRect.zero, configuration: configuration)
        webView.uiDelegate = context.coordinator
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.isScrollEnabled = true
        
        LocationManager.shared.requestLocationAuthorization()
       return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        if url == .localUrl {
            // Load local website
            if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
                webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
            }
        } else if url == .publicUrl {
            // Load a public website, for example I used here google.com
            if let url = URL(string: "https://www.google.com/") {
                webView.load(URLRequest(url: url))
            }
        }
    }
    
    class Coordinator : NSObject {
        var parent: WebView
        var delegate: WebViewHandlerDelegate?
        weak var valueSubscriber: AnyCancellable? = nil
        weak var webViewNavigationSubscriber: AnyCancellable? = nil
        
        //TODO: I don't like this.
        //TODO: I want to use @Binding but, ...
        var showAlert: Binding<Bool>
//        var isConfirm: Binding<Bool>
//        var alertMessage: Binding<String>
//        var confirmHandler: Binding<(Bool) -> Void>
        
//        init(_ uiWebView: WebView) {
//            self.parent = uiWebView
//            self.delegate = parent
//        }
        
        init(_ parent: WebView, showAlert: Binding<Bool>) {
            self.parent = parent
            self.showAlert = showAlert
//            self.isConfirm = isConfirm
//            self.alertMessage = alertMessage
//            self.confirmHandler = confirmHandler
            
            self.delegate = parent
        }
        
        
        deinit {
            valueSubscriber?.cancel()
            webViewNavigationSubscriber?.cancel()
        }
    }
}

// MARK: - Extensions
// MARK: WKScriptMessageHandler
extension WebView.Coordinator: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Make sure that your passed delegate is called
        if message.name == "iOSNative" {
            if let body = message.body as? [String: Any?] {
                delegate?.receivedJsonValueFromWebView(value: body)
            } else if let body = message.body as? String {
                delegate?.receivedStringValueFromWebView(value: body)
            }
        }
    }
}

// MARK: - WKNavigationDelegate
extension WebView.Coordinator : WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Get the title of loaded webcontent
        webView.evaluateJavaScript("document.title") { (response, error) in
            if let error = error {
                print("Error getting title")
                print(error.localizedDescription)
            }
            
            guard let title = response as? String else {
                return
            }
            
            self.parent.viewModel.showWebTitle.send(title)
        }
        
        /* An observer that observes 'viewModel.valuePublisher' to get value from TextField and
         pass that value to web app by calling JavaScript function */
        valueSubscriber = parent.viewModel.valuePublisher.receive(on: RunLoop.main).sink(receiveValue: { value in
            let javascriptFunction = "valueGotFromIOS(\(value));"
            webView.evaluateJavaScript(javascriptFunction) { (response, error) in
                if let error = error {
                    print("Error calling javascript:valueGotFromIOS()")
                    print(error.localizedDescription)
                } else {
                    print("Called javascript:valueGotFromIOS()")
                }
            }
        })
        
        // Page loaded so no need to show loader anymore
        self.parent.viewModel.showLoader.send(false)
    }
    
    /* Here I implemented most of the WKWebView's delegate functions so that you can know them and
     can use them in different necessary purposes */
    
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        // Hides loader
        parent.viewModel.showLoader.send(false)
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        // Hides loader
        parent.viewModel.showLoader.send(false)
    }
    
    func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
        // Shows loader
        parent.viewModel.showLoader.send(true)
    }
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        // Shows loader
        parent.viewModel.showLoader.send(true)
        self.webViewNavigationSubscriber = self.parent.viewModel.webViewNavigationPublisher.receive(on: RunLoop.main).sink(receiveValue: { navigation in
            switch navigation {
                case .backward:
                    if webView.canGoBack {
                        webView.goBack()
                    }
                case .forward:
                    if webView.canGoForward {
                        webView.goForward()
                    }
                case .reload:
                    webView.reload()
            }
        })
    }
    
    // This function is essential for intercepting every navigation in the webview
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Suppose you don't want your user to go a restricted site
        // Here you can get many information about new url from 'navigationAction.request.description'
        if let host = navigationAction.request.url?.host {
            if host == "restricted.com" {
                // This cancels the navigation
                decisionHandler(.cancel)
                return
            }
        }
        
        let cookieStorage = HTTPCookieStorage.shared
        cookieStorage.cookieAcceptPolicy = .always
        
        let hostUrl = navigationAction.request.url
        
        if let url = hostUrl, url.scheme != "http", url.scheme != "https", url.scheme != "file" {
            //self.showActivityIndicator(isShow: false)
            debugPrint("Navigation Action url \(url.absoluteString)")
            
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            } else {
                if url.absoluteString.contains("about:blank") == true {
                    // #. WebView애서 Content를 열지 못함.
                    //self.displayAlert(title: "알림", message: "웹페이지가 Open되지 않습니다.")
                    debugPrint("about:blank 가 포함된 url로 redirection.")
                    
                }
            }
            
            decisionHandler(.cancel)
            return
        }
        
        // This allows the navigation
        decisionHandler(.allow)
    }
}

// MARK: - WKUIDelegate
extension WebView.Coordinator : WKUIDelegate {
    // MARK: confirm handler
    func webView(_ webView: WKWebView,
                 runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        print("received confirm : \(message)")
//        self.alertMessage.wrappedValue = message
        self.showAlert.wrappedValue.toggle()
//        self.isConfirm.wrappedValue = true
//        self.confirmHandler.wrappedValue = completionHandler
        WebAlertHolder.isConfirm = true
        WebAlertHolder.alertMessage = message
        WebAlertHolder.confirmHandler = completionHandler
    }
    
    // MARK: alert handler
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        print("received alert: \(message)")
//        self.alertMessage.wrappedValue = message
        self.showAlert.wrappedValue.toggle()
//        self.isConfirm.wrappedValue = false
        WebAlertHolder.isConfirm = false
        WebAlertHolder.alertMessage = message
//        WebAlertHolder.confirmHandler = {_ in}
        completionHandler()
    }
}

// MARK: - WebViewHandlerDelegate extension
extension WebView: WebViewHandlerDelegate {
    func receivedJsonValueFromWebView(value: [String : Any?]) {
        print("JSON value received from web is: \(value)")
        for (k, v) in value {
            print("Received key \(k) and value \(v)")
        }
    }
    
    func receivedStringValueFromWebView(value: String) {
        print("String value received from web is: \(value)")
    }
}

// MARK: - CLLocationManagerDelegate
class LocationManager: NSObject, CLLocationManagerDelegate {

    static let shared = LocationManager()
    private var locationManager: CLLocationManager = CLLocationManager()
    private var requestLocationAuthorizationCallback: ((CLAuthorizationStatus) -> Void)?

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
    // MARK: - CLLocationManagerDelegate
    public func locationManager(_ manager: CLLocationManager,
                                didChangeAuthorization status: CLAuthorizationStatus) {
        self.requestLocationAuthorizationCallback?(status)
    }
    
    public func locationManager(_ manager: CLLocationManager,
                                didUpdateLocations locations: [CLLocation]) {
        print("print didUpdateLocations \(locations)")
    }
    
    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("print didFailWithError \(error)")
    }
}
