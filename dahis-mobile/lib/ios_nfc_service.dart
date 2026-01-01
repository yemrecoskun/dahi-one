import 'dart:io';
import 'package:flutter/services.dart';

class IosNfc {
  static const _channel = MethodChannel('ios_nfc');

  static Future<String> startSession() async {
    if (!Platform.isIOS) {
      throw Exception('Bu servis sadece iOS içindir');
    }

    try {
      final dynamic result = await _channel.invokeMethod('startNfcSession');
      
      if (result is String) {
        return result.toLowerCase();
      } else if (result is PlatformException) {
        throw Exception('NFC hatası: ${result.message}');
      } else {
        throw Exception('Beklenmeyen NFC yanıtı: $result');
      }
    } on PlatformException catch (e) {
      print('❌ PlatformException: ${e.code} - ${e.message}');
      throw Exception('NFC hatası: ${e.message ?? e.code}');
    } catch (e) {
      print('❌ NFC hatası: $e');
      rethrow;
    }
  }
}
