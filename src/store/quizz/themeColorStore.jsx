import { create } from "zustand";

const colors = ["#FFEB3B", "#5DBE74", "#993E3E", "#1F6A73", "#5B44F2", "#C39BD3"];

const useThemeColorStore = create((set, get) => ({
    themeColors: {}, // Stockage des couleurs
    assignColors: (themes) => {
        set((state) => {
            const newColors = { ...state.themeColors };

            themes.forEach((theme, index) => {
                if (!newColors[theme]) {
                    newColors[theme] = colors[index % colors.length]; // Associer une couleur
                }
            });

            console.log("🎨 [DEBUG] Couleurs assignées :", newColors); // ✅ Log pour voir les couleurs assignées
            return { themeColors: newColors };
        });
    },
    getColor: (theme) => {
        const color = get().themeColors[theme] || "#CCCCCC"; // Retourne une couleur par défaut si absent
        console.log(`🎨 [DEBUG] Récupération couleur pour ${theme} :`, color); // ✅ Log pour voir quelle couleur est récupérée
        return color;
    },
}));

export default useThemeColorStore;

