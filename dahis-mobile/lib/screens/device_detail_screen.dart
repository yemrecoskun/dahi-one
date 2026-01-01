import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/character.dart';
import '../services/data_service.dart';

class DeviceDetailScreen extends StatefulWidget {
  final String dahiosId;
  final String characterId;
  final bool isActive;

  const DeviceDetailScreen({
    super.key,
    required this.dahiosId,
    required this.characterId,
    required this.isActive,
  });

  @override
  State<DeviceDetailScreen> createState() => _DeviceDetailScreenState();
}

class _DeviceDetailScreenState extends State<DeviceDetailScreen> {
  final DataService _dataService = DataService();
  Character? _character;
  bool _isLoading = true;
  late bool _isActive;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _isActive = widget.isActive;
    _loadCharacter();
  }

  Future<void> _loadCharacter() async {
    try {
      final character = await _dataService.getCharacterById(widget.characterId);
      setState(() {
        _character = character;
        _isLoading = false;
      });
    } catch (e) {
      print('⚠️  Karakter yüklenirken hata: $e');
      // Hata durumunda local data kullan
      setState(() {
        _character = Character.getCharacters()[widget.characterId];
        _isLoading = false;
      });
    }
  }

  Color _parseColor(String colorCode) {
    return Color(int.parse(colorCode.replaceFirst('#', '0xFF')));
  }

  String _getCharacterName(String characterId) {
    final characters = Character.getCharacters();
    return characters[characterId]?.name ?? characterId;
  }

  Color _getCharacterColor(String characterId) {
    final characters = Character.getCharacters();
    return _parseColor(characters[characterId]?.colorCode ?? '#667eea');
  }

  Future<void> _toggleActiveStatus() async {
    if (_isUpdating) return;

    setState(() {
      _isUpdating = true;
    });

    try {
      final response = await http.put(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosUpdate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'dahiosId': widget.dahiosId,
          'isActive': !_isActive,
        }),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['status'] == 'success') {
          setState(() {
            _isActive = !_isActive;
            _isUpdating = false;
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  _isActive ? 'Cihaz aktif edildi' : 'Cihaz pasif edildi',
                ),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 2),
              ),
            );
          }
        } else {
          throw Exception(responseData['message'] ?? 'Güncelleme başarısız');
        }
      } else {
        final errorBody = json.decode(response.body);
        throw Exception(errorBody['message'] ?? 'Güncelleme başarısız');
      }
    } catch (e) {
      print('❌ Cihaz durumu güncellenirken hata: $e');
      setState(() {
        _isUpdating = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Hata: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final characterColor = _getCharacterColor(widget.characterId);
    final characterName = _getCharacterName(widget.characterId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cihaz Detayı'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cihaz Kartı
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          characterColor.withValues(alpha: 0.3),
                          characterColor.withValues(alpha: 0.1),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: characterColor.withValues(alpha: 0.3),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        // Karakter İkonu
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: characterColor.withValues(alpha: 0.2),
                          ),
                          child: Center(
                            child: Text(
                              characterName[0],
                              style: TextStyle(
                                fontSize: 48,
                                fontWeight: FontWeight.w700,
                                color: characterColor,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Karakter Adı
                        Text(
                          characterName,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Durum Badge ve Toggle
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: _isActive
                                    ? Colors.green.withValues(alpha: 0.2)
                                    : Colors.grey.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _isActive ? Icons.check_circle : Icons.cancel,
                                    size: 16,
                                    color: _isActive ? Colors.green : Colors.grey,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _isActive ? 'Aktif' : 'Pasif',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: _isActive ? Colors.green : Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            // Toggle Switch
                            if (_isUpdating)
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFF667eea),
                                ),
                              )
                            else
                              Switch(
                                value: _isActive,
                                onChanged: (value) => _toggleActiveStatus(),
                                activeColor: Colors.green,
                                inactiveThumbColor: Colors.grey,
                                inactiveTrackColor: Colors.grey.withValues(alpha: 0.3),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  // dahiOS ID
                  const Text(
                    'dahiOS ID',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1a1a2e),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFF667eea).withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: SelectableText(
                      widget.dahiosId,
                      style: const TextStyle(
                        fontSize: 16,
                        fontFamily: 'monospace',
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Karakter Detayına Git Butonu
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          characterColor,
                          characterColor.withValues(alpha: 0.8),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        context.push('/character/${widget.characterId}');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.person, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'Karakter Detayına Git',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // dahiOS Link
                  const Text(
                    'dahiOS Link',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1a1a2e),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFF667eea).withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: SelectableText(
                      'https://os.dahis.io/${widget.dahiosId}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF667eea),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

