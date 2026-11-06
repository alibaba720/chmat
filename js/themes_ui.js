// Theme UI Logic
function renderThemes() {
    const demonsCol = document.getElementById('demonsColumn');
    const angelsCol = document.getElementById('angelsColumn');
    
    if(!demonsCol || !angelsCol || !window.themesData) return;

    const data = window.themesData;
    let demonsHtml = '<div class="column-title">Villain\'s Aura</div>';
    let angelsHtml = '<div class="column-title">Superheroes</div>';

    for (const id in data) {
        const theme = data[id];
        const cardHtml = `
            <div class="theme-card ${theme.isReserved ? 'reserved' : ''}" style="background: ${theme.bgGradient};" onclick="handleThemeClick('${id}')">
                ${theme.isReserved ? '<div class="theme-badge">👑</div>' : ''}
                <div class="theme-name">${theme.name}</div>
            </div>
        `;
        
        if (theme.type === 'demon') {
            demonsHtml += cardHtml;
        } else {
            angelsHtml += cardHtml;
        }
    }

    demonsCol.innerHTML = demonsHtml;
    angelsCol.innerHTML = angelsHtml;
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
    }
};

window.addEventListener('DOMContentLoaded', renderThemes);
