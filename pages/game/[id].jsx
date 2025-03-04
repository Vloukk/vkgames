import { useRouter } from "next/router";
import { useState, useEffect } from "react";

// Hooks
import useGame from "@/hooks/games/quizz/UseGame";
import usePlayers from "@/hooks/games/quizz/UsePlayers";
import usePlayerSession from "@/hooks/games/quizz/UsePlayerSession";
import { useRealtimeSubscription } from "@/hooks/games/quizz/UseRealtimeSubscription"; // 🔥 Ajout du hook global

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

  // ✅ Ajout du hook global pour Supabase
  useRealtimeSubscription(gameId, uuid);

  useEffect(() => {
    if (typeof window !== "undefined" && gameId) {
      const hasSeenTransition = localStorage.getItem(`seenTransition-${gameId}`);
      if (!hasSeenTransition) {
        setShowTransition(true);
      }
    }
  }, [gameId]);

  useEffect(() => {
    if (game && uuid && !isSpectator) {
      const rulesSeen = localStorage.getItem(`rulesSeen-${gameId}`);
      const isRulesComplete =
        game.rules &&
        game.rules.selectedThemes &&
        game.rules.selectedThemes.length === game.rules.numThemes &&
        game.rules.maxPlayers >= 1 &&
        game.rules.timeLimit;

      if (!rulesSeen || !isRulesComplete) {
        setShowRulesModal(true);
      }
    }
  }, [game, pseudo, gameId, uuid, isSpectator]);

  useEffect(() => {
    if (game?.rules?.selectedThemes?.length < game?.rules?.numThemes && !isSpectator) {
      setShowThemeModal(true);
    }
  }, [game?.rules?.selectedThemes, isSpectator]);

  useEffect(() => {
    if (game?.rules?.availableThemes?.length > 0 && !isSpectator) {
      setShowThemeModal(true);
    }
  }, [game, isSpectator]);

  if (gameLoading || showTransition) {
    return <PageTransition gameId={gameId} onFinish={() => setShowTransition(false)} />;
  }

  return (
    <div className="gameQuizz">
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

      {gameId && showRulesModal && <RulesModal gameId={gameId} onClose={() => setShowRulesModal(false)} />}
      {showThemeModal && <ThemeSelectionModal gameId={gameId} playerId={uuid} onClose={() => setShowThemeModal(false)} />}

      <div className="gameQuizz__utils">
        {!isSpectator && <GameActions gameId={gameId} uuid={uuid} router={router} />}
        {!isSpectator && <PlayerInfos pseudo={pseudo} selectedTheme={game?.rules?.selectedTheme || ""} gameId={gameId} playerId={uuid} />}
        <PlayersList gameId={gameId} />
        {!isSpectator && <ReadyStatus gameId={gameId} uuid={uuid} isGameStarted={game?.is_started} />}
      </div>
    </div>
  );
}
