import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";

export default function ReadyStatus({ gameId, pseudo, isGameStarted }) {
  const [isReady, setIsReady] = useState(false);
  const [timer, setTimer] = useState(null);

  // ✅ Récupérer l'état "prêt" au chargement
  useEffect(() => {
    if (!gameId || !pseudo) return;

    const fetchReadyStatus = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("is_ready")
        .eq("game_id", gameId)
        .eq("pseudo", pseudo) // 🔥 Remplace user_id par pseudo
        .single();

      if (error) {
        console.error("❌ Erreur récupération du statut :", error);
        return;
      }

      setIsReady(data?.is_ready || false);
    };

    fetchReadyStatus();
  }, [gameId, pseudo]);

  // ✅ Mettre à jour le statut "prêt"
  const toggleReady = async () => {
    if (!gameId || !pseudo) return;

    const newReadyState = !isReady;
    setIsReady(newReadyState);

    const { error } = await supabase
      .from("players")
      .update({ is_ready: newReadyState })
      .match({ game_id: gameId, pseudo: pseudo }); // 🔥 Mise à jour avec pseudo

    if (error) {
      console.error("❌ Erreur mise à jour du statut :", error);
    }
  };

  // ✅ Lancer le timer quand la partie commence
  useEffect(() => {
    if (isGameStarted) {
      let countdown = 10;
      setTimer(countdown);

      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
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
