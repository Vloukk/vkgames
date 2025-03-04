import { useEffect } from "react";
import { fetchPlayers } from "@/services/gameService";
import usePlayersStore from "@/store/quizz/playerStore";

const usePlayers = (gameId, uuid) => {
  const { players, setPlayers, isSpectator, setIsSpectator } = usePlayersStore();

  useEffect(() => {
    if (!gameId || players.length > 0) return; // ✅ Évite un re-fetch inutile

    fetchPlayers(gameId).then((playersList) => {
      setPlayers(playersList);
      setIsSpectator(playersList.some(p => p.uuid === uuid && p.is_spectator));
    });
  }, [gameId, players]);

  return { players, isSpectator };
};

export default usePlayers;
