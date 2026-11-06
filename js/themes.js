// CHMAT Theme Engine V4 (Preview & Images)

const themes = {
    // --- RESERVED ---
    "victor_doom": {
        name: "Victor Von Doom", type: "demon", isReserved: true,
        image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600&auto=format&fit=crop",
        caption: "Bow down to the King. Absolute power, absolute control.",
        bgGradient: "linear-gradient(135deg, #050505, #002200, #050505)",
        primary: "#00ff00", text: "#ffffff", border: "#004400",
        reservedText: "This legendary theme is permanently reserved for Mr. Tiger."
    },
    "white_queen": {
        name: "White Queen", type: "angel", isReserved: true,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
        caption: "Elegance, purity, and unmatched power. The Queen's aura.",
        bgGradient: "linear-gradient(135deg, #ffffff, #e0e0e0, #ffffff)",
        primary: "#888888", text: "#111111", border: "#cccccc",
        reservedText: "This celestial theme is eternally reserved for the Queen of the CHMAT Universe."
    },

    // --- SUPERHEROES ---
    "iron_man": { 
        name: "Iron Man", type: "angel", 
        image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=600&auto=format&fit=crop",
        caption: "Genius. Billionaire. Playboy. Philanthropist. I am Iron Man.",
        bgGradient: "linear-gradient(135deg, #000000, #3a0000, #000000)", 
        primary: "#ff0000", text: "#ffffff", border: "#550000" 
    },
    "thor": { 
        name: "Thor", type: "angel", 
        image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=600&auto=format&fit=crop",
        caption: "I am Thor, son of Odin. Bring me Thanos!",
        bgGradient: "linear-gradient(135deg, #000000, #001a33, #000000)", 
        primary: "#00bfff", text: "#ffffff", border: "#003366" 
    },
    "spiderman": { 
        name: "Spider-Man", type: "angel", 
        image: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?q=80&w=600&auto=format&fit=crop",
        caption: "With great power comes great responsibility.",
        bgGradient: "linear-gradient(135deg, #000000, #330000, #000033)", 
        primary: "#e62429", text: "#ffffff", border: "#660000" 
    },
    "captain_america": { 
        name: "Captain America", type: "angel", 
        image: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=600&auto=format&fit=crop",
        caption: "I can do this all day. Avengers Assemble!",
        bgGradient: "linear-gradient(135deg, #000000, #0a1b3a, #000000)", 
        primary: "#1e3a8a", text: "#ffffff", border: "#112a5c" 
    },

    // --- VILLAINS AURA ---
    "thanos": { 
        name: "Thanos", type: "demon", 
        image: "https://images.unsplash.com/photo-1620336655052-b57986a1b4d6?q=80&w=600&auto=format&fit=crop",
        caption: "I am inevitable. Perfectly balanced, as all things should be.",
        bgGradient: "linear-gradient(135deg, #050505, #1a0033, #050505)", 
        primary: "#9c27b0", text: "#ffffff", border: "#330066" 
    },
    "venom": { 
        name: "Venom", type: "demon", 
        image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=600&auto=format&fit=crop",
        caption: "We are Venom. You are a loser, and we are going to eat your brain.",
        bgGradient: "linear-gradient(135deg, #000000, #111111, #000000)", 
        primary: "#ff003c", text: "#ffffff", border: "#333333" 
    }
    // Baaki themes ko aap baad mein add kar sakte hain isi format mein
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
};

// Global Loader
(function applyGlobalTheme() {
    const savedTheme = localStorage.getItem('chmat_active_theme') || 'iron_man';
    if (themes[savedTheme]) {
        const theme = themes[savedTheme];
        const root = document.documentElement.style;
        root.setProperty('--theme-bg-grad', theme.bgGradient);
        root.setProperty('--theme-primary', theme.primary);
        root.setProperty('--theme-text', theme.text);
        root.setProperty('--theme-border', theme.border);
    }
})();

window.themesData = themes;
