import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/friend_service.dart';
import '../widgets/custom_toast.dart';

class FriendsScreen extends StatelessWidget {
  const FriendsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    if (Firebase.apps.isEmpty || FirebaseAuth.instance.currentUser == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Arkadaşlar')),
        body: const Center(
          child: Text(
            'Arkadaşlar için giriş ve Firebase gerekir.',
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Arkadaşlar'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'İstekler'),
              Tab(text: 'Arkadaşlarım'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _IncomingRequestsTab(),
            _AcceptedFriendsTab(),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => _pickAddFriendMethod(context),
          icon: const Icon(Icons.person_add_alt_1),
          label: const Text('Arkadaş ekle'),
        ),
      ),
    );
  }

  static Future<void> _pickAddFriendMethod(BuildContext context) async {
    final choice = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.search),
              title: const Text('Kullanıcı adı ile ara'),
              subtitle: const Text('Kullanıcı adının bir kısmını yaz'),
              onTap: () => Navigator.pop(ctx, 'username'),
            ),
            ListTile(
              leading: const Icon(Icons.nfc),
              title: const Text('NFC ile ekle'),
              subtitle: const Text('Arkadaşının dahiOS etiketini okut'),
              onTap: () => Navigator.pop(ctx, 'nfc'),
            ),
          ],
        ),
      ),
    );
    if (!context.mounted) return;
    if (choice == 'username') {
      await _onAddFriendByUsername(context);
    } else if (choice == 'nfc') {
      await _onAddFriendByNfc(context);
    }
  }

  static String _friendProfileLocation(String peerUid, String dahiosId, String name) {
    final q =
        'friendUid=$peerUid&name=${Uri.encodeComponent(name)}${dahiosId.isNotEmpty ? '&dahiosId=${Uri.encodeComponent(dahiosId)}' : ''}';
    return '/friend-profile?$q';
  }

  static Future<void> _confirmAndSendRequest(
    BuildContext context,
    FriendService svc, {
    required String toUid,
    required String sharedDahiosId,
    required String displayLabel,
  }) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Arkadaşlık isteği'),
        content: Text('$displayLabel kullanıcısına istek gönderilsin mi?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('İptal')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Gönder')),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    try {
      await svc.sendFriendRequest(toUid: toUid, sharedDahiosId: sharedDahiosId);
      if (context.mounted) {
        CustomToast.showSuccess(context, 'İstek gönderildi');
      }
    } catch (e) {
      if (context.mounted) {
        CustomToast.showError(context, e.toString().replaceFirst('Exception: ', ''));
      }
    }
  }

  static Future<void> _onAddFriendByNfc(BuildContext context) async {
    final svc = FriendService();
    final map = await context.push<Map<String, String>>('/add-friend-scan');
    if (map == null || !context.mounted) return;
    final dahiosId = map['dahiosId'] ?? '';
    final ownerUid = map['ownerUid'] ?? '';
    if (dahiosId.isEmpty || ownerUid.isEmpty) return;

    final pub = await svc.getUserPublicFields(ownerUid);
    if (!context.mounted) return;
    final name = pub?['name'] as String? ?? 'Kullanıcı';

    await _confirmAndSendRequest(
      context,
      svc,
      toUid: ownerUid,
      sharedDahiosId: dahiosId,
      displayLabel: name,
    );
  }

  static Future<void> _onAddFriendByUsername(BuildContext context) async {
    final picked = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => const _UsernameFriendSearchDialog(),
    );
    if (picked == null || !context.mounted) return;
    final toUid = picked['uid'] ?? '';
    final label = picked['label'] ?? 'Kullanıcı';
    if (toUid.isEmpty) return;

    final svc = FriendService();
    await _confirmAndSendRequest(
      context,
      svc,
      toUid: toUid,
      sharedDahiosId: '',
      displayLabel: label,
    );
  }
}

class _IncomingRequestsTab extends StatelessWidget {
  const _IncomingRequestsTab();

