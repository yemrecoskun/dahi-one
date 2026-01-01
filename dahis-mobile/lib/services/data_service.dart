import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import '../models/character.dart';
import '../models/season.dart';
import '../models/episode.dart';

class DataService {
  final FirebaseFirestore? _firestore;

  DataService() : _firestore = Firebase.apps.isNotEmpty ? FirebaseFirestore.instance : null;

  // Karakterleri Firestore'dan çek
  Future<Map<String, Character>> getCharacters() async {
    if (_firestore == null) {
      // Firebase yoksa local data döndür
      return Character.getCharacters();
    }

    try {
      final snapshot = await _firestore!.collection('characters').get();
      final Map<String, Character> characters = {};

      for (var doc in snapshot.docs) {
        final data = doc.data();
        characters[doc.id] = Character(
          id: data['id'] ?? doc.id,
          name: data['name'] ?? '',
          color: data['color'] ?? '',
          colorCode: data['colorCode'] ?? '#000000',
          image: data['image'] ?? '',
          description: data['description'] ?? '',
          traits: List<String>.from(data['traits'] ?? []),
          fullDescription: data['fullDescription'] ?? '',
        );
      }

      return characters;
    } catch (e) {
      print('⚠️  Firestore\'dan karakterler çekilemedi: $e');
      // Hata durumunda local data döndür
      return Character.getCharacters();
    }
  }

  // Sezonları Firestore'dan çek
  Future<Map<String, Season>> getSeasons() async {
    if (_firestore == null) {
      // Firebase yoksa local data döndür
      return Season.getSeasons();
    }

    try {
      final snapshot = await _firestore!.collection('seasons').get();
      final Map<String, Season> seasons = {};

      for (var doc in snapshot.docs) {
        final data = doc.data();
        
        // Episodes'ı çek
        final episodesSnapshot = await doc.reference.collection('episodes').get();
        final List<Episode> episodes = episodesSnapshot.docs.map((episodeDoc) {
          final episodeData = episodeDoc.data();
          return Episode(
            id: episodeData['id'] ?? episodeDoc.id,
            number: episodeData['number'] ?? 0,
            title: episodeData['title'] ?? '',
            character: episodeData['character'] ?? '',
            characterColor: episodeData['characterColor'] ?? '#000000',
            summary: episodeData['summary'] ?? '',
            content: episodeData['content'] ?? '',
          );
        }).toList();

        // Episode'ları number'a göre sırala
        episodes.sort((a, b) => a.number.compareTo(b.number));

        seasons[doc.id] = Season(
          id: data['id'] ?? doc.id,
          title: data['title'] ?? '',
          subtitle: data['subtitle'] ?? '',
          summary: data['summary'] ?? '',
          episodes: episodes,
        );
      }

      return seasons;
    } catch (e) {
      print('⚠️  Firestore\'dan sezonlar çekilemedi: $e');
      // Hata durumunda local data döndür
      return Season.getSeasons();
    }
  }

  // Tek bir karakteri ID'ye göre çek
  Future<Character?> getCharacterById(String characterId) async {
    if (_firestore == null) {
      return Character.getCharacters()[characterId];
    }

    try {
      final doc = await _firestore!.collection('characters').doc(characterId).get();
      if (!doc.exists) return null;

      final data = doc.data()!;
      return Character(
        id: data['id'] ?? doc.id,
        name: data['name'] ?? '',
        color: data['color'] ?? '',
        colorCode: data['colorCode'] ?? '#000000',
        image: data['image'] ?? '',
        description: data['description'] ?? '',
        traits: List<String>.from(data['traits'] ?? []),
        fullDescription: data['fullDescription'] ?? '',
      );
    } catch (e) {
      print('⚠️  Firestore\'dan karakter çekilemedi: $e');
      return Character.getCharacters()[characterId];
    }
  }

  // Tek bir sezonu ID'ye göre çek
  Future<Season?> getSeasonById(String seasonId) async {
    if (_firestore == null) {
      return Season.getSeasons()[seasonId];
    }

    try {
      final doc = await _firestore!.collection('seasons').doc(seasonId).get();
      if (!doc.exists) return null;

      final data = doc.data()!;

      // Episodes'ı çek
      final episodesSnapshot = await doc.reference.collection('episodes').get();
      final List<Episode> episodes = episodesSnapshot.docs.map((episodeDoc) {
        final episodeData = episodeDoc.data();
        return Episode(
          id: episodeData['id'] ?? episodeDoc.id,
          number: episodeData['number'] ?? 0,
          title: episodeData['title'] ?? '',
          character: episodeData['character'] ?? '',
          characterColor: episodeData['characterColor'] ?? '#000000',
          summary: episodeData['summary'] ?? '',
          content: episodeData['content'] ?? '',
        );
      }).toList();

      // Episode'ları number'a göre sırala
      episodes.sort((a, b) => a.number.compareTo(b.number));

      return Season(
        id: data['id'] ?? doc.id,
        title: data['title'] ?? '',
        subtitle: data['subtitle'] ?? '',
        summary: data['summary'] ?? '',
        episodes: episodes,
      );
    } catch (e) {
      print('⚠️  Firestore\'dan sezon çekilemedi: $e');
      return Season.getSeasons()[seasonId];
    }
  }
}

