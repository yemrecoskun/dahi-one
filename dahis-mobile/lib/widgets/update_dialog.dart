import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class UpdateDialog extends StatelessWidget {
  final bool forceUpdate;
  final String updateMessage;
  final String? appStoreUrl;
  final String? playStoreUrl;

  const UpdateDialog({
    super.key,
    required this.forceUpdate,
    required this.updateMessage,
    this.appStoreUrl,
    this.playStoreUrl,
  });

  Future<void> _openStore() async {
    String? storeUrl = appStoreUrl ?? playStoreUrl;
    
    // Eğer URL yoksa, varsayılan App Store/Play Store URL'lerini kullan
    if (storeUrl == null || storeUrl.isEmpty) {
      // Burada app bundle ID veya package name ile store URL oluşturulabilir
      // Şimdilik placeholder
      return;
    }

    final uri = Uri.parse(storeUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !forceUpdate, // Force update ise geri tuşu çalışmaz
      child: AlertDialog(
        backgroundColor: const Color(0xFF1a1a2e),
        title: const Text(
          'Güncelleme Gerekli',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
        content: Text(
          updateMessage,
          style: const TextStyle(
            color: Color(0xFFb0b0b8),
          ),
        ),
        actions: [
          if (!forceUpdate)
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Daha Sonra',
                style: TextStyle(color: Color(0xFFb0b0b8)),
              ),
            ),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF667eea),
                  Color(0xFF764ba2),
                ],
              ),
              borderRadius: BorderRadius.circular(25),
            ),
            child: TextButton(
              onPressed: _openStore,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
              ),
              child: const Text(
                'Güncelle',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