  @override
  Widget build(BuildContext context) {
    final svc = FriendService();
    return StreamBuilder<List<FriendRequestRow>>(
      stream: svc.incomingPendingStream(),
      builder: (context, snap) {
        if (snap.hasError) {
          return Center(child: Text('Hata: ${snap.error}'));
        }
        if (!snap.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final rows = snap.data!;
        if (rows.isEmpty) {
          return const Center(
            child: Text(
              'Bekleyen arkadaşlık isteği yok.',
              style: TextStyle(color: Color(0xFFb0b0b8)),
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: rows.length,
          itemBuilder: (context, i) {
            final r = rows[i];
            return _IncomingTile(request: r);
          },
        );
      },
    );
  }
}

class _IncomingTile extends StatelessWidget {
  const _IncomingTile({required this.request});

  final FriendRequestRow request;

  @override
  Widget build(BuildContext context) {
    final svc = FriendService();
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FutureBuilder<Map<String, dynamic>?>(
              future: svc.getUserPublicFields(request.fromUid),
              builder: (context, snap) {
                final n = snap.data?['name'] as String? ?? 'Kullanıcı';
                final un = snap.data?['username'] as String?;
                final detail = request.sharedDahiosId.isEmpty
                    ? (un != null && un.isNotEmpty
                        ? 'Kullanıcı adı: @$un'
                        : 'Kullanıcı adı ile gönderildi')
                    : 'Etiket: ${request.sharedDahiosId}';
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      n,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      detail,
                      style: const TextStyle(fontSize: 13, color: Color(0xFFb0b0b8)),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () async {
                      try {
                        await svc.deleteRequestOrFriendship(request.id);
                        if (context.mounted) {
                          CustomToast.showSuccess(context, 'İstek reddedildi');
                        }
                      } catch (_) {
                        if (context.mounted) {
                          CustomToast.showError(context, 'İşlem başarısız');
                        }
                      }
                    },
                    child: const Text('Reddet'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: () async {
                      try {
                        await svc.acceptRequest(request.id);
                        if (context.mounted) {
                          CustomToast.showSuccess(context, 'Arkadaş eklendi');
                        }
                      } catch (_) {
                        if (context.mounted) {
                          CustomToast.showError(context, 'Kabul edilemedi');
                        }
                      }
                    },
                    child: const Text('Kabul et'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AcceptedFriendsTab extends StatelessWidget {
  const _AcceptedFriendsTab();

  @override
  Widget build(BuildContext context) {
    final me = FirebaseAuth.instance.currentUser?.uid;
    if (me == null) {
      return const Center(child: Text('Oturum gerekli'));
    }
    final svc = FriendService();
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: svc.acceptedAsFromStream(),
      builder: (context, snap1) {
        return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
          stream: svc.acceptedAsToStream(),
          builder: (context, snap2) {
            if (!snap1.hasData || !snap2.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            final byId = <String, FriendRequestRow>{};
            for (final d in snap1.data!.docs) {
              byId[d.id] = FriendRequestRow.fromDoc(d);
            }
            for (final d in snap2.data!.docs) {
              byId[d.id] = FriendRequestRow.fromDoc(d);
            }
            final list = byId.values.toList();
            if (list.isEmpty) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                    'Henüz arkadaş yok. Kullanıcı adı veya NFC ile ekleyebilirsin.',
                    style: TextStyle(color: Color(0xFFb0b0b8)),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, i) {
                final r = list[i];
                final peer = r.peerUid(me);
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    title: FutureBuilder<Map<String, dynamic>?>(
                      future: svc.getUserPublicFields(peer),
                      builder: (context, fs) {
                        final n = fs.data?['name'] as String? ?? 'Kullanıcı';
                        return Text(n, style: const TextStyle(fontWeight: FontWeight.w600));
                      },
                    ),
                    subtitle: FutureBuilder<Map<String, dynamic>?>(
                      future: svc.getUserPublicFields(peer),
                      builder: (context, fs) {
                        final un = fs.data?['username'] as String?;
                        if (r.sharedDahiosId.isNotEmpty) {
                          return Text('dahiOS: ${r.sharedDahiosId}');
                        }
                        if (un != null && un.isNotEmpty) {
                          return Text('@$un');
                        }
                        return const Text('Kullanıcı adı ile eklendi');
                      },
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () async {
                      final pub = await svc.getUserPublicFields(peer);
                      final name = pub?['name'] as String? ?? '';
                      if (!context.mounted) return;
                      context.push(
                        FriendsScreen._friendProfileLocation(peer, r.sharedDahiosId, name),
                      );
                    },
                  ),
                );
              },
            );
          },
        );
      },
    );
  }
}

class _UsernameFriendSearchDialog extends StatefulWidget {
  const _UsernameFriendSearchDialog();

  @override
  State<_UsernameFriendSearchDialog> createState() => _UsernameFriendSearchDialogState();
}

class _UsernameFriendSearchDialogState extends State<_UsernameFriendSearchDialog> {
  final _ctrl = TextEditingController();
  final _svc = FriendService();
  List<QueryDocumentSnapshot<Map<String, dynamic>>> _hits = [];
  bool _searching = false;
  String? _err;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _searching = true;
      _err = null;
      _hits = [];
    });
    try {
      final list = await _svc.searchUsersByUsernamePrefix(_ctrl.text);
      if (!mounted) return;
      setState(() {
        _hits = list;
        _searching = false;
        if (list.isEmpty) {
          _err = 'Sonuç yok. En az 2 karakter yaz; kullanıcı adı profilde otomatik atanır.';
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _searching = false;
        _err = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Kullanıcı adı ile ara'),
      content: SizedBox(
        width: double.maxFinite,
        height: 340,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _ctrl,
              autofocus: true,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Örn: ahmet',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: _searching ? null : _search,
                ),
              ),
              onSubmitted: (_) {
                if (!_searching) _search();
              },
            ),
            if (_err != null) ...[
              const SizedBox(height: 8),
              Text(
                _err!,
                style: const TextStyle(fontSize: 12, color: Colors.orangeAccent),
              ),
            ],
            const SizedBox(height: 8),
            Expanded(
              child: _searching
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: _hits.length,
                      itemBuilder: (context, i) {
                        final d = _hits[i];
                        final m = d.data();
                        final display = m['name'] as String? ?? 'Kullanıcı';
                        final u = (m['username'] as String?)?.trim() ?? '';
                        final label = u.isNotEmpty ? '@$u' : display;
                        return ListTile(
                          title: Text(display),
                          subtitle: u.isNotEmpty ? Text('@$u') : null,
                          onTap: () {
                            Navigator.pop(context, {
                              'uid': d.id,
                              'label': label,
                            });
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Kapat'),
        ),
      ],
    );
  }
}
