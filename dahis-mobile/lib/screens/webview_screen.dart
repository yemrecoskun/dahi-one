import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../services/auth_service.dart';
import '../widgets/custom_toast.dart';

/// Genel amaçlı WebView (KVKK, eğlence sayfaları vb.).
/// [enableQuizCharacterBridge]: "Hangi One sensin?" sonucunda profil karakterini kaydetmek için.
class WebViewScreen extends StatefulWidget {
  const WebViewScreen({
    super.key,
    required this.url,
    this.title = 'Sayfa',
    this.enableQuizCharacterBridge = false,
  });

  final String url;
  final String title;
  final bool enableQuizCharacterBridge;

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted);

    if (widget.enableQuizCharacterBridge) {
      _controller.addJavaScriptChannel(
        'DahisQuiz',
        onMessageReceived: (JavaScriptMessage message) async {
          final raw = message.message.trim().toLowerCase();
          if (raw.isEmpty || !mounted) return;
          if (Firebase.apps.isEmpty || FirebaseAuth.instance.currentUser == null) {
            if (mounted) {
              CustomToast.showError(
                context,
                'Profil karakteri için giriş yapmalısın',
              );
            }
            return;
          }
          try {
            await AuthService().updateProfileCharacterId(raw);
            if (mounted) {
              CustomToast.showSuccess(
                context,
                'Profil karakterin test sonucuna göre kaydedildi',
              );
            }
          } catch (e) {
            if (mounted) {
              CustomToast.showError(
                context,
                e.toString().replaceFirst('Exception: ', ''),
              );
            }
          }
        },
      );
    }

    _controller
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1a1a2e),
      appBar: AppBar(
        title: Text(
          widget.title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF1a1a2e),
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back, color: Colors.white),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF667eea),
              ),
            ),
        ],
      ),
    );
  }
}
