import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchGame, fetchPlayers, joinGame } from "@/services/gameService";
import useGameStore from "@/store/quizz/gameStore";
import { supabase } from "@/utils/supabaseClient";

// Components
import GameActions from "../../src/components/games/quizz/GameActions";
import PlayersList from "../../src/components/games/quizz/PlayerList";
import PlayerInfos from "../../src/components/games/quizz/PlayerInfos";
import ReadyStatus from "../../src/components/games/quizz/ReadyStatus";
import RulesModal from "../../src/components/games/quizz/RulesModal";
import PseudoModal from "../../src/components/games/quizz/PseudoModal";

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;
  const { pseudo, setPseudo } = useGameStore();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [uuid, setUuid] = useState(null);
  const [showPseudoModal, setShowPseudoModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false); // ✅ Ajout d’un état pour savoir si on est spectateur

  // ✅ Vérifier si le pseudo est enregistré
  useEffect(() => {
    const storedPseudo = localStorage.getItem("pseudo");
    if (storedPseudo) {
      setPseudo(storedPseudo);
    } else {
      setShowPseudoModal(true);
    }
  }, []);

  // ✅ Vérifier et récupérer l'UUID après que gameId et pseudo soient définis
  useEffect(() => {
    if (!gameId || !pseudo) return;

    const storedUuid = localStorage.getItem("uuid");
    if (storedUuid) {
      setUuid(storedUuid);
    } else {
      joinGame(gameId, pseudo).then((user) => {
        if (user?.uuid) {
          localStorage.setItem("uuid", user.uuid);
          setUuid(user.uuid);
          setIsSpectator(user.is_spectator); // ✅ Définir si le joueur est spectateur
        }
      });
    }
  }, [gameId, pseudo]);

  // ✅ Récupérer les infos de la partie après que gameId soit défini
  useEffect(() => {
    if (!gameId) return;
  
    fetchGame(gameId).then(async (data) => {
      if (data) {
        // 🔥 Rechercher le pseudo de l'hôte dans la liste des joueurs
        const { data: hostPlayer } = await supabase
          .from("players")
          .select("pseudo")
          .eq("uuid", data.host_id)
          .single();
  
        setGame({
          ...data,
          host_pseudo: hostPlayer?.pseudo || "Hôte inconnu", // 🔥 Ajout du pseudo de l'hôte
        });
      }
    });
  }, [gameId]);  

  // ✅ Récupérer les joueurs après que gameId et uuid soient définis
  useEffect(() => {
    if (!gameId || !uuid) return;

    fetchPlayers(gameId, uuid).then((players) => {
      setPlayers(players);
      const currentPlayer = players.find((p) => p.uuid === uuid);
      if (currentPlayer) {
        setIsSpectator(currentPlayer.is_spectator); // ✅ Mise à jour du mode spectateur
      }
    });
  }, [gameId, uuid]);

  // ✅ Afficher la modale des règles pour l'hôte
  useEffect(() => {
    if (!game || !gameId || !uuid || isSpectator) return; // ✅ Ne pas afficher pour les spectateurs

    const rulesSeen = localStorage.getItem(`rulesSeen-${gameId}`);
    if (game.host_pseudo === pseudo && !rulesSeen) {
      setShowRulesModal(true);
      localStorage.setItem(`rulesSeen-${gameId}`, "true");
    }
  }, [game, pseudo, gameId, uuid, isSpectator]); 

  if (!game) return <p>Chargement...</p>;

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

      <div className="gameQuizz__utils">
        {!isSpectator && <GameActions gameId={gameId} uuid={uuid} router={router} />} {/* 🔥 Masque les actions pour les spectateurs */}
        {!isSpectator && <PlayerInfos pseudo={pseudo} selectedTheme={game?.rules?.selectedTheme || ""} />} {/* 🔥 Cache les infos perso */}
        <PlayersList gameId={gameId} />
        {!isSpectator && <ReadyStatus gameId={gameId} uuid={uuid} isGameStarted={game?.is_started} />} {/* 🔥 Cache le statut prêt */}
      </div>

      {gameId && showRulesModal && (
        <RulesModal gameId={gameId} onClose={() => setShowRulesModal(false)} />
      )}
    </div>
  );
}

