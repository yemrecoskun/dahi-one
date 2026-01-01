import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

/// Logo widget'ını PNG'ye çevirir ve app icon olarak kaydeder
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Logo widget'ını oluştur
  final logoWidget = Container(
    width: 1024,
    height: 1024,
    color: const Color(0xFF0a0a0f),
    child: Center(
      child: ShaderMask(
        shaderCallback: (bounds) => const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF667eea),
            Color(0xFF764ba2),
            Color(0xFFf093fb),
          ],
          stops: [0.0, 0.5, 1.0],
        ).createShader(bounds),
        child: const Text(
          "dahi's",
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 320,
            color: Colors.white,
            letterSpacing: -5,
            height: 1.1,
          ),
        ),
      ),
    ),
  );

  // Widget'ı render et
  final repaintBoundary = RepaintBoundary(
    child: logoWidget,
  );

  // PNG'ye çevir (bu kısım için screenshot paketi gerekli)
  // Şimdilik kullanıcıya manuel oluşturma talimatı veriyoruz
  print('📝 Logo PNG oluşturma talimatları:');
  print('');
  print('1. Logo widget özellikleri:');
  print('   - Metin: "dahi\'s"');
  print('   - Font: Bold (w800)');
  print('   - Font Size: 320px (1024x1024 için)');
  print('   - Renkler: Gradient (#667eea → #764ba2 → #f093fb)');
  print('   - Arka plan: #0a0a0f');
  print('   - Letter spacing: -5px');
  print('');
  print('2. PNG oluşturma:');
  print('   - Boyut: 1024x1024 px');
  print('   - Format: PNG');
  print('   - Kayıt yeri: assets/icon/icon.png');
  print('');
  print('3. App icon oluşturma:');
  print('   flutter pub run flutter_launcher_icons');
}

