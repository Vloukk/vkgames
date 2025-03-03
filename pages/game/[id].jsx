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
import PageTransition from "@/components/utils/PageTransition";

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;

  const { pseudo, setPseudo, uuid, showPseudoModal, setShowPseudoModal } = usePlayerSession(gameId);
  const { game, isLoading: gameLoading } = useGame(gameId);
  const { players, isSpectator } = usePlayers(gameId, uuid);

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && gameId) {
      const hasSeenTransition = localStorage.getItem(`seenTransition-${gameId}`);
      if (!hasSeenTransition) {
        setShowTransition(true);
      }
    }
  }, [gameId]);

  // ✅ Afficher la modale des règles pour l'hôte
  useEffect(() => {
    if (game && uuid && !isSpectator) {
      const rulesSeen = localStorage.getItem(`rulesSeen-${gameId}`);
  
      // Vérifier si les règles sont complètes
      const isRulesComplete =
        game.rules &&
        game.rules.selectedThemes &&
        game.rules.selectedThemes.length === game.rules.numThemes &&
        game.rules.maxPlayers >= 1 &&
        game.rules.timeLimit;
  
      if (!rulesSeen || !isRulesComplete) {
        console.log("📌 [DEBUG] Affichage forcé de RulesModal car les règles sont incomplètes.");
        setShowRulesModal(true);
      } else {
        console.log("✅ [DEBUG] Règles complètes, pas besoin de RulesModal.");
        setShowRulesModal(false);
      }
    }
  }, [game, pseudo, gameId, uuid, isSpectator]);
  

  useEffect(() => {
  
    // Si l'hôte n'a pas encore sélectionné tous les thèmes requis, on affiche la modal
    if (game?.rules?.selectedThemes?.length < game?.rules?.numThemes && !isSpectator) {
      console.log("🎨 [DEBUG] Activation de ThemeSelectionModal !");
      setShowThemeModal(true);
    }
  }, [game?.rules?.selectedThemes, isSpectator]); // ✅ On surveille bien selectedThemes  

  // Afficher la modale si le joueur est l'hôte et les thèmes sont chargés
  useEffect(() => {
    if (game?.rules?.availableThemes?.length > 0 && !isSpectator) {
      console.log("🎨 [DEBUG] Activation de la sélection des thèmes.");
      setShowThemeModal(true);
    }
  }, [game, isSpectator]);

  if (gameLoading) return <p>Chargement...</p>;

  if (gameLoading || showTransition) {
    return (
      <PageTransition gameId={gameId} onFinish={() => setShowTransition(false)} />
    );
  }

  //////////////////////////////////////////////////////////////

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

      {showThemeModal && (
        <ThemeSelectionModal
          gameId={gameId}
          playerId={uuid}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      <div className="gameQuizz__utils">
        {!isSpectator && <GameActions gameId={gameId} uuid={uuid} router={router} />}
        {!isSpectator && <PlayerInfos pseudo={pseudo} selectedTheme={game?.rules?.selectedTheme || ""} gameId={gameId} playerId={uuid} />}
        <PlayersList gameId={gameId} />
        {!isSpectator && <ReadyStatus gameId={gameId} uuid={uuid} isGameStarted={game?.is_started} />}
      </div>
    </div>
  );
}