//
//  ContentView.swift
//  swiftui-webview
//
//  Created by Deokgon Kim on 2022/08/01.
//

import SwiftUI
import WebKit

struct ContentView: View {
    @ObservedObject var viewModel = ViewModel()
    @State var showLoader = false
    @State var message = ""
    @State var webTitle = ""
    
    @State var showAlert: Bool = false
//    @State var isConfirm: Bool = false
    
//    @State var alertMessage: String = "error"
        
//    @State var confirmHandler: (Bool) -> Void = {_ in }
    
    // For WebView's forward and backward navigation
    var webViewNavigationBar: some View {
        VStack(spacing: 0) {
            Divider()
            HStack {
                Spacer()
                Button(action: {
                    self.viewModel.webViewNavigationPublisher.send(.backward)
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .regular))
                        .imageScale(.large)
                        .foregroundColor(.gray)
                }
                Group {
                    Spacer()
                    Divider()
                    Spacer()
                }
                Button(action: {
                    self.viewModel.webViewNavigationPublisher.send(.forward)
                }) {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 20, weight: .regular))
                        .imageScale(.large)
                        .foregroundColor(.gray)
                }
                Group {
                    Spacer()
                    Divider()
                    Spacer()
                }
                Button(action: {
                    self.viewModel.webViewNavigationPublisher.send(.reload)
                }) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 20, weight: .regular))
                        .imageScale(.large)
                        .foregroundColor(.gray).padding(.bottom, 4)
                }
                Spacer()
            }.frame(height: 45)
            Divider()
        }
    }
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                /* Here I created a text field that takes string value and when send
                 button is clicked 'viewModel.valuePublisher' sends that value to WebView
                 then WebView sends that value to web app that you will load. In this
                 project's local .html file can not receive it because it is static you should
                 test with a web app then it will work because static website can not receive values
                 at runtime where dynamic web app can */
                
                HStack {
                    TextField("Write message", text: $message).textFieldStyle(RoundedBorderTextFieldStyle())
                    Button(action: {
                        self.viewModel.valuePublisher.send(self.message)
                    }) {
                        Text("Send")
                            .padding(.trailing, 10)
                            .padding(.leading, 10)
                            .padding(.top, 4)
                            .padding(.bottom, 4)
                            .overlay (
                                RoundedRectangle(cornerRadius: 4, style: .circular)
                                    .stroke(Color.gray, lineWidth: 0.5)
                            )
                    }
                }.padding()
                
                Text(webTitle).font(.title).onReceive(self.viewModel.showWebTitle.receive(on: RunLoop.main)) { value in
                    self.webTitle = value
                }
                
                /* This is our WebView. Here if you pass .localUrl it will load LocalWebsite.html file
                 into the WebView and if you pass .publicUrl it will load the public website depending on
                 your url provided. See WebView implementation for more info. */
                WebView(showAlert: self.$showAlert, url: .localUrl, viewModel: viewModel)
                    .overlay (
                        RoundedRectangle(cornerRadius: 4, style: .circular)
                            .stroke(Color.gray, lineWidth: 0.5)
                ).padding(.leading, 20).padding(.trailing, 20)
                
                webViewNavigationBar
            }.onReceive(self.viewModel.showLoader.receive(on: RunLoop.main)) { value in
                self.showLoader = value
            }
            .alert(isPresented: self.$showAlert) {
                () -> Alert in
                var alert = Alert(title: Text(WebAlertHolder.alertMessage))
                if self.showAlert == true {
                    if WebAlertHolder.isConfirm {
                        alert = Alert(title: Text("알림"),
                                      message: Text(WebAlertHolder.alertMessage),
                                      primaryButton: .default(Text("OK"),
                                                              action: {
                            WebAlertHolder.confirmHandler(true)
                        }),
                                      secondaryButton: .cancel({
                            WebAlertHolder.confirmHandler(false)
                        }))
                    } else {
//                        alert = Alert(title: Text("알림"),
//                                      message: Text(WebAlertHolder.alertMessage),
//                                      dismissButton: .default(Text("OK"),
//                                                              action: {() in }))
                        alert = Alert(title: Text("알림"),
                                      message: Text(WebAlertHolder.alertMessage))
                    }
                } else {
                    print("now showing")
                }
                return alert;
            }
            
            // A simple loader that is shown when WebView is loading any page and hides when loading is finished.
            if showLoader {
                Loader()
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
