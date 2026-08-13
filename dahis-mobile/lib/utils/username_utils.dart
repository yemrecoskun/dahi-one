/// Uygulama içi kullanıcı adı: küçük harf, a-z 0-9 ve alt çizgi (Türkçe harfler dönüştürülür).
class UsernameUtils {
  UsernameUtils._();

  static const Map<String, String> _tr = {
    'ğ': 'g',
    'ü': 'u',
    'ş': 's',
    'ı': 'i',
    'ö': 'o',
    'ç': 'c',
    'Ğ': 'g',
    'Ü': 'u',
    'Ş': 's',
    'İ': 'i',
    'I': 'i',
    'Ö': 'o',
    'Ç': 'c',
  };

  /// Arama / eşleştirme anahtarı (Firestore `usernameLower` ile aynı kurallar).
  static String normalizeUsernameKey(String raw) {
    var s = raw.trim().toLowerCase();
    for (final e in _tr.entries) {
      s = s.replaceAll(e.key, e.value);
    }
    s = s.replaceAll(RegExp(r'[^a-z0-9_]'), '');
    if (s.length > 30) {
      s = s.substring(0, 30);
    }
    return s;
  }

  /// İsim veya e-postadan otomatik kullanıcı adı tabanı (3+ karakter hedeflenir).
  static String slugBaseFromNameOrEmail(String name, String? email) {
    var base = normalizeUsernameKey(name.replaceAll(RegExp(r'\s+'), '_'));
    if (base.isEmpty) {
      final local = email?.split('@').first ?? 'user';
      base = normalizeUsernameKey(local);
    }
    if (base.length < 3) {
      base = '${base}usr';
    }
    if (base.length > 30) {
      base = base.substring(0, 30);
    }
    return base;
  }
}
