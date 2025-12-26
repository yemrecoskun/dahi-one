// API Base URL
const API_BASE = 'https://us-central1-dahisio.cloudfunctions.net';

// Generate dahiOS Redirect URL
function generateDahiosUrl(characterId, redirectType, customUrl) {
    switch (redirectType) {
        case 'character':
            return `https://dahis.io/?character=${characterId}`;
        case 'store':
            return `https://dahis.shop/one-${characterId}`;
        case 'campaign':
            return customUrl || 'https://dahis.io';
        default:
            return `https://dahis.io/?character=${characterId}`;
    }
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Redirect Type Change Handler
document.getElementById('redirectType').addEventListener('change', (e) => {
    const customUrlGroup = document.getElementById('customUrlGroup');
    if (e.target.value === 'campaign') {
        customUrlGroup.style.display = 'block';
        document.getElementById('customUrl').required = true;
    } else {
        customUrlGroup.style.display = 'none';
        document.getElementById('customUrl').required = false;
    }
});

// Create Form
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resultDiv = document.getElementById('createResult');
    resultDiv.className = 'result loading';
    resultDiv.textContent = 'Tag oluşturuluyor';
    resultDiv.style.display = 'block';
    
    const formData = {
        characterId: document.getElementById('characterId').value,
        redirectType: document.getElementById('redirectType').value,
        isActive: document.getElementById('isActive').checked,
    };
    
    if (formData.redirectType === 'campaign') {
        formData.customUrl = document.getElementById('customUrl').value;
    }
    
    try {
        const response = await fetch(`${API_BASE}/dahiosCreate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const redirectUrl = generateDahiosUrl(
                data.data.characterId,
                data.data.redirectType,
                data.data.customUrl
            );
            const dahiosRedirectUrl = `${API_BASE}/dahiosRedirect?dahiosId=${encodeURIComponent(data.data.dahiosId || data.data.nfcId)}`;
            
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>✅ Tag başarıyla oluşturuldu!</strong><br>
                <div style="margin-top: 15px;">
                    <div style="margin-bottom: 15px;">
                        <strong>dahiOS ID (UUID):</strong><br>
                        <code style="background: #fff; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 5px; font-size: 0.9rem; word-break: break-all;">${data.data.dahiosId || data.data.nfcId}</code>
                        <button onclick="copyToClipboard('${data.data.dahiosId || data.data.nfcId}')" style="margin-left: 10px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Kopyala</button>
                    </div>
                    <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                        <strong>🔗 dahiOS Redirect URL (Backend):</strong><br>
                        <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <code style="background: #fff; padding: 8px; border-radius: 4px; font-size: 0.85rem; word-break: break-all; flex: 1; min-width: 200px;">${dahiosRedirectUrl}</code>
                            <button onclick="copyToClipboard('${dahiosRedirectUrl}')" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">Kopyala</button>
                            <a href="${dahiosRedirectUrl}" target="_blank" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; white-space: nowrap;">Test Et</a>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px; padding: 15px; background: #e7f3ff; border-radius: 8px; border-left: 4px solid #4488ff;">
                        <strong>🌐 Yönlendirme URL (Hedef):</strong><br>
                        <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <code style="background: #fff; padding: 8px; border-radius: 4px; font-size: 0.85rem; word-break: break-all; flex: 1; min-width: 200px;">${redirectUrl}</code>
                            <button onclick="copyToClipboard('${redirectUrl}')" style="padding: 6px 12px; background: #4488ff; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">Kopyala</button>
                            <a href="${redirectUrl}" target="_blank" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; white-space: nowrap;">Aç</a>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; color: #666; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                        <strong>Karakter:</strong> ${data.data.characterId}<br>
                        <strong>Yönlendirme Tipi:</strong> ${data.data.redirectType}<br>
                        <strong>Durum:</strong> ${data.data.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                </div>
            `;
            
            // Reset form
            document.getElementById('createForm').reset();
            document.getElementById('isActive').checked = true;
            document.getElementById('customUrlGroup').style.display = 'none';
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = `❌ Hata: ${data.message || 'Bilinmeyen hata'}`;
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = `❌ Bağlantı hatası: ${error.message}`;
    }
});

