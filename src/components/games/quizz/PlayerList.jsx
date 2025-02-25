import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

export default function PlayersList({ gameId }) {
  const [players, setPlayers] = useState([]);

  // ✅ Récupérer les joueurs au chargement
  useEffect(() => {
    if (!gameId) return;

    const fetchPlayers = async () => {
      const { data: playersData, error } = await supabase
        .from("players")
        .select("user_id, score, users (pseudo)")
        .eq("game_id", gameId);

      if (error) {
        console.error("❌ Erreur récupération joueurs :", error);
        return;
      }

      console.log("✅ Joueurs récupérés :", playersData);
      setPlayers(playersData);
    };

    fetchPlayers();
  }, [gameId]);

  // ✅ Mise à jour en temps réel
  useEffect(() => {
    if (!gameId) return;

    const subscription = supabase
      .channel("players")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "players", filter: `game_id=eq.${gameId}` },
        (payload) => {
          console.log("🆕 Nouveau joueur ajouté :", payload.new);
          setPlayers((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [gameId]);

  return (
    <div className="playersList">
      <ul>
        {players.map((player) => (
          <li key={player.user_id}>
            <span>{player.users?.pseudo}</span>
            <span>{player.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
