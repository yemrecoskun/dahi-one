import 'package:cloud_firestore/cloud_firestore.dart';

/// Firestore `eglence_menu_items` veya uygulama içi varsayılan satır.
class EglenceMenuItem {
  const EglenceMenuItem({
    required this.sectionKey,
    required this.sectionOrder,
    required this.itemOrder,
    required this.title,
    required this.subtitle,
    required this.path,
    required this.icon,
    this.enabled = true,
  });

  final String sectionKey;
  final int sectionOrder;
  final int itemOrder;
  final String title;
  final String subtitle;
  final String path;
  final String icon;
  final bool enabled;

  factory EglenceMenuItem.fromFirestore(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>? ?? {};
    return EglenceMenuItem(
      sectionKey: (d['sectionKey'] as String?)?.trim().isNotEmpty == true
          ? d['sectionKey'] as String
          : 'games',
      sectionOrder: (d['sectionOrder'] as num?)?.toInt() ?? 99,
      itemOrder: (d['itemOrder'] as num?)?.toInt() ?? 0,
      title: (d['title'] as String?)?.trim() ?? 'Öğe',
      subtitle: (d['subtitle'] as String?) ?? '',
      path: (d['path'] as String?)?.trim() ?? '/',
      icon: (d['icon'] as String?) ?? '🎮',
      enabled: d['enabled'] is bool ? d['enabled'] as bool : true,
    );
  }

  static List<EglenceMenuItem> defaultCatalog() {
    return const [
      EglenceMenuItem(
        sectionKey: 'entertainment',
        sectionOrder: 0,
        itemOrder: 0,
        title: 'Hangi One sensin?',
        subtitle: 'Soru-cevap ile seni yansıtan One karakterini keşfet.',
        path: '/quiz',
        icon: '🎯',
      ),
      EglenceMenuItem(
        sectionKey: 'entertainment',
        sectionOrder: 0,
        itemOrder: 1,
        title: 'Onelar Arası Uyum',
        subtitle: 'Hangi One hangisiyle eş, arkadaş, anlaşır veya anlaşamaz?',
        path: '/uyum',
        icon: '💕',
      ),
      EglenceMenuItem(
        sectionKey: 'entertainment',
        sectionOrder: 0,
        itemOrder: 2,
        title: "One'ının bugünkü sözü",
        subtitle: 'Rastgele bir One senin için bir cümle seçer.',
        path: '/soz',
        icon: '💬',
      ),
      EglenceMenuItem(
        sectionKey: 'card_multi',
        sectionOrder: 1,
        itemOrder: 0,
        title: 'DAHIS: Five Forces',
        subtitle: '3–5 oyunculu stratejik kart oyunu.',
        path: '/five-forces',
        icon: '⚡',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 0,
        title: 'One Eşleştirme',
        subtitle: 'Aynı One çiftini bul. Kartları çevir, eşleştir!',
        path: '/memory',
        icon: '🃏',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 1,
        title: 'Noktaları Birleştir',
        subtitle: 'Noktaları sırayla birleştir, tüm hücreleri doldur.',
        path: '/number-link',
        icon: '🔗',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 2,
        title: 'Dahis Sudoku',
        subtitle: '4×4 sudoku. Her satır, sütun ve bölgede dört karakter bir kez.',
        path: '/character-sudoku',
        icon: '🔢',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 3,
        title: 'Dahis Takuzu',
        subtitle: 'İki karakterle doldur. = aynı, X karşıt.',
        path: '/takuzu',
        icon: '◐',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 4,
        title: 'Taç Yerleştir',
        subtitle: 'Her satır, sütun ve bölgede bir taç.',
        path: '/crown-puzzle',
        icon: '♔',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 5,
        title: 'Dahis Yapboz',
        subtitle: 'Karakter resmini parçalara böl, kaydırarak tamamla.',
        path: '/yapboz',
        icon: '🧩',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 6,
        title: 'Tek Hat',
        subtitle: 'Tüm hücrelerden tek çizgide geç.',
        path: '/one-line',
        icon: '〰',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 7,
        title: 'Crystal Merge',
        subtitle: 'Kristalleri birleştir, Dahi\'s One\'a ulaş.',
        path: '/crystal-merge',
        icon: '◇',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 8,
        title: 'Glitch Minesweeper',
        subtitle: 'Virüslü hücreleri işaretle.',
        path: '/glitch-sweeper',
        icon: '⚠',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 9,
        title: 'Dahis Path',
        subtitle: 'Blokları kaydırarak karakteri portaline ulaştır.',
        path: '/dahis-path',
        icon: '⚡',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 10,
        title: 'Zamanlanmış Karakter',
        subtitle: 'Aktif karakteri süre dolmadan doğru hedefe yerleştir.',
        path: '/zamanlama',
        icon: '⏰',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 11,
        title: 'Patches',
        subtitle: 'Sayılı ipuçlarıyla tabloyu dikdörtgenlere böl.',
        path: '/patches',
        icon: '▦',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 12,
        title: 'One Renk Sıralama',
        subtitle: 'Renkleri tek renkli tüplerde topla.',
        path: '/color-sort',
        icon: '🧪',
      ),
      EglenceMenuItem(
        sectionKey: 'games',
        sectionOrder: 2,
        itemOrder: 13,
        title: 'Renk Kodlama',
        subtitle: 'Gizli renk sırasını ipuçlarıyla çöz.',
        path: '/renk-kodlama',
        icon: '🎨',
      ),
    ];
  }

  static Map<String, List<EglenceMenuItem>> groupBySection(List<EglenceMenuItem> items) {
    final enabled = items.where((e) => e.enabled).toList();
    final bySection = <String, List<EglenceMenuItem>>{};
    for (final e in enabled) {
      bySection.putIfAbsent(e.sectionKey, () => []).add(e);
    }
    for (final list in bySection.values) {
      list.sort((a, b) {
        final s = a.sectionOrder.compareTo(b.sectionOrder);
        if (s != 0) return s;
        return a.itemOrder.compareTo(b.itemOrder);
      });
    }
    const order = ['entertainment', 'card_multi', 'games'];
    final out = <String, List<EglenceMenuItem>>{};
    for (final k in order) {
      if (bySection.containsKey(k)) out[k] = bySection[k]!;
    }
    for (final k in bySection.keys) {
      if (!out.containsKey(k)) out[k] = bySection[k]!;
    }
    return out;
  }
}
