import { useRouter } from "next/router";
import { useState, useEffect } from "react";

//hooks
import useGame from "@/hooks/games/quizz/UseGame";
import usePlayers from "@/hooks/games/quizz/UsePlayers";
import usePlayerSession from "@/hooks/games/quizz/UsePlayerSession";

// Components
import GameActions from "@/components/games/quizz/player/GameActions";
import PlayersList from "@/components/games/quizz/player/PlayerList";
import PlayerInfos from "@/components/games/quizz/player/PlayerInfos";
import ReadyStatus from "@/components/games/quizz/ReadyStatus";
import RulesModal from "@/components/games/quizz/game/RulesModal";
import PseudoModal from "@/components/games/quizz/player/PseudoModal";
import ThemeSelectionModal from "@/components/games/quizz/theme/ThemeSelectionModal";

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;

  const { pseudo, setPseudo, uuid, showPseudoModal, setShowPseudoModal } = usePlayerSession(gameId);
  const { game, isLoading: gameLoading } = useGame(gameId);
  const { players, isSpectator } = usePlayers(gameId, uuid);

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // ✅ Afficher la modale des règles pour l'hôte
  useEffect(() => {
    if (game && uuid && !isSpectator) {
      const rulesSeen = localStorage.getItem(`rulesSeen-${gameId}`);
      if (game.host_pseudo === pseudo && !rulesSeen) {
        setShowRulesModal(true);
        localStorage.setItem(`rulesSeen-${gameId}`, "true");
      }
    }
  }, [game, pseudo, gameId, uuid, isSpectator]);

  // Afficher la modale si le joueur est l'hôte et les thèmes sont chargés
  useEffect(() => {
    if (game?.rules?.availableThemes?.length > 0 && !isSpectator) {
      console.log("🎨 [DEBUG] Activation de la sélection des thèmes.");
      setShowThemeModal(true);
    }
  }, [game, isSpectator]);

  if (gameLoading) return <p>Chargement...</p>;

  //////////////////////////////////////////////////////////////
  console.log("📡 [DEBUG] showThemeModal :", showThemeModal);
  console.log("📡 [DEBUG] game.rules.selectedThemes :", game?.rules?.selectedThemes);

  return (
    <div className="gameQuizz">
      {/* ✅ S'assurer que PseudoModal ne bloque pas RulesModal */}
      {showPseudoModal && (
        <PseudoModal
          gameId={gameId}
          onSave={(newPseudo) => {
            if (!newPseudo.trim()) return;
            setPseudo(newPseudo);
            localStorage.setItem("pseudo", newPseudo);
            setShowPseudoModal(false);
          }}
        />
      )}

      {/* ✅ Afficher RulesModal uniquement si le joueur est l'hôte */}
      {gameId && showRulesModal && <RulesModal gameId={gameId} onClose={() => setShowRulesModal(false)} />}

      <button onClick={() => setShowThemeModal(true)}>Ouvrir ThemeModal</button>
      {showThemeModal && (
        <ThemeSelectionModal
          gameId={gameId}
          playerId={uuid}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      <div className="gameQuizz__utils">
        {!isSpectator && <GameActions gameId={gameId} uuid={uuid} router={router} />}
        {!isSpectator && <PlayerInfos pseudo={pseudo} selectedTheme={game?.rules?.selectedTheme || ""} />}
        <PlayersList gameId={gameId} />
        {!isSpectator && <ReadyStatus gameId={gameId} uuid={uuid} isGameStarted={game?.is_started} />}
      </div>
    </div>
  );
}