import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/season.dart';
import '../services/data_service.dart';

class EpisodeDetailScreen extends StatefulWidget {
  final String seasonId;
  final String episodeId;

  const EpisodeDetailScreen({
    super.key,
    required this.seasonId,
    required this.episodeId,
  });

  @override
  State<EpisodeDetailScreen> createState() => _EpisodeDetailScreenState();
}

class _EpisodeDetailScreenState extends State<EpisodeDetailScreen> {
  final DataService _dataService = DataService();
  Season? _season;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSeason();
  }

  Future<void> _loadSeason() async {
    try {
      final season = await _dataService.getSeasonById(widget.seasonId);
      setState(() {
        _season = season;
        _isLoading = false;
      });
    } catch (e) {
      // Hata durumunda local data kullan
      setState(() {
        _season = Season.getSeasons()[widget.seasonId];
        _isLoading = false;
      });
    }
  }

  Color _parseColor(String colorCode) {
    return Color(int.parse(colorCode.replaceFirst('#', '0xFF')));
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Bölüm Detayı'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
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

    final season = _season;

    if (season == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Sezon Bulunamadı')),
        body: const Center(child: Text('Sezon bulunamadı')),
      );
    }

    final episode = season.episodes.firstWhere(
      (ep) => ep.id == widget.episodeId,
      orElse: () => season.episodes.first,
    );

    final currentIndex = season.episodes.indexWhere((ep) => ep.id == widget.episodeId);
    final prevEpisode = currentIndex > 0 ? season.episodes[currentIndex - 1] : null;
    final nextEpisode = currentIndex < season.episodes.length - 1
        ? season.episodes[currentIndex + 1]
        : null;

    final color = _parseColor(episode.characterColor);
    final characterName = episode.character == 'All' ? 'Tüm Ekip' : episode.character;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bölüm Detayı'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Episode Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    color,
                    color.withValues(alpha: 0.7),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bölüm ${episode.number}',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withValues(alpha: 0.8),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    episode.title,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      characterName,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Episode Content
            Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                episode.content,
                style: const TextStyle(
                  fontSize: 16,
                  height: 1.8,
                  color: Color(0xFFb0b0b8),
                ),
              ),
            ),

            // Navigation Buttons
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Previous Episode
                  if (prevEpisode != null)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          context.pushReplacement(
                            '/season/${widget.seasonId}/episode/${prevEpisode.id}',
                          );
                        },
                        icon: const Icon(Icons.arrow_back),
                        label: const Text('Önceki'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey.withValues(alpha: 0.2),
                          foregroundColor: Colors.white,
                        ),
                      ),
                    )
                  else
                    const Expanded(child: SizedBox()),
                  const SizedBox(width: 16),
                  // Back to Season
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        context.pushReplacement('/season/${widget.seasonId}');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: color,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Sezona Dön'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Next Episode
                  if (nextEpisode != null)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          context.pushReplacement(
                            '/season/${widget.seasonId}/episode/${nextEpisode.id}',
                          );
                        },
                        icon: const Icon(Icons.arrow_forward),
                        label: const Text('Sonraki'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: color,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    )
                  else
                    const Expanded(child: SizedBox()),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

