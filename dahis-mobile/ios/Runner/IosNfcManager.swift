//
//  IosNfcManager.swift
//  Runner
//
//  Created by YUNUS EMRE COSKUN  on 1.01.2026.
//

import Foundation
import CoreNFC
import Flutter

@available(iOS 13.0, *)
class IosNfcManager: NSObject, NFCTagReaderSessionDelegate, NFCNDEFReaderSessionDelegate {

    static let shared = IosNfcManager()

    private var tagSession: NFCTagReaderSession?
    private var ndefSession: NFCNDEFReaderSession?
    private var flutterResult: FlutterResult?

    func start(result: @escaping FlutterResult) {
        self.flutterResult = result

        guard NFCNDEFReaderSession.readingAvailable else {
            result(FlutterError(
                code: "NFC_NOT_AVAILABLE",
                message: "NFC bu cihazda desteklenmiyor",
                details: nil
            ))
            return
        }

        // Önce NDEF okumayı dene (URL'den UID almak için)
        ndefSession = NFCNDEFReaderSession(
            delegate: self,
            queue: nil,
            invalidateAfterFirstRead: true
        )

        ndefSession?.alertMessage = "dahiOS etiketini okutun"
        ndefSession?.begin()
    }

    // MARK: - NDEF Reader Session Delegate
    
    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        print("📄 NDEF mesajı bulundu: \(messages.count) mesaj")
        
        guard let firstMessage = messages.first,
              let firstRecord = firstMessage.records.first else {
            // NDEF yoksa tag ID'yi oku
            print("⚠️ NDEF mesajı boş, tag ID okunuyor...")
            session.invalidate()
            fallbackToTagId()
            return
        }
        
        var nfcId: String?
        
        // NDEF Record'dan veri oku
        let payload = firstRecord.payload
        if payload.count > 0 {
            // İlk byte language code length olabilir (Text Record için)
            let langLen = Int(payload[0]) & 0x3F
            if payload.count > langLen {
                let data = payload.subdata(in: (langLen + 1)..<payload.count)
                if let text = String(data: data, encoding: .utf8) {
                    nfcId = text.trimmingCharacters(in: .whitespacesAndNewlines)
                    print("✅ NDEF Text: \(nfcId ?? "")")
                }
            }
        }
        
        // URL formatından UID'yi çıkar
        if let urlString = nfcId, !urlString.isEmpty {
            if urlString.hasPrefix("http://") || urlString.hasPrefix("https://") {
                if let url = URL(string: urlString),
                   let lastPath = url.pathComponents.last, !lastPath.isEmpty {
                    nfcId = lastPath
                    print("✅ URL'den UID çıkarıldı: \(nfcId ?? "")")
                }
            } else if urlString.contains("/") {
                nfcId = urlString.components(separatedBy: "/").last
                print("✅ Path'den UID çıkarıldı: \(nfcId ?? "")")
            }
        }
        
        if let uid = nfcId, !uid.isEmpty {
            session.alertMessage = "Okundu"
            session.invalidate()
            flutterResult?(uid.lowercased())
            flutterResult = nil
        } else {
            // NDEF'ten UID alınamadı, tag ID'ye geç
            print("⚠️ NDEF'ten UID çıkarılamadı, tag ID okunuyor...")
            session.invalidate()
            fallbackToTagId()
        }
    }
    
    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        print("❌ NDEF session kapandı: \(error.localizedDescription)")
        
        let nsError = error as NSError
        // Kullanıcı iptal ettiyse veya tag bulunamadıysa tag ID okumayı dene
        if nsError.code == NFCReaderError.Code.readerSessionInvalidationErrorUserCanceled.rawValue {
            flutterResult?(FlutterError(
                code: "USER_CANCELED",
                message: "NFC okuma iptal edildi",
                details: nil
            ))
            flutterResult = nil
            return
        }
        
        // Diğer hatalarda tag ID okumayı dene
        fallbackToTagId()
    }
    
    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {
        print("✅ NDEF session aktif")
    }
    
    // MARK: - Fallback to Tag ID
    
    private func fallbackToTagId() {
        print("📱 Tag ID okuma başlatılıyor...")
        
        // Tag Reader Session başlat
        guard NFCTagReaderSession.readingAvailable else {
            flutterResult?(FlutterError(
                code: "NFC_NOT_AVAILABLE",
                message: "NFC bu cihazda desteklenmiyor",
                details: nil
            ))
            flutterResult = nil
            return
        }
        
        tagSession = NFCTagReaderSession(
            pollingOption: [.iso14443, .iso15693],
            delegate: self,
            queue: nil
        )
        
        tagSession?.alertMessage = "dahiOS etiketini okutun"
        tagSession?.begin()
    }
    
    // MARK: - Tag Reader Session Delegate

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        print("✅ Tag session aktif")
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        print("❌ Tag session kapandı: \(error.localizedDescription)")
        flutterResult?(FlutterError(
            code: "SESSION_INVALIDATED",
            message: error.localizedDescription,
            details: nil
        ))
        flutterResult = nil
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard let tag = tags.first else { return }

        session.connect(to: tag) { error in
            if let error = error {
                self.flutterResult?(FlutterError(
                    code: "CONNECT_ERROR",
                    message: error.localizedDescription,
                    details: nil
                ))
                session.invalidate()
                return
            }

            var uid: String?
            
            switch tag {
            case .miFare(let mifareTag):
                uid = mifareTag.identifier
                    .map { String(format: "%02x", $0) }
                    .joined()
                print("✅ MiFare Tag ID: \(uid ?? "")")

            case .iso7816(let iso7816Tag):
                uid = iso7816Tag.identifier
                    .map { String(format: "%02x", $0) }
                    .joined()
                print("✅ ISO7816 Tag ID: \(uid ?? "")")
                
            case .feliCa(let felicaTag):
                uid = felicaTag.currentIDm
                    .map { String(format: "%02x", $0) }
                    .joined()
                print("✅ FeliCa Tag ID: \(uid ?? "")")
                
            case .iso15693(let iso15693Tag):
                uid = iso15693Tag.identifier
                    .map { String(format: "%02x", $0) }
                    .joined()
                print("✅ ISO15693 Tag ID: \(uid ?? "")")

            @unknown default:
                session.invalidate()
                self.flutterResult?(FlutterError(
                    code: "UNSUPPORTED_TAG",
                    message: "Desteklenmeyen NFC tag",
                    details: nil
                ))
                self.flutterResult = nil
                return
            }
            
            if let tagId = uid, !tagId.isEmpty {
                session.alertMessage = "Okundu"
                session.invalidate()
                self.flutterResult?(tagId.lowercased())
                self.flutterResult = nil
            } else {
                session.invalidate()
                self.flutterResult?(FlutterError(
                    code: "NO_TAG_ID",
                    message: "Tag ID okunamadı",
                    details: nil
                ))
                self.flutterResult = nil
            }
        }
    }
}
