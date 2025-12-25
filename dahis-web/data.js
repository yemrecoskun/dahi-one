// Sezonlar ve Bölümler Verisi
const seasonsData = {
    season1: {
        id: 'season1',
        title: 'Kristal Şehrin Uyanışı',
        subtitle: 'Sezon 1',
        summary: `Harmonya Şehri, teknolojinin ve doğanın mükemmel birleştiği, renklerin ve ritimlerin hüküm sürdüğü eşsiz bir yer. dahi's One ekibi, her birinin bileğinde özel güçler veren dahi's One saatleriyle şehrin enerjisini düzenliyordu. Ancak bir sabah, şehrin kalbinden gelen neşeli müzik durdu. Dans pistleri boş kaldı, kuşlar şarkı söylemeyi bıraktı ve Harmonya'nın her köşesine bir sessizlik çöktü. Şehrin ritmini çalan efsanevi "Ritmin Kristali" kaybolmuştu! Puls'un liderliğinde, beş kahraman bu gizemi çözmek için yola çıktı. Her bölümde, bir karakterin uzmanlığına ve o renge odaklanan bir meydan okuma onları bekliyor.`,
        episodes: [
            {
                id: 'episode1',
                number: 1,
                title: 'Sessizliğin Başlangıcı',
                character: 'Puls',
                characterColor: '#ff4444',
                summary: 'Harmonya Şehri\'nin o meşhur neşeli atmosferini görürüz. Birden bire zaman durma noktasına gelir ve renkler solmaya başlar. Puls, ekibi "Dahi Karargahı"nda toplar. İlk ipucu Melodi Ormanı\'ndadır.',
                content: `<p>"dahi's One" ekibi, teknolojinin ve doğanın mükemmel birleştiği, renklerin ve ritimlerin hüküm sürdüğü <strong>Harmonya Şehri</strong>'nde yaşıyordu. Her birinin bileğinde, onlara özel güçler veren ve şehrin enerjisini düzenleyen dahi's One saatleri parlıyordu.</p>
                <p>Şehir her zamanki gibi neşeli ve canlıydı. Sokaklarda müzik çalıyor, insanlar dans ediyor, kuşlar şarkı söylüyordu. Her şey mükemmel bir uyum içindeydi.</p>
                <p>Ancak bir sabah, şehrin kalbinden gelen neşeli müzik aniden durdu. Dans pistleri boş kaldı, kuşlar şarkı söylemeyi bıraktı ve Harmonya'nın her köşesine ürkütücü bir sessizlik çöktü. Renkler solmaya başladı, sanki şehrin canı çekilmiş gibiydi.</p>
                <p><strong>Puls</strong>, liderlik ruhuyla hemen ekibi "Dahi Karargahı"nda topladı. Kırmızı saatinden yükselen enerjiyle, "Bu işi biz çözeceğiz! Harmonya'ya ritmini geri getireceğiz!" dedi. "Şehrin ritmini çalan efsanevi Ritmin Kristali kaybolmuş. İlk ipucu Melodi Ormanı'nda. Hemen yola çıkmalıyız!"</p>
                <p>Ekip, bu gizemi çözmek için hazırdı. Beş kahraman, Harmonya'nın kaderini ellerinde tutuyordu.</p>`
            },
            {
                id: 'episode2',
                number: 2,
                title: 'Vigo\'nun Yeşil Labirenti',
                character: 'Vigo',
                characterColor: '#44dd88',
                summary: 'Ekip ormana girer ama orman onları bir yabancı gibi reddeder. Vigo, doğayla bağ kurarak ağaçların neden sustuğunu anlar. Tema: Sabır ve dinlemek. Vigo\'nun yeşil saati, ormanın kalbine giden yolu açar.',
                content: `<p>Ekip, Melodi Ormanı'na doğru yola çıktı. Orman, normalde cıvıl cıvıl şarkılarla dolu olurken, şimdi ürkütücü bir sessizliğe bürünmüştü. Ağaçlar solmuş, çiçekler büzülmüştü.</p>
                <p>Ormana girdiklerinde, garip bir şey oldu. Ağaçlar sanki onları tanımıyordu. Dallar yollarını kapatıyor, kökler ayaklarının altında büyüyordu. Orman, onları bir yabancı gibi reddediyordu.</p>
                <p><strong>Zest</strong>, hemen tırmanmaya kalktı ama <strong>Vigo</strong> onu durdurdu. "Dur Zest! Bu orman acı çekiyor. Onu dinlemeliyiz, zorlamamalıyız."</p>
                <p><strong>Vigo</strong>, yeşil saatinden yayılan sakinleştirici enerjiyle, bir ağaca dokundu. Gözlerini kapattı ve doğanın sesini dinlemeye başladı. "Melodi Ormanı... Orada denge çok önemlidir. Kristal kaybolduğunda, doğanın dengesi de bozulmuş olabilir."</p>
                <p>Yeşil saatinden çıkan parıltıyla havayı kokladı. "Bir şeyler hissediyorum... Bir yankı, bir iz... Orman bize bir şey söylemeye çalışıyor ama biz dinlemiyoruz."</p>
                <p>Vigo, sabırla ve saygıyla doğayla bağ kurdu. Ağaçlar yavaşça yollarını açmaya başladı. Yeşil saati parladı ve ormanın kalbine giden gizli bir yol ortaya çıktı. "Sabır ve dinlemek... İşte anahtar bu."</p>
                <p>Ekip, Vigo'nun açtığı yoldan ilerledi. Orman artık onları kabul etmişti.</p>`
            },
            {
                id: 'episode3',
                number: 3,
                title: 'Aura\'nın Mavi Stratejisi',
                character: 'Aura',
                characterColor: '#4488ff',
                summary: 'Mağaraya girerlerken karmaşık, lazer benzeri bir güvenlik sistemiyle karşılaşırlar. Aura, duygularını bir kenara bırakıp saf mantıkla bu teknolojik bulmacayı çözer. Tema: Odaklanma. Aura\'nın mavi ekranı, görünmez lazerleri ve frekansları görünür kılar.',
                content: `<p>Ormanın derinliklerinde, gizli bir mağaranın girişini buldular. Ancak mağaraya girmek o kadar kolay değildi. Önlerinde karmaşık, lazer benzeri bir güvenlik sistemi vardı. Görünmez ışınlar havada dans ediyor, her yanlış adımda alarm çalıyordu.</p>
                <p><strong>Zest</strong>, "Hadi içeri atlayalım!" diye heyecanla atıldı ama <strong>Aura</strong> onu durdurdu. "Dur! Bu sistem çok hassas. Bir hata yaparsak, tüm mağara çökebilir."</p>
                <p><strong>Aura</strong>, haritasını açmış, sakin ve odaklanmış bir şekilde durumu değerlendiriyordu. Mavi saatinden yayılan enerji, etrafı aydınlattı. "Termal sensörlerime göre, kristalin enerjisi buradan yayılan garip bir frekansla karışıyor. Bu frekans, doğal ritimleri bastırıyor."</p>
                <p>Aura, duygularını bir kenara bıraktı. Saf mantık ve stratejiyle, mavi ekranından görünmez lazerleri ve frekansları görünür kıldı. "Her lazerin bir deseni var. Sadece doğru zamanlamayla geçebiliriz."</p>
                <p>Mavi saatinden çıkan hologramik harita, ekibe güvenli yolu gösterdi. Aura, mükemmel odaklanmayla, her adımı hesapladı. "Şimdi! Adım at!" diye komut verdi.</p>
                <p>Ekip, Aura'nın rehberliğinde güvenlik sistemini geçti. "Odaklanma ve mantık... İşte başarının anahtarı."</p>`
            },
            {
                id: 'episode4',
                number: 4,
                title: 'Lumo\'nun Işık Oyunu',
                character: 'Lumo',
                characterColor: '#ffdd44',
                summary: 'Karanlık bir koridorda, sadece belirli renk paletlerine basarak ilerlemeleri gereken bir "renk köprüsü" vardır. Lumo, hayal gücünü kullanarak doğru renk kombinasyonlarını oluşturur. Tema: Yaratıcılık. Lumo\'nun sarı saati, karanlığı bir sanat eserine dönüştürür.',
                content: `<p>Mağaranın derinliklerinde, karanlık bir koridora girdiler. Önlerinde, sadece belirli renk paletlerine basarak ilerleyebilecekleri bir "renk köprüsü" vardı. Yanlış renge basarlarsa, köprü çökebilirdi.</p>
                <p><strong>Puls</strong>, "Bu çok riskli! Hangi renklere basmalıyız?" diye sordu.</p>
                <p><strong>Lumo</strong>, gözlerini parlatarak yaklaştı. "Aaa, tam da Lumo'luk bir iş! Sanatsal bir bulmaca!" Sarı saatinden çıkan yaratıcı enerjiyle, köprünün üzerindeki renkleri incelemeye başladı.</p>
                <p>"Her renk bir nota gibi... Sadece doğru kombinasyonu bulmalıyız!" Lumo, hayal gücünü kullanarak, renklerin arasındaki uyumu görüyordu. "Kırmızı tutku, mavi sakinlik, yeşil denge... Bunları birleştirince ne olur?"</p>
                <p>Sarı saatinden fışkıran enerji, karanlığı aydınlattı. Lumo, renkleri bir sanat eseri gibi düzenledi. "İşte bu! Her renk bir hikaye anlatıyor. Sadece onları dinlememiz gerekiyor!"</p>
                <p>Lumo'nun yaratıcı zekasıyla, doğru renk kombinasyonunu buldular. Köprü, güzel bir ışık gösterisiyle parladı. "Yaratıcılık... İşte karanlığı aydınlatan şey!"</p>
                <p>Ekip, Lumo'nun açtığı renkli yoldan geçti. Karanlık koridor, bir sanat galerisine dönüşmüştü.</p>`
            },
            {
                id: 'episode5',
                number: 5,
                title: 'Zest\'in Turuncu Kaçışı',
                character: 'Zest',
                characterColor: '#ff8844',
                summary: 'Kristale ulaşmak üzereyken yer sarsılmaya başlar ve devasa kaya parçaları düşer. Zest, inanılmaz hızı ve enerjisiyle herkesi tehlikeli bölgeden tek tek dışarı çıkarır. Tema: Cesaret ve Refleks. Zest\'in turuncu saati, ona süper hız verir.',
                content: `<p>Kristale ulaşmak üzereydiler. Mağaranın en derin odasına girdiler ve ortada, küçük bir kürsünün üzerinde, soluk bir şekilde parlayan Ritmin Kristali'ni gördüler.</p>
                <p>"İşte bu!" diye fısıldadı <strong>Puls</strong>. Ancak tam o anda, yer sarsılmaya başladı. Mağaranın tavanından devasa kaya parçaları düşmeye başladı!</p>
                <p>"Mağara çöküyor!" diye bağırdı <strong>Aura</strong>. "Hemen dışarı çıkmalıyız!"</p>
                <p>Ama kristal hala oradaydı. Onu almadan gidemezlerdi. <strong>Zest</strong>, yerinde duramıyordu. "Ben giderim! En hızlı benim!"</p>
                <p>Turuncu saatinden yansıyan enerjiyle, Zest süper hıza ulaştı. Sanki zaman yavaşlamış gibiydi. Her kaya parçasının düşüşünü görüyor, her açıklığı buluyordu.</p>
                <p>Zest, kristali aldı ve geri döndü. Ama ekip hala içerideydi. "Hepinizi çıkaracağım!" diye bağırdı.</p>
                <p>Turuncu saatinden çıkan enerjiyle, Zest herkesi tek tek tehlikeli bölgeden dışarı çıkardı. İnanılmaz refleksleri ve cesaretiyle, herkesi güvenli bir yere taşıdı.</p>
                <p>"Cesaret ve refleks... İşte kahramanlığın anahtarı!" diye neşeyle bağırdı Zest, kristali havaya kaldırarak.</p>
                <p>Ekip güvendi ama mağara çökmüştü. Kristal onlardaydı ama hala bir sorun vardı...</p>`
            },
            {
                id: 'episode6',
                number: 6,
                title: 'Büyük Senfoni',
                character: 'All',
                characterColor: '#667eea',
                summary: 'Gölge Varlıklarla yüzleşme anı. Sadece tek bir karakterin gücü yetmez. Beş saatin de birbirine bağlanması (Dahi-Link) gerekir. Kristal yerine takılır, şehir eski haline döner ama yeni bir tehdit ufukta görünür...',
                content: `<p>Kristali aldılar ama mağaradan çıktıklarında, karşılarında ritmi emen gölge benzeri varlıklar belirdi. Bu varlıklar, kristalin gücünü çalmaya çalışıyordu.</p>
                <p>"İşte bu!" diye fısıldadı <strong>Puls</strong>. "Kristali korumalıyız ama önce bu gölgeleri def etmeliyiz."</p>
                <p><strong>Aura</strong>, mavi saatinden bir plan yayınladı. "Bu gölgeler, düzensiz frekanslarla besleniyor. Eğer Harmonya'nın gerçek ritmini geri getirebilirsek, dağılırlar. Ama tek başına hiçbirimiz yeterli değiliz."</p>
                <p><strong>Vigo</strong>, mağaranın nemli duvarlarından çıkan bitkilere dokundu. "Bitkiler bile acı çekiyor. Doğanın sesi, kristal olmadan tam değil." Yeşil saatinden yayılan rahatlatıcı enerjiyle, solmuş bir çiçeği canlandırdı.</p>
                <p><strong>Zest</strong>, "Peki nasıl bir ritim?" diye sordu. "En eğlenceli ritim olsun!"</p>
                <p>Kırmızı saatinden yansıyan enerjiyle <strong>Puls</strong>, "Hepimizden gelen ritim! Harmonya'nın ruhu, neşe, uyum ve cesaretle beslenir!" diye bağırdı. "Beş saati birleştirmeliyiz! Dahi-Link!"</p>
                <p>Ekip, yan yana geldi. <strong>Puls</strong>, cesaretin ritmini kalbinden akıttı. <strong>Zest</strong>, neşenin ve maceranın enerjisini etrafa saçtı. <strong>Aura</strong>, mükemmel zamanlamayla notaları ayarladı. <strong>Vigo</strong>, doğanın sakinleştirici frekanslarını yaydı. Ve <strong>Lumo</strong>, tüm bu elementleri bir araya getirerek, Harmonya'nın eşsiz, canlandırıcı melodisini yarattı.</p>
                <p>Beş dahi's One saati de aynı anda parladı ve güçleri birleşerek devasa bir ses dalgası yarattı. Bu dalga, gölge varlıklara çarptığında, onlar bir duman gibi dağıldılar. Ritmin Kristali, göz kamaştırıcı bir ışıkla parlamaya başladı ve etrafa neşeli bir melodi yayıldı.</p>
                <p>Ritmin Kristali'ni alan dahi's One ekibi, Harmonya'ya döndüğünde, şehir tekrar neşe ve müzikle dolup taşıyordu. dahi's One'lar, sadece bir saatin ötesinde, Harmonya'nın kalbini ve ruhunu koruyan gerçek kahramanlar olmuşlardı.</p>
                <p>Herkes, beş renkli kahramanın cesaretini, zekasını ve işbirliğini kutluyordu. Onlar, dahi's One saatlerinin gücüyle, Harmonya'nın ritmini sonsuza dek koruyacaklardı.</p>
                <p>Ancak ufukta, yeni bir tehdit belirmeye başlamıştı... Şehir güvendeydi ama macera henüz bitmemişti.</p>`
            }
        ]
    }
};

