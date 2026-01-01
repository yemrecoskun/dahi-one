const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK'yı başlat
let initialized = false;
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  // Service account key dosyası varsa kullan
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Service account key dosyası bulundu ve kullanılıyor');
    initialized = true;
  } catch (error) {
    console.error('⚠️  Service account key dosyası okunamadı:', error.message);
  }
}

if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Environment variable'dan al
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Service account environment variable kullanılıyor');
    initialized = true;
  } catch (error) {
    console.error('⚠️  Environment variable okunamadı:', error.message);
  }
}

if (!initialized) {
  // Application Default Credentials kullan (Firebase Functions içinde çalışıyorsa)
  try {
    // Eğer zaten initialize edilmişse hata vermesin
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    console.log('✅ Application Default Credentials kullanılıyor');
    initialized = true;
  } catch (error) {
    console.error('\n❌ Firebase Admin SDK başlatılamadı!');
    console.error('\nLütfen aşağıdaki yöntemlerden birini kullanın:\n');
    console.error('1. Service Account Key dosyası:');
    console.error('   - Firebase Console > Project Settings > Service Accounts');
    console.error('   - "Generate new private key" butonuna tıklayın');
    console.error(`   - İndirilen JSON dosyasını ${serviceAccountPath} olarak kaydedin\n`);
    console.error('2. Environment Variable:');
    console.error('   export FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account",...}\'\n');
    console.error('3. Firebase Functions içinde çalıştırın (otomatik credentials)\n');
    process.exit(1);
  }
}

const db = admin.firestore();

// Karakter verileri
const charactersData = {
  puls: {
    id: 'puls',
    name: 'Puls',
    color: 'Kırmızı',
    colorCode: '#ff4444',
    image: 'assets/characters/kirmizi.png',
    description: 'Cesur, hızlı karar veren ve liderlik ruhuna sahip tutkulu deha. Kararlı ve motive edici.',
    traits: ['Lider', 'Cesur', 'Tutkulu'],
    fullDescription: 'Puls, Harmonya\'nın en cesur ve kararlı kahramanıdır. Kırmızı dahi\'s One saatiyle, ekibin lideri olarak zorlu durumlarda hızlı kararlar verir ve herkesi motive eder. Tutkusu ve cesaretiyle, en zorlu görevlerin bile üstesinden gelir.'
  },
  zest: {
    id: 'zest',
    name: 'Zest',
    color: 'Turuncu',
    colorCode: '#ff8844',
    image: 'assets/characters/turuncu.png',
    description: 'Hiperaktif, sosyal ve macera peşinde koşan enerji küpü. Maceracı ve hevesli.',
    traits: ['Enerjik', 'Maceracı', 'Sosyal'],
    fullDescription: 'Zest, Harmonya\'nın enerji kaynağıdır. Turuncu dahi\'s One saatiyle, süper hız ve inanılmaz reflekslere sahiptir. Hiperaktif doğası ve maceracı ruhuyla, ekibin en neşeli üyesidir. Her durumda pozitif enerji yayar.'
  },
  lumo: {
    id: 'lumo',
    name: 'Lumo',
    color: 'Sarı',
    colorCode: '#ffdd44',
    image: 'assets/characters/sari.png',
    description: 'Fikirleri ışık saçan, her zaman neşeli ve yaratıcı zeka. Enerjik ve problem çözücü.',
    traits: ['Yaratıcı', 'Neşeli', 'Zeki'],
    fullDescription: 'Lumo, Harmonya\'nın yaratıcı dehasıdır. Sarı dahi\'s One saatiyle, en karmaşık bulmacaları çözer ve sanatsal çözümler üretir. Neşeli kişiliği ve yaratıcı zekasıyla, ekibin problem çözme uzmanıdır.'
  },
  vigo: {
    id: 'vigo',
    name: 'Vigo',
    color: 'Yeşil',
    colorCode: '#44dd88',
    image: 'assets/characters/yesil.png',
    description: 'Doğayı seven, huzurlu ve sürdürülebilir enerji dehası. Bilge ve araştırmacı.',
    traits: ['Bilge', 'Huzurlu', 'Doğa Sever'],
    fullDescription: 'Vigo, Harmonya\'nın doğa koruyucusudur. Yeşil dahi\'s One saatiyle, doğayla derin bir bağ kurar ve sürdürülebilir enerji çözümleri üretir. Bilgeliği ve huzurlu doğasıyla, ekibin denge sağlayıcısıdır.'
  },
  aura: {
    id: 'aura',
    name: 'Aura',
    color: 'Mavi',
    colorCode: '#4488ff',
    image: 'assets/characters/mavi.png',
    description: 'Odaklanmış, sakin ve stratejik düşünen teknoloji uzmanı. Mantıklı ve planlayıcı.',
    traits: ['Stratejik', 'Sakin', 'Teknoloji Uzmanı'],
    fullDescription: 'Aura, Harmonya\'nın teknoloji dehasıdır. Mavi dahi\'s One saatiyle, karmaşık sistemleri analiz eder ve stratejik çözümler üretir. Sakin ve odaklanmış doğasıyla, ekibin planlama uzmanıdır.'
  }
};

