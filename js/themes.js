// CHMAT Theme Engine V22 (All Themes Restored)

const themes = {
    // --- RESERVED & SPECIAL ---
    "victor_doom": { name: "Victor Von Doom", type: "demon", isReserved: true, image: "assets/themes/victor_doom.jpg", caption: "Bow down to the King.", bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)", primary: "#00ff00", text: "#ffffff", border: "#004400", reservedText: "Reserved for Mr. Tiger." },
    "white_queen": { name: "White Queen", type: "angel", isReserved: false, image: "assets/themes/white_queen.png", caption: "Elegance and unmatched power.", bgGradient: "linear-gradient(135deg, #f4f9ff 0%, #dbe9f4 100%)", primary: "#d4af37", text: "#111111", border: "#d4af37", reservedText: "Reserved for the Queen." },

    // --- SUPERHEROES ---
    "iron_man": { name: "Iron Man", type: "angel", image: "assets/themes/iron_man.jpg", caption: "I am Iron Man.", bgGradient: "linear-gradient(135deg, #000000, #3a0000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#550000" },
    "thor": { name: "Thor", type: "angel", image: "assets/themes/thor.jpg", caption: "Bring me Thanos!", bgGradient: "linear-gradient(135deg, #000000, #001a33, #000000)", primary: "#00bfff", text: "#ffffff", border: "#003366" },
    "spiderman": { name: "Spider-Man", type: "angel", image: "assets/themes/spiderman.jpg", caption: "With great power comes great responsibility.", bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", primary: "#e62429", text: "#ffffff", border: "#660000" },
    "captain_america": { name: "Captain America", type: "angel", image: "assets/themes/captain.jpg", caption: "I can do this all day.", bgGradient: "linear-gradient(135deg, #000000, #0a1b3a, #000000)", primary: "#1e3a8a", text: "#ffffff", border: "#112a5c" },
    "doctor_strange": { name: "Doctor Strange", type: "angel", image: "assets/themes/dr_strange.jpg", caption: "We are in the endgame now.", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#4a148c", text: "#ffffff", border: "#330066" },
    "hulk": { name: "Hulk", type: "angel", image: "assets/themes/hulk.jpg", caption: "I'm always angry.", bgGradient: "linear-gradient(135deg, #001100, #003300, #1a0033)", primary: "#39ff14", text: "#ffffff", border: "#005500" },
    "black_widow": { name: "Black Widow", type: "angel", image: "assets/themes/natasha.jpg", caption: "I've got red in my ledger.", bgGradient: "linear-gradient(135deg, #000000, #1a0000, #000000)", primary: "#e60000", text: "#ffffff", border: "#550000" },
    "hawkeye": { name: "Hawkeye", type: "angel", image: "assets/themes/hawkeye.jpg", caption: "I aim, I shoot, I hit.", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#8000ff", text: "#ffffff", border: "#330066" },

    // --- VILLAINS AURA ---
    "thanos": { name: "Thanos", type: "demon", image: "assets/themes/thanos.jpg", caption: "I am inevitable.", bgGradient: "linear-gradient(135deg, #050505, #1a0033, #050505)", primary: "#9c27b0", text: "#ffffff", border: "#330066" },
    "venom": { name: "Venom", type: "demon", image: "assets/themes/venom.jpg", caption: "We are Venom.", bgGradient: "linear-gradient(135deg, #000000, #111111, #000000)", primary: "#ff003c", text: "#ffffff", border: "#333333" },
    "loki": { name: "Loki", type: "demon", image: "assets/themes/loki.jpg", caption: "Glorious purpose.", bgGradient: "linear-gradient(135deg, #000000, #002200, #1a1a00)", primary: "#ffd700", text: "#ffffff", border: "#004400" }
};

// Apply Theme Logic

window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;
    
    // Set CSS Variables for Global Use
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-grad', theme.bgGradient);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-border', theme.border);
    
    // Set body class for specific overrides (like White Queen castle)
    document.body.className = ''; // Reset classes
    document.body.classList.add('theme-' + themeId);
    
    localStorage.setItem('chmat_active_theme', themeId);
    
    // Trigger specific animations
    if(themeId === 'white_queen') { 
        if(typeof startSnowfall === 'function') startSnowfall();
    } else { 
        if(typeof stopSnowfall === 'function') stopSnowfall(); 
    }
};


// --- SNOWFALL ---
let snowInterval = null;
function startSnowfall() {
    if (snowInterval || !document.getElementById('snow-styles')) {
        const styleSheet = document.createElement("style"); styleSheet.id = 'snow-styles'; 
        styleSheet.innerText = `.snowflake { position: fixed; top: -10vh; pointer-events: none; z-index: 9999; color: #fff; animation: fall linear forwards, sway ease-in-out infinite alternate, spin linear infinite; } @keyframes fall { 0% { top: -10vh; } 100% { top: 110vh; } } @keyframes sway { 0% { margin-left: -30px; } 100% { margin-left: 30px; } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`; 
        document.head.appendChild(styleSheet);
    }
    if (snowInterval) return;
    snowInterval = setInterval(() => {
        const flake = document.createElement('div'); flake.classList.add('snowflake');
        const size = Math.random() * 6 + 5 + 'px'; const duration = Math.random() * 4 + 5 + 's';
        flake.style.cssText = `width:${size}; height:${size}; left:${Math.random() * 100}vw; opacity:${Math.random() * 0.6 + 0.4}; animation-duration:${duration}, ${Math.random() * 2 + 2}s, ${Math.random() * 3 + 2}s; font-size:${size};`;
        flake.innerText = '❄️';
        document.body.appendChild(flake); setTimeout(() => { flake.remove(); }, parseFloat(duration) * 1000);
    }, 150);
}
function stopSnowfall() { if (snowInterval) { clearInterval(snowInterval); snowInterval = null; } document.querySelectorAll('.snowflake').forEach(el => el.remove()); }

// --- RANI ENTRY (ROSES) ---
let roseInterval = null;
window.startRoseShower = function(callback) {
    if (roseInterval) return;
    if (!document.getElementById('rose-styles')) {
        const styleSheet = document.createElement("style"); styleSheet.id = 'rose-styles'; 
        styleSheet.innerText = `.rose-particle { position: fixed; top: -10vh; pointer-events: none; z-index: 10000; animation: roseFall linear forwards, roseSway ease-in-out infinite alternate, roseSpin linear infinite; filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.5)); } @keyframes roseFall { 0% { top: -10vh; } 100% { top: 110vh; } } @keyframes roseSway { 0% { margin-left: -40px; } 100% { margin-left: 40px; } } @keyframes roseSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`; 
        document.head.appendChild(styleSheet);
    }
    let startTime = Date.now(); let roseDuration = 60000; 
    roseInterval = setInterval(() => {
        if (Date.now() - startTime > roseDuration) {
            clearInterval(roseInterval); roseInterval = null;
            document.querySelectorAll('.rose-particle').forEach(el => el.remove());
            if (callback) callback();
            return;
        }
        const particle = document.createElement('div'); particle.classList.add('rose-particle');
        const isPetal = Math.random() > 0.3; let size, duration, opacity, content;
        if (isPetal) {
            size = Math.random() * 12 + 8 + 'px'; duration = Math.random() * 6 + 6 + 's'; opacity = Math.random() * 0.7 + 0.3; content = '🌹';
            particle.style.filter = 'sepia(1) saturate(8) hue-rotate(330deg) brightness(0.7) drop-shadow(0 0 3px rgba(255,0,0,0.8))';
            particle.style.transform = 'scaleX(0.6) scaleY(0.8)';
        } else {
            size = Math.random() * 10 + 15 + 'px'; duration = Math.random() * 3 + 3 + 's'; opacity = 1; content = '🌹';
            particle.style.filter = 'drop-shadow(0 0 6px rgba(255,0,0,0.8))';
        }
        particle.style.cssText += `width:${size}; height:${size}; left:${Math.random() * 100}vw; opacity:${opacity}; animation-duration:${duration}, ${Math.random() * 2 + 2}s, ${Math.random() * 3 + 2}s; font-size:${size};`;
        particle.innerText = content;
        document.body.appendChild(particle); setTimeout(() => { particle.remove(); }, parseFloat(duration) * 1000);
    }, 150);
};

// --- AUTO TRIGGER ON LOAD ---
window.addEventListener('DOMContentLoaded', () => {
    let active = localStorage.getItem('chmat_active_theme') || 'iron_man';
    
    if(active === 'white_queen') {
        document.body.classList.add('theme-white-queen');
        startSnowfall();
    }

    if (sessionStorage.getItem('rani_entry_shown') !== 'true') {
        sessionStorage.setItem('rani_entry_shown', 'true');
        setTimeout(() => {
            window.startRoseShower(() => {
                if(localStorage.getItem('chmat_active_theme') === 'white_queen') startSnowfall();
            });
        }, 1000);
    }
});

window.themesData = themes;
