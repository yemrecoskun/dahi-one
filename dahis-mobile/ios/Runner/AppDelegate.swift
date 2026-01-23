import UIKit
import Flutter
import UserNotifications

@main
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)
        
        // Push notification için UNUserNotificationCenter delegate
        if #available(iOS 10.0, *) {
            UNUserNotificationCenter.current().delegate = self
        }
        
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
    
    // APNs token alındığında
    override func application(_ application: UIApplication,
                             didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Firebase Messaging plugin otomatik olarak token'ı yönetir
    }
    
    // APNs kayıt hatası
    override func application(_ application: UIApplication,
                             didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }
}
