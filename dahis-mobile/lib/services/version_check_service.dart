import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class VersionCheckService {
  static const String apiBaseUrl =
      'https://us-central1-dahisio.cloudfunctions.net';

  /// Uygulama açıldığında versiyon kontrolü yap
  static Future<void> checkForUpdate() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;
      final platform = _getPlatform();

      final url = Uri.parse(
        '$apiBaseUrl/appVersionCheck?platform=$platform&currentVersion=$currentVersion',
      );

      final response = await http.get(url).timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          // Timeout durumunda sessizce devam et
          return http.Response('', 408);
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 'success') {
          final requiresUpdate = data['requiresUpdate'] ?? false;
          final forceUpdate = data['forceUpdate'] ?? false;

          if (requiresUpdate) {
            // Update dialog'u göster
            _showUpdateDialog(
              forceUpdate: forceUpdate,
              updateMessage: data['updateMessage'] ??
                  'Yeni bir güncelleme mevcut. Lütfen uygulamayı güncelleyin.',
              appStoreUrl: data['appStoreUrl'],
              playStoreUrl: data['playStoreUrl'],
            );
          }
        }
      }
    } catch (e) {
      // Hata durumunda sessizce devam et (uygulama çalışmaya devam eder)
      print('Version check error: $e');
    }
  }

  static String _getPlatform() {
    // Flutter'da platform kontrolü
    // iOS için 'ios', Android için 'android'
    return 'ios'; // Şimdilik iOS, daha sonra Platform.isIOS kontrolü eklenebilir
  }

  static void _showUpdateDialog({
    required bool forceUpdate,
    required String updateMessage,
    String? appStoreUrl,
    String? playStoreUrl,
  }) {
    // Bu fonksiyon main.dart'ta çağrılacak ve context ile dialog gösterilecek
    // Şimdilik placeholder
  }
}

