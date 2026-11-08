// CHMAT Theme Engine V25 (Fresh Rebuild)

const themes = {
    // --- LOCKED THEME (FOR QUEEN) ---
    "white_queen": { 
        name: "White Queen", 
        type: "angel", 
        isReserved: false, // LOCKED
        image: "assets/themes/white_queen.png", 
        caption: "Elegance and unmatched power.", 
        bgGradient: "linear-gradient(135deg, #f4f9ff 0%, #dbe9f4 100%)", 
        primary: "#d4af37", 
        text: "#111111", 
        border: "#d4af37", 
        reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe." 
    },

    // --- NEW FRESH THEMES (No Red/Black Leaks) ---
    "iron_man": { 
        name: "Iron Man", type: "angel", 
        image: "assets/themes/iron_man.jpg", 
        caption: "I am Iron Man.", 
        bgGradient: "linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #1a0000 100%)", 
        primary: "#ff1a1a", text: "#ffffff", border: "#800000" 
    },
    "thor": { 
        name: "Thor", type: "angel", 
        image: "assets/themes/thor.jpg", 
        caption: "Bring me Thanos!", 
        bgGradient: "linear-gradient(135deg, #001133 0%, #003366 50%, #001133 100%)", 
        primary: "#00e5ff", text: "#ffffff", border: "#0055aa" 
    },
    "spiderman": { 
        name: "Spider-Man", type: "angel", 
        image: "assets/themes/spiderman.jpg", 
        caption: "With great power comes great responsibility.", 
        bgGradient: "linear-gradient(135deg, #330000 0%, #000033 100%)", 
        primary: "#e62429", text: "#ffffff", border: "#660000" 
    },
    "captain_america": { 
        name: "Captain America", type: "angel", 
        image: "assets/themes/captain.jpg", 
        caption: "I can do this all day.", 
        bgGradient: "linear-gradient(135deg, #0a1128 0%, #1e3a8a 100%)", 
        primary: "#ffffff", text: "#ffffff", border: "#4a6ebd" 
    },
    "doctor_strange": { 
        name: "Doctor Strange", type: "angel", 
        image: "assets/themes/dr_strange.jpg", 
        caption: "We are in the endgame now.", 
        bgGradient: "linear-gradient(135deg, #1a0033 0%, #4a148c 100%)", 
        primary: "#e0b0ff", text: "#ffffff", border: "#6a1b9a" 
    },
    "hulk": { 
        name: "Hulk", type: "angel", 
        image: "assets/themes/hulk.jpg", 
        caption: "I'm always angry.", 
        bgGradient: "linear-gradient(135deg, #001100 0%, #003300 100%)", 
        primary: "#39ff14", text: "#ffffff", border: "#006600" 
    },
    "black_widow": { 
        name: "Black Widow", type: "angel", 
        image: "assets/themes/natasha.jpg", 
        caption: "I've got red in my ledger.", 
        bgGradient: "linear-gradient(135deg, #111111 0%, #333333 100%)", 
        primary: "#ff003c", text: "#ffffff", border: "#555555" 
    },
    "hawkeye": { 
        name: "Hawkeye", type: "angel", 
        image: "assets/themes/hawkeye.jpg", 
        caption: "I aim, I shoot, I hit.", 
        bgGradient: "linear-gradient(135deg, #1a0033 0%, #330066 100%)", 
        primary: "#b366ff", text: "#ffffff", border: "#4d0099" 
    },
    "victor_doom": { 
        name: "Victor Von Doom", type: "demon", 
        isReserved: true, // LOCKED
        image: "assets/themes/victor_doom.jpg", 
        caption: "Bow down to the King.", 
        bgGradient: "linear-gradient(135deg, #000000 0%, #003300 100%)", 
        primary: "#00ff00", text: "#ffffff", border: "#006600", 
        reservedText: "This legendary theme is permanently reserved for Mr. Tiger." 
    },
    "thanos": { 
        name: "Thanos", type: "demon", 
        image: "assets/themes/thanos.jpg", 
        caption: "I am inevitable.", 
        bgGradient: "linear-gradient(135deg, #1a0033 0%, #330066 100%)", 
        primary: "#cc66ff", text: "#ffffff", border: "#660099" 
    },
    "venom": { 
        name: "Venom", type: "demon", 
        image: "assets/themes/venom.jpg", 
        caption: "We are Venom.", 
        bgGradient: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", 
        primary: "#ffffff", text: "#ffffff", border: "#444444" 
    },
    "loki": { 
        name: "Loki", type: "demon", 
        image: "assets/themes/loki.jpg", 
        caption: "Glorious purpose.", 
        bgGradient: "linear-gradient(135deg, #001100 0%, #003300 100%)", 
        primary: "#ffd700", text: "#ffffff", border: "#b8860b" 
    }
};

// --- BULLETPROOF APPLY THEME FUNCTION ---
window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;
    
    // 1. Force Remove ALL old theme classes from body
    document.body.className = ''; 
    
    // 2. Set CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-grad', theme.bgGradient);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-border', theme.border);
    
    // 3. Add the specific class for the new theme
    document.body.classList.add('theme-' + themeId);
    
    // 4. Save to Local Storage
    localStorage.setItem('chmat_active_theme', themeId);
    
    // 5. Handle Specific Effects (Snowfall only for White Queen)
    if(themeId === 'white_queen') { 
        if(typeof startSnowfall === 'function') startSnowfall();
    } else { 
        if(typeof stopSnowfall === 'function') stopSnowfall(); 
    }
};

// --- SNOWFALL LOGIC ---
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

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    // Default to Iron Man for normal users, but White Queen if saved
    let active = localStorage.getItem('chmat_active_theme') || 'iron_man';
    applyTheme(active);
});

window.themesData = themes;
