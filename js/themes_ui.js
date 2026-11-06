// Theme UI Logic
const angels = ['white_queen', 'iron_man', 'thor', 'captain_america', 'spiderman', 'doctor_strange'];
const demons = ['victor_doom', 'thanos', 'venom', 'loki', 'ultron', 'evil_cap'];

function renderThemes() {
    const container = document.getElementById('themesContainer');
    if(!container || !window.themesData) return;

    const data = window.themesData;

    // Render Angels
    let angelsHtml = '<div class="section-title">☀️ Angels (Superheroes)</div><div class="theme-grid">';
    angels.forEach(id => {
        if(data[id]) angelsHtml += createCardHtml(id, data[id]);
    });
    angelsHtml += '</div>';

    // Render Demons
    let demonsHtml = '<div class="section-title">🌑 Demons (Villains Aura)</div><div class="theme-grid">';
    demons.forEach(id => {
        if(data[id]) demonsHtml += createCardHtml(id, data[id]);
    });
    demonsHtml += '</div>';

    container.innerHTML = angelsHtml + demonsHtml;
}

function createCardHtml(id, theme) {
    const isReserved = theme.isReserved ? 'reserved' : '';
    const badge = theme.isReserved ? '<div class="theme-badge">👑</div>' : '';
    
    return `
        <div class="theme-card ${isReserved}" onclick="handleThemeClick('${id}')">
            ${badge}
            <div class="color-preview">
                <div class="color-dot" style="background:${theme.bg}; border-color:${theme.border};"></div>
                <div class="color-dot" style="background:${theme.primary};"></div>
                <div class="color-dot" style="background:${theme.text};"></div>
            </div>
            <div class="theme-name">${theme.name}</div>
        </div>
    `;
}

window.handleThemeClick = function(id) {
    const theme = window.themesData[id];
    if(!theme) return;

    if(theme.isReserved) {
        // Show Professional Popup
        document.getElementById('reservedTitle').innerText = "Access Denied";
        document.getElementById('reservedText').innerText = theme.reservedText;
        document.getElementById('reservedPopup').style.display = 'flex';
    } else {
        // Apply Theme
        window.applyTheme(id);
        // Give a small haptic feedback
        if(navigator.vibrate) navigator.vibrate(50);
        
        // Optional: Show a quick toast
        alert(theme.name + " Theme Applied!");
    }
};

window.addEventListener('DOMContentLoaded', renderThemes);
