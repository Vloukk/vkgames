import { useEffect, useState } from "react";
import { fetchPlayers } from "@/services/gameService";

const usePlayers = (gameId, uuid) => {
  const [players, setPlayers] = useState([]);
  const [isSpectator, setIsSpectator] = useState(false);

  useEffect(() => {
    if (!gameId || !uuid) return;

    fetchPlayers(gameId).then((playersList) => {
      setPlayers(playersList);

      const currentPlayer = playersList.find((p) => p.uuid === uuid);
      if (currentPlayer) {
        setIsSpectator(currentPlayer.is_spectator);
      }
    }).catch((error) => {
      console.error("❌ Erreur fetchPlayers:", error);
    });

  }, [gameId, uuid]);

  return { players, isSpectator };
};

export default usePlayers;
