// CHMAT Theme Engine V6 (Fixed & Complete)

const themes = {
    // --- RESERVED ---
    "victor_doom": {
        name: "Victor Von Doom", type: "demon", isReserved: true,
        image: "assets/themes/victor_doom.jpg", // Agar download ki hai toh, warna placeholder
        caption: "Bow down to the King. Absolute power, absolute control.",
        bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)",
        primary: "#00ff00", text: "#ffffff", border: "#004400",
        reservedText: "This legendary theme is permanently reserved for Mr. Tiger."
    },
    "white_queen": {
        name: "White Queen", type: "angel", isReserved: false,
        image: "assets/themes/white_queen.png",
        caption: "Elegance, purity, and unmatched power. The Queen's aura.",
        bgGradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        primary: "#d4af37", text: "#111111", border: "#d4af37",
        reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe."
    },

    // --- SUPERHEROES ---
    "iron_man": { name: "Iron Man", type: "angel", image: "assets/themes/iron_man.jpg", caption: "Genius. Billionaire. Playboy. Philanthropist. I am Iron Man.", bgGradient: "linear-gradient(135deg, #000000, #3a0000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#550000" },
    "thor": { name: "Thor", type: "angel", image: "assets/themes/thor.jpg", caption: "I am Thor, son of Odin. Bring me Thanos!", bgGradient: "linear-gradient(135deg, #000000, #001a33, #000000)", primary: "#00bfff", text: "#ffffff", border: "#003366" },
    "spiderman": { name: "Spider-Man", type: "angel", image: "assets/themes/spiderman.jpg", caption: "With great power comes great responsibility.", bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", primary: "#e62429", text: "#ffffff", border: "#660000" },
    "captain_america": { name: "Captain America", type: "angel", image: "assets/themes/captain.jpg", caption: "I can do this all day. Avengers Assemble!", bgGradient: "linear-gradient(135deg, #000000, #0a1b3a, #000000)", primary: "#1e3a8a", text: "#ffffff", border: "#112a5c" },
    "doctor_strange": { name: "Doctor Strange", type: "angel", image: "assets/themes/dr_strange.jpg", caption: "We are in the endgame now.", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#4a148c", text: "#ffffff", border: "#330066" },
    "hulk": { name: "Hulk", type: "angel", image: "assets/themes/hulk.jpg", caption: "That's my secret, Captain. I'm always angry.", bgGradient: "linear-gradient(135deg, #001100, #003300, #1a0033)", primary: "#39ff14", text: "#ffffff", border: "#005500" },
    "black_widow": { name: "Black Widow", type: "angel", image: "assets/themes/natasha.jpg", caption: "I've got red in my ledger. I'd like to wipe it out.", bgGradient: "linear-gradient(135deg, #000000, #1a0000, #000000)", primary: "#e60000", text: "#ffffff", border: "#550000" },
    "hawkeye": { name: "Hawkeye", type: "angel", image: "assets/themes/hawkeye.jpg", caption: "I'm a sniper. I aim, I shoot, I hit.", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#8000ff", text: "#ffffff", border: "#330066" },

    // --- VILLAINS AURA ---
    "thanos": { name: "Thanos", type: "demon", image: "assets/themes/thanos.jpg", caption: "I am inevitable. Perfectly balanced, as all things should be.", bgGradient: "linear-gradient(135deg, #050505, #1a0033, #050505)", primary: "#9c27b0", text: "#ffffff", border: "#330066" },
    "venom": { name: "Venom", type: "demon", image: "assets/themes/venom.jpg", caption: "We are Venom. You are a loser, and we are going to eat your brain.", bgGradient: "linear-gradient(135deg, #000000, #111111, #000000)", primary: "#ff003c", text: "#ffffff", border: "#333333" },
    "loki": { name: "Loki", type: "demon", image: "assets/themes/loki.jpg", caption: "I am burdened with glorious purpose.", bgGradient: "linear-gradient(135deg, #000000, #002200, #1a1a00)", primary: "#ffd700", text: "#ffffff", border: "#004400" }
};

window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;
    const root = document.documentElement.style;
    root.setProperty('--theme-bg-grad', theme.bgGradient);
    root.setProperty('--theme-primary', theme.primary);
    root.setProperty('--theme-text', theme.text);
    root.setProperty('--theme-border', theme.border);
    localStorage.setItem('chmat_active_theme', themeId);
    if(themeId === 'white_queen') { document.body.classList.add('theme-white-queen'); } else { document.body.classList.remove('theme-white-queen'); }
};

(function applyGlobalTheme() {
    const savedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
    if (themes[savedTheme]) {
        if(savedTheme === 'white_queen') document.body.classList.add('theme-white-queen');
        const theme = themes[savedTheme];
        const root = document.documentElement.style;
        root.setProperty('--theme-bg-grad', theme.bgGradient);
        root.setProperty('--theme-primary', theme.primary);
        root.setProperty('--theme-text', theme.text);
        root.setProperty('--theme-border', theme.border);
    }
})();

window.themesData = themes;


// --- ROYAL SNOWFALL 3D ANIMATION ---
let snowInterval = null;
const snowCSS = `
.snowflake {
  position: fixed;
  top: -10vh;
  pointer-events: none;
  z-index: 9999;
  animation: fall linear forwards, sway ease-in-out infinite alternate;
}
.frost-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9998;
  box-shadow: inset 0 0 60px rgba(255, 255, 255, 0.5), inset 0 0 120px rgba(212, 175, 55, 0.15);
  background: radial-gradient(circle at center, transparent 60%, rgba(255,255,255,0.1) 100%);
  transition: opacity 0.5s ease;
}
@keyframes fall {
  0% { transform: translateY(-10vh); }
  100% { transform: translateY(110vh); }
}
@keyframes sway {
  0% { margin-left: -30px; }
  100% { margin-left: 30px; }
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = snowCSS;
document.head.appendChild(styleSheet);

function startSnowfall() {
    if (snowInterval) return;
    
    // Add Frost Overlay
    if (!document.querySelector('.frost-overlay')) {
        const frost = document.createElement('div');
        frost.className = 'frost-overlay';
        document.body.appendChild(frost);
    }

    snowInterval = setInterval(() => {
        const flake = document.createElement('div');
        flake.classList.add('snowflake');
        
        const rand = Math.random();
        let size, duration, blur, opacity, content;
        
        // 3D Layers Logic
        if (rand < 0.6) { // Background (Small, slow, blurry)
            size = Math.random() * 3 + 2 + 'px';
            duration = Math.random() * 5 + 8 + 's';
            blur = '2px';
            opacity = Math.random() * 0.4 + 0.3;
            content = '❄️';
        } else if (rand < 0.9) { // Midground (Medium, normal)
            size = Math.random() * 5 + 4 + 'px';
            duration = Math.random() * 4 + 5 + 's';
            blur = '0px';
            opacity = Math.random() * 0.5 + 0.5;
            content = '❄️';
        } else { // Foreground (Large, fast, very blurry)
            size = Math.random() * 8 + 8 + 'px';
            duration = Math.random() * 2 + 3 + 's';
            blur = '4px';
            opacity = 0.9;
            content = '';
        }

        flake.style.width = size;
        flake.style.height = size;
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.opacity = opacity;
        flake.style.filter = `blur(${blur})`;
        flake.style.animationDuration = duration + ', ' + (Math.random() * 2 + 2) + 's';
        flake.style.fontSize = size;
        flake.innerText = content;
        
        if (!content) {
             flake.style.background = '#fff';
             flake.style.borderRadius = '50%';
             flake.style.boxShadow = '0 0 10px rgba(255,255,255,0.8), 0 0 20px #d4af37';
        }

        document.body.appendChild(flake);
        setTimeout(() => { flake.remove(); }, parseFloat(duration) * 1000);
    }, 100); // Faster spawn rate
}

function stopSnowfall() {
    if (snowInterval) {
        clearInterval(snowInterval);
        snowInterval = null;
    }
    document.querySelectorAll('.snowflake').forEach(el => el.remove());
    const frost = document.querySelector('.frost-overlay');
    if (frost) frost.remove();
}

// Overwrite applyTheme
const originalApplyTheme = window.applyTheme;
window.applyTheme = function(themeId) {
    if(originalApplyTheme) originalApplyTheme(themeId);
    if (themeId === 'white_queen') {
        startSnowfall();
    } else {
        stopSnowfall();
    }
};

if (localStorage.getItem('chmat_active_theme') === 'white_queen') {
    document.addEventListener('DOMContentLoaded', startSnowfall);
}
