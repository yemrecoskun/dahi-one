// Routing System
let currentView = 'seasons'; // 'seasons', 'seasonDetail', 'episodeDetail'
let currentSeasonId = null;
let currentEpisodeId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSeasons();
    setupNavigation();
    setupCharacterInteractions();
    setupScrollEffects();
});

// Check URL for character parameter and open modal
function checkUrlForCharacter() {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('character') || urlParams.get('id');
    
    console.log('Checking URL for character:', characterId);
    console.log('charactersData available:', typeof charactersData !== 'undefined');
    
    if (characterId) {
        console.log('Character ID found:', characterId);
        
        // Check if charactersData is loaded
        if (typeof charactersData === 'undefined') {
            console.warn('charactersData not loaded yet, retrying...');
            setTimeout(() => checkUrlForCharacter(), 200);
            return;
        }
        
        if (charactersData[characterId]) {
            console.log('Character found in data, opening modal...');
            // Scroll to characters section first
            const charactersSection = document.getElementById('characters');
            if (charactersSection) {
                setTimeout(() => {
                    charactersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    showCharacterModal(characterId);
                }, 500);
            }, 100);
        } else {
            showCharacterModal(characterId);
        }
        } else {
            console.warn('Character not found in data:', characterId);
            console.log('Available characters:', Object.keys(charactersData));
        }
    }
}

// Update URL when modal opens
function updateUrlForCharacter(characterId) {
    const url = new URL(window.location);
    url.searchParams.set('character', characterId);
    window.history.pushState({ character: characterId }, '', url);
}

// Clean URL when modal closes
function cleanUrlForCharacter() {
    const url = new URL(window.location);
    url.searchParams.delete('character');
    url.searchParams.delete('id');
    window.history.replaceState({}, '', url);
}

// Load Seasons List
function loadSeasons() {
    const seasonsGrid = document.getElementById('seasonsGrid');
    if (!seasonsGrid) return;

    seasonsGrid.innerHTML = '';
    
    Object.values(seasonsData).forEach(season => {
        const seasonCard = createSeasonCard(season);
        seasonsGrid.appendChild(seasonCard);
    });
}

function createSeasonCard(season) {
    const card = document.createElement('div');
    card.className = 'season-card';
    card.addEventListener('click', () => {
        // Navigate to new page
        window.location.href = `season.html?id=${season.id}`;
    });
    
    card.innerHTML = `
        <div class="season-card-glow"></div>
        <div class="season-number">${season.subtitle}</div>
        <h3 class="season-card-title">${season.title}</h3>
        <p class="season-card-summary">${season.summary.substring(0, 150)}...</p>
        <div class="season-card-footer">
            <span class="episode-count">${season.episodes.length} Bölüm</span>
            <span class="view-btn">Detayları Gör →</span>
        </div>
    `;
    
    return card;
}

