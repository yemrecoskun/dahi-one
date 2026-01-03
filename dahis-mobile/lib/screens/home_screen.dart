import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/character.dart';
import '../widgets/character_orb.dart';
import '../widgets/logo.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final DataService _dataService = DataService();
  final AuthService _authService = AuthService();
  Map<String, Character> _characters = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final characters = await _dataService.getCharacters();
      setState(() {
        _characters = characters;
        _isLoading = false;
      });
    } catch (e) {
      print('⚠️  Veri yüklenirken hata: $e');
      setState(() {
        _characters = Character.getCharacters();
        _isLoading = false;
      });
    }
  }

  void _openCharacterModal(String characterId) {
    context.push('/character/$characterId');
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF667eea),
        ),
      );
    }

    return Container(
      height: MediaQuery.of(context).size.height,
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
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Title
            ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [
                  Color(0xFF667eea),
                  Color(0xFF764ba2),
                  Color(0xFFf093fb),
                ],
              ).createShader(bounds),
              child: const Text(
                "dahi's One",
                style: TextStyle(
                  fontSize: 64,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              "Harmonya'nın Ritmini Koruyan Kahramanlar",
              style: TextStyle(
                fontSize: 18,
                color: Color(0xFFb0b0b8),
                fontWeight: FontWeight.w300,
              ),
            ),
            const SizedBox(height: 48),

            // Character Orbs Slider (Horizontal Scroll)
            Stack(
              clipBehavior: Clip.none,
              children: [
                SizedBox(
                  height: 120,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    itemCount: _characters.length,
                    itemBuilder: (context, index) {
                      final character = _characters.values.elementAt(index);
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        child: CharacterOrb(
                          character: character,
                          onTap: () => _openCharacterModal(character.id),
                        ),
                      );
                    },
                  ),
                ),
                // Sağ tarafta fade effect ve scroll hint
                if (_characters.length > 3)
                  Positioned(
                    right: 0,
                    top: 0,
                    bottom: 0,
                    child: IgnorePointer(
                      child: Container(
                        width: 100,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [
                              Colors.transparent,
                              const Color(0xFF050508).withValues(alpha: 0.9),
                            ],
                          ),
                        ),
                        child: Center(
                          child: Container(
                            margin: const EdgeInsets.only(right: 16),
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF667eea).withValues(alpha: 0.6),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.arrow_forward_ios,
                              size: 16,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 48),
            // dahiOS Section
            const Icon(Icons.watch, size: 64, color: Color(0xFF667eea)),
            const SizedBox(height: 16),
            const Text(
              'dahiOS ile Anında Keşfet',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 32.0),
              child: Text(
                'Onelarımızın her birinde dahiOS teknolojisi var! Telefonunuzu cihaza yaklaştırın ve karakterin dünyasına anında girin.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Color(0xFFb0b0b8),
                ),
              ),
            ),
            const SizedBox(height: 24),
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
              child: ElevatedButton(
                onPressed: () {
                  // Kullanıcı login kontrolü
                  if (_authService.currentUser == null) {
                    // Login değilse, login ekranına yönlendir
                    context.push('/login');
                  } else {
                    // Login ise, cihazlar ekranına git
                    context.push('/devices');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: const Text(
                  'dahiOS',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
