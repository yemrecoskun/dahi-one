import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/character.dart';
import '../models/season.dart';
import '../widgets/character_orb.dart';
import '../widgets/character_card.dart';
import '../widgets/season_card.dart';
import '../widgets/logo.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  final PageController _charactersPageController = PageController();
  final DataService _dataService = DataService();
  final AuthService _authService = AuthService();
  Map<String, Character> _characters = {};
  Map<String, Season> _seasons = {};
  int _charactersCurrentPage = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _charactersPageController.addListener(() {
      setState(() {
        _charactersCurrentPage = _charactersPageController.page?.round() ?? 0;
      });
    });
  }

  Future<void> _loadData() async {
    try {
      final characters = await _dataService.getCharacters();
      final seasons = await _dataService.getSeasons();
      setState(() {
        _characters = characters;
        _seasons = seasons;
        _isLoading = false;
      });
    } catch (e) {
      print('⚠️  Veri yüklenirken hata: $e');
      // Hata durumunda local data kullan
      setState(() {
        _characters = Character.getCharacters();
        _seasons = Season.getSeasons();
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _charactersPageController.dispose();
    super.dispose();
  }

  void _openCharacterModal(String characterId) {
    context.push('/character/$characterId');
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const DahisLogo(
            fontSize: 24,
            showShadow: true,
            animated: false,
          ),
          centerTitle: false,
          backgroundColor: const Color(0xFF0a0a0f),
          elevation: 0,
        ),
        backgroundColor: const Color(0xFF050508),
        body: const Center(
          child: CircularProgressIndicator(
            color: Color(0xFF667eea),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const DahisLogo(
          fontSize: 24,
          showShadow: true,
          animated: false,
        ),
        centerTitle: false,
        backgroundColor: const Color(0xFF0a0a0f),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              context.push('/profile');
            },
            icon: const Icon(
              Icons.person,
              color: Color(0xFFb0b0b8),
            ),
            tooltip: 'Profil',
          ),
        ],
      ),
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [

          // Hero Section
          SliverToBoxAdapter(
            child: Container(
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
                  ],
                ),
              ),
            ),
          ),

          // Characters Section
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Onelarımız',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    height: 450,
                    child: PageView.builder(
                      controller: _charactersPageController,
                      scrollDirection: Axis.horizontal,
                      itemCount: _characters.length,
                      itemBuilder: (context, index) {
                        final character = _characters.values.elementAt(index);
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12.0),
                          child: CharacterCard(
                            character: character,
                            onTap: () => _openCharacterModal(character.id),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Page Indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _characters.length,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: index == _charactersCurrentPage ? 24 : 8,
                        height: 8,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          color: index == _charactersCurrentPage
                              ? const Color(0xFF667eea)
                              : const Color(0xFFb0b0b8).withValues(alpha: 0.3),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // dahiOS Section
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(24),
              margin: const EdgeInsets.symmetric(vertical: 24),
              child: Column(
                children: [
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
                  const Text(
                    'Onelarımızın her birinde dahiOS teknolojisi var! Telefonunuzu cihaza yaklaştırın ve karakterin dünyasına anında girin.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFFb0b0b8),
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
          ),

          // Seasons Section
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sezonlar',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 32),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _seasons.length,
                    itemBuilder: (context, index) {
                      final season = _seasons.values.elementAt(index);
                      return SeasonCard(
                        season: season,
                        onTap: () {
                          context.push('/season/${season.id}');
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // Footer
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(24),
              child: const Center(
                child: Text(
                  "© 2025 dahi's One - Harmonya'nın Kahramanları",
                  style: TextStyle(
                    color: Color(0xFFb0b0b8),
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0a0a0f),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                TextButton(
                  onPressed: () {
                    _scrollController.animateTo(
                      0,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  },
                  child: const Text(
                    'Ana Sayfa',
                    style: TextStyle(
                      color: Color(0xFFb0b0b8),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    _scrollController.animateTo(
                      MediaQuery.of(context).size.height * 1.2,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  },
                  child: const Text(
                    'Onelar',
                    style: TextStyle(
                      color: Color(0xFFb0b0b8),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    _scrollController.animateTo(
                      MediaQuery.of(context).size.height * 2.5,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  },
                  child: const Text(
                    'Sezonlar',
                    style: TextStyle(
                      color: Color(0xFFb0b0b8),
                      fontWeight: FontWeight.w500,
                    ),
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
                    onPressed: () {
                      context.push('/store');
                    },
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    child: const Text(
                      'Mağaza',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

