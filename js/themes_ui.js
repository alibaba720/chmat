// Theme UI Logic V4
function renderThemes() {
    const angelsGrid = document.getElementById('angelsGrid');
    const demonsGrid = document.getElementById('demonsGrid');
    if(!angelsGrid || !demonsGrid || !window.themesData) return;

    const data = window.themesData;
    let angelsHtml = '';
    let demonsHtml = '';

    for (const id in data) {
        const theme = data[id];
        const cardHtml = `
            <div class="theme-card" onclick="openPreview('${id}')">
                <img src="${theme.image}" class="theme-bg-img" alt="${theme.name}">
                <div class="theme-overlay"></div>
                ${theme.isReserved ? '<div class="theme-badge">👑</div>' : ''}
                <div class="theme-content">
                    <div class="theme-name">${theme.name}</div>
                    <div class="theme-caption">"${theme.caption}"</div>
                </div>
            </div>
        `;
        
        if (theme.type === 'demon') {
            demonsHtml += cardHtml;
        } else {
            angelsHtml += cardHtml;
        }
    }

    angelsGrid.innerHTML = angelsHtml;
    demonsGrid.innerHTML = demonsHtml;
}

let selectedThemeId = null;

window.openPreview = function(id) {
    const theme = window.themesData[id];
    if(!theme) return;

    if(theme.isReserved) {
        // Agar reserved hai toh direct popup (assuming yeh function pehle se hai ya alert use kar lein)
        alert("Access Denied!\n\n" + theme.reservedText);
        return;
    }

    selectedThemeId = id;
    
    // Set Modal Title
    document.getElementById('previewThemeName').innerText = theme.name + " Preview";
    
    // Apply Theme to Modal temporarily
    const root = document.documentElement.style;
    root.setProperty('--theme-bg-grad', theme.bgGradient);
    root.setProperty('--theme-primary', theme.primary);
    root.setProperty('--theme-text', theme.text);
    root.setProperty('--theme-border', theme.border);

    // Show Modal
    document.getElementById('previewModal').style.display = 'flex';
    
    // Reset slider to first slide
    document.getElementById('previewSlider').scrollLeft = 0;
};

window.closePreview = function() {
    document.getElementById('previewModal').style.display = 'none';
    // Revert to actual applied theme
    if(window.applyTheme) {
        const appliedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
        window.applyTheme(appliedTheme);
    }
};

document.getElementById('finalApplyBtn')?.addEventListener('click', () => {
    if(selectedThemeId && window.applyTheme) {
        window.applyTheme(selectedThemeId);
        if(navigator.vibrate) navigator.vibrate(100);
        alert("Theme Applied Successfully!");
        closePreview();
    }
});

window.addEventListener('DOMContentLoaded', renderThemes);
