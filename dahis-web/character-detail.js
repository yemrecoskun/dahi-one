// Character Detail Page Script

// Character Data (from script.js)
const charactersData = {
    puls: {
        name: 'Puls',
        colorCode: '#ff4444',
        image: 'kirmizi.png',
        description: 'Cesur, hızlı karar veren ve liderlik ruhuna sahip tutkulu deha. Kararlı ve motive edici.',
        traits: ['Lider', 'Cesur', 'Tutkulu'],
        fullDescription: 'Puls, Harmonya\'nın en cesur ve kararlı kahramanıdır. Kırmızı dahi\'s One saatiyle, ekibin lideri olarak zorlu durumlarda hızlı kararlar verir ve herkesi motive eder. Tutkusu ve cesaretiyle, en zorlu görevlerin bile üstesinden gelir.',
        stats: { power: 85, intelligence: 90, speed: 80 }
    },
    zest: {
        name: 'Zest',
        colorCode: '#ff8844',
        image: 'turuncu.png',
        description: 'Hiperaktif, sosyal ve macera peşinde koşan enerji küpü. Maceracı ve hevesli.',
        traits: ['Enerjik', 'Sosyal', 'Maceracı'],
        fullDescription: 'Zest, Harmonya\'nın en enerjik ve sosyal kahramanıdır. Turuncu dahi\'s One saatiyle, her zaman pozitif enerji yayar ve ekibi motive eder. Macera dolu görevlerde öncülük eder ve herkesi heyecanlandırır.',
        stats: { power: 75, intelligence: 80, speed: 95 }
    },
    lumo: {
        name: 'Lumo',
        colorCode: '#ffdd44',
        image: 'sari.png',
        description: 'Fikirleri ışık saçan, her zaman neşeli ve yaratıcı zeka. Enerjik ve problem çözücü.',
        traits: ['Yaratıcı', 'Neşeli', 'Problem Çözücü'],
        fullDescription: 'Lumo, Harmonya\'nın en yaratıcı ve neşeli kahramanıdır. Sarı dahi\'s One saatiyle, parlak fikirler üretir ve zorlu problemleri çözer. Her zaman pozitif bir yaklaşımla ekibe ilham verir.',
        stats: { power: 70, intelligence: 95, speed: 75 }
    },
    vigo: {
        name: 'Vigo',
        colorCode: '#44dd88',
        image: 'yesil.png',
        description: 'Doğayı seven, huzurlu ve sürdürülebilir enerji dehası. Bilge ve araştırmacı.',
        traits: ['Bilge', 'Huzurlu', 'Araştırmacı'],
        fullDescription: 'Vigo, Harmonya\'nın en bilge ve huzurlu kahramanıdır. Yeşil dahi\'s One saatiyle, doğayla uyum içinde çalışır ve sürdürülebilir çözümler üretir. Derin düşünceleri ve araştırmacı ruhuyla ekibe rehberlik eder.',
        stats: { power: 80, intelligence: 85, speed: 70 }
    },
    aura: {
        name: 'Aura',
        colorCode: '#4488ff',
        image: 'mavi.png',
        description: 'Odaklanmış, sakin ve stratejik düşünen teknoloji uzmanı. Mantıklı ve planlayıcı.',
        traits: ['Stratejik', 'Odaklanmış', 'Teknoloji Uzmanı'],
        fullDescription: 'Aura, Harmonya\'nın en stratejik ve odaklanmış kahramanıdır. Mavi dahi\'s One saatiyle, teknoloji ve mantık kullanarak karmaşık problemleri çözer. Sakin ve planlı yaklaşımıyla ekibe istikrar kazandırır.',
        stats: { power: 75, intelligence: 90, speed: 85 }
    }
};

// Get character ID from URL
function getCharacterFromUrl() {
    // Check path: /character/{id}
    const pathMatch = window.location.pathname.match(/\/character\/([^\/]+)/);
    if (pathMatch) {
        return pathMatch[1].toLowerCase();
    }
    
    // Check query: ?id={id}
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id')?.toLowerCase() || urlParams.get('character')?.toLowerCase();
}

// Load Character Detail
function loadCharacterDetail() {
    const characterId = getCharacterFromUrl();
    
    if (!characterId) {
        showError('Karakter ID bulunamadı.');
        return;
    }
    
    const character = charactersData[characterId];
    
    if (!character) {
        showError('Karakter bulunamadı: ' + characterId);
        return;
    }
    
    // Update page title
    document.title = `${character.name} - dahi's`;
    
    // Render character detail
    const content = document.getElementById('characterContent');
    content.innerHTML = `
        <div class="character-detail-card">
            <div class="character-detail-image">
                <div class="character-detail-icon-wrapper" style="background: linear-gradient(135deg, ${character.colorCode}, ${character.colorCode}dd);">
                    <img src="${character.image}" alt="${character.name}" class="character-detail-img">
                </div>
            </div>
            <div class="character-detail-info">
                <h1 class="character-detail-name">${character.name}</h1>
                <p class="character-detail-description">${character.fullDescription}</p>
                
                <div class="character-detail-traits">
                    ${character.traits.map(trait => `<span class="character-detail-trait">${trait}</span>`).join('')}
                </div>
                
                <div class="character-detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">Güç</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${character.stats.power}%; background: ${character.colorCode};"></div>
                        </div>
                        <span class="stat-value">${character.stats.power}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Zeka</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${character.stats.intelligence}%; background: ${character.colorCode};"></div>
                        </div>
                        <span class="stat-value">${character.stats.intelligence}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Hız</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${character.stats.speed}%; background: ${character.colorCode};"></div>
                        </div>
                        <span class="stat-value">${character.stats.speed}%</span>
                    </div>
                </div>
                
                <button class="character-detail-buy-btn" onclick="goToStore('${characterId}')">
                    <span>SATIN AL</span>
                    <span class="buy-icon">→</span>
                </button>
                
                <a href="index.html#characters" class="character-detail-back">← Tüm Karakterlere Dön</a>
            </div>
        </div>
    `;
}

// Show Error
function showError(message) {
    const content = document.getElementById('characterContent');
    content.innerHTML = `
        <div class="character-detail-error">
            <h2>Hata</h2>
            <p>${message}</p>
            <a href="index.html#characters" class="character-detail-back">Ana Sayfaya Dön</a>
        </div>
    `;
}

// Go to Store
function goToStore(characterId) {
    window.location.href = 'https://dahis.shop/one-' + characterId;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCharacterDetail();
});