// Sezon verileri
const seasonsData = {
  season1: {
    id: 'season1',
    title: 'Kristal Şehrin Uyanışı',
    subtitle: 'Sezon 1',
    summary: 'Harmonya Şehri, teknolojinin ve doğanın mükemmel birleştiği, renklerin ve ritimlerin hüküm sürdüğü eşsiz bir yer. dahi\'s One ekibi, her birinin bileğinde özel güçler veren dahi\'s One saatleriyle şehrin enerjisini düzenliyordu. Ancak bir sabah, şehrin kalbinden gelen neşeli müzik durdu. Dans pistleri boş kaldı, kuşlar şarkı söylemeyi bıraktı ve Harmonya\'nın her köşesine bir sessizlik çöktü. Şehrin ritmini çalan efsanevi "Ritmin Kristali" kaybolmuştu! Puls\'un liderliğinde, beş kahraman bu gizemi çözmek için yola çıktı. Her bölümde, bir karakterin uzmanlığına ve o renge odaklanan bir meydan okuma onları bekliyor.',
    episodes: [
      {
        id: 'episode1',
        number: 1,
        title: 'Sessizliğin Başlangıcı',
        character: 'Puls',
        characterColor: '#ff4444',
        summary: 'Harmonya Şehri\'nin o meşhur neşeli atmosferini görürüz. Birden bire zaman durma noktasına gelir ve renkler solmaya başlar. Puls, ekibi "Dahi Karargahı"nda toplar. İlk ipucu Melodi Ormanı\'ndadır.',
        content: '"dahi\'s One" ekibi, teknolojinin ve doğanın mükemmel birleştiği, renklerin ve ritimlerin hüküm sürdüğü Harmonya Şehri\'nde yaşıyordu. Her birinin bileğinde, onlara özel güçler veren ve şehrin enerjisini düzenleyen dahi\'s One saatleri parlıyordu.\n\nŞehir her zamanki gibi neşeli ve canlıydı. Sokaklarda müzik çalıyor, insanlar dans ediyor, kuşlar şarkı söylüyordu. Her şey mükemmel bir uyum içindeydi.\n\nAncak bir sabah, şehrin kalbinden gelen neşeli müzik aniden durdu. Dans pistleri boş kaldı, kuşlar şarkı söylemeyi bıraktı ve Harmonya\'nın her köşesine ürkütücü bir sessizlik çöktü. Renkler solmaya başladı, sanki şehrin canı çekilmiş gibiydi.\n\nPuls, liderlik ruhuyla hemen ekibi "Dahi Karargahı"nda topladı. Kırmızı saatinden yükselen enerjiyle, "Bu işi biz çözeceğiz! Harmonya\'ya ritmini geri getireceğiz!" dedi. "Şehrin ritmini çalan efsanevi Ritmin Kristali kaybolmuş. İlk ipucu Melodi Ormanı\'nda. Hemen yola çıkmalıyız!"\n\nEkip, bu gizemi çözmek için hazırdı. Beş kahraman, Harmonya\'nın kaderini ellerinde tutuyordu.'
      },
      {
        id: 'episode2',
        number: 2,
        title: 'Vigo\'nun Yeşil Labirenti',
        character: 'Vigo',
        characterColor: '#44dd88',
        summary: 'Ekip ormana girer ama orman onları bir yabancı gibi reddeder. Vigo, doğayla bağ kurarak ağaçların neden sustuğunu anlar. Tema: Sabır ve dinlemek. Vigo\'nun yeşil saati, ormanın kalbine giden yolu açar.',
        content: 'Ekip, Melodi Ormanı\'na doğru yola çıktı. Orman, normalde cıvıl cıvıl şarkılarla dolu olurken, şimdi ürkütücü bir sessizliğe bürünmüştü. Ağaçlar solmuş, çiçekler büzülmüştü.\n\nOrmana girdiklerinde, garip bir şey oldu. Ağaçlar sanki onları tanımıyordu. Dallar yollarını kapatıyor, kökler ayaklarının altında büyüyordu. Orman, onları bir yabancı gibi reddediyordu.\n\nZest, hemen tırmanmaya kalktı ama Vigo onu durdurdu. "Dur Zest! Bu orman acı çekiyor. Onu dinlemeliyiz, zorlamamalıyız."\n\nVigo, yeşil saatinden yayılan sakinleştirici enerjiyle, bir ağaca dokundu. Gözlerini kapattı ve doğanın sesini dinlemeye başladı. "Melodi Ormanı... Orada denge çok önemlidir. Kristal kaybolduğunda, doğanın dengesi de bozulmuş olabilir."\n\nYeşil saatinden çıkan parıltıyla havayı kokladı. "Bir şeyler hissediyorum... Bir yankı, bir iz... Orman bize bir şey söylemeye çalışıyor ama biz dinlemiyoruz."\n\nVigo, sabırla ve saygıyla doğayla bağ kurdu. Ağaçlar yavaşça yollarını açmaya başladı. Yeşil saati parladı ve ormanın kalbine giden gizli bir yol ortaya çıktı. "Sabır ve dinlemek... İşte anahtar bu."\n\nEkip, Vigo\'nun açtığı yoldan ilerledi. Orman artık onları kabul etmişti.'
      },
      {
        id: 'episode3',
        number: 3,
        title: 'Aura\'nın Mavi Stratejisi',
        character: 'Aura',
        characterColor: '#4488ff',
        summary: 'Mağaraya girerlerken karmaşık, lazer benzeri bir güvenlik sistemiyle karşılaşırlar. Aura, duygularını bir kenara bırakıp saf mantıkla bu teknolojik bulmacayı çözer. Tema: Odaklanma. Aura\'nın mavi ekranı, görünmez lazerleri ve frekansları görünür kılar.',
        content: 'Ormanın derinliklerinde, gizli bir mağaranın girişini buldular. Ancak mağaraya girmek o kadar kolay değildi. Önlerinde karmaşık, lazer benzeri bir güvenlik sistemi vardı. Görünmez ışınlar havada dans ediyor, her yanlış adımda alarm çalıyordu.\n\nZest, "Hadi içeri atlayalım!" diye heyecanla atıldı ama Aura onu durdurdu. "Dur! Bu sistem çok hassas. Bir hata yaparsak, tüm mağara çökebilir."\n\nAura, haritasını açmış, sakin ve odaklanmış bir şekilde durumu değerlendiriyordu. Mavi saatinden yayılan enerji, etrafı aydınlattı. "Termal sensörlerime göre, kristalin enerjisi buradan yayılan garip bir frekansla karışıyor. Bu frekans, doğal ritimleri bastırıyor."\n\nAura, duygularını bir kenara bıraktı. Saf mantık ve stratejiyle, mavi ekranından görünmez lazerleri ve frekansları görünür kıldı. "Her lazerin bir deseni var. Sadece doğru zamanlamayla geçebiliriz."\n\nMavi saatinden çıkan hologramik harita, ekibe güvenli yolu gösterdi. Aura, mükemmel odaklanmayla, her adımı hesapladı. "Şimdi! Adım at!" diye komut verdi.\n\nEkip, Aura\'nın rehberliğinde güvenlik sistemini geçti. "Odaklanma ve mantık... İşte başarının anahtarı."'
      },
      {
        id: 'episode4',
        number: 4,
        title: 'Lumo\'nun Işık Oyunu',
        character: 'Lumo',
        characterColor: '#ffdd44',
        summary: 'Karanlık bir koridorda, sadece belirli renk paletlerine basarak ilerlemeleri gereken bir "renk köprüsü" vardır. Lumo, hayal gücünü kullanarak doğru renk kombinasyonlarını oluşturur. Tema: Yaratıcılık. Lumo\'nun sarı saati, karanlığı bir sanat eserine dönüştürür.',
        content: 'Mağaranın derinliklerinde, karanlık bir koridora girdiler. Önlerinde, sadece belirli renk paletlerine basarak ilerleyebilecekleri bir "renk köprüsü" vardı. Yanlış renge basarlarsa, köprü çökebilirdi.\n\nPuls, "Bu çok riskli! Hangi renklere basmalıyız?" diye sordu.\n\nLumo, gözlerini parlatarak yaklaştı. "Aaa, tam da Lumo\'luk bir iş! Sanatsal bir bulmaca!" Sarı saatinden çıkan yaratıcı enerjiyle, köprünün üzerindeki renkleri incelemeye başladı.\n\n"Her renk bir nota gibi... Sadece doğru kombinasyonu bulmalıyız!" Lumo, hayal gücünü kullanarak, renklerin arasındaki uyumu görüyordu. "Kırmızı tutku, mavi sakinlik, yeşil denge... Bunları birleştirince ne olur?"\n\nSarı saatinden fışkıran enerji, karanlığı aydınlattı. Lumo, renkleri bir sanat eseri gibi düzenledi. "İşte bu! Her renk bir hikaye anlatıyor. Sadece onları dinlememiz gerekiyor!"\n\nLumo\'nun yaratıcı zekasıyla, doğru renk kombinasyonunu buldular. Köprü, güzel bir ışık gösterisiyle parladı. "Yaratıcılık... İşte karanlığı aydınlatan şey!"\n\nEkip, Lumo\'nun açtığı renkli yoldan geçti. Karanlık koridor, bir sanat galerisine dönüşmüştü.'
      },
      {
        id: 'episode5',
        number: 5,
        title: 'Zest\'in Turuncu Kaçışı',
        character: 'Zest',
        characterColor: '#ff8844',
        summary: 'Kristale ulaşmak üzereyken yer sarsılmaya başlar ve devasa kaya parçaları düşer. Zest, inanılmaz hızı ve enerjisiyle herkesi tehlikeli bölgeden tek tek dışarı çıkarır. Tema: Cesaret ve Refleks. Zest\'in turuncu saati, ona süper hız verir.',
        content: 'Kristale ulaşmak üzereydiler. Mağaranın en derin odasına girdiler ve ortada, küçük bir kürsünün üzerinde, soluk bir şekilde parlayan Ritmin Kristali\'ni gördüler.\n\n"İşte bu!" diye fısıldadı Puls. Ancak tam o anda, yer sarsılmaya başladı. Mağaranın tavanından devasa kaya parçaları düşmeye başladı!\n\n"Mağara çöküyor!" diye bağırdı Aura. "Hemen dışarı çıkmalıyız!"\n\nAma kristal hala oradaydı. Onu almadan gidemezlerdi. Zest, yerinde duramıyordu. "Ben giderim! En hızlı benim!"\n\nTuruncu saatinden yansıyan enerjiyle, Zest süper hıza ulaştı. Sanki zaman yavaşlamış gibiydi. Her kaya parçasının düşüşünü görüyor, her açıklığı buluyordu.\n\nZest, kristali aldı ve geri döndü. Ama ekip hala içerideydi. "Hepinizi çıkaracağım!" diye bağırdı.\n\nTuruncu saatinden çıkan enerjiyle, Zest herkesi tek tek tehlikeli bölgeden dışarı çıkardı. İnanılmaz refleksleri ve cesaretiyle, herkesi güvenli bir yere taşıdı.\n\n"Cesaret ve refleks... İşte kahramanlığın anahtarı!" diye neşeyle bağırdı Zest, kristali havaya kaldırarak.\n\nEkip güvendi ama mağara çökmüştü. Kristal onlardaydı ama hala bir sorun vardı...'
      },
      {
        id: 'episode6',
        number: 6,
        title: 'Büyük Senfoni',
        character: 'All',
        characterColor: '#667eea',
        summary: 'Gölge Varlıklarla yüzleşme anı. Sadece tek bir karakterin gücü yetmez. Beş saatin de birbirine bağlanması (Dahi-Link) gerekir. Kristal yerine takılır, şehir eski haline döner ama yeni bir tehdit ufukta görünür...',
        content: 'Kristali aldılar ama mağaradan çıktıklarında, karşılarında ritmi emen gölge benzeri varlıklar belirdi. Bu varlıklar, kristalin gücünü çalmaya çalışıyordu.\n\n"İşte bu!" diye fısıldadı Puls. "Kristali korumalıyız ama önce bu gölgeleri def etmeliyiz."\n\nAura, mavi saatinden bir plan yayınladı. "Bu gölgeler, düzensiz frekanslarla besleniyor. Eğer Harmonya\'nın gerçek ritmini geri getirebilirsek, dağılırlar. Ama tek başına hiçbirimiz yeterli değiliz."\n\nVigo, mağaranın nemli duvarlarından çıkan bitkilere dokundu. "Bitkiler bile acı çekiyor. Doğanın sesi, kristal olmadan tam değil." Yeşil saatinden yayılan rahatlatıcı enerjiyle, solmuş bir çiçeği canlandırdı.\n\nZest, "Peki nasıl bir ritim?" diye sordu. "En eğlenceli ritim olsun!"\n\nKırmızı saatinden yansıyan enerjiyle Puls, "Hepimizden gelen ritim! Harmonya\'nın ruhu, neşe, uyum ve cesaretle beslenir!" diye bağırdı. "Beş saati birleştirmeliyiz! Dahi-Link!"\n\nEkip, yan yana geldi. Puls, cesaretin ritmini kalbinden akıttı. Zest, neşenin ve maceranın enerjisini etrafa saçtı. Aura, mükemmel zamanlamayla notaları ayarladı. Vigo, doğanın sakinleştirici frekanslarını yaydı. Ve Lumo, tüm bu elementleri bir araya getirerek, Harmonya\'nın eşsiz, canlandırıcı melodisini yarattı.\n\nBeş dahi\'s One saati de aynı anda parladı ve güçleri birleşerek devasa bir ses dalgası yarattı. Bu dalga, gölge varlıklara çarptığında, onlar bir duman gibi dağıldılar. Ritmin Kristali, göz kamaştırıcı bir ışıkla parlamaya başladı ve etrafa neşeli bir melodi yayıldı.\n\nRitmin Kristali\'ni alan dahi\'s One ekibi, Harmonya\'ya döndüğünde, şehir tekrar neşe ve müzikle dolup taşıyordu. dahi\'s One\'lar, sadece bir saatin ötesinde, Harmonya\'nın kalbini ve ruhunu koruyan gerçek kahramanlar olmuşlardı.\n\nHerkes, beş renkli kahramanın cesaretini, zekasını ve işbirliğini kutluyordu. Onlar, dahi\'s One saatlerinin gücüyle, Harmonya\'nın ritmini sonsuza dek koruyacaklardı.\n\nAncak ufukta, yeni bir tehdit belirmeye başlamıştı... Şehir güvendeydi ama macera henüz bitmemişti.'
      }
    ]
  }
};

