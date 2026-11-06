// CHMAT Theme Engine
// Colors are stored as CSS variables to apply globally

const themes = {
    // --- MR TIGER & QUEEN (Reserved) ---
    "victor_doom": {
        name: "Victor Von Doom",
        bg: "#0a0a0a", // Pitch black
        text: "#ffffff", // White
        primary: "#00ff00", // Doom Green
        border: "#1a1a1a",
        isReserved: true,
        reservedText: "This legendary theme is permanently reserved for Mr. Tiger."
    },
    "white_queen": {
        name: "White Queen",
        bg: "#f8f9fa", // Pure White
        text: "#000000", // Black text for contrast
        primary: "#c0c0c0", // Silver
        border: "#e0e0e0",
        isReserved: true,
        reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe."
    },

    // --- ANGELS (Superheroes) ---
    "iron_man": { name: "Iron Man", bg: "#000000", text: "#ffffff", primary: "#ff0000", border: "#331111" },
    "thor": { name: "Thor", bg: "#000000", text: "#ffffff", primary: "#00bfff", border: "#112233" },
    "captain_america": { name: "Captain America", bg: "#000000", text: "#ffffff", primary: "#1e3a8a", border: "#112233" },
    "spiderman": { name: "Spider-Man", bg: "#000000", text: "#ffffff", primary: "#e62429", border: "#221111" },
    "doctor_strange": { name: "Doctor Strange", bg: "#000000", text: "#ffffff", primary: "#4a148c", border: "#1a0b2e" },

    // --- DEMONS (Villains) ---
    "thanos": { name: "Thanos", bg: "#000000", text: "#ffffff", primary: "#9c27b0", border: "#2e1a47" },
    "venom": { name: "Venom", bg: "#000000", text: "#ffffff", primary: "#ff003c", border: "#222222" },
    "loki": { name: "Loki", bg: "#000000", text: "#ffffff", primary: "#2e7d32", border: "#1b2a1b" },
    "ultron": { name: "Ultron", bg: "#000000", text: "#ffffff", primary: "#d32f2f", border: "#331111" },
    "evil_cap": { name: "Hydra Captain America", bg: "#000000", text: "#ffffff", primary: "#006400", border: "#112211" }
};

window.applyTheme = function(themeId) {
    const theme = themes[themeId];
    if (!theme) return;

    // Set CSS variables on the root element
    document.documentElement.style.setProperty('--theme-bg', theme.bg);
    document.documentElement.style.setProperty('--theme-text', theme.text);
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-border', theme.border);
    
    // Save to localStorage for persistence
    localStorage.setItem('chmat_active_theme', themeId);
    console.log("Theme applied:", theme.name);
};

// On Load, apply saved theme or default to Iron Man
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
    applyTheme(savedTheme);
});

window.themesData = themes; // Export for UI use
