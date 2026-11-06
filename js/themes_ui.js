// Theme UI Logic V2 (Split Layout)
function renderThemes() {
    const demonsCol = document.getElementById('demonsColumn');
    const angelsCol = document.getElementById('angelsColumn');
    if(!demonsCol || !angelsCol || !window.themesData) return;

    const data = window.themesData;
    let demonsHtml = '<div class="column-title">🌑 Demons</div>';
    let angelsHtml = '<div class="column-title">☀️ Angels</div>';

    for (const id in data) {
        const theme = data[id];
        const cardHtml = createCardHtml(id, theme);
        
        if (theme.type === 'demon') {
            demonsHtml += cardHtml;
        } else {
            angelsHtml += cardHtml;
        }
    }

    demonsCol.innerHTML = demonsHtml;
    angelsCol.innerHTML = angelsHtml;
}

function createCardHtml(id, theme) {
    const isReserved = theme.isReserved ? 'reserved' : '';
    const badge = theme.isReserved ? '<div class="theme-badge">👑</div>' : '';
    
    return `
        <div class="theme-card ${isReserved}" style="background: ${theme.bgGradient};" onclick="handleThemeClick('${id}')">
            ${badge}
            <div class="theme-name">${theme.name}</div>
        </div>
    `;
}

window.handleThemeClick = function(id) {
    const theme = window.themesData[id];
    if(!theme) return;

    if(theme.isReserved) {
        document.getElementById('reservedTitle').innerText = "Access Denied";
        document.getElementById('reservedText').innerText = theme.reservedText;
        document.getElementById('reservedPopup').style.display = 'flex';
    } else {
        window.applyTheme(id);
        if(navigator.vibrate) navigator.vibrate(50);
        
        // Small visual feedback
        const card = event.currentTarget;
        const originalBorder = card.style.borderColor;
        card.style.borderColor = '#fff';
        setTimeout(() => { card.style.borderColor = originalBorder; }, 300);
    }
};

window.addEventListener('DOMContentLoaded', renderThemes);
