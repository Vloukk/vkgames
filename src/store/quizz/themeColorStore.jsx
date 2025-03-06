import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeColorStore = create(
  persist(
    (set, get) => ({
      themeColors: {},

      assignColors: (themeIds) => {
        console.log("🎨 [DEBUG] Assignation des couleurs pour cette partie :", themeIds);
        console.log("🎨 [DEBUG] État des couleurs AVANT assignation :", get().themeColors);

        const colorPalette = ["#FFEB3B", "#5DBE74", "#993E3E", "#1F6A73", "#5B44F2", "#C39BD3"];
        const shuffledColors = [...colorPalette].sort(() => Math.random() - 0.5); // Mélange des couleurs

        const newColors = {};
        themeIds.forEach((themeId, index) => {
          if (!get().themeColors[themeId]) { 
            newColors[themeId] = shuffledColors[index % shuffledColors.length]; // ✅ Assigne une couleur seulement si elle n’existe pas
          }
        });

        console.log("🎨 [DEBUG] Nouveau mapping des couleurs :", newColors);

        set((state) => ({
          themeColors: { ...state.themeColors, ...newColors } // ✅ Conserve les anciennes couleurs
        }));
      },

      getColor: (themeId) => {
        if (!themeId) {
          console.warn("⚠️ [DEBUG] Aucun themeId reçu pour getColor !");
          return "#FFFFFF";
        }

        // ✅ Forcer React à détecter les changements
        const themeColors = get().themeColors;
        const color = themeColors[themeId] || "#FFFFFF";

        console.log("🎨 [DEBUG] getColor - ThemeId :", themeId, "=> Couleur :", color);

        return color;
      },
    }),
    {
      name: "themeColorStore", // Nom pour le localStorage
      getStorage: () => localStorage, // Utilise localStorage pour persister les couleurs
    }
  )
);

export default useThemeColorStore;
