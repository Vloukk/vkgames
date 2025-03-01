import { useState, useEffect } from "react";

import { useThemes } from "@/hooks/games/quizz/useThemes";
import ThemeCard from "./ThemeCard";

export default function ThemeSelectionModal({ gameId, playerId, onClose }) {
  const { themes, selectedTheme, selectTheme } = useThemes(gameId, playerId); // ✅ Ajout de selectedTheme

  console.log("📌 selectTheme dans ThemeSelectionModal:", selectTheme);
  console.log("📌 [DEBUG] selectTheme passé en prop :", selectTheme);


  useEffect(() => {
    console.log("🔄 [DEBUG] L'état selectedTheme a changé :", selectedTheme);
  }, [selectedTheme]);
  

  if (!gameId || !playerId) {
    console.error("❌ [ERREUR] gameId ou playerId est undefined dans ThemeSelectionModal !");
    return null;
  }

  return (
    <div onClose={onClose} className="modalThemes">
      <div className="modalThemes__content">
      {themes.map((theme, index) => (
        <ThemeCard 
          key={theme} 
          theme={theme} // ✅ Passe bien la string ici
          color="#f0f0f0" 
          isSelected={selectedTheme === theme} // ✅ Vérification correcte
          onSelect={(theme) => {
            selectTheme(theme); // ✅ Met à jour la BDD
            onClose(); // ✅ Ferme la modal après sélection
          }}
        />
      ))}
      </div>
    </div>
  );
}

