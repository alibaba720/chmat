// Theme UI Logic V5
let currentListType = 'angel';

window.showThemeList = function(type) {
    currentListType = type;
    document.getElementById('categoryView').style.display = 'none';
    document.getElementById('listView').style.display = 'flex';
    document.getElementById('mainBackBtn').style.display = 'none';
    document.getElementById('listBackBtn').style.display = 'block';
    document.getElementById('pageTitle').innerText = type === 'angel' ? "Hero's Themes" : "Villains Themes";
    
    renderThemes();
};

window.showCategoryView = function() {
    document.getElementById('categoryView').style.display = 'flex';
    document.getElementById('listView').style.display = 'none';
    document.getElementById('mainBackBtn').style.display = 'block';
    document.getElementById('listBackBtn').style.display = 'none';
    document.getElementById('pageTitle').innerText = "Themes";
};

function renderThemes() {
    const grid = document.getElementById('themeGrid');
    if(!grid || !window.themesData) return;

    const data = window.themesData;
    let themesArray = [];

    for (const id in data) {
        if (data[id].type === currentListType) {
            themesArray.push({ id: id, ...data[id] });
        }
    }

    // SORTING: Put White Queen and Victor Doom at the top
    themesArray.sort((a, b) => {
        if (a.id === 'white_queen' || a.id === 'victor_doom') return -1;
        if (b.id === 'white_queen' || b.id === 'victor_doom') return 1;
        return 0;
    });

    let html = '';
    themesArray.forEach(theme => {
        html += `
            <div class="theme-card" onclick="handleThemeClick('${theme.id}')">
                <img src="${theme.image}" class="theme-bg-img" alt="${theme.name}" onerror="this.src='https://via.placeholder.com/600x400/111/fff?text=${theme.name}'">
                <div class="theme-overlay"></div>
                ${theme.isReserved ? '<div class="theme-badge">👑</div>' : ''}
                <div class="theme-content">
                    <div class="theme-name">${theme.name}</div>
                    <div class="theme-caption">"${theme.caption}"</div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

window.handleThemeClick = function(id) {
    const theme = window.themesData[id];
    if(!theme) return;

    if(theme.isReserved) {
        alert("Access Denied!\n\n" + theme.reservedText);
    } else {
        window.applyTheme(id);
        if(navigator.vibrate) navigator.vibrate(50);
        alert(theme.name + " Theme Applied!");
    }
};
