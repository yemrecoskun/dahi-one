import UIKit
import Flutter

@main
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)
        
        let controller = window?.rootViewController as! FlutterViewController
        let nfcChannel = FlutterMethodChannel(
            name: "ios_nfc",
            binaryMessenger: controller.binaryMessenger
        )
        if #available(iOS 13.0, *) {
            nfcChannel.setMethodCallHandler { call, result in
                if call.method == "startNfcSession" {
                    IosNfcManager.shared.start(result: result)
                } else {
                    result(FlutterMethodNotImplemented)
                }
            }
        }
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
