// Get season ID from URL parameter
function getSeasonIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'season1'; // Default to season1
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const seasonId = getSeasonIdFromURL();
    loadSeasonDetail(seasonId);
    setupNavigation();
    setupScrollEffects();
});

// Load Season Detail
function loadSeasonDetail(seasonId) {
    const season = seasonsData[seasonId];
    if (!season) {
        // If season not found, redirect to home
        window.location.href = 'index.html';
        return;
    }

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

    // Hide season detail
    document.querySelector('.season-detail-section').style.display = 'none';
    
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
        <button class="episode-nav-btn back-to-season" onclick="backToSeasonDetail()">
            Sezona Dön
        </button>
        <button class="episode-nav-btn next-episode" ${!nextEpisode ? 'disabled' : ''} 
                ${nextEpisode ? `onclick="showEpisodeDetail('${seasonId}', '${nextEpisode.id}')"` : ''}>
            Sonraki Bölüm <span>→</span>
        </button>
    `;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToSeasonDetail() {
    document.getElementById('episodeDetail').style.display = 'none';
    document.querySelector('.season-detail-section').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation Setup
function setupNavigation() {
    // Back to seasons button
    const backToSeasonsBtn = document.getElementById('backToSeasons');
    if (backToSeasonsBtn) {
        backToSeasonsBtn.addEventListener('click', () => {
            window.location.href = 'index.html#seasons';
        });
    }

    // Back to season button (in episode detail)
    const backToSeasonBtn = document.getElementById('backToSeason');
    if (backToSeasonBtn) {
        backToSeasonBtn.addEventListener('click', () => {
            backToSeasonDetail();
        });
    }

    // Home button
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

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
}

// Keyboard navigation for episodes
document.addEventListener('keydown', (e) => {
    const episodeDetail = document.getElementById('episodeDetail');
    if (episodeDetail.style.display === 'none') return;

    const seasonId = getSeasonIdFromURL();
    const season = seasonsData[seasonId];
    if (!season) return;

    // Get current episode from URL hash or from displayed content
    const urlHash = window.location.hash;
    let currentEpisodeId = null;
    
    if (urlHash) {
        currentEpisodeId = urlHash.replace('#', '');
    } else {
        // Try to get from episode content
        const episodeNumber = document.querySelector('.episode-number-badge')?.textContent;
        if (episodeNumber) {
            const episodeNum = parseInt(episodeNumber.replace('Bölüm ', ''));
            const episode = season.episodes.find(ep => ep.number === episodeNum);
            if (episode) currentEpisodeId = episode.id;
        }
    }

    if (!currentEpisodeId) return;

    const currentIndex = season.episodes.findIndex(ep => ep.id === currentEpisodeId);
    
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
        showEpisodeDetail(seasonId, season.episodes[currentIndex - 1].id);
    } else if (e.key === 'ArrowRight' && currentIndex < season.episodes.length - 1) {
        showEpisodeDetail(seasonId, season.episodes[currentIndex + 1].id);
    }
});

