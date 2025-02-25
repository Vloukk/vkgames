import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";

export default function ReadyStatus({ gameId, userId, isGameStarted }) {
  const [isReady, setIsReady] = useState(false);
  const [timer, setTimer] = useState(null);

  // ✅ Récupérer l'état "prêt" au chargement
  useEffect(() => {
    if (!gameId || !userId) return;

    const fetchReadyStatus = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("is_ready")
        .eq("game_id", gameId)
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("❌ Erreur récupération du statut :", error);
        return;
      }

      setIsReady(data?.is_ready || false);
    };

    fetchReadyStatus();
  }, [gameId, userId]);

  // ✅ Mettre à jour le statut "prêt"
  const toggleReady = async () => {
    if (!gameId || !userId) return;

    const newReadyState = !isReady;
    setIsReady(newReadyState);

    const { error } = await supabase
      .from("players")
      .update({ is_ready: newReadyState })
      .match({ game_id: gameId, user_id: userId });

    if (error) {
      console.error("❌ Erreur mise à jour du statut :", error);
    }
  };

  // ✅ Lancer le timer quand la partie commence
  useEffect(() => {
    if (isGameStarted) {
      let countdown = 10; // Temps avant début
      setTimer(countdown);

      const interval = setInterval(() => {
        countdown -= 1;
        setTimer(countdown);
        if (countdown <= 0) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGameStarted]);

  return (
    <div className="readyStatus">
      {!isGameStarted ? (
        <button onClick={toggleReady} className={`btn ${isReady ? "btn-success" : "btn-warning"}`}>
          {isReady ? "X" : "Prêt"}
        </button>
      ) : (
        <p className="timer">Début dans {timer} secondes...</p>
      )}
    </div>
  );
}
