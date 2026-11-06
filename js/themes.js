// CHMAT Advanced Theme Engine

const themes = {
    // --- MR TIGER & QUEEN (Reserved) ---
    "victor_doom": {
        name: "Victor Von Doom",
        bg: "#0a0a0a", text: "#ffffff", primary: "#00ff00", border: "#1a1a1a",
        btnBg: "#004400", btnText: "#00ff00",
        font: "'Times New Roman', serif", logoFont: "'Cinzel', serif", logoColor: "#00ff00",
        isReserved: true, reservedText: "This legendary theme is permanently reserved for Mr. Tiger."
    },
    "white_queen": {
        name: "White Queen",
        bg: "#f4f4f4", text: "#111111", primary: "#c0c0c0", border: "#dddddd",
        btnBg: "#111111", btnText: "#ffffff",
        font: "'Georgia', serif", logoFont: "'Playfair Display', serif", logoColor: "#000000",
        isReserved: true, reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe."
    },

    // --- ANGELS (Superheroes) ---
    "iron_man": { 
        name: "Iron Man", 
        bg: "#050505", text: "#ffffff", primary: "#ff0000", border: "#331111",
        btnBg: "#ff0000", btnText: "#ffffff",
        font: "'Orbitron', sans-serif", logoFont: "'Orbitron', sans-serif", logoColor: "#ffd700"
    },
    "thor": { 
        name: "Thor", 
        bg: "#0b1320", text: "#ffffff", primary: "#00bfff", border: "#1a2a40",
        btnBg: "#0055ff", btnText: "#ffffff",
        font: "'Trebuchet MS', sans-serif", logoFont: "'Impact', sans-serif", logoColor: "#00bfff"
    },
    "captain_america": { 
        name: "Captain America", 
        bg: "#0a1128", text: "#ffffff", primary: "#1e3a8a", border: "#1a2547",
        btnBg: "#1e3a8a", btnText: "#ffffff",
        font: "'Arial', sans-serif", logoFont: "'Impact', sans-serif", logoColor: "#ff0000"
    },

    // --- DEMONS (Villains) ---
    "thanos": { 
        name: "Thanos", 
        bg: "#110b1a", text: "#ffffff", primary: "#9c27b0", border: "#2e1a47",
        btnBg: "#6a1b9a", btnText: "#ffffff",
        font: "'Verdana', sans-serif", logoFont: "'Impact', sans-serif", logoColor: "#9c27b0"
    },
    "venom": { 
        name: "Venom", 
        bg: "#000000", text: "#ffffff", primary: "#ff003c", border: "#222222",
        btnBg: "#ff003c", btnText: "#ffffff",
        font: "'Comic Sans MS', cursive", logoFont: "'Comic Sans MS', cursive", logoColor: "#ff003c"
    }
};

window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;

    const root = document.documentElement.style;
    root.setProperty('--theme-bg', theme.bg);
    root.setProperty('--theme-text', theme.text);
    root.setProperty('--theme-primary', theme.primary);
    root.setProperty('--theme-border', theme.border);
    root.setProperty('--theme-btn-bg', theme.btnBg);
    root.setProperty('--theme-btn-text', theme.btnText);
    root.setProperty('--theme-font', theme.font);
    root.setProperty('--theme-logo-font', theme.logoFont);
    root.setProperty('--theme-logo-color', theme.logoColor);
    
    localStorage.setItem('chmat_active_theme', themeId);
    console.log("Advanced Theme applied:", theme.name);
};

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
    applyTheme(savedTheme);
});

window.themesData = themes;
