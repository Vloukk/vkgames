import { useEffect } from "react";
import { useThemes } from "@/hooks/games/quizz/useThemes";
import ThemeCard from "./ThemeCard";

export default function ThemeSelectionModal({ gameId, playerId, onClose }) {
  const { themes, selectedTheme, selectTheme } = useThemes(gameId, playerId);
  console.log("📡 [DEBUG] Props de ThemeSelectionModal :", { gameId, playerId, themes, selectedTheme });

  useEffect(() => {
    console.log("🔄 [DEBUG] L'état selectedTheme a changé :", selectedTheme);
  }, [selectedTheme]);

  if (!gameId || !playerId) {
    console.error("❌ [ERREUR] gameId ou playerId est undefined dans ThemeSelectionModal !");
    return null;
  }

  return (
    <div className="modalThemes">
      <div className="modalThemes__content">
        {themes.length > 0 ? (
          themes.map((theme) => (
            <ThemeCard 
              key={theme} 
              theme={theme}
              color="#f0f0f0"
              isSelected={selectedTheme === theme} 
              onSelect={() => {
                selectTheme(theme);
                onClose();
              }}
            />
          ))
        ) : (
          <p>⚠️ Aucun thème disponible.</p>
        )}
      </div>
    </div>
  );
}
