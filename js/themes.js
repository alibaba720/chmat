// CHMAT Theme Engine V22 (Clean & Working)

const themes = {
    "victor_doom": { name: "Victor Von Doom", type: "demon", isReserved: true, image: "assets/themes/victor_doom.jpg", caption: "Bow down to the King.", bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)", primary: "#00ff00", text: "#ffffff", border: "#004400", reservedText: "Reserved for Mr. Tiger." },
    "white_queen": { name: "White Queen", type: "angel", isReserved: false, image: "assets/themes/white_queen.png", caption: "Elegance and unmatched power.", bgGradient: "linear-gradient(135deg, #f4f9ff 0%, #dbe9f4 100%)", primary: "#d4af37", text: "#111111", border: "#d4af37", reservedText: "Reserved for the Queen." },
    "iron_man": { name: "Iron Man", type: "angel", image: "assets/themes/iron_man.jpg", caption: "I am Iron Man.", bgGradient: "linear-gradient(135deg, #000000, #3a0000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#550000" }
    // (Aap yahan baaki themes add kar sakte hain, filhal sirf 3 rakhi hain taake file choti aur fast rahe)
};

window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;
    
    localStorage.setItem('chmat_active_theme', themeId);
    
    if(themeId === 'white_queen') { 
        document.body.classList.add('theme-white-queen'); 
        startSnowfall();
        startRain();
    } else { 
        document.body.classList.remove('theme-white-queen'); 
        stopSnowfall();
        stopRain();
    }
};


// --- LIVE RAIN ON GLASS EFFECT ---
let rainInterval = null;
function startRain() {
    if (rainInterval) return;
    rainInterval = setInterval(() => {
        const drop = document.createElement('div');
        drop.classList.add('rain-drop');
        
        // Randomize drop size and speed
        const duration = Math.random() * 1 + 0.5; // Fast drops
        const left = Math.random() * 100;
        
        drop.style.left = left + 'vw';
        drop.style.animationDuration = duration + 's';
        
        // 50% chance for a larger drop
        if (Math.random() > 0.5) {
            drop.style.height = '25px';
            drop.style.width = '3px';
            drop.style.background = 'rgba(255, 255, 255, 0.8)';
        }

        document.body.appendChild(drop);
        setTimeout(() => { drop.remove(); }, duration * 1000);
    }, 100); // Spawn rate
}

function stopRain() {
    if (rainInterval) {
        clearInterval(rainInterval);
        rainInterval = null;
    }
    document.querySelectorAll('.rain-drop').forEach(el => el.remove());
}

// --- SNOWFALL ---
let snowInterval = null;
function startSnowfall() {
    if (snowInterval) return;
    snowInterval = setInterval(() => {
        const flake = document.createElement('div'); 
        flake.classList.add('snowflake');
        flake.style.cssText = `position:fixed; top:-10vh; color:#fff; pointer-events:none; z-index:9999; font-size:${Math.random()*6+5}px; left:${Math.random()*100}vw; animation: fall ${Math.random()*4+5}s linear forwards, spin 3s linear infinite;`;
        flake.innerText = '❄️';
        document.body.appendChild(flake); 
        setTimeout(() => { flake.remove(); }, 10000);
    }, 150);
}
function stopSnowfall() { 
    if (snowInterval) { clearInterval(snowInterval); snowInterval = null; } 
    document.querySelectorAll('.snowflake').forEach(el => el.remove()); 
}

// --- ROSES (RANI ENTRY) ---
let roseInterval = null;
window.startRoseShower = function(callback) {
    if (roseInterval) return;
    
    let startTime = Date.now(); 
    let roseDuration = 30000; // 30 seconds is enough for entry
    
    roseInterval = setInterval(() => {
        if (Date.now() - startTime > roseDuration) {
            clearInterval(roseInterval); roseInterval = null;
            document.querySelectorAll('.rose-particle').forEach(el => el.remove());
            if (callback) callback();
            return;
        }

        const particle = document.createElement('div'); 
        particle.classList.add('rose-particle');
        const isPetal = Math.random() > 0.3; 
        
        if (isPetal) {
            particle.style.cssText = `position:fixed; top:-10vh; pointer-events:none; z-index:10000; font-size:${Math.random()*12+8}px; left:${Math.random()*100}vw; opacity:${Math.random()*0.7+0.3}; filter:sepia(1) saturate(8) hue-rotate(330deg) brightness(0.7); animation: fall ${Math.random()*6+6}s linear forwards;`;
        } else {
            particle.style.cssText = `position:fixed; top:-10vh; pointer-events:none; z-index:10000; font-size:${Math.random()*10+15}px; left:${Math.random()*100}vw; animation: fall ${Math.random()*3+3}s linear forwards;`;
        }
        
        particle.innerText = '🌹';
        document.body.appendChild(particle); 
        setTimeout(() => { particle.remove(); }, 10000);
    }, 150);
};

// --- INITIALIZATION (On Load) ---
window.addEventListener('DOMContentLoaded', () => {
    let active = localStorage.getItem('chmat_active_theme') || 'white_queen';
    
    // Force apply the class if it's white queen
    if(active === 'white_queen') {
        document.body.classList.add('theme-white-queen');
        startSnowfall();
        startRain();
    }

    // Force Roses to show (Clear old session)
    sessionStorage.removeItem('rani_entry_shown');
    setTimeout(() => {
        window.startRoseShower();
    }, 1000);
});

window.themesData = themes;
