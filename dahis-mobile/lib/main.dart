import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'screens/home_screen.dart';
import 'screens/character_detail_screen.dart';
import 'screens/season_detail_screen.dart';
import 'screens/episode_detail_screen.dart';
import 'screens/store_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/login_screen.dart';
import 'screens/devices_screen.dart';
import 'screens/device_detail_screen.dart';
import 'screens/contact_info_screen.dart';
import 'widgets/update_dialog.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase'i başlat (hata durumunda uygulama çalışmaya devam eder)
  try {
    await Firebase.initializeApp();
    print('✅ Firebase başarıyla başlatıldı');
  } catch (e) {
    // Firebase yapılandırma dosyaları eksikse uygulama yine de çalışır
    // Detaylar için: dahis-mobile/FIREBASE-SETUP.md ve FIREBASE-FIX.md dosyalarına bakın
    final errorStr = e.toString();
    if (errorStr.contains('not-initialized') || 
        errorStr.contains('GoogleService-Info.plist') ||
        errorStr.contains('google-services.json') ||
        errorStr.contains('Could not find')) {
      print('ℹ️  Firebase yapılandırma dosyaları bulunamadı. Uygulama Firebase olmadan çalışacak.');
      print('   Firebase özelliklerini kullanmak için: dahis-mobile/FIREBASE-FIX.md');
      print('   Hata detayı: $errorStr');
    } else {
      print('⚠️  Firebase başlatılamadı: $e');
    }
  }
  
  runApp(const DahisApp());
  
  // Uygulama açıldığında versiyon kontrolü yap
  _checkForUpdate();
}

Future<void> _checkForUpdate() async {
  try {
    // Firebase başlatılmamışsa kontrol etme
    if (Firebase.apps.isEmpty) {
      return;
    }

    final packageInfo = await PackageInfo.fromPlatform();
    final currentVersion = packageInfo.version;
    final platform = Platform.isIOS ? 'ios' : 'android';

    // Direkt Firestore'dan oku
    final versionDoc = await FirebaseFirestore.instance
        .collection('app_versions')
        .doc(platform)
        .get()
        .timeout(const Duration(seconds: 5));

    if (versionDoc.exists) {
      final data = versionDoc.data()!;
      final minimumVersion = data['minimumVersion'] as String? ?? '1.0.0';
      final forceUpdate = data['forceUpdate'] as bool? ?? false;

      // Version karşılaştırması
      if (_compareVersions(currentVersion, minimumVersion) < 0) {
        // Update dialog'u göster
        Future.delayed(const Duration(milliseconds: 500), () {
          final context = navigatorKey.currentContext;
          if (context != null) {
            showDialog(
              context: context,
              barrierDismissible: !forceUpdate,
              builder: (context) => UpdateDialog(
                forceUpdate: forceUpdate,
                updateMessage: data['updateMessage'] as String? ??
                    'Yeni bir güncelleme mevcut. Lütfen uygulamayı güncelleyin.',
                appStoreUrl: data['appStoreUrl'] as String?,
                playStoreUrl: data['playStoreUrl'] as String?,
              ),
            );
          }
        });
      }
    }
  } catch (e) {
    // Hata durumunda sessizce devam et
    print('Version check error: $e');
  }
}

/// Version karşılaştırma fonksiyonu
/// v1 < v2 ise -1, v1 > v2 ise 1, eşitse 0 döner
int _compareVersions(String v1, String v2) {
  final parts1 = v1.split('.').map(int.parse).toList();
  final parts2 = v2.split('.').map(int.parse).toList();
  final maxLength = parts1.length > parts2.length ? parts1.length : parts2.length;

  for (int i = 0; i < maxLength; i++) {
    final part1 = i < parts1.length ? parts1[i] : 0;
    final part2 = i < parts2.length ? parts2[i] : 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}

class DahisApp extends StatelessWidget {
  const DahisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: "dahi's",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFF0a0a0f),
        fontFamily: 'Poppins',
      ),
      routerConfig: _router,
    );
  }
}

final GoRouter _router = GoRouter(
  navigatorKey: navigatorKey,
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/character/:id',
      builder: (context, state) {
        final characterId = state.pathParameters['id']!;
        return CharacterDetailScreen(characterId: characterId);
      },
    ),
    GoRoute(
      path: '/season/:id',
      builder: (context, state) {
        final seasonId = state.pathParameters['id']!;
        return SeasonDetailScreen(seasonId: seasonId);
      },
    ),
    GoRoute(
      path: '/season/:seasonId/episode/:episodeId',
      builder: (context, state) {
        final seasonId = state.pathParameters['seasonId']!;
        final episodeId = state.pathParameters['episodeId']!;
        return EpisodeDetailScreen(
          seasonId: seasonId,
          episodeId: episodeId,
        );
      },
    ),
    GoRoute(
      path: '/store',
      builder: (context, state) => const StoreScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/devices',
      builder: (context, state) => const DevicesScreen(),
    ),
    GoRoute(
      path: '/device/:dahiosId',
      builder: (context, state) {
        final dahiosId = state.pathParameters['dahiosId']!;
        final characterId = state.uri.queryParameters['characterId'] ?? '';
        final isActive = state.uri.queryParameters['isActive'] == 'true';
        return DeviceDetailScreen(
          dahiosId: dahiosId,
          characterId: characterId,
          isActive: isActive,
        );
      },
    ),
    GoRoute(
      path: '/contact-info',
      builder: (context, state) => const ContactInfoScreen(),
    ),
  ],
);
