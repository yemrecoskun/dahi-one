class Character {
  final String id;
  final String name;
  final String color;
  final String colorCode;
  final String image;
  final String description;
  final List<String> traits;
  final String fullDescription;

  Character({
    required this.id,
    required this.name,
    required this.color,
    required this.colorCode,
    required this.image,
    required this.description,
    required this.traits,
    required this.fullDescription,
  });

  static Map<String, Character> getCharacters() {
    return {
      'puls': Character(
        id: 'puls',
        name: 'Puls',
        color: 'Kırmızı',
        colorCode: '#ff4444',
        image: 'assets/characters/kirmizi.png',
        description: 'Cesur, hızlı karar veren ve liderlik ruhuna sahip tutkulu deha. Kararlı ve motive edici.',
        traits: ['Lider', 'Cesur', 'Tutkulu'],
        fullDescription: 'Puls, Harmonya\'nın en cesur ve kararlı kahramanıdır. Kırmızı dahi\'s One saatiyle, ekibin lideri olarak zorlu durumlarda hızlı kararlar verir ve herkesi motive eder. Tutkusu ve cesaretiyle, en zorlu görevlerin bile üstesinden gelir.',
      ),
      'zest': Character(
        id: 'zest',
        name: 'Zest',
        color: 'Turuncu',
        colorCode: '#ff8844',
        image: 'assets/characters/turuncu.png',
        description: 'Hiperaktif, sosyal ve macera peşinde koşan enerji küpü. Maceracı ve hevesli.',
        traits: ['Enerjik', 'Maceracı', 'Sosyal'],
        fullDescription: 'Zest, Harmonya\'nın enerji kaynağıdır. Turuncu dahi\'s One saatiyle, süper hız ve inanılmaz reflekslere sahiptir. Hiperaktif doğası ve maceracı ruhuyla, ekibin en neşeli üyesidir. Her durumda pozitif enerji yayar.',
      ),
      'lumo': Character(
        id: 'lumo',
        name: 'Lumo',
        color: 'Sarı',
        colorCode: '#ffdd44',
        image: 'assets/characters/sari.png',
        description: 'Fikirleri ışık saçan, her zaman neşeli ve yaratıcı zeka. Enerjik ve problem çözücü.',
        traits: ['Yaratıcı', 'Neşeli', 'Zeki'],
        fullDescription: 'Lumo, Harmonya\'nın yaratıcı dehasıdır. Sarı dahi\'s One saatiyle, en karmaşık bulmacaları çözer ve sanatsal çözümler üretir. Neşeli kişiliği ve yaratıcı zekasıyla, ekibin problem çözme uzmanıdır.',
      ),
      'vigo': Character(
        id: 'vigo',
        name: 'Vigo',
        color: 'Yeşil',
        colorCode: '#44dd88',
        image: 'assets/characters/yesil.png',
        description: 'Doğayı seven, huzurlu ve sürdürülebilir enerji dehası. Bilge ve araştırmacı.',
        traits: ['Bilge', 'Huzurlu', 'Doğa Sever'],
        fullDescription: 'Vigo, Harmonya\'nın doğa koruyucusudur. Yeşil dahi\'s One saatiyle, doğayla derin bir bağ kurar ve sürdürülebilir enerji çözümleri üretir. Bilgeliği ve huzurlu doğasıyla, ekibin denge sağlayıcısıdır.',
      ),
      'aura': Character(
        id: 'aura',
        name: 'Aura',
        color: 'Mavi',
        colorCode: '#4488ff',
        image: 'assets/characters/mavi.png',
        description: 'Odaklanmış, sakin ve stratejik düşünen teknoloji uzmanı. Mantıklı ve planlayıcı.',
        traits: ['Stratejik', 'Sakin', 'Teknoloji Uzmanı'],
        fullDescription: 'Aura, Harmonya\'nın teknoloji dehasıdır. Mavi dahi\'s One saatiyle, karmaşık sistemleri analiz eder ve stratejik çözümler üretir. Sakin ve odaklanmış doğasıyla, ekibin planlama uzmanıdır.',
      ),
    };
  }
}