// Info Form
document.getElementById('infoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resultDiv = document.getElementById('infoResult');
    const nfcId = document.getElementById('infoNfcId').value.trim();
    
    resultDiv.className = 'result loading';
    resultDiv.textContent = 'Bilgi getiriliyor';
    resultDiv.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE}/dahiosInfo?dahiosId=${encodeURIComponent(nfcId)}`);
        const data = await response.json();
        
        if (response.ok) {
            // Get full tag info to determine redirect URL
            const dahiosId = data.data.dahiosId || data.data.nfcId;
            const redirectUrl = generateDahiosUrl(
                data.data.characterId,
                data.data.redirectType,
                data.data.customUrl || null
            );
            const dahiosRedirectUrl = `${API_BASE}/dahiosRedirect?dahiosId=${encodeURIComponent(dahiosId)}`;
            
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>✅ Tag Bilgileri</strong><br>
                <div style="margin-top: 15px;">
                    <div style="margin-bottom: 15px;">
                        <strong>dahiOS ID (UUID):</strong><br>
                        <code style="background: #fff; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 5px; font-size: 0.9rem; word-break: break-all;">${dahiosId}</code>
                        <button onclick="copyToClipboard('${dahiosId}')" style="margin-left: 10px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Kopyala</button>
                    </div>
                    <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                        <strong>🔗 dahiOS Redirect URL (Backend):</strong><br>
                        <code style="background: #fff; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 5px; font-size: 0.85rem; word-break: break-all; max-width: 100%;">${dahiosRedirectUrl}</code>
                        <button onclick="copyToClipboard('${dahiosRedirectUrl}')" style="margin-left: 10px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Kopyala</button>
                        <a href="${dahiosRedirectUrl}" target="_blank" style="margin-left: 10px; padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block;">Test Et</a>
                    </div>
                    <div style="margin-bottom: 15px; padding: 15px; background: #e7f3ff; border-radius: 8px; border-left: 4px solid #4488ff;">
                        <strong>🌐 Yönlendirme URL (Hedef):</strong><br>
                        <code style="background: #fff; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 5px; font-size: 0.85rem; word-break: break-all; max-width: 100%;">${redirectUrl}</code>
                        <button onclick="copyToClipboard('${redirectUrl}')" style="margin-left: 10px; padding: 6px 12px; background: #4488ff; color: white; border: none; border-radius: 4px; cursor: pointer;">Kopyala</button>
                        <a href="${redirectUrl}" target="_blank" style="margin-left: 10px; padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block;">Aç</a>
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">
                        <div style="margin-bottom: 8px;">
                            <strong>Karakter ID:</strong> ${data.data.characterId}
                        </div>
                        <div style="margin-bottom: 8px;">
                            <strong>Yönlendirme Tipi:</strong> ${data.data.redirectType}
                        </div>
                        <div>
                            <strong>Durum:</strong> 
                            <span style="padding: 4px 12px; border-radius: 20px; background: ${data.data.isActive ? '#d4edda' : '#f8d7da'}; color: ${data.data.isActive ? '#155724' : '#721c24'}; font-size: 0.85rem;">
                                ${data.data.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = `❌ Hata: ${data.message || 'Tag bulunamadı'}`;
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = `❌ Bağlantı hatası: ${error.message}`;
    }
});

// Stats Form
document.getElementById('statsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resultDiv = document.getElementById('statsResult');
    const characterId = document.getElementById('statsCharacterId').value;
    
    resultDiv.className = 'result loading';
    resultDiv.textContent = 'İstatistikler getiriliyor';
    resultDiv.style.display = 'block';
    
    try {
        const url = characterId 
            ? `${API_BASE}/dahiosStats?characterId=${encodeURIComponent(characterId)}`
            : `${API_BASE}/dahiosStats`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.className = 'result info';
            
            if (data.count === 0) {
                resultDiv.innerHTML = '<strong>ℹ️ Henüz scan kaydı bulunmuyor.</strong>';
            } else {
                let html = `
                    <strong>📊 İstatistikler (Toplam: ${data.count} scan)</strong>
                    <table class="stats-table" style="margin-top: 15px;">
                        <thead>
                            <tr>
                                <th>dahiOS ID</th>
                                <th>Karakter</th>
                                <th>Tip</th>
                                <th>IP Adresi</th>
                                <th>Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                data.data.forEach(scan => {
                    // Firestore timestamp formatını parse et
                    let dateStr = 'Bilinmiyor';
                    if (scan.timestamp) {
                        try {
                            let date;
                            if (scan.timestamp.seconds) {
                                // Firestore Timestamp formatı: {seconds: ..., nanoseconds: ...}
                                date = new Date(scan.timestamp.seconds * 1000);
                            } else if (scan.timestamp._seconds) {
                                // Alternatif format
                                date = new Date(scan.timestamp._seconds * 1000);
                            } else if (scan.timestamp instanceof Date) {
                                // Direkt Date objesi
                                date = scan.timestamp;
                            } else if (typeof scan.timestamp === 'string') {
                                // ISO string formatı
                                date = new Date(scan.timestamp);
                            } else if (typeof scan.timestamp === 'number') {
                                // Unix timestamp (milliseconds)
                                date = new Date(scan.timestamp);
                            } else {
                                date = null;
                            }
                            
                            if (date && !isNaN(date.getTime())) {
                                dateStr = date.toLocaleString('tr-TR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                });
                            }
                        } catch (e) {
                            console.error('Date parse error:', e, scan.timestamp);
                        }
                    }
                    
                    const scanId = scan.dahiosId || scan.nfcId || 'N/A';
                    const displayId = scanId !== 'N/A' ? `${scanId.substring(0, 20)}...` : 'N/A';
                    html += `
                        <tr>
                            <td><code style="font-size: 0.85rem;">${displayId}</code></td>
                            <td>${scan.characterId || 'N/A'}</td>
                            <td>${scan.redirectType || 'N/A'}</td>
                            <td>${scan.ipAddress || scan.ip || 'N/A'}</td>
                            <td>${dateStr}</td>
                        </tr>
                    `;
                });
                
                html += `
                        </tbody>
                    </table>
                `;
                
                resultDiv.innerHTML = html;
            }
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = `❌ Hata: ${data.message || 'Bilinmeyen hata'}`;
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = `❌ Bağlantı hatası: ${error.message}`;
    }
});

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('NFC ID kopyalandı!');
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
    });
}

