import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:in_app_purchase_storekit/in_app_purchase_storekit.dart';

class PurchaseService {
  static final PurchaseService _instance = PurchaseService._internal();
  factory PurchaseService() => _instance;
  PurchaseService._internal();

  final InAppPurchase _inAppPurchase = InAppPurchase.instance;
  late StreamSubscription<List<PurchaseDetails>> _subscription;
  bool _isAvailable = false;
  List<ProductDetails> _products = [];
  bool _purchasePending = false;
  
  // Callback for purchase success
  Function(String productId)? onPurchaseSuccess;

  // Product IDs - Her karakter için ayrı product ID
  static const Map<String, String> _productIds = {
    'puls': 'com.dahis.app.character.puls',
    'zest': 'com.dahis.app.character.zest',
    'lumo': 'com.dahis.app.character.lumo',
    'vigo': 'com.dahis.app.character.vigo',
    'aura': 'com.dahis.app.character.aura',
  };

  // Fiyat (TL cinsinden)
  static const double price = 3000.0;

  bool get isAvailable => _isAvailable;
  bool get purchasePending => _purchasePending;
  List<ProductDetails> get products => _products;

  /// In-app purchase'ı başlat
  Future<void> initialize() async {
    _isAvailable = await _inAppPurchase.isAvailable();
    if (!_isAvailable) {
      print('⚠️  In-app purchase kullanılamıyor');
      return;
    }

    // Purchase stream'i dinle
    _subscription = _inAppPurchase.purchaseStream.listen(
      _onPurchaseUpdate,
      onDone: () => _subscription.cancel(),
      onError: (error) => print('Purchase stream error: $error'),
    );

    // Ürünleri yükle
    await loadProducts();
  }

  /// Ürünleri yükle
  Future<void> loadProducts() async {
    if (!_isAvailable) return;

    final Set<String> productIds = _productIds.values.toSet();
    final ProductDetailsResponse response =
        await _inAppPurchase.queryProductDetails(productIds);

    if (response.notFoundIDs.isNotEmpty) {
      print('⚠️  Ürünler bulunamadı: ${response.notFoundIDs}');
    }

    if (response.error != null) {
      print('⚠️  Ürün yükleme hatası: ${response.error}');
      return;
    }

    _products = response.productDetails;
    print('✅ ${_products.length} ürün yüklendi');
  }

  /// Karakter için product ID al
  String? getProductIdForCharacter(String characterId) {
    return _productIds[characterId.toLowerCase()];
  }

  /// Karakter için ürün detayı al
  ProductDetails? getProductForCharacter(String characterId) {
    final productId = getProductIdForCharacter(characterId);
    if (productId == null) return null;
    try {
      return _products.firstWhere(
        (product) => product.id == productId,
      );
    } catch (e) {
      print('⚠️  Ürün bulunamadı: $productId');
      return null;
    }
  }

  /// Satın alma işlemini başlat
  Future<bool> purchaseCharacter(String characterId) async {
    if (!_isAvailable) {
      print('⚠️  In-app purchase kullanılamıyor');
      return false;
    }

    final product = getProductForCharacter(characterId);
    if (product == null) {
      print('⚠️  Ürün bulunamadı: $characterId');
      return false;
    }

    if (_purchasePending) {
      print('⚠️  Zaten bir satın alma işlemi devam ediyor');
      return false;
    }

    try {
      _purchasePending = true;
      final PurchaseParam purchaseParam = PurchaseParam(
        productDetails: product,
      );

      // Platform'a göre satın alma
      if (Platform.isIOS) {
        final InAppPurchaseStoreKitPlatform iosPlatform =
            _inAppPurchase as InAppPurchaseStoreKitPlatform;
        await iosPlatform.buyNonConsumable(purchaseParam: purchaseParam);
      } else if (Platform.isAndroid) {
        final InAppPurchaseAndroidPlatform androidPlatform =
            _inAppPurchase as InAppPurchaseAndroidPlatform;
        await androidPlatform.buyNonConsumable(purchaseParam: purchaseParam);
      }

      return true;
    } catch (e) {
      print('⚠️  Satın alma hatası: $e');
      _purchasePending = false;
      return false;
    }
  }

  /// Satın alma güncellemelerini işle
  void _onPurchaseUpdate(List<PurchaseDetails> purchaseDetailsList) {
    for (final purchaseDetails in purchaseDetailsList) {
      if (purchaseDetails.status == PurchaseStatus.pending) {
        print('⏳ Satın alma bekleniyor...');
      } else {
        if (purchaseDetails.status == PurchaseStatus.error) {
          print('❌ Satın alma hatası: ${purchaseDetails.error}');
          _purchasePending = false;
        } else if (purchaseDetails.status == PurchaseStatus.purchased ||
            purchaseDetails.status == PurchaseStatus.restored) {
          print('✅ Satın alma başarılı!');
          _handleSuccessfulPurchase(purchaseDetails);
        }

        // Satın alma işlemini tamamla
        if (purchaseDetails.pendingCompletePurchase) {
          _inAppPurchase.completePurchase(purchaseDetails);
        }
      }
    }
  }

  /// Başarılı satın alma işlemini işle
  void _handleSuccessfulPurchase(PurchaseDetails purchaseDetails) {
    _purchasePending = false;
    
    // Burada backend'e satın alma doğrulaması yapılabilir
    // Örnek: await _verifyPurchase(purchaseDetails);
    
    print('✅ Satın alma tamamlandı: ${purchaseDetails.productID}');
    
    // Callback'i çağır
    if (onPurchaseSuccess != null) {
      onPurchaseSuccess!(purchaseDetails.productID);
    }
  }

  /// Satın almayı doğrula (backend ile)
  Future<bool> verifyPurchase(PurchaseDetails purchaseDetails) async {
    try {
      // Backend'e satın alma bilgilerini gönder
      // Örnek endpoint: POST /verifyPurchase
      // Body: { productId, purchaseId, transactionDate, receipt }
      
      // Şimdilik true döndür (backend entegrasyonu sonra yapılabilir)
      return true;
    } catch (e) {
      print('⚠️  Satın alma doğrulama hatası: $e');
      return false;
    }
  }

  /// Fiyatı formatla
  static String formatPrice(double price) {
    return '${price.toStringAsFixed(0)} TL';
  }

  /// Temizle
  void dispose() {
    _subscription.cancel();
  }
}

