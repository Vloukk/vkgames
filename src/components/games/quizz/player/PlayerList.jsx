import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import useThemeColorStore from "@/store/quizz/themeColorStore";

export default function PlayersList({ gameId }) {
  const [players, setPlayers] = useState([]);
  const { assignColors, getColor } = useThemeColorStore();
  const [colorsUpdated, setColorsUpdated] = useState(false);

  const fetchPlayers = async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from("players")
      .select("id, pseudo, score, is_ready, is_spectator, selected_theme_id")
      .eq("game_id", gameId);

    if (error) {
      console.error("❌ Erreur récupération joueurs :", error);
      return;
    }

    setPlayers(data);
    assignColors(data.map((player) => player.selected_theme_id).filter(Boolean));
    setTimeout(() => setColorsUpdated(true), 100);
  };

  useEffect(() => {
    fetchPlayers();
  }, [gameId]);

  if (!colorsUpdated) return <p>🔄 Chargement des couleurs...</p>;
  if (!players.length) return <p>🔄 Chargement des joueurs...</p>;

  return (
    <div className="playersList">
      <ul>
        {players.map((player) => (
          <li key={player.id} style={{ backgroundColor: getColor(player.selected_theme_id) || "#FFFFFF" }}>
            {player.pseudo} - Score: {player.score} - {player.is_ready ? " ✅ Prêt" : " ❌ Pas prêt"}
          </li>
        ))}
      </ul>
    </div>
  );
}
