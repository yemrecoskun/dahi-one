import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/eglence_menu_item.dart';

/// Eğlence: Firestore `eglence_menu_items` veya yedek katalog.
/// Üç alt menü — [ExpansionTile] ile açılır; satıra tıklanınca oyun linki WebView'da.
class EglenceMenuScreen extends StatelessWidget {
  const EglenceMenuScreen({super.key});

  static const String _baseHost = 'https://dahis.io';

  static String resolveAppUrl(String path) {
    final p = path.trim();
    if (p.startsWith('http://') || p.startsWith('https://')) {
      final uri = Uri.parse(p);
      final q = Map<String, String>.from(uri.queryParameters);
      q.putIfAbsent('app', () => '1');
      return uri.replace(queryParameters: q).toString();
    }
    final pathOnly = p.startsWith('/') ? p : '/$p';
    final uri = Uri.parse(_baseHost).resolve(pathOnly);
    final q = Map<String, String>.from(uri.queryParameters);
    q['app'] = '1';
    return uri.replace(queryParameters: q).toString();
  }

  void _openWebView(BuildContext context, String path, String title) {
    final url = resolveAppUrl(path);
    final quizBridge =
        path.toLowerCase().contains('quiz') ? '1' : '0';
    context.push(
      '/webview?url=${Uri.encodeComponent(url)}&title=${Uri.encodeComponent(title)}&quizBridge=$quizBridge',
    );
  }

  String _sectionTitle(String key) {
    switch (key) {
      case 'entertainment':
        return 'Eğlence';
      case 'card_multi':
        return 'Kart / Çoklu Oyun';
      case 'games':
        return 'Oyun';
      default:
        return key;
    }
  }

  Widget _buildGrouped(
    BuildContext context,
    Map<String, List<EglenceMenuItem>> grouped,
  ) {
    final keys = grouped.keys.toList();
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        Text(
          'Alt menüden oyun seç; tıklayınca sitede açılır.',
          style: TextStyle(
            color: Colors.white.withOpacity(0.65),
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 16),
        ...keys.map((sectionKey) {
          final items = grouped[sectionKey]!;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Material(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              child: Theme(
                data: Theme.of(context).copyWith(
                  dividerColor: Colors.white.withOpacity(0.08),
                ),
                child: ExpansionTile(
                  key: PageStorageKey<String>('eglence-$sectionKey'),
                  initiallyExpanded: true,
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  childrenPadding: const EdgeInsets.only(bottom: 8),
                  iconColor: const Color(0xFF667eea),
                  collapsedIconColor: const Color(0xFFb0b0b8),
                  title: Text(
                    _sectionTitle(sectionKey),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 17,
                    ),
                  ),
                  children: items
                      .map((item) => _buildRow(context, item))
                      .toList(),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildRow(BuildContext context, EglenceMenuItem item) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openWebView(context, item.path, item.title),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF667eea).withOpacity(0.22),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text(item.icon, style: const TextStyle(fontSize: 24)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    if (item.subtitle.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        item.subtitle,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.62),
                          fontSize: 13,
                          height: 1.25,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.open_in_new,
                size: 18,
                color: Colors.white.withOpacity(0.45),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fallback =
        EglenceMenuItem.groupBySection(EglenceMenuItem.defaultCatalog());

    if (Firebase.apps.isEmpty) {
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
        child: _buildGrouped(context, fallback),
      );
    }

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
      child: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('eglence_menu_items')
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return _buildGrouped(context, fallback);
          }
          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return _buildGrouped(context, fallback);
          }

          final list = snapshot.data!.docs
              .map((d) => EglenceMenuItem.fromFirestore(d))
              .toList();
          final grouped = EglenceMenuItem.groupBySection(list);
          if (grouped.isEmpty) {
            return _buildGrouped(context, fallback);
          }
          return _buildGrouped(context, grouped);
        },
      ),
    );
  }
}
