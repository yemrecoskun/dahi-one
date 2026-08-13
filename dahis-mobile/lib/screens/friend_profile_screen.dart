import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;

import '../models/character.dart';
import '../services/data_service.dart';
import '../services/friend_service.dart';

/// Arkadaşın paylaştığı NFC (dahios) profilini salt okunur gösterir.
class FriendProfileScreen extends StatefulWidget {
  const FriendProfileScreen({
    super.key,
    required this.friendUid,
    required this.sharedDahiosId,
    this.displayName,
  });

  final String friendUid;
  final String sharedDahiosId;
  final String? displayName;

  @override
  State<FriendProfileScreen> createState() => _FriendProfileScreenState();
}

class _FriendProfileScreenState extends State<FriendProfileScreen> {
  final _dataService = DataService();
  final _friendService = FriendService();

  Character? _character;
  bool _loading = true;
  String? _error;
  List<String> _profileLinkTypes = [];
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    if (widget.sharedDahiosId.trim().isEmpty) {
      setState(() {
        _character = Character.getCharacters()['puls'];
        _profileLinkTypes = [];
        _isActive = true;
        _loading = false;
      });
      return;
    }
    try {
      final res = await http.get(
        Uri.parse(
          'https://us-central1-dahisio.cloudfunctions.net/dahiosInfo?dahiosId=${widget.sharedDahiosId}',
        ),
      );
      if (res.statusCode != 200) {
        throw Exception('Profil bilgisi alınamadı');
      }
      final body = json.decode(res.body) as Map<String, dynamic>;
      if (body['status'] != 'success') {
        throw Exception(body['message']?.toString() ?? 'Hata');
      }
      final data = body['data'] as Map<String, dynamic>? ?? {};
      final characterId = data['characterId'] as String? ?? 'puls';
      if (data['profileLinkTypes'] is List) {
        _profileLinkTypes = List<String>.from(data['profileLinkTypes'] as List);
      } else if (data['profileLinkType'] != null && data['profileLinkType'] != 'none') {
        _profileLinkTypes = [data['profileLinkType'] as String];
      } else {
        _profileLinkTypes = [];
      }
      _isActive = data['isActive'] != false;

      Character? ch;
      try {
        ch = await _dataService.getCharacterById(characterId);
      } catch (_) {
        ch = Character.getCharacters()[characterId];
      }
      setState(() {
        _character = ch;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  String _linkLabel(String key) {
    switch (key) {
      case 'instagram':
        return 'Instagram';
      case 'whatsapp':
        return 'WhatsApp';
      case 'phone':
        return 'Telefon';
      case 'email':
        return 'E-posta';
      default:
        return key;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Arkadaş profili'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFFb0b0b8)),
                    ),
                  ),
                )
              : FutureBuilder<Map<String, dynamic>?>(
                  future: _friendService.getUserPublicFields(widget.friendUid),
                  builder: (context, snap) {
                    final name = widget.displayName ??
                        (snap.data?['name'] as String?) ??
                        'Arkadaş';
                    final uname = snap.data?['username'] as String?;
                    final c = _character;
                    final color = c != null
                        ? Color(int.parse(c.colorCode.replaceFirst('#', '0xFF')))
                        : const Color(0xFF667eea);

                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: color.withOpacity(0.3),
                                child: Text(
                                  (c != null && c.name.isNotEmpty)
                                      ? c.name.substring(0, 1).toUpperCase()
                                      : '?',
                                  style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    if (uname != null && uname.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        '@$uname',
                                        style: const TextStyle(
                                          fontSize: 14,
                                          color: Color(0xFF667eea),
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                    if (widget.sharedDahiosId.trim().isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        'dahiOS: ${widget.sharedDahiosId}',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFFb0b0b8),
                                        ),
                                      ),
                                    ],
                                    if (widget.sharedDahiosId.trim().isEmpty)
                                      const Padding(
                                        padding: EdgeInsets.only(top: 8),
                                        child: Text(
                                          'Bu kişi kullanıcı adı ile eklendi; NFC etiketi bu ekranda gösterilmiyor.',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Color(0xFFb0b0b8),
                                            height: 1.3,
                                          ),
                                        ),
                                      ),
                                    if (!_isActive &&
                                        widget.sharedDahiosId.trim().isNotEmpty)
                                      const Padding(
                                        padding: EdgeInsets.only(top: 6),
                                        child: Text(
                                          'Bu etiket şu an pasif olabilir',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.orangeAccent,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          if (c != null) ...[
                            const SizedBox(height: 20),
                            Text(
                              c.name,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: color,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              c.description,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFFb0b0b8),
                                height: 1.35,
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          Text(
                            widget.sharedDahiosId.trim().isEmpty
                                ? 'Paylaşılan bağlantılar'
                                : 'NFC ile paylaşılan bağlantılar',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          if (_profileLinkTypes.isEmpty)
                            Text(
                              widget.sharedDahiosId.trim().isEmpty
                                  ? 'NFC etiketi olmadan eklendiği için burada yönlendirme listesi yok.'
                                  : 'Bu etikette herkese açık yönlendirme tipi seçilmemiş.',
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFFb0b0b8),
                              ),
                            )
                          else
                            ..._profileLinkTypes.map(
                              (t) => ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: Icon(Icons.link, color: color),
                                title: Text(_linkLabel(t)),
                                subtitle: const Text(
                                  'Tarama web / etiket akışında açılır',
                                  style: TextStyle(fontSize: 12),
                                ),
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
