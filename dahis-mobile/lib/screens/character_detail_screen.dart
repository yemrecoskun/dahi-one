import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/character.dart';
import '../services/data_service.dart';
import '../services/purchase_service.dart';

class CharacterDetailScreen extends StatefulWidget {
  final String characterId;

  const CharacterDetailScreen({
    super.key,
    required this.characterId,
  });

  @override
  State<CharacterDetailScreen> createState() => _CharacterDetailScreenState();
}

class _CharacterDetailScreenState extends State<CharacterDetailScreen> {
  final DataService _dataService = DataService();
  final PurchaseService _purchaseService = PurchaseService();
  Character? _character;
  bool _isLoading = true;
  bool _isPurchasing = false;

  @override
  void initState() {
    super.initState();
    _loadCharacter();
    _initializePurchase();
  }

  Future<void> _initializePurchase() async {
    await _purchaseService.initialize();
    await _purchaseService.loadProducts();
    
    // Satın alma başarılı olduğunda callback
    _purchaseService.onPurchaseSuccess = (productId) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Satın alma başarılı! Teşekkürler.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
      }
    };
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

  void _goToStore(String characterId) async {
    final url = Uri.parse('https://dahis.shop/one-$characterId');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _handlePurchase() async {
    if (_character == null) return;

    setState(() {
      _isPurchasing = true;
    });

    try {
      final success = await _purchaseService.purchaseCharacter(_character!.id);
      if (!success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Satın alma başlatılamadı. Lütfen tekrar deneyin.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      print('⚠️  Satın alma hatası: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Satın alma sırasında bir hata oluştu: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isPurchasing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Karakter Detayı'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(
          child: CircularProgressIndicator(
            color: Color(0xFF667eea),
          ),
        ),
      );
    }

    final character = _character;

    if (character == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Karakter Bulunamadı')),
        body: const Center(child: Text('Karakter bulunamadı')),
      );
    }

    final color = _parseColor(character.colorCode);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Karakter Detayı'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Character Image
            Container(
              width: double.infinity,
              height: 300,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    color,
                    color.withValues(alpha: 0.3),
                  ],
                ),
              ),
              child: Center(
                child: Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(30.0),
                    child: Image.asset(
                      character.image,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
            ),

            // Character Details
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name
                  Text(
                    character.name,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Full Description
                  Text(
                    character.fullDescription,
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Traits
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: character.traits.map((trait) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: color.withValues(alpha: 0.5),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          trait,
                          style: TextStyle(
                            fontSize: 14,
                            color: color,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 32),

                  // Stats
                  const Text(
                    'İstatistikler',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildStatBar('Güç', 0.85, color),
                  const SizedBox(height: 12),
                  _buildStatBar('Zeka', 0.90, color),
                  const SizedBox(height: 12),
                  _buildStatBar('Hız', 0.80, color),
                  const SizedBox(height: 32),

                  // Price Display
                  Center(
                    child: Text(
                      PurchaseService.formatPrice(PurchaseService.price),
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Buy Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isPurchasing ? null : _handlePurchase,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: color,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        disabledBackgroundColor: color.withValues(alpha: 0.5),
                      ),
                      child: _isPurchasing
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'SATIN AL',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Alternative: Web Store Link
                  TextButton(
                    onPressed: () => _goToStore(character.id),
                    child: const Text(
                      'Web mağazadan satın al',
                      style: TextStyle(
                        fontSize: 14,
                        color: Color(0xFFb0b0b8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBar(String label, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              '${(value * 100).toInt()}%',
              style: TextStyle(
                fontSize: 14,
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            backgroundColor: Colors.grey.withValues(alpha: 0.2),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
          ),
        ),
      ],
    );
  }
}

