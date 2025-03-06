import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import useThemeColorStore from "@/store/quizz/themeColorStore";
import { useThemes } from "@/hooks/games/quizz/useThemes"; // ✅ Import ajouté

export default function PlayersList({ gameId }) {
  const [players, setPlayers] = useState([]);
  const { assignColors, getColor } = useThemeColorStore();
  const [colorsUpdated, setColorsUpdated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { selectedTheme } = useThemes(gameId, null); // ✅ Utilisation de selectedTheme

  useEffect(() => {
    setIsClient(true); // ✅ On indique que le composant s'affiche côté client
  }, []);

  useEffect(() => {
    if (isClient && gameId) fetchPlayers();
  }, [gameId, isClient]);

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
    
    setTimeout(() => {
      assignColors(data.map((player) => player.selected_theme_id).filter(Boolean));
      setColorsUpdated(true);
    }, 200);
  };

  useEffect(() => {
    fetchPlayers();
    setTimeout(() => {
    }, 500);
  }, [selectedTheme]);


  useEffect(() => {
    if (players.length > 0) {
        const themeIds = players.map((player) => player.selected_theme_id).filter(Boolean);
        assignColors(themeIds);
        
        setColorsUpdated(true);
    }
  }, [players]); // ✅ Les couleurs sont réassignées à chaque mise à jour des joueurs
  
  useEffect(() => {
    fetchPlayers();
  }, [selectedTheme]);
  
  useEffect(() => {
    setColorsUpdated(false);
    setTimeout(() => setColorsUpdated(true), 200);
  }, [players]);

  if (!isClient) return <p>Chargement...</p>;

  if (!colorsUpdated || players.length === 0 || players.some(player => !player.selected_theme_id)) {
    return <p>🔄 Chargement des couleurs...</p>;
  }

  return (
    <div className="playersList">
        <ul>
        {players.map((player) => {
          const playerColor = getColor(player.selected_theme_id);
          return (
            <li key={player.id} style={{ backgroundColor: playerColor }}>
              {player.pseudo} - Score: {player.score} - {player.is_ready ? " ✅ Prêt" : " ❌ Pas prêt"}
            </li>
          );
        })}
        </ul>
    </div>
  );
}