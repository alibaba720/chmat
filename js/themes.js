// CHMAT Advanced Theme Engine V2

const themes = {
    // --- RESERVED (MR TIGER & QUEEN) ---
    "victor_doom": {
        name: "Victor Von Doom", type: "demon", isReserved: true,
        bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)",
        primary: "#00ff00", text: "#ffffff", border: "#004400",
        reservedText: "This legendary theme is permanently reserved for Mr. Tiger."
    },
    "white_queen": {
        name: "White Queen", type: "angel", isReserved: true,
        bgGradient: "linear-gradient(135deg, #ffffff, #e0e0e0, #ffffff)",
        primary: "#888888", text: "#111111", border: "#cccccc",
        reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe."
    },

    // --- ANGELS (HEROES) ---
    "iron_man": { name: "Iron Man", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #3a0000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#550000" },
    "thor": { name: "Thor", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #001a33, #000000)", primary: "#00bfff", text: "#ffffff", border: "#003366" },
    "captain_america": { name: "Captain America", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #0a1b3a, #000000)", primary: "#1e3a8a", text: "#ffffff", border: "#112a5c" },
    "spiderman": { name: "Spider-Man", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", primary: "#e62429", text: "#ffffff", border: "#660000" },
    "doctor_strange": { name: "Doctor Strange", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#4a148c", text: "#ffffff", border: "#330066" },
    "hulk": { name: "Hulk", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #003300, #000000)", primary: "#00ff00", text: "#ffffff", border: "#005500" },
    "captain_marvel": { name: "Captain Marvel", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", primary: "#ffcc00", text: "#ffffff", border: "#664400" },
    "scarlet_witch": { name: "Scarlet Witch", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #4a0000, #000000)", primary: "#e60000", text: "#ffffff", border: "#800000" },
    "black_widow": { name: "Black Widow", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a1a1a, #000000)", primary: "#ff0000", text: "#ffffff", border: "#333333" },
    "black_panther": { name: "Black Panther", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#6600cc", text: "#ffffff", border: "#330066" },
    "ant_man": { name: "Ant-Man", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #330000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#660000" },
    "star_lord": { name: "Star-Lord", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #331a00, #000000)", primary: "#ff6600", text: "#ffffff", border: "#663300" },
    "hawkeye": { name: "Hawkeye", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a0033, #000000)", primary: "#8000ff", text: "#ffffff", border: "#330066" },
    "winter_soldier": { name: "Winter Soldier", type: "angel", bgGradient: "linear-gradient(135deg, #000000, #1a1a1a, #000000)", primary: "#cc0000", text: "#ffffff", border: "#333333" },

    // --- DEMONS (VILLAINS) ---
    "thanos": { name: "Thanos", type: "demon", bgGradient: "linear-gradient(135deg, #050505, #1a0033, #050505)", primary: "#9c27b0", text: "#ffffff", border: "#330066" },
    "venom": { name: "Venom", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #111111, #000000)", primary: "#ff003c", text: "#ffffff", border: "#333333" },
    "loki": { name: "Loki", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #003300, #000000)", primary: "#2e7d32", text: "#ffffff", border: "#004400" },
    "ultron": { name: "Ultron", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #330000, #000000)", primary: "#d32f2f", text: "#ffffff", border: "#660000" },
    "hela": { name: "Hela", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #003333, #000000)", primary: "#00cccc", text: "#ffffff", border: "#006666" },
    "green_goblin": { name: "Green Goblin", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #003300, #000000)", primary: "#33cc33", text: "#ffffff", border: "#006600" },
    "kang": { name: "Kang", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #330033, #000000)", primary: "#00ffcc", text: "#ffffff", border: "#660066" },
    "deadpool": { name: "Deadpool", type: "demon", bgGradient: "linear-gradient(135deg, #000000, #330000, #000000)", primary: "#ff0000", text: "#ffffff", border: "#660000" }
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
    console.log("V2 Theme applied:", theme.name);
};

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
    applyTheme(savedTheme);
});

window.themesData = themes;
