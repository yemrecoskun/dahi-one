# Firebase Kurulum Rehberi

Flutter uygulamasında Firebase kullanmak için yapılandırma dosyalarını eklemeniz gerekiyor.

## iOS Kurulumu

### 1. Firebase Console'dan `GoogleService-Info.plist` İndirin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. ⚙️ **Project Settings** → **Your apps** bölümüne gidin
3. iOS uygulaması yoksa **Add app** → **iOS** seçin
4. **Bundle ID** girin (Xcode'da `ios/Runner.xcodeproj` açarak görebilirsiniz)
5. `GoogleService-Info.plist` dosyasını indirin

### 2. Dosyayı Projeye Ekleyin

```bash
# İndirdiğiniz GoogleService-Info.plist dosyasını şuraya kopyalayın:
cp ~/Downloads/GoogleService-Info.plist dahis-mobile/ios/Runner/
```

### 3. Xcode'da Dosyayı Ekleyin

1. Xcode'da `ios/Runner.xcworkspace` dosyasını açın
2. `Runner` klasörüne sağ tıklayın → **Add Files to "Runner"...**
3. `GoogleService-Info.plist` dosyasını seçin
4. ✅ **Copy items if needed** işaretleyin
5. ✅ **Add to targets: Runner** işaretli olduğundan emin olun
6. **Add** tıklayın

## Android Kurulumu

### 1. Firebase Console'dan `google-services.json` İndirin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. ⚙️ **Project Settings** → **Your apps** bölümüne gidin
3. Android uygulaması yoksa **Add app** → **Android** seçin
4. **Package name** girin (`android/app/build.gradle` dosyasındaki `applicationId`)
5. `google-services.json` dosyasını indirin

### 2. Dosyayı Projeye Ekleyin

```bash
# İndirdiğiniz google-services.json dosyasını şuraya kopyalayın:
cp ~/Downloads/google-services.json dahis-mobile/android/app/
```

### 3. `android/app/build.gradle` Dosyasını Güncelleyin

`android/app/build.gradle` dosyasının en altına ekleyin:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 4. `android/build.gradle` Dosyasını Güncelleyin

`android/build.gradle` dosyasındaki `dependencies` bölümüne ekleyin:

```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
    // ... diğer classpath'ler
}
```

## Firebase Olmadan Çalıştırma

Uygulama Firebase yapılandırma dosyaları olmadan da çalışır, ancak şu özellikler çalışmaz:
- ❌ Kullanıcı girişi/kayıt
- ❌ Profil ekranı
- ❌ Cihazlarım ekranı
- ❌ Force update kontrolü

Diğer tüm özellikler (karakterler, sezonlar, bölümler, mağaza) normal çalışır.

## Test Etme

Kurulumdan sonra:

```bash
cd dahis-mobile
flutter clean
flutter pub get
flutter run
```

Firebase başarıyla başlatılırsa terminal'de hata mesajı görünmez.

