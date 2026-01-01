# Google ve Apple Sign-In Kurulum Rehberi

## Google Sign-In Kurulumu

### 1. Firebase Console'da Google Sign-In'i Etkinleştirin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. **Authentication** → **Sign-in method** sekmesine gidin
3. **Google** provider'ını bulun ve **Enable** yapın
4. **Support email** seçin ve **Save** tıklayın

### 2. iOS için Google Sign-In Yapılandırması

#### 2.1. GoogleService-Info.plist Kontrolü

`GoogleService-Info.plist` dosyasının Xcode projesine eklendiğinden emin olun (FIREBASE-FIX.md'ye bakın).

#### 2.2. GIDClientID Ekleme

✅ **GIDClientID `Info.plist` dosyasına eklenmiştir!**

**ÖNEMLİ:** `GIDClientID` değerini Firebase Console'dan almanız gerekiyor:

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. **Project Settings** (⚙️) → **General** sekmesine gidin
3. **Your apps** bölümünde iOS uygulamanızı seçin
4. **OAuth 2.0 Client IDs** bölümünde iOS client ID'sini bulun
5. `ios/Runner/Info.plist` dosyasını açın
6. `GIDClientID` anahtarının değerini bulun ve OAuth client ID ile değiştirin:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com</string>
   ```

**Not:** OAuth client ID genellikle `XXXXX-XXXXX.apps.googleusercontent.com` formatındadır.

#### 2.3. URL Scheme Ekleme

✅ **URL Scheme zaten `Info.plist` dosyasına eklenmiştir!**

Eğer farklı bir Firebase projesi kullanıyorsanız veya değeri güncellemeniz gerekiyorsa:

1. `GoogleService-Info.plist` dosyasını açın
2. `REVERSED_CLIENT_ID` değerini bulun (yoksa `GCM_SENDER_ID` kullanın)
3. `ios/Runner/Info.plist` dosyasını açın
4. `CFBundleURLTypes` bölümündeki `CFBundleURLSchemes` değerini güncelleyin

**Mevcut yapılandırma (Info.plist'te):**
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.412418089622</string>
        </array>
    </dict>
</array>
```

**Not:** 
- Eğer `GoogleService-Info.plist` dosyanızda `REVERSED_CLIENT_ID` varsa, o değeri kullanın
- Yoksa `GCM_SENDER_ID` (412418089622) kullanılarak `com.googleusercontent.apps.412418089622` formatında oluşturulmuştur
- Bu değer Google Sign-In'in geri çağrı (callback) için gereklidir

### 3. Android için Google Sign-In Yapılandırması

Android için `google-services.json` dosyasının doğru yapılandırıldığından emin olun.

## Apple Sign-In Kurulumu

### 1. Apple Developer Console'da Capability Ekleme

1. [Apple Developer](https://developer.apple.com/account/) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → Uygulamanızı seçin (`com.dahis.io`)
3. **Capabilities** sekmesinde **Sign In with Apple** işaretleyin
4. **Save** tıklayın

### 2. Xcode'da Capability Ekleme

1. Xcode'da `ios/Runner.xcworkspace` dosyasını açın
2. Sol panelde **Runner** projesini seçin
3. **Signing & Capabilities** sekmesine gidin
4. **+ Capability** butonuna tıklayın
5. **Sign In with Apple** seçin

### 3. Firebase Console'da Apple Sign-In'i Etkinleştirin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. **Authentication** → **Sign-in method** sekmesine gidin
3. **Apple** provider'ını bulun ve **Enable** yapın
4. **OAuth code flow configuration** bölümünü doldurun:
   - **Services ID**: Apple Developer Console'dan alın
   - **Apple Team ID**: Apple Developer Console'dan alın
   - **Key ID**: Apple Developer Console'dan oluşturduğunuz key'in ID'si
   - **Private Key**: Apple Developer Console'dan indirdiğiniz `.p8` dosyasının içeriği

### 4. Apple Developer Console'da Service ID Oluşturma

1. [Apple Developer](https://developer.apple.com/account/) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → **+** butonuna tıklayın
3. **Services IDs** seçin ve **Continue**
4. **Description** ve **Identifier** girin (örn: `com.dahis.io.signin`)
5. **Sign In with Apple** işaretleyin ve **Configure** tıklayın
6. **Primary App ID** olarak uygulamanızı seçin
7. **Website URLs** bölümüne Firebase callback URL'ini ekleyin:
   - `https://dahisio.firebaseapp.com/__/auth/handler`
8. **Save** ve **Continue** tıklayın
9. **Register** tıklayın

## Test Etme

### Google Sign-In Testi

```bash
cd dahis-mobile
flutter run
```

Uygulamada **Google ile Devam Et** butonuna tıklayın ve Google hesabınızla giriş yapın.

### Apple Sign-In Testi

```bash
cd dahis-mobile
flutter run
```

Uygulamada **Apple ile Devam Et** butonuna tıklayın ve Apple ID'nizle giriş yapın.

**Not:** Apple Sign-In sadece gerçek iOS cihazlarda veya simülatörde test edilebilir (iOS 13+).

## Sorun Giderme

### Google Sign-In Çalışmıyor

1. `GoogleService-Info.plist` dosyasının Xcode projesine eklendiğinden emin olun
2. URL Scheme'in doğru eklendiğinden emin olun
3. Firebase Console'da Google Sign-In'in etkin olduğundan emin olun

### Apple Sign-In Çalışmıyor

1. Xcode'da **Sign In with Apple** capability'sinin eklendiğinden emin olun
2. Apple Developer Console'da capability'nin etkin olduğundan emin olun
3. Firebase Console'da Apple Sign-In yapılandırmasının doğru olduğundan emin olun
4. Service ID'nin doğru yapılandırıldığından emin olun

## Paketler

- `google_sign_in: ^6.2.1` - Google Sign-In için
- `sign_in_with_apple: ^6.1.3` - Apple Sign-In için

Bu paketler `pubspec.yaml` dosyasına eklenmiştir. Yüklemek için:

```bash
cd dahis-mobile
flutter pub get
```

