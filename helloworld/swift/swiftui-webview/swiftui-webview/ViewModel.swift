//
//  ViewModel.swift
//  swiftui-webview
//
//  Created by Deokgon Kim on 2022/08/01.
//

import Foundation
import Combine

class ViewModel: ObservableObject {
    var webViewNavigationPublisher = PassthroughSubject<WebViewNavigation, Never>()
    var showWebTitle = PassthroughSubject<String, Never>()
    var showLoader = PassthroughSubject<Bool, Never>()
    var valuePublisher = PassthroughSubject<String, Never>()
}

// For identifiying WebView's forward and backward navigation
enum WebViewNavigation {
    case backward, forward, reload
}

// For identifying what type of url should load into WebView
enum WebUrlType {
    case localUrl, publicUrl
}

class WebAlertHolder {
    static var isConfirm: Bool = false
    static var alertMessage: String = ""
    static var confirmHandler: (Bool) -> Void = {_ in}
}
