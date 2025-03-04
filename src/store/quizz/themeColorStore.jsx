import { create } from "zustand";
import { persist } from "zustand/middleware";

const colors = ["#FFEB3B", "#5DBE74", "#993E3E", "#1F6A73", "#5B44F2", "#C39BD3"];

const useThemeColorStore = create(
    persist(
        (set, get) => ({
            themeColors: {}, // Stocke les couleurs par ID de thème
            
            assignColors: (themes) => {
                set((state) => {
                    let newColors = { ...state.themeColors };
                    let usedColors = new Set(Object.values(newColors));

                    console.log("🎨 [DEBUG] Assignation des couleurs aux thèmes :", themes);
                    console.log("🎨 [DEBUG] Couleurs déjà en mémoire :", newColors);

                    themes.forEach((themeId) => {
                        if (!newColors[themeId]) { // Assigner une couleur uniquement si elle n'existe pas déjà
                            let availableColors = colors.filter(c => !usedColors.has(c));

                            if (availableColors.length === 0) {
                                availableColors = colors; // 🔄 Recycler si nécessaire
                            }

                            const selectedColor = availableColors.shift(); // 🔹 Prend la première couleur disponible
                            newColors[themeId] = selectedColor;
                            usedColors.add(selectedColor);

                            console.log(`🎨 [DEBUG] Couleur assignée au thème ${themeId} : ${selectedColor}`);
                        }
                    });

                    console.log("🎨 [DEBUG] État final des couleurs :", newColors);
                    return { themeColors: newColors };
                });
            },

            getColor: (themeId) => {
                const store = get();
                return store.themeColors[themeId] || "#FFFFFF"; // ✅ Retourne une couleur blanche si non trouvée
            },
        }),
        { name: "theme-colors-storage" }
    )
);


export default useThemeColorStore;
