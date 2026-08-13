import 'dart:convert';
import 'dart:io' show Platform;

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:nfc_manager/nfc_manager.dart';

import '../ios_nfc_service.dart';
import '../services/friend_service.dart';
import '../widgets/custom_toast.dart';

/// Arkadaş eklemek için NFC okutur; sonuç `dahiosId` + `ownerUid` ile geri döner.
class AddFriendScanScreen extends StatefulWidget {
  const AddFriendScanScreen({super.key});

  @override
  State<AddFriendScanScreen> createState() => _AddFriendScanScreenState();
}

class _AddFriendScanScreenState extends State<AddFriendScanScreen> {
  final _friendService = FriendService();
  bool _busy = false;

  Future<void> _scan() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      String nfcId;
      if (Platform.isIOS) {
        nfcId = await IosNfc.startSession();
      } else {
        final r = await showDialog<String>(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => _FriendNfcDialog(
            onCancel: () {
              NfcManager.instance.stopSession().catchError((_) {});
              Navigator.of(ctx).pop();
            },
            onTag: (id) => Navigator.of(ctx).pop(id),
          ),
        );
        if (r == null || r.isEmpty) return;
        nfcId = r;
      }
      if (!mounted) return;
      await _afterNfcId(nfcId.toLowerCase());
    } catch (e) {
      if (mounted) {
        final s = e.toString().toLowerCase();
        if (!s.contains('cancel')) {
          CustomToast.showError(context, 'NFC okunamadı');
        }
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _afterNfcId(String normalizedNfcId) async {
    final me = FirebaseAuth.instance.currentUser?.uid;
    if (me == null) return;

    try {
      final response = await http.get(
        Uri.parse(
          'https://us-central1-dahisio.cloudfunctions.net/dahiosInfo?dahiosId=$normalizedNfcId',
        ),
      );
      if (response.statusCode != 200) {
        if (mounted) CustomToast.showError(context, 'Etiket bulunamadı');
        return;
      }
      final body = json.decode(response.body) as Map<String, dynamic>;
      if (body['status'] != 'success') {
        if (mounted) CustomToast.showError(context, 'Etiket bulunamadı');
        return;
      }
    } catch (_) {
      if (mounted) CustomToast.showError(context, 'Bağlantı hatası');
      return;
    }

    final owner = await _friendService.resolveOwnerUidFromDahios(normalizedNfcId);
    if (!mounted) return;
    if (owner == null) {
      CustomToast.showError(
        context,
        'Bu etiket henüz uygulamada bir hesaba eklenmemiş. Arkadaşın cihazlar bölümünden etiketi eklemesi gerekir.',
      );
      return;
    }
    if (owner == me) {
      CustomToast.showError(context, 'Kendi etiketini taradın');
      return;
    }

    if (mounted) {
      context.pop(<String, String>{
        'dahiosId': normalizedNfcId,
        'ownerUid': owner,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NFC ile arkadaş ekle'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Arkadaşının telefonuna eklediği dahiOS etiketini okut. Etiket, arkadaşının hesabında tanımlı olmalı.',
              style: TextStyle(
                fontSize: 15,
                color: Color(0xFFb0b0b8),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: _busy ? null : _scan,
              icon: _busy
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.nfc),
              label: Text(_busy ? 'Okunuyor…' : 'NFC Tara'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FriendNfcDialog extends StatefulWidget {
  const _FriendNfcDialog({
    required this.onCancel,
    required this.onTag,
  });

  final VoidCallback onCancel;
  final void Function(String nfcId) onTag;

  @override
  State<_FriendNfcDialog> createState() => _FriendNfcDialogState();
}

class _FriendNfcDialogState extends State<_FriendNfcDialog> {
  bool _scanning = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) _start();
    });
  }

  Future<void> _start() async {
    setState(() {
      _scanning = true;
      _error = null;
    });
    try {
      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          try {
            final id = await _extractNfcId(tag);
            await NfcManager.instance.stopSession();
            if (mounted) widget.onTag(id);
          } catch (_) {
            await NfcManager.instance.stopSession();
            if (mounted) {
              setState(() {
                _error = 'Okuma başarısız';
                _scanning = false;
              });
            }
          }
        },
        pollingOptions: {
          NfcPollingOption.iso14443,
          NfcPollingOption.iso15693,
          NfcPollingOption.iso18092,
        },
      );
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'NFC başlatılamadı';
          _scanning = false;
        });
      }
    }
  }

  Future<String> _extractNfcId(NfcTag tag) async {
    String? nfcId;
    final ndef = Ndef.from(tag);
    if (ndef == null) throw Exception('NDEF yok');
    final message = await ndef.read();
    if (message.records.isEmpty) throw Exception('boş');
    for (final record in message.records) {
      if (record.typeNameFormat == NdefTypeNameFormat.nfcWellknown &&
          String.fromCharCodes(record.type) == 'U') {
        final payload = record.payload;
        if (payload.isEmpty) continue;
        final uriString = String.fromCharCodes(payload.skip(1)).trim();
        final uri = Uri.tryParse(uriString);
        if (uri != null && uri.pathSegments.isNotEmpty) {
          nfcId = uri.pathSegments.last.toLowerCase();
          break;
        }
      }
    }
    if (nfcId == null || nfcId.isEmpty) throw Exception('id');
    return nfcId;
  }

  @override
  void dispose() {
    NfcManager.instance.stopSession().catchError((_) {});
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Etiketi okut'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.nfc, size: 64),
          const SizedBox(height: 12),
          if (_scanning)
            const Text('Etiketi yaklaştırın…')
          else if (_error != null)
            Text(_error!, style: const TextStyle(color: Colors.red)),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () async {
            await NfcManager.instance.stopSession().catchError((_) {});
            widget.onCancel();
          },
          child: const Text('İptal'),
        ),
      ],
    );
  }
}
