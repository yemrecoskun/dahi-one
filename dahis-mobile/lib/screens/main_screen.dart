import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'home_screen.dart';
import 'characters_screen.dart';
import 'seasons_screen.dart';
import 'store_screen.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/logo.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // URL'den index'i al
    try {
      final uri = GoRouterState.of(context).uri;
      if (uri.path == '/characters') {
        _currentIndex = 1;
      } else if (uri.path == '/seasons') {
        _currentIndex = 2;
      } else if (uri.path == '/store') {
        _currentIndex = 3;
      } else {
        _currentIndex = 0;
      }
    } catch (e) {
      // Hata durumunda 0'da kal
    }
  }

  final List<Widget> _screens = [
    const HomeScreen(),
    const CharactersScreen(),
    const SeasonsScreen(),
    const StoreScreen(),
  ];

  PreferredSizeWidget _buildAppBar(int index) {
    final titles = [
      null, // Ana sayfa için DahisLogo
      'Onelarımız',
      'Sezonlar',
      'Mağaza',
    ];

    return AppBar(
      title: Row(
        children: [
          GestureDetector(
            onTap: () {
              if (index != 0) {
                setState(() {
                  _currentIndex = 0;
                });
              }
            },
            child: const DahisLogo(
              fontSize: 24,
              showShadow: true,
              animated: false,
            ),
          ),
          if (index != 0) ...[
            const SizedBox(width: 16),
            Text(
              titles[index]!,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ],
      ),
      centerTitle: false,
      backgroundColor: const Color(0xFF0a0a0f),
      elevation: 0,
      actions: [
        Builder(
          builder: (context) => IconButton(
            onPressed: () {
              context.push('/profile');
            },
            icon: const Icon(
              Icons.person,
              color: Color(0xFFb0b0b8),
            ),
            tooltip: 'Profil',
          ),
        ),
      ],
    );
  }

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(_currentIndex),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
      ),
    );
  }
}
