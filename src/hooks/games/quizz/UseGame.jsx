import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";

const useGame = (gameId, pseudo) => {
  const [players, setPlayers] = useState([]);
  const [uuid, setUuid] = useState(null);
  const [isSpectator, setIsSpectator] = useState(false);

  const { game, setGame } = useGameStore((state) => ({
    game: state.game,
    setGame: state.setGame,
  }));

  // Utiliser `useEffect` pour récupérer les infos du jeu et écouter les changements en temps réel
  useEffect(() => {
    if (!gameId) {
      console.error("❌ gameId est manquant !");
      return;
    }

    const fetchGame = async () => {
      console.log("📡 Récupération des infos du jeu...");
      const { data, error } = await supabase
        .from("games")
        .select("id, host_pseudo, rules, host_uuid")
        .eq("id", gameId)
        .single();

      if (error) {
        console.error("❌ Erreur Supabase :", error);
        return;
      }

      if (!data) {
        console.warn("⚠️ Aucun jeu trouvé avec cet ID !");
        return;
      }

      // Vérifier avant de mettre à jour l'état pour éviter un re-render inutile
      if (game?.id !== data.id) {
        console.log("🎮 Mise à jour du jeu");
        setGame(data); // Mettre à jour uniquement si l'ID du jeu a changé
      }

      // Récupérer les joueurs du jeu
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id, pseudo, is_spectator")
        .eq("game_id", gameId);

      if (playersError) {
        console.error("❌ Erreur Supabase pour les joueurs :", playersError);
        return;
      }

      setPlayers(playersData || []);
    };

    fetchGame();
  }, [gameId, setGame, game?.rules]); // Dépendance à `game?.rules` pour éviter un appel répété

  useEffect(() => {
  if (!gameId) return;

  const channel = supabase
    .channel(`game-updates-${gameId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
      (payload) => {
        if (payload.new.rules && JSON.stringify(game?.rules) !== JSON.stringify(payload.new.rules)) {
          console.log("🎯 Nouvelles règles reçues :", payload.new.rules);
          setGame((state) => {
            if (JSON.stringify(state.rules) !== JSON.stringify(payload.new.rules)) {
              return { ...state, rules: payload.new.rules };
            }
            return state;
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [gameId]);


  return {
    game,
    players,
    isSpectator,
    uuid,
  };
};

export default useGame;
