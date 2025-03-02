import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import useThemeColorStore from "@/store/quizz/themeColorStore"; // Import du store des couleurs

export default function PlayersList({ gameId }) {
  const [players, setPlayers] = useState([]);
  const { getColor } = useThemeColorStore(); // Récupérer les couleurs des thèmes

  useEffect(() => {
    if (!gameId) return;

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, pseudo, score, is_ready, is_spectator, selected_theme_id") // ✅ Ajout de selected_theme_id
        .eq("game_id", gameId);

      if (error) {
        console.error("❌ Erreur récupération joueurs :", error);
        return;
      }

      console.log("✅ Joueurs récupérés :", data);
      setPlayers(data);
    };

    fetchPlayers();

    // ✅ Écoute en temps réel des changements sur la table `players`
    const channel = supabase
      .channel(`players-${gameId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, (payload) => {
        console.log("🔄 Changement détecté dans players :", payload);

        if (payload.eventType === "INSERT") {
          setPlayers((prev) => [...prev, payload.new]);
        }

        if (payload.eventType === "DELETE") {
          setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id));
        }

        if (payload.eventType === "UPDATE") {
          setPlayers((prev) =>
            prev.map((p) => (p.id === payload.new.id ? payload.new : p))
          );
        }
      })
      .subscribe();

    return () => {
      console.log("📡 Désabonnement des channels Supabase...");
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // ✅ Séparer les joueurs actifs et les spectateurs
  const activePlayers = players.filter(player => !player.is_spectator);
  const spectatorsCount = players.filter(player => player.is_spectator).length;

  return (
    <div className="playersList">
      <ul>
        {activePlayers.length > 0 ? (
          activePlayers.map((player) => {
            const playerThemeColor = player.selected_theme_id ? getColor(player.selected_theme_id) : "#030303";

            return (
              <li 
                key={player.id} 
                style={{ backgroundColor: playerThemeColor }}
              >
                {player.pseudo} - Score: {player.score} - 
                {player.is_ready ? " ✅ Prêt" : " ❌ Pas prêt"}
              </li>
            );
          })
        ) : (
          <p>Aucun joueur pour l’instant...</p>
        )}
      </ul>
      
      {/* ✅ Affichage des spectateurs */}
      {spectatorsCount > 0 && <p>👀 Spectateurs : {spectatorsCount}</p>}
    </div>
  );
}
