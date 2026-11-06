// CHMAT Advanced Theme Engine V3

const themes = {
    // --- RESERVED (MR TIGER & QUEEN) ---
    "victor_doom": {
        name: "Victor Von Doom", type: "demon", isReserved: true,
        bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)",
        primary: "#00ff00", text: "#ffffff", border: "#004400",
        fontFamily: "'Cinzel', serif", btnRadius: "0px", btnShadow: "0 0 10px #00ff00",
        reservedText: "This legendary theme is permanently reserved for Mr. Tiger."
    },
    "white_queen": {
        name: "White Queen", type: "angel", isReserved: true,
        bgGradient: "linear-gradient(135deg, #ffffff, #e0e0e0, #ffffff)",
        primary: "#888888", text: "#111111", border: "#cccccc",
        fontFamily: "'Playfair Display', serif", btnRadius: "20px", btnShadow: "0 4px 15px rgba(0,0,0,0.1)",
        reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe."
    },

    // --- SUPERHEROES ---
    "iron_man": { name: "Iron Man", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #3a0000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#550000", fontFamily: "'Orbitron', sans-serif", btnRadius: "4px", btnShadow: "0 0 10px #ff0000" },
    "thor": { name: "Thor", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #001a33, #000000)", primary: "#00bfff", text: "#ffffff", border: "#003366", fontFamily: "'Trebuchet MS', sans-serif", btnRadius: "12px", btnShadow: "0 0 15px #00bfff" },
    "captain_america": { name: "Captain America", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #0a1b3a, #000000)", primary: "#1e3a8a", text: "#ffffff", border: "#112a5c", fontFamily: "'Arial', sans-serif", btnRadius: "8px", btnShadow: "none" },
    "spiderman": { name: "Spider-Man", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", primary: "#e62429", text: "#ffffff", border: "#660000", fontFamily: "'Comic Sans MS', cursive", btnRadius: "15px", btnShadow: "0 4px 10px rgba(230,36,41,0.4)" },
    "doctor_strange": { name: "Doctor Strange", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#4a148c", text: "#ffffff", border: "#330066", fontFamily: "'Georgia', serif", btnRadius: "50px", btnShadow: "0 0 20px #4a148c" },
    "hulk": { name: "Hulk", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #003300, #000000)", primary: "#00ff00", text: "#ffffff", border: "#005500", fontFamily: "'Impact', sans-serif", btnRadius: "0px", btnShadow: "0 5px 0 #005500" },
    "captain_marvel": { name: "Captain Marvel", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", primary: "#ffcc00", text: "#ffffff", border: "#664400", fontFamily: "'Arial Black', sans-serif", btnRadius: "10px", btnShadow: "0 0 15px #ffcc00" },
    "scarlet_witch": { name: "Scarlet Witch", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #4a0000, #000000)", primary: "#e60000", text: "#ffffff", border: "#800000", fontFamily: "'Times New Roman', serif", btnRadius: "20px", btnShadow: "0 0 15px #e60000" },
    "black_widow": { name: "Black Widow", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a1a1a, #000000)", primary: "#ff0000", text: "#ffffff", border: "#333333", fontFamily: "'Courier New', monospace", btnRadius: "8px", btnShadow: "none" },
    "black_panther": { name: "Black Panther", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#6600cc", text: "#ffffff", border: "#330066", fontFamily: "'Verdana', sans-serif", btnRadius: "5px", btnShadow: "0 0 10px #6600cc" },
    "ant_man": { name: "Ant-Man", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #330000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#660000", fontFamily: "'Arial', sans-serif", btnRadius: "4px", btnShadow: "none" },
    "star_lord": { name: "Star-Lord", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #331a00, #000000)", primary: "#ff6600", text: "#ffffff", border: "#663300", fontFamily: "'Trebuchet MS', sans-serif", btnRadius: "12px", btnShadow: "0 4px 10px rgba(255,102,0,0.3)" },
    "hawkeye": { name: "Hawkeye", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#8000ff", text: "#ffffff", border: "#330066", fontFamily: "'Arial', sans-serif", btnRadius: "10px", btnShadow: "none" },
    "winter_soldier": { name: "Winter Soldier", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a1a1a, #000000)", primary: "#cc0000", text: "#ffffff", border: "#333333", fontFamily: "'Courier New', monospace", btnRadius: "0px", btnShadow: "none" },

    // --- VILLAINS AURA ---
    "thanos": { name: "Thanos", type: "demon", bgGradient: "linear-gradient(135deg, #050505, #1a0033, #050505)", primary: "#9c27b0", text: "#ffffff", border: "#330066", fontFamily: "'Verdana', sans-serif", btnRadius: "50px", btnShadow: "0 0 15px #9c27b0" },
    "venom": { name: "Venom", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #111111, #000000)", primary: "#ff003c", text: "#ffffff", border: "#333333", fontFamily: "'Comic Sans MS', cursive", btnRadius: "5px", btnShadow: "0 0 20px #ff003c" },
    "loki": { name: "Loki", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #003300, #000000)", primary: "#2e7d32", text: "#ffffff", border: "#004400", fontFamily: "'Times New Roman', serif", btnRadius: "8px", btnShadow: "0 0 10px #2e7d32" },
    "ultron": { name: "Ultron", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #330000, #000000)", primary: "#d32f2f", text: "#ffffff", border: "#660000", fontFamily: "'Orbitron', sans-serif", btnRadius: "0px", btnShadow: "0 5px 0 #660000" },
    "hela": { name: "Hela", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #003333, #000000)", primary: "#00cccc", text: "#ffffff", border: "#006666", fontFamily: "'Impact', sans-serif", btnRadius: "0px", btnShadow: "0 0 15px #00cccc" },
    "green_goblin": { name: "Green Goblin", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #003300, #000000)", primary: "#33cc33", text: "#ffffff", border: "#006600", fontFamily: "'Courier New', monospace", btnRadius: "8px", btnShadow: "none" },
    "kang": { name: "Kang", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #330033, #000000)", primary: "#00ffcc", text: "#ffffff", border: "#660066", fontFamily: "'Trebuchet MS', sans-serif", btnRadius: "4px", btnShadow: "0 0 10px #00ffcc" },
    "deadpool": { name: "Deadpool", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #330000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#660000", fontFamily: "'Comic Sans MS', cursive", btnRadius: "15px", btnShadow: "0 4px 10px rgba(255,0,0,0.4)" }
};

window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;

    const root = document.documentElement.style;
    root.setProperty('--theme-bg-grad', theme.bgGradient);
    root.setProperty('--theme-primary', theme.primary);
    root.setProperty('--theme-text', theme.text);
    root.setProperty('--theme-border', theme.border);
    root.setProperty('--theme-font', theme.fontFamily);
    root.setProperty('--theme-btn-radius', theme.btnRadius);
    root.setProperty('--theme-btn-shadow', theme.btnShadow);
    
    localStorage.setItem('chmat_active_theme', themeId);
    
    // Apply font to body
    document.body.style.fontFamily = theme.fontFamily;
};

// Global Loader - Runs on every page
(function applyGlobalTheme() {
    const savedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
    if (themes[savedTheme]) {
        const theme = themes[savedTheme];
        const root = document.documentElement.style;
        root.setProperty('--theme-bg-grad', theme.bgGradient);
        root.setProperty('--theme-primary', theme.primary);
        root.setProperty('--theme-text', theme.text);
        root.setProperty('--theme-border', theme.border);
        root.setProperty('--theme-font', theme.fontFamily);
        root.setProperty('--theme-btn-radius', theme.btnRadius);
        root.setProperty('--theme-btn-shadow', theme.btnShadow);
    }
})();

window.themesData = themes;