// Load Tag List
async function loadTagList() {
    const listDiv = document.getElementById('tagList');
    const filterCharacter = document.getElementById('filterCharacter').value;
    
    listDiv.innerHTML = '<div class="loading">Tag listesi yükleniyor...</div>';
    
    try {
        const url = filterCharacter 
            ? `${API_BASE}/dahiosList?characterId=${encodeURIComponent(filterCharacter)}`
            : `${API_BASE}/dahiosList`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            if (data.count === 0) {
                listDiv.innerHTML = `
                    <div class="result info">
                        <strong>ℹ️ Henüz tag bulunmuyor.</strong><br>
                        "dahiOS Tag Oluştur" sekmesinden yeni tag oluşturabilirsiniz.
                    </div>
                `;
            } else {
                let html = `
                    <div style="margin-bottom: 15px; font-weight: 600; color: #667eea;">
                        Toplam ${data.count} tag bulundu
                    </div>
                `;
                
                data.data.forEach(tag => {
                    const dahiosId = tag.dahiosId || tag.nfcId;
                    const redirectUrl = generateDahiosUrl(
                        tag.characterId,
                        tag.redirectType,
                        tag.customUrl
                    );
                    const dahiosRedirectUrl = `${API_BASE}/dahiosRedirect?dahiosId=${encodeURIComponent(dahiosId)}`;
                    
                    html += `
                        <div class="tag-item">
                            <div class="tag-item-header">
                                <span class="tag-id">${dahiosId.substring(0, 24)}...</span>
                                <span class="tag-status ${tag.isActive ? 'active' : 'inactive'}">
                                    ${tag.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                            </div>
                            <div class="tag-details">
                                <div class="tag-detail-item">
                                    <span class="tag-detail-label">Karakter</span>
                                    <span class="tag-detail-value">${tag.characterId}</span>
                                </div>
                                <div class="tag-detail-item">
                                    <span class="tag-detail-label">Yönlendirme</span>
                                    <span class="tag-detail-value">${tag.redirectType}</span>
                                </div>
                                <div class="tag-detail-item" style="grid-column: 1 / -1;">
                                    <span class="tag-detail-label">🔗 dahiOS Redirect URL (Backend)</span>
                                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; flex-wrap: wrap;">
                                        <code style="background: #f8f9fa; padding: 6px; border-radius: 4px; font-size: 0.8rem; flex: 1; min-width: 200px; word-break: break-all;">${dahiosRedirectUrl}</code>
                                        <button onclick="copyToClipboard('${dahiosRedirectUrl}')" style="padding: 4px 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; white-space: nowrap;">Kopyala</button>
                                        <a href="${dahiosRedirectUrl}" target="_blank" style="padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; font-size: 0.8rem; white-space: nowrap;">Test Et</a>
                                    </div>
                                </div>
                                <div class="tag-detail-item" style="grid-column: 1 / -1;">
                                    <span class="tag-detail-label">🌐 Yönlendirme URL (Hedef)</span>
                                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; flex-wrap: wrap;">
                                        <code style="background: #f8f9fa; padding: 6px; border-radius: 4px; font-size: 0.8rem; flex: 1; min-width: 200px; word-break: break-all;">${redirectUrl}</code>
                                        <button onclick="copyToClipboard('${redirectUrl}')" style="padding: 4px 8px; background: #4488ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; white-space: nowrap;">Kopyala</button>
                                        <a href="${redirectUrl}" target="_blank" style="padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; font-size: 0.8rem; white-space: nowrap;">Aç</a>
                                    </div>
                                </div>
                                <div class="tag-detail-item" style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                                    <button onclick="openEditTagModal('${dahiosId}', '${tag.characterId}', '${tag.redirectType}', ${tag.isActive}, '${tag.customUrl || ''}')" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; width: 100%;">✏️ Düzenle</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                listDiv.innerHTML = html;
            }
        } else {
            listDiv.innerHTML = `
                <div class="result error">
                    <strong>❌ Hata:</strong> ${data.message || 'Bilinmeyen hata'}<br>
                    <small style="margin-top: 10px; display: block; color: #666;">
                        Endpoint: <code>${API_BASE}/dahiosList</code><br>
                        Backend deploy edildi mi kontrol edin: <code>firebase deploy --only functions:dahisio</code>
                    </small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Tag list error:', error);
        listDiv.innerHTML = `
            <div class="result error">
                <strong>❌ Bağlantı hatası:</strong> ${error.message}<br>
                <small style="margin-top: 10px; display: block; color: #666;">
                    Endpoint: <code>${API_BASE}/dahiosList</code><br>
                    Backend'in çalıştığından ve <code>dahiosList</code> endpoint'inin deploy edildiğinden emin olun.
                </small>
            </div>
        `;
    }
}

// Edit Tag Modal Functions
function openEditTagModal(nfcId, characterId, redirectType, isActive, customUrl) {
    document.getElementById('editNfcId').value = nfcId;
    document.getElementById('editCharacterId').value = characterId;
    document.getElementById('editRedirectType').value = redirectType;
    document.getElementById('editIsActive').checked = isActive;
    document.getElementById('editCustomUrl').value = customUrl || '';
    
    // Show/hide custom URL field
    const customUrlGroup = document.getElementById('editCustomUrlGroup');
    if (redirectType === 'campaign') {
        customUrlGroup.style.display = 'block';
    } else {
        customUrlGroup.style.display = 'none';
    }
    
    // Redirect type change handler
    document.getElementById('editRedirectType').onchange = function() {
        if (this.value === 'campaign') {
            customUrlGroup.style.display = 'block';
        } else {
            customUrlGroup.style.display = 'none';
        }
    };
    
    document.getElementById('editTagModal').style.display = 'block';
    document.getElementById('editTagResult').innerHTML = '';
}

function closeEditTagModal() {
    document.getElementById('editTagModal').style.display = 'none';
    document.getElementById('editTagForm').reset();
}

// Edit Tag Form Submit
document.getElementById('editTagForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resultDiv = document.getElementById('editTagResult');
    const nfcId = document.getElementById('editNfcId').value;
    const characterId = document.getElementById('editCharacterId').value;
    const redirectType = document.getElementById('editRedirectType').value;
    const isActive = document.getElementById('editIsActive').checked;
    const customUrl = document.getElementById('editCustomUrl').value;
    
    resultDiv.className = 'result loading';
    resultDiv.textContent = 'Güncelleniyor...';
    resultDiv.style.display = 'block';
    
    try {
        const updateData = {
            dahiosId: dahiosId,
            characterId: characterId,
            redirectType: redirectType,
            isActive: isActive
        };
        
        if (redirectType === 'campaign' && customUrl) {
            updateData.customUrl = customUrl;
        }
        
        const response = await fetch(`${API_BASE}/dahiosUpdate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>✅ Tag başarıyla güncellendi!</strong><br>
                <div style="margin-top: 10px; font-size: 0.9rem;">
                    <strong>dahiOS ID:</strong> ${data.data.dahiosId || data.data.nfcId}<br>
                    <strong>Karakter:</strong> ${data.data.characterId}<br>
                    <strong>Yönlendirme:</strong> ${data.data.redirectType}<br>
                    <strong>Durum:</strong> ${data.data.isActive ? 'Aktif' : 'Pasif'}
                </div>
            `;
            
            // Reload tag list after 1 second
            setTimeout(() => {
                closeEditTagModal();
                loadTagList();
            }, 1500);
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = `❌ Hata: ${data.message || 'Bilinmeyen hata'}`;
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = `❌ Bağlantı hatası: ${error.message}`;
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editTagModal');
    if (event.target === modal) {
        closeEditTagModal();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('dahi\'s One Admin Panel yüklendi');
    
    // Load tag list when list tab is opened
    const listTab = document.querySelector('[data-tab="list"]');
    if (listTab) {
        listTab.addEventListener('click', () => {
            setTimeout(() => {
                loadTagList();
            }, 100);
        });
    }
    
    // Auto-load tag list if already on list tab
    if (document.getElementById('list').classList.contains('active')) {
        setTimeout(() => loadTagList(), 200);
    }
});

