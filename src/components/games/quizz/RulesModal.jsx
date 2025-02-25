import { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

export default function RulesModal({ gameId, onClose }) {
  const [rules, setRules] = useState({
    responseTime: 15,
    hideUrl: false,
    themeCount: 3,
    randomThemes: false,
  });

  const handleSaveRules = async () => {
    try {
      const { error } = await supabase
        .from("games")
        .update({ rules })
        .eq("id", gameId);

      if (error) throw error;

      onClose(); // Ferme la modale après la sauvegarde
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des règles :", err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Configuration des règles</h2>

        <label>Temps pour répondre (en s) :</label>
        {[15, 20, 30].map((time) => (
          <button key={time} onClick={() => setRules({ ...rules, responseTime: time })}>
            {time}
          </button>
        ))}

        <label>Masquer la URL de la session :</label>
        <button onClick={() => setRules({ ...rules, hideUrl: true })}>Oui</button>
        <button onClick={() => setRules({ ...rules, hideUrl: false })}>Non</button>

        <label>Nombre de thèmes :</label>
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button key={num} onClick={() => setRules({ ...rules, themeCount: num })}>
            {num}
          </button>
        ))}

        <label>Thèmes aléatoires :</label>
        <button onClick={() => setRules({ ...rules, randomThemes: true })}>Oui</button>
        <button onClick={() => setRules({ ...rules, randomThemes: false })}>Non</button>

        <p>Une fois les règles définies, elles s'appliqueront à cette partie.</p>

        <button onClick={handleSaveRules}>Let's goooo</button>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}
