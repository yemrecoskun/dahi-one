import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Eğlence alt menüsü: Her öğe tıklanınca ilgili web sayfası WebView'da açılır.
class EglenceMenuScreen extends StatelessWidget {
  const EglenceMenuScreen({super.key});

  static const String _baseUrl = 'https://dahis.io';

  static const List<Map<String, String>> _items = [
    {
      'title': 'Hangi One sensin?',
      'subtitle': 'Soru-cevap ile seni yansıtan karakteri keşfet.',
      'url': '/quiz.html',
      'icon': '🎯',
    },
    {
      'title': 'Onelar Arası Uyum',
      'subtitle': 'Hangi One hangisiyle eş, arkadaş veya anlaşamaz?',
      'url': '/uyum.html',
      'icon': '💕',
    },
    {
      'title': "One'ının bugünkü sözü",
      'subtitle': 'Rastgele bir One\'dan motivasyon sözü.',
      'url': '/soz.html',
      'icon': '💬',
    },
    {
      'title': 'One hafıza kartları',
      'subtitle': 'Aynı One çiftini bul, eşleştir.',
      'url': '/memory.html',
      'icon': '🃏',
    },
  ];

  void _openWebView(BuildContext context, String path, String title) {
    final separator = path.contains('?') ? '&' : '?';
    final url = '$_baseUrl$path${separator}app=1';
    context.push(
      '/webview?url=${Uri.encodeComponent(url)}&title=${Uri.encodeComponent(title)}',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.center,
          radius: 1.5,
          colors: [
            Color(0xFF1a1a2e),
            Color(0xFF050508),
          ],
        ),
      ),
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          const SizedBox(height: 8),
          Text(
            'Bir eğlence seç',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 12),
          ..._items.map((item) => _buildCard(
                context,
                title: item['title']!,
                subtitle: item['subtitle']!,
                icon: item['icon']!,
                url: item['url']!,
              )),
        ],
      ),
    );
  }

  Widget _buildCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required String icon,
    required String url,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () => _openWebView(context, url, title),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: const Color(0xFF667eea).withOpacity(0.25),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Text(icon, style: const TextStyle(fontSize: 26)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.65),
                          fontSize: 13,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: Colors.white.withOpacity(0.5),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
