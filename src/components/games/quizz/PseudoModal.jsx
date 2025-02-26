import { useState, useEffect } from "react";
import { joinGame, fetchGame, fetchPlayers } from "@/services/gameService";
import { useRouter } from "next/router";

export default function PseudoModal({ gameId, onSave }) {
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [isFull, setIsFull] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfFull = async () => {
      if (!gameId) return;

      const game = await fetchGame(gameId); // ✅ Récupère les règles depuis la BDD
      if (!game || !game.rules?.maxPlayers) return;

      const players = await fetchPlayers(gameId);
      const activePlayers = players.filter(player => !player.is_spectator).length;

      console.log(`👥 Joueurs actifs : ${activePlayers} / ${game.rules.maxPlayers}`);

      if (activePlayers >= game.rules.maxPlayers) {
        console.log("⛔ Partie pleine, activation du mode spectateur.");
        setIsFull(true);
      }
    };

    checkIfFull();
  }, [gameId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim()) {
      setError("Le pseudo ne peut pas être vide !");
      return;
    }
    if (pseudo.length < 3) {
      setError("Le pseudo doit avoir au moins 3 caractères !");
      return;
    }

    setError("");
    console.log(`🚀 Tentative de rejoindre la partie ${gameId} avec le pseudo ${pseudo}`);

    try {
      const user = await joinGame(gameId, pseudo.trim());
      if (user?.uuid) {
        console.log("✅ UUID récupéré :", user.uuid);
        localStorage.setItem("uuid", user.uuid);
        onSave(pseudo);
      } else {
        setError("❌ Erreur lors de la récupération de l'UUID !");
      }
    } catch (error) {
      console.error("❌ Erreur joinGame :", error);
      setError("❌ Impossible de rejoindre la partie !");
    }
  };

  const handleSpectate = () => {
    console.log("👀 Mode spectateur activé pour la partie :", gameId);
    onSave("Spectateur");
  };

  const handleHome = () => {
    console.log("🏠 Retour à l'accueil");
    router.push("/");
  };

  return (
    <div className="pseudoModal layout">
      <div className="pseudoModal__content">
        <h2>{isFull ? "La partie est pleine" : "Entrez votre pseudo"}</h2>
        
        {isFull ? (
          <>
            <p>Vous pouvez regarder en tant que spectateur ou retourner au menu.</p>
            <div className="pseudoModal__buttons">
              <button onClick={handleSpectate}>👀 Mode spectateur</button>
              <button onClick={handleHome}>🏠 Retour au menu</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Votre pseudo.."
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              autoFocus
              disabled={isFull} // 🔥 Bloque l'input si la partie est pleine
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={isFull}>Let's goooooo</button> {/* 🔥 Bloque aussi le bouton */}
          </form>
        )}
      </div>
    </div>
  );
}
