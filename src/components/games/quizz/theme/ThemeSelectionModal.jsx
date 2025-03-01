import { useEffect } from "react";
import { useThemes } from "@/hooks/games/quizz/useThemes";
import useGameStore from "@/store/quizz/gameStore";
import ThemeCard from "./ThemeCard";

export default function ThemeSelectionModal({ gameId, playerId, onClose }) {
  const { themes, selectedTheme, selectTheme } = useThemes(gameId, playerId);
  const game = useGameStore((state) => state.game);

  console.log("📡 [DEBUG] Props de ThemeSelectionModal :", { gameId, playerId, themes, selectedTheme });
  console.log("🎯 [DEBUG] selectedThemes depuis Zustand :", game?.rules?.selectedThemes); // Vérification

  useEffect(() => {
    console.log("🔄 [DEBUG] L'état selectedTheme a changé :", selectedTheme);
  }, [selectedTheme]);

  if (!gameId || !playerId) {
    console.error("❌ [ERREUR] gameId ou playerId est undefined dans ThemeSelectionModal !");
    return null;
  }

  useEffect(() => {
    if (selectedTheme) {
        console.log("✅ [DEBUG] Thème bien récupéré, fermeture de la modale !");
        onClose(); // 🚀 Fermer la modale une fois que selectedTheme est mis à jour
    }
  }, [selectedTheme]);

  return (
    <div className="modalThemes">
      <div className="modalThemes__content">
        {game?.rules?.selectedThemes?.length > 0 ? ( // 🔥 Utiliser `selectedThemes` ici
          game.rules.selectedThemes.map((theme) => ( 
            <ThemeCard 
              key={theme} 
              theme={theme}
              color="#f0f0f0"
              isSelected={selectedTheme === theme} 
              onSelect={() => {
                selectTheme(theme, onClose); // 🔥 Attendre la mise à jour avant de fermer
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