async function pushDataToFirestore() {
  try {
    console.log('🚀 Firestore\'a veri push ediliyor...\n');

    // Karakterleri push et
    console.log('📝 Karakterler push ediliyor...');
    const charactersRef = db.collection('characters');
    for (const [id, character] of Object.entries(charactersData)) {
      await charactersRef.doc(id).set(character);
      console.log(`  ✅ ${character.name} eklendi`);
    }

    // Sezonları push et
    console.log('\n📺 Sezonlar push ediliyor...');
    const seasonsRef = db.collection('seasons');
    for (const [id, season] of Object.entries(seasonsData)) {
      // Episodes'ı ayrı bir subcollection olarak ekle
      const { episodes, ...seasonData } = season;
      const seasonDocRef = seasonsRef.doc(id);
      await seasonDocRef.set(seasonData);
      console.log(`  ✅ ${season.title} eklendi`);

      // Episodes'ı ekle
      const episodesRef = seasonDocRef.collection('episodes');
      for (const episode of episodes) {
        await episodesRef.doc(episode.id).set(episode);
        console.log(`    ✅ Bölüm ${episode.number}: ${episode.title}`);
      }
    }

    console.log('\n✨ Tüm veriler başarıyla Firestore\'a push edildi!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

pushDataToFirestore();

