import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/season.dart';
import '../widgets/episode_card.dart';
import '../services/data_service.dart';

class SeasonDetailScreen extends StatefulWidget {
  final String seasonId;

  const SeasonDetailScreen({
    super.key,
    required this.seasonId,
  });

  @override
  State<SeasonDetailScreen> createState() => _SeasonDetailScreenState();
}

class _SeasonDetailScreenState extends State<SeasonDetailScreen> {
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

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Sezon Detayı'),
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sezon Detayı'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Season Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF667eea),
                    Color(0xFF764ba2),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    season.subtitle,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withValues(alpha: 0.8),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    season.title,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            // Season Summary
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sezon Özeti',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    season.summary,
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                ],
              ),
            ),

            // Episodes List
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Bölümler',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: season.episodes.length,
                    itemBuilder: (context, index) {
                      final episode = season.episodes[index];
                      return EpisodeCard(
                        episode: episode,
                        seasonId: season.id,
                        onTap: () {
                          context.push(
                            '/season/${season.id}/episode/${episode.id}',
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