// Show Season Detail
function showSeasonDetail(seasonId) {
    const season = seasonsData[seasonId];
    if (!season) return;

    // Check if already viewing this season
    const wasSameSeason = currentView === 'seasonDetail' && currentSeasonId === seasonId;
    
    currentView = 'seasonDetail';
    currentSeasonId = seasonId;
    currentEpisodeId = null;

    // Hide sections
    document.getElementById('seasons').style.display = 'none';
    document.getElementById('episodeDetail').style.display = 'none';
    
    // Show season detail
    const seasonDetail = document.getElementById('seasonDetail');
    seasonDetail.style.display = 'block';

    // Load season header
    const seasonHeader = document.getElementById('seasonHeader');
    seasonHeader.innerHTML = `
        <div class="season-number-badge">${season.subtitle}</div>
        <h2 class="season-detail-title">${season.title}</h2>
    `;

    // Load season summary
    const seasonSummary = document.getElementById('seasonSummary');
    seasonSummary.innerHTML = `
        <h3 class="summary-title">Sezon Özeti</h3>
        <p class="summary-text">${season.summary}</p>
    `;

    // Load episodes list
    const episodesList = document.getElementById('episodesList');
    episodesList.innerHTML = '<h3 class="episodes-title">Bölümler</h3><div class="episodes-grid"></div>';
    
    const episodesGrid = episodesList.querySelector('.episodes-grid');
    season.episodes.forEach(episode => {
        const episodeCard = createEpisodeCard(episode, seasonId);
        episodesGrid.appendChild(episodeCard);
    });

    // Scroll to top only if coming from different view or different season
    if (!wasSameSeason) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function createEpisodeCard(episode, seasonId) {
    const card = document.createElement('div');
    card.className = 'episode-card';
    card.addEventListener('click', () => showEpisodeDetail(seasonId, episode.id));
    
    const characterName = episode.character === 'All' ? 'Tüm Ekip' : episode.character;
    
    card.innerHTML = `
        <div class="episode-card-glow" style="--glow-color: ${episode.characterColor};"></div>
        <div class="episode-number">Bölüm ${episode.number}</div>
        <h4 class="episode-card-title">${episode.title}</h4>
        <div class="episode-character" style="color: ${episode.characterColor};">
            <span class="character-icon-small">${characterName}</span>
        </div>
        <p class="episode-card-summary">${episode.summary}</p>
        <div class="episode-card-footer">
            <span class="read-btn">Oku →</span>
        </div>
    `;
    
    return card;
}

// Show Episode Detail
function showEpisodeDetail(seasonId, episodeId) {
    const season = seasonsData[seasonId];
    if (!season) return;

    const episode = season.episodes.find(ep => ep.id === episodeId);
    if (!episode) return;

    // Check if already viewing this episode
    const wasSameEpisode = currentView === 'episodeDetail' && currentSeasonId === seasonId && currentEpisodeId === episodeId;

    currentView = 'episodeDetail';
    currentSeasonId = seasonId;
    currentEpisodeId = episodeId;

    // Hide sections
    document.getElementById('seasons').style.display = 'none';
    document.getElementById('seasonDetail').style.display = 'none';
    
    // Show episode detail
    const episodeDetail = document.getElementById('episodeDetail');
    episodeDetail.style.display = 'block';

    // Load episode content
    const episodeContent = document.getElementById('episodeContent');
    const characterName = episode.character === 'All' ? 'Tüm Ekip' : episode.character;
    
    episodeContent.innerHTML = `
        <div class="episode-header">
            <div class="episode-number-badge">Bölüm ${episode.number}</div>
            <h2 class="episode-detail-title">${episode.title}</h2>
            <div class="episode-character-badge" style="background: ${episode.characterColor};">
                ${characterName}
            </div>
        </div>
        <div class="episode-story-content">
            ${episode.content}
        </div>
    `;

    // Load navigation
    const episodeNavigation = document.getElementById('episodeNavigation');
    const currentIndex = season.episodes.findIndex(ep => ep.id === episodeId);
    const prevEpisode = currentIndex > 0 ? season.episodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < season.episodes.length - 1 ? season.episodes[currentIndex + 1] : null;

    episodeNavigation.innerHTML = `
        <button class="episode-nav-btn prev-episode" ${!prevEpisode ? 'disabled' : ''} 
                ${prevEpisode ? `onclick="showEpisodeDetail('${seasonId}', '${prevEpisode.id}')"` : ''}>
            <span>←</span> Önceki Bölüm
        </button>
        <button class="episode-nav-btn back-to-season" onclick="showSeasonDetail('${seasonId}')">
            Sezona Dön
        </button>
        <button class="episode-nav-btn next-episode" ${!nextEpisode ? 'disabled' : ''} 
                ${nextEpisode ? `onclick="showEpisodeDetail('${seasonId}', '${nextEpisode.id}')"` : ''}>
            Sonraki Bölüm <span>→</span>
        </button>
    `;

    // Scroll to top only if coming from different view or different episode
    if (!wasSameEpisode) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Navigation Setup
function setupNavigation() {
    // Back to seasons button
    const backToSeasonsBtn = document.getElementById('backToSeasons');
    if (backToSeasonsBtn) {
        backToSeasonsBtn.addEventListener('click', () => {
            showSeasonsList();
        });
    }

    // Back to season button (in episode detail)
    const backToSeasonBtn = document.getElementById('backToSeason');
    if (backToSeasonBtn) {
        backToSeasonBtn.addEventListener('click', () => {
            if (currentSeasonId) {
                showSeasonDetail(currentSeasonId);
            }
        });
    }

    // Home button
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            showSeasonsList();
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // If clicking on "Sezonlar" link and already on seasons view, don't scroll
            if (href === '#seasons' && currentView === 'seasons') {
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function showSeasonsList() {
    // Only scroll if coming from different view
    const wasDifferentView = currentView !== 'seasons';
    
    currentView = 'seasons';
    currentSeasonId = null;
    currentEpisodeId = null;

    document.getElementById('seasonDetail').style.display = 'none';
    document.getElementById('episodeDetail').style.display = 'none';
    document.getElementById('seasons').style.display = 'block';

    // Only scroll if we were on a different view
    if (wasDifferentView) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Character Data
const charactersData = {
    puls: {
        name: 'Puls',
        color: 'Kırmızı',
        colorCode: '#ff4444',
        image: 'kirmizi.png',
        description: 'Cesur, hızlı karar veren ve liderlik ruhuna sahip tutkulu deha. Kararlı ve motive edici.',
        traits: ['Lider', 'Cesur', 'Tutkulu'],
        fullDescription: 'Puls, Harmonya\'nın en cesur ve kararlı kahramanıdır. Kırmızı dahi\'s One saatiyle, ekibin lideri olarak zorlu durumlarda hızlı kararlar verir ve herkesi motive eder. Tutkusu ve cesaretiyle, en zorlu görevlerin bile üstesinden gelir.'
    },
    zest: {
        name: 'Zest',
        color: 'Turuncu',
        colorCode: '#ff8844',
        image: 'turuncu.png',
        description: 'Hiperaktif, sosyal ve macera peşinde koşan enerji küpü. Maceracı ve hevesli.',
        traits: ['Enerjik', 'Maceracı', 'Sosyal'],
        fullDescription: 'Zest, Harmonya\'nın enerji kaynağıdır. Turuncu dahi\'s One saatiyle, süper hız ve inanılmaz reflekslere sahiptir. Hiperaktif doğası ve maceracı ruhuyla, ekibin en neşeli üyesidir. Her durumda pozitif enerji yayar.'
    },
    lumo: {
        name: 'Lumo',
        color: 'Sarı',
        colorCode: '#ffdd44',
        image: 'sari.png',
        description: 'Fikirleri ışık saçan, her zaman neşeli ve yaratıcı zeka. Enerjik ve problem çözücü.',
        traits: ['Yaratıcı', 'Neşeli', 'Zeki'],
        fullDescription: 'Lumo, Harmonya\'nın yaratıcı dehasıdır. Sarı dahi\'s One saatiyle, en karmaşık bulmacaları çözer ve sanatsal çözümler üretir. Neşeli kişiliği ve yaratıcı zekasıyla, ekibin problem çözme uzmanıdır.'
    },
    vigo: {
        name: 'Vigo',
        color: 'Yeşil',
        colorCode: '#44dd88',
        image: 'yesil.png',
        description: 'Doğayı seven, huzurlu ve sürdürülebilir enerji dehası. Bilge ve araştırmacı.',
        traits: ['Bilge', 'Huzurlu', 'Doğa Sever'],
        fullDescription: 'Vigo, Harmonya\'nın doğa koruyucusudur. Yeşil dahi\'s One saatiyle, doğayla derin bir bağ kurar ve sürdürülebilir enerji çözümleri üretir. Bilgeliği ve huzurlu doğasıyla, ekibin denge sağlayıcısıdır.'
    },
    aura: {
        name: 'Aura',
        color: 'Mavi',
        colorCode: '#4488ff',
        image: 'mavi.png',
        description: 'Odaklanmış, sakin ve stratejik düşünen teknoloji uzmanı. Mantıklı ve planlayıcı.',
        traits: ['Stratejik', 'Sakin', 'Teknoloji Uzmanı'],
        fullDescription: 'Aura, Harmonya\'nın teknoloji dehasıdır. Mavi dahi\'s One saatiyle, karmaşık sistemleri analiz eder ve stratejik çözümler üretir. Sakin ve odaklanmış doğasıyla, ekibin planlama uzmanıdır.'
    }
};

// Character Interactions
function setupCharacterInteractions() {
    const characterOrbs = document.querySelectorAll('.character-orb');
    const characterCards = document.querySelectorAll('.character-card');

    characterOrbs.forEach(orb => {
        orb.addEventListener('click', () => {
            const character = orb.getAttribute('data-character');
            const targetCard = document.querySelector(`.character-card[data-character="${character}"]`);
            
            if (targetCard) {
                document.getElementById('characters').scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                setTimeout(() => {
                    targetCard.style.transform = 'scale(1.05)';
                    targetCard.style.transition = 'transform 0.3s ease';
                    
                    setTimeout(() => {
                        targetCard.style.transform = '';
                    }, 1000);
                }, 500);
            }
        });
    });

    characterCards.forEach(card => {
        card.addEventListener('click', function() {
            const character = this.getAttribute('data-character');
            showCharacterModal(character);
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Show Character Modal
function showCharacterModal(characterId) {
    console.log('Opening modal for character:', characterId);
    const character = charactersData[characterId];
    if (!character) {
        console.error('Character not found:', characterId);
        return;
    }

    const modal = document.getElementById('characterModal');
    const modalContent = document.getElementById('modalCharacterInfo');

    modalContent.innerHTML = `
        <div class="modal-character-image">
            <div class="modal-icon-wrapper" style="background: linear-gradient(135deg, ${character.colorCode}, ${character.colorCode}dd);">
                <img src="${character.image}" alt="${character.name}" class="modal-character-img">
            </div>
        </div>
        <div class="modal-character-details">
            <div class="modal-character-header">
                <h2 class="modal-character-name">${character.name}</h2>
            </div>
            <p class="modal-character-full-desc">${character.fullDescription}</p>
            <div class="modal-character-traits">
                ${character.traits.map(trait => `<span class="modal-trait">${trait}</span>`).join('')}
            </div>
            <div class="modal-character-stats">
                <div class="stat-item">
                    <span class="stat-label">Güç</span>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: 85%; background: ${character.colorCode};"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Zeka</span>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: 90%; background: ${character.colorCode};"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Hız</span>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: 80%; background: ${character.colorCode};"></div>
                    </div>
                </div>
            </div>
            <button class="buy-button" onclick="goToStore('${characterId}')">
                <span>SATIN AL</span>
                <span class="buy-icon">→</span>
            </button>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update URL
    updateUrlForCharacter(characterId);
}

// Handle browser back button
window.addEventListener('popstate', (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('character') || urlParams.get('id');
    
    if (!characterId) {
        closeCharacterModal();
    }
});

// Close Character Modal
function closeCharacterModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clean URL
    cleanUrlForCharacter();
}

// Go to Store
function goToStore(characterId) {
    window.location.href = 'https://dahis.shop/one-'+characterId;
}

// Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('characterModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeCharacterModal);
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeCharacterModal);
    }
    
    // Check URL for character after everything is loaded
    setTimeout(() => {
        checkUrlForCharacter();
    }, 500);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeCharacterModal();
        }
    });
});

// Scroll Effects
function setupScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }
    });

    // Parallax effect for hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe character cards
    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Observe season cards
    setTimeout(() => {
        const seasonCards = document.querySelectorAll('.season-card');
        seasonCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }, 100);
}

// Keyboard navigation for episodes
document.addEventListener('keydown', (e) => {
    if (currentView === 'episodeDetail' && currentSeasonId && currentEpisodeId) {
        const season = seasonsData[currentSeasonId];
        if (!season) return;

        const currentIndex = season.episodes.findIndex(ep => ep.id === currentEpisodeId);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            showEpisodeDetail(currentSeasonId, season.episodes[currentIndex - 1].id);
        } else if (e.key === 'ArrowRight' && currentIndex < season.episodes.length - 1) {
            showEpisodeDetail(currentSeasonId, season.episodes[currentIndex + 1].id);
        }
    }
});

