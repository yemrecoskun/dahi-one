import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/season.dart';
import '../widgets/season_card.dart';
import '../services/data_service.dart';

class SeasonsScreen extends StatefulWidget {
  const SeasonsScreen({super.key});

  @override
  State<SeasonsScreen> createState() => _SeasonsScreenState();
}

class _SeasonsScreenState extends State<SeasonsScreen> {
  final DataService _dataService = DataService();
  Map<String, Season> _seasons = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final seasons = await _dataService.getSeasons();
      setState(() {
        _seasons = seasons;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _seasons = Season.getSeasons();
        _isLoading = false;
      });
    }
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
    );
  }
}

