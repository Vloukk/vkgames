import { useState } from "react";
import { leaveGame, copyGameLink } from "@/services/gameService";

export default function GameActions({ gameId, uuid, router }) {
  const [copySuccess, setCopySuccess] = useState("");
  console.log("🛠️ Props reçues dans GameActions :", { gameId, uuid });

  const handleLeaveGame = async () => {
    console.log("🚪 Tentative de quitter la partie avec gameId:", gameId, "et uuid:", uuid);
  
    if (!gameId || !uuid) {
      console.error("❌ Erreur: gameId ou uuid manquant !");
      console.log("🔍 Vérifie si uuid est bien enregistré :", localStorage.getItem("userId"));
      return;
    }
  
    const success = await leaveGame(gameId, uuid);
  
    if (success) {
      console.log("✅ Joueur quitté avec succès !");
      localStorage.removeItem("userId");
      router.push("/");
    }
  };

  return (
    <div className="gameActions">
      <button onClick={handleLeaveGame} className="btn btn-danger">
        Quitter la partie
      </button>
      <button onClick={() => copyGameLink(gameId, setCopySuccess)} className="btn btn-primary">
        Copier le lien
      </button>
      {copySuccess && <span className="copy-success">{copySuccess}</span>}
    </div>
  );
}

