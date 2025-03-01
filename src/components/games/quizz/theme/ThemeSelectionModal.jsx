import { useEffect } from "react";
import { useThemes } from "@/hooks/games/quizz/useThemes";
import useGameStore from "@/store/quizz/gameStore";
import useThemeColorStore from "@/store/quizz/themeColorStore"; // Import du store Zustand
import ThemeCard from "./ThemeCard";

export default function ThemeSelectionModal({ gameId, playerId, onClose }) {
    const { themes, selectedTheme, selectTheme } = useThemes(gameId, playerId);
    const game = useGameStore((state) => state.game);
    const { assignColors, getColor } = useThemeColorStore(); // Récupération des couleurs

    useEffect(() => {
        if (themes.length > 0) {
            assignColors(themes); // ⚡ Assigner les couleurs une seule fois
        }
    }, [themes]);

    useEffect(() => {
        console.log("🔄 [DEBUG] L'état selectedTheme a changé :", selectedTheme);
        if (selectedTheme) {
            console.log("✅ [DEBUG] Thème bien récupéré, fermeture de la modale !");
            onClose(); 
        }
    }, [selectedTheme]);

    if (!gameId || !playerId) {
        console.error("❌ [ERREUR] gameId ou playerId est undefined dans ThemeSelectionModal !");
        return null;
    }

    return (
        <div className="modalThemes">
          <span>Choisissez votre theme</span>
            <div className="modalThemes__content">
                {game?.rules?.selectedThemes?.length > 0 ? (
                    game.rules.selectedThemes.map((theme) => (
                        <ThemeCard 
                            key={theme} 
                            theme={theme}
                            color={getColor(theme)} // 🔥 Appliquer la couleur associée
                            isSelected={selectedTheme === theme} 
                            onSelect={() => {
                                selectTheme(theme, onClose);
                            }}              
                        />
                    ))
                ) : (
                    <p>⚠️ Aucun thème sélectionné.</p>
                )}
            </div>
        </div>
    );
}

