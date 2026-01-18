# Google Sign-In Capability Ekleme

Google Sign-In crash'ini önlemek için Xcode'da capability eklemeniz gerekiyor.

## Adımlar:

1. **Xcode'u açın:**
   ```bash
   open dahis-mobile/ios/Runner.xcworkspace
   ```

2. **Runner target'ını seçin:**
   - Sol panelde "Runner" projesine tıklayın
   - "TARGETS" altında "Runner" seçin

3. **Signing & Capabilities sekmesine gidin:**
   - Üst menüden "Signing & Capabilities" sekmesini seçin

4. **Google Sign-In capability'sini ekleyin:**
   - Sol üstteki "+ Capability" butonuna tıklayın
   - Arama kutusuna "Sign in with Google" yazın
   - "Sign in with Google" seçeneğini seçin
   - Eğer "Sign in with Google" görünmüyorsa, "Google Sign-In" arayın

5. **Kontrol edin:**
   - Capability listesinde "Sign in with Google" görünmeli
   - Eğer hata varsa, GoogleService-Info.plist dosyasının doğru yapılandırıldığından emin olun

## Alternatif: Manuel Entitlements Ekleme

Eğer Xcode'da capability ekleyemiyorsanız, `Runner.entitlements` dosyasına manuel olarak ekleyebilirsiniz:

```xml
<key>com.apple.developer.signinwithgoogle</key>
<true/>
```

**Not:** Google Sign-In için genellikle capability eklemek gerekmez, ancak bazı durumlarda gerekebilir. Asıl önemli olan:
- GoogleService-Info.plist dosyasının doğru yapılandırılması
- Info.plist'teki GIDClientID ve URL scheme'lerin doğru olması
