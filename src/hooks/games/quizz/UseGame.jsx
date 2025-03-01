import { useEffect, useState, useRef } from "react";
import { fetchGame } from "@/services/gameService";
import useGameStore from "@/store/quizz/gameStore";

const useGame = (gameId) => {
  const { game, setGame } = useGameStore();
  const lastGameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    setIsLoading(true);

    fetchGame(gameId).then((data) => {
      if (data && (!lastGameRef.current || lastGameRef.current.id !== data.id)) {
        setGame(data);
        lastGameRef.current = data;
      }
      setIsLoading(false);
    }).catch((error) => {
      console.error("❌ Erreur fetchGame:", error);
      setIsLoading(false);
    });

  }, [gameId]);

  return { game, isLoading };
};

export default useGame;
