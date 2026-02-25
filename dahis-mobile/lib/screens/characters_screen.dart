import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/character.dart';
import '../widgets/character_card.dart';
import '../services/data_service.dart';

class CharactersScreen extends StatefulWidget {
  const CharactersScreen({super.key});

  @override
  State<CharactersScreen> createState() => _CharactersScreenState();
}

class _CharactersScreenState extends State<CharactersScreen> {
  final PageController _charactersPageController = PageController();
  final DataService _dataService = DataService();
  Map<String, Character> _characters = {};
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
      setState(() {
        _characters = characters;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _characters = Character.getCharacters();
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _charactersPageController.dispose();
    super.dispose();
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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          SizedBox(
            height: 360,
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
                      : const Color(0xFFb0b0b8).withOpacity(0.3),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

