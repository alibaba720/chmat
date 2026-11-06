// CHMAT Theme Engine V7 (Fixed Snowfall)

const themes = {
    // --- RESERVED ---
    "victor_doom": { name: "Victor Von Doom", type: "demon", isReserved: true, image: "assets/themes/victor_doom.jpg", caption: "Bow down to the King. Absolute power, absolute control.", bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)", primary: "#00ff00", text: "#ffffff", border: "#004400", reservedText: "This legendary theme is permanently reserved for Mr. Tiger." },
    "white_queen": { name: "White Queen", type: "angel", isReserved: false, image: "assets/themes/white_queen.png", caption: "Elegance, purity, and unmatched power. The Queen's aura.", bgGradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", primary: "#d4af37", text: "#111111", border: "#d4af37", reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe." },

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
    
    if(themeId === 'white_queen') { 
        document.body.classList.add('theme-white-queen'); 
        if(typeof startSnowfall === 'function') startSnowfall();
    } else { 
        document.body.classList.remove('theme-white-queen'); 
        if(typeof stopSnowfall === 'function') stopSnowfall();
    }
};

// --- ROYAL SNOWFALL ANIMATION ---
let snowInterval = null;
const snowCSS = `
.snowflake {
  position: fixed;
  top: -10vh;
  pointer-events: none;
  z-index: 9999;
  color: #ffffff;
  animation: fall linear forwards, sway ease-in-out infinite alternate, spin linear infinite;
}
@keyframes fall {
  0% { top: -10vh; }
  100% { top: 110vh; }
}
@keyframes sway {
  0% { margin-left: -30px; }
  100% { margin-left: 30px; }
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = snowCSS;
document.head.appendChild(styleSheet);

function startSnowfall() {
    if (snowInterval) return;
    snowInterval = setInterval(() => {
        const flake = document.createElement('div');
        flake.classList.add('snowflake');
        
        const rand = Math.random();
        let size, duration, opacity, content;
        
        if (rand < 0.8) { 
            size = Math.random() * 6 + 5 + 'px';
            duration = Math.random() * 4 + 5 + 's';
            opacity = Math.random() * 0.6 + 0.4;
            content = '❄️';
        } else { 
            size = Math.random() * 3 + 2 + 'px';
            duration = Math.random() * 3 + 3 + 's';
            opacity = Math.random() * 0.4 + 0.3;
            content = '';
        }

        flake.style.width = size;
        flake.style.height = size;
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.opacity = opacity;
        flake.style.animationDuration = `${duration}, ${Math.random() * 2 + 2}s, ${Math.random() * 3 + 2}s`;
        flake.style.fontSize = size;
        flake.innerText = content;
        
        if (!content) {
             flake.style.background = '#fff';
             flake.style.borderRadius = '50%';
        }
        document.body.appendChild(flake);
        setTimeout(() => { flake.remove(); }, parseFloat(duration) * 1000);
    }, 150);
}

function stopSnowfall() {
    if (snowInterval) {
        clearInterval(snowInterval);
        snowInterval = null;
    }
    document.querySelectorAll('.snowflake').forEach(el => el.remove());
}

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

window.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('chmat_active_theme') === 'white_queen') {
        startSnowfall();
    }
});

window.themesData = themes;

// --- ROYAL ROSE SHOWER ANIMATION ---
let roseInterval = null;
const roseCSS = `
.rose-particle {
  position: fixed;
  top: -10vh;
  pointer-events: none;
  z-index: 10000;
  animation: roseFall linear forwards, roseSway ease-in-out infinite alternate, roseSpin linear infinite;
  filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.5));
}
@keyframes roseFall {
  0% { top: -10vh; }
  100% { top: 110vh; }
}
@keyframes roseSway {
  0% { margin-left: -40px; }
  100% { margin-left: 40px; }
}
@keyframes roseSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
if (!document.getElementById('rose-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'rose-styles';
    styleSheet.innerText = roseCSS;
    document.head.appendChild(styleSheet);
}

window.startRoseShower = function(callback) {
    // 1. ADD WELCOME TEXT OVERLAY
    if (!document.getElementById('queen-welcome-text')) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'queen-welcome-text';
        welcomeDiv.style.cssText = 'position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) scale(0.8); z-index: 99999; text-align: center; pointer-events: none; opacity: 0; transition: all 4s ease-in-out;';
        welcomeDiv.innerHTML = `<h1 style="color: rgba(212, 175, 55, 0.8); font-family: 'Playfair Display', serif; font-size: 3rem; margin: 0; text-shadow: 0 0 20px rgba(255,255,255,0.8); line-height: 1.2;">Welcome Back<br><span style="font-size: 4rem; font-style: italic;">My Queen</span></h1>`;
        document.body.appendChild(welcomeDiv);
        
        // Trigger animation after a tiny delay
        setTimeout(() => {
            welcomeDiv.style.opacity = '1';
            welcomeDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
        
        // Remove it after 15 seconds
        setTimeout(() => {
            welcomeDiv.style.opacity = '0';
            setTimeout(() => welcomeDiv.remove(), 4000);
        }, 15000);
    }

    // 2. PLAY SOFT MAGICAL SOUND
    if (!window.queenAudio) {
        window.queenAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Soft magic chime
        window.queenAudio.volume = 0.2; // Very soft
        window.queenAudio.loop = true;
        window.queenAudio.play().catch(e => console.log('Audio play failed:', e));
    }

    if (roseInterval) return;
    
    let roseDuration = 60000; // 1 minute
    let startTime = Date.now();

    roseInterval = setInterval(() => {
        if (Date.now() - startTime > roseDuration) {
            clearInterval(roseInterval);
            roseInterval = null;
            document.querySelectorAll('.rose-particle').forEach(el => el.remove());
            if (window.queenAudio) {
                window.queenAudio.pause();
                window.queenAudio = null;
            }
            if (callback) callback();
            return;
        }

        const particle = document.createElement('div');
        particle.classList.add('rose-particle');
        
        const isPetal = Math.random() > 0.3; // 70% petals, 30% full roses
        let size, duration, opacity, content;

        if (isPetal) {
            size = Math.random() * 12 + 8 + 'px';
            duration = Math.random() * 6 + 6 + 's'; // Slow falling
            opacity = Math.random() * 0.7 + 0.3;
            content = '🌹';
            particle.style.filter = 'sepia(1) saturate(8) hue-rotate(330deg) brightness(0.7) drop-shadow(0 0 3px rgba(255,0,0,0.8))';
            particle.style.transform = 'scaleX(0.6) scaleY(0.8)';
        } else {
            size = Math.random() * 10 + 15 + 'px';
            duration = Math.random() * 3 + 3 + 's'; // Fast falling
            opacity = 1;
            content = '🌹';
            particle.style.filter = 'drop-shadow(0 0 6px rgba(255,0,0,0.8))';
        }

        particle.style.fontSize = size;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.opacity = opacity;
        particle.style.animationDuration = `${duration}, ${Math.random() * 2 + 2}s, ${Math.random() * 3 + 2}s`;
        particle.innerText = content;

        document.body.appendChild(particle);
        setTimeout(() => { particle.remove(); }, parseFloat(duration) * 1000);

    }, 150);
};
