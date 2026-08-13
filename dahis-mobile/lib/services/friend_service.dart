import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';

import '../utils/username_utils.dart';

class FriendRequestRow {
  FriendRequestRow({
    required this.id,
    required this.fromUid,
    required this.toUid,
    required this.sharedDahiosId,
    required this.status,
  });

  final String id;
  final String fromUid;
  final String toUid;
  final String sharedDahiosId;
  final String status;

  String peerUid(String myUid) => fromUid == myUid ? toUid : fromUid;

  factory FriendRequestRow.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>? ?? {};
    return FriendRequestRow(
      id: doc.id,
      fromUid: d['fromUid'] as String? ?? '',
      toUid: d['toUid'] as String? ?? '',
      sharedDahiosId: (d['sharedDahiosId'] as String? ?? '').toLowerCase(),
      status: d['status'] as String? ?? 'pending',
    );
  }
}

class FriendService {
  FirebaseFirestore? get _db {
    if (Firebase.apps.isEmpty) return null;
    return FirebaseFirestore.instance;
  }

  User? get _user => FirebaseAuth.instance.currentUser;

  String requestDocId(String fromUid, String toUid) => '${fromUid}_$toUid';

  Future<String?> resolveOwnerUidFromDahios(String dahiosId) async {
    final db = _db;
    if (db == null) return null;
    final id = dahiosId.trim().toLowerCase();
    final snap = await db.collection('dahios_user_index').doc(id).get();
    if (!snap.exists) return null;
    return snap.data()?['ownerUid'] as String?;
  }

  Future<Map<String, dynamic>?> getUserPublicFields(String uid) async {
    final db = _db;
    if (db == null) return null;
    final snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return null;
    final d = snap.data()!;
    return {
      'name': d['name'] as String? ?? 'Kullanıcı',
      'email': d['email'] as String? ?? '',
      'username': d['username'] as String?,
      'usernameLower': d['usernameLower'] as String?,
    };
  }

  /// En az 2 karakter; `usernameLower` önek eşleşmesi (kendi hesabın hariç).
  Future<List<QueryDocumentSnapshot<Map<String, dynamic>>>> searchUsersByUsernamePrefix(
    String query,
  ) async {
    final db = _db;
    final me = _user?.uid;
    if (db == null || me == null) return [];

    final q = UsernameUtils.normalizeUsernameKey(query);
    if (q.length < 2) return [];

    final end = '$q\uf8ff';
    final snap = await db
        .collection('users')
        .where('usernameLower', isGreaterThanOrEqualTo: q)
        .where('usernameLower', isLessThan: end)
        .limit(24)
        .get();
    return snap.docs.where((d) => d.id != me).toList();
  }

  /// [sharedDahiosId] boşsa NFC doğrulaması yapılmaz (kullanıcı adı ile ekleme).
  Future<void> sendFriendRequest({
    required String toUid,
    required String sharedDahiosId,
  }) async {
    final db = _db;
    final me = _user?.uid;
    if (db == null || me == null) throw Exception('Oturum gerekli');

    if (toUid == me) throw Exception('Kendine istek gönderemezsin');

    final sid = sharedDahiosId.trim().toLowerCase();
    if (sid.isNotEmpty) {
      final owner = await resolveOwnerUidFromDahios(sid);
      if (owner == null) {
        throw Exception('Bu etiket uygulamada kayıtlı bir kullanıcıya bağlı değil');
      }
      if (owner != toUid) {
        throw Exception('Etiket sahibi ile eşleşmiyor');
      }
    }

    final id = requestDocId(me, toUid);
    final existing = await db.collection('friend_requests').doc(id).get();
    if (existing.exists) {
      final st = existing.data()?['status'] as String? ?? '';
      if (st == 'pending') throw Exception('Bu kullanıcıya zaten istek gönderdin');
      if (st == 'accepted') throw Exception('Zaten arkadaşsınız');
    }

    final reverseId = requestDocId(toUid, me);
    final reverse = await db.collection('friend_requests').doc(reverseId).get();
    if (reverse.exists && (reverse.data()?['status'] as String?) == 'accepted') {
      throw Exception('Zaten arkadaşsınız');
    }

    await db.collection('friend_requests').doc(id).set({
      'fromUid': me,
      'toUid': toUid,
      'status': 'pending',
      'sharedDahiosId': sid,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  Stream<List<FriendRequestRow>> incomingPendingStream() {
    final db = _db;
    final me = _user?.uid;
    if (db == null || me == null) {
      return const Stream.empty();
    }
    return db
        .collection('friend_requests')
        .where('toUid', isEqualTo: me)
        .where('status', isEqualTo: 'pending')
        .snapshots()
        .map((s) => s.docs.map(FriendRequestRow.fromDoc).toList());
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> acceptedAsFromStream() {
    final db = _db;
    final me = _user?.uid;
    if (db == null || me == null) {
      return const Stream.empty();
    }
    return db
        .collection('friend_requests')
        .where('fromUid', isEqualTo: me)
        .where('status', isEqualTo: 'accepted')
        .snapshots();
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> acceptedAsToStream() {
    final db = _db;
    final me = _user?.uid;
    if (db == null || me == null) {
      return const Stream.empty();
    }
    return db
        .collection('friend_requests')
        .where('toUid', isEqualTo: me)
        .where('status', isEqualTo: 'accepted')
        .snapshots();
  }

  Future<void> acceptRequest(String requestDocId) async {
    final db = _db;
    if (db == null || _user == null) return;
    await db.collection('friend_requests').doc(requestDocId).update({
      'status': 'accepted',
      'respondedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> deleteRequestOrFriendship(String requestDocId) async {
    final db = _db;
    if (db == null) return;
    await db.collection('friend_requests').doc(requestDocId).delete();
  }

  Future<void> withdrawOutgoing(String toUid) async {
    final me = _user?.uid;
    if (me == null) return;
    await deleteRequestOrFriendship(requestDocId(me, toUid));
  }
}
