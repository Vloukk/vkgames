import { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";

//sécurité
import useLoopGuard from "@/utils/sécurity/useLoopGard";

export default function RulesModal({ gameId, onClose }) {
  const [rules, setRules] = useState({
    selectedThemes: [],        // Thèmes choisis
    maxPlayers: 1,             // Nombre max de joueurs
    roundTime: 30,             // Temps de réponse en secondes
    hideUrl: false,            // Masquer l'URL (true/false)
    themeSelectionCount: 0, // À définir par la suite
    numThemes: 1,           // À définir en fonction des règles
    allowRandomThemes: true,   // Autoriser thèmes aléatoires
  });

    const [allThemes, setAllThemes] = useState([]); // ✅ Stocker les thèmes récupérés

    // ✅ Récupérer la liste des thèmes depuis Supabase
    useEffect(() => {
      const fetchThemes = async () => {
        const { data, error } = await supabase.from("themes").select("name");

        if (error) {
          console.error("❌ Erreur lors de la récupération des thèmes :", error);
          return;
        }

        console.log("✅ Thèmes récupérés depuis Supabase :", data);
        setAllThemes(data.map(theme => theme.name)); // Stocke uniquement les noms des thèmes
      };

      fetchThemes();
    }, []);

    ///////////////////////////////////////////////////// ✅ Charger les règles existantes depuis Supabase
    useEffect(() => {
      const fetchRules = async () => {
        const { data, error } = await supabase
          .from("games")
          .select("rules")
          .eq("id", gameId)
          .single();
    
        if (error) {
          console.error("❌ Erreur lors de la récupération des règles :", error);
          return;
        }
    
        if (data.rules) {
          console.log("✅ Règles récupérées :", data.rules);
    
          setRules({
            ...data.rules,
            selectedThemes: Array.isArray(data.rules.selectedThemes) ? data.rules.selectedThemes : [],
            maxPlayers: data.rules.maxPlayers || 6,
          });
        }
      };
    
      fetchRules();
    }, [gameId]);            

  //////////////////////////////////////////////////// ✅ Sauvegarde automatique dans Supabase à chaque modification
  const updateRules = async (newRules) => {
    console.log("📡 Envoi des règles mises à jour :", newRules);
  
    const { error } = await supabase
      .from("games")
      .update({ rules: newRules })
      .eq("id", gameId);
  
    if (error) {
      console.error("❌ Erreur lors de l'enregistrement des règles :", error);
      return;
    }
  
    console.log("✅ Règles enregistrées avec succès !");
  
    //🔄 Récupération immédiate des nouvelles règles
    const { data, error: fetchError } = await supabase
      .from("games")
      .select("rules")
      .eq("id", gameId)
      .single();
  
    if (fetchError) {
      console.error("❌ Erreur lors de la récupération des nouvelles règles :", fetchError);
      return;
    }
  
    console.log("🔄 Règles mises à jour récupérées :", data.rules);
  
    // 🏗️ Mettre à jour l'état local et le store global
    setRules(data.rules);
    useGameStore.setState((state) => ({
      game: { ...state.game, rules: data.rules },
    }));
  };      

  ///////////////////////////////////////////////////////////// ✅ Gère les modifications des règles
  const handleChange = (name, value) => {
    let updatedRules = { ...rules, [name]: value };
  
    // ✅ Réinitialise `selectedThemes` si on réduit `numThemes`
    if (name === "numThemes" && value < rules.selectedThemes.length) {
      updatedRules.selectedThemes = [];
      console.log("🚨 Changement du nombre de thèmes -> Réinitialisation !");
    }
  
    // ✅ Empêche `maxPlayers` d’être inférieur à 1
    if (name === "maxPlayers" && value < 1) {
      console.warn("⛔ Le nombre de joueurs ne peut pas être inférieur à 1 !");
      return;
    }
  
    setRules(updatedRules);
    updateRules(updatedRules);
  };

  /////////////////////////////////////////////////////// ✅ Gère la sélection/désélection des thèmes
  const toggleThemeSelection = (theme) => {
    let newSelectedThemes = Array.isArray(rules.selectedThemes) ? [...rules.selectedThemes] : [];
  
    if (newSelectedThemes.includes(theme)) {
      newSelectedThemes = newSelectedThemes.filter(t => t !== theme);
    } else if (newSelectedThemes.length < rules.numThemes) {
      newSelectedThemes.push(theme);
    } else {
      console.log("🚫 Nombre max de thèmes atteint !");
      return;
    }
  
    setRules({ ...rules, selectedThemes: newSelectedThemes });
    console.log("📌 [DEBUG] AvailableThemes après fetchRules :", rules.availableThemes);

    updateRules({ ...rules, selectedThemes: newSelectedThemes });
  };
    
    /////////////////////////////////////////////////////:  
    
    const isValidSelection = () => {
      return (
        rules.timeLimit &&
        rules.hideSessionUrl !== null &&
        rules.numThemes &&
        rules.selectedThemes.length === rules.numThemes &&
        rules.maxPlayers >= 1
      );
    };
      
    /////////////////////////////////////////////////////:
    const saveRules = async () => {
      if (!isValidSelection()) {
          alert("Vous devez remplir toutes les options avant de valider.");
          return;
      }
  
      const updatedRules = {
          ...rules,
          availableThemes: allThemes, // 🔥 Assure-toi que `availableThemes` contient bien tous les thèmes
      };
  
      console.log("📥 Sauvegarde des règles avec availableThemes :", updatedRules);
  
      const { error } = await supabase
          .from("games")
          .update({ rules: updatedRules })
          .eq("id", gameId);
  
      if (error) {
          console.error("❌ Erreur lors de la mise à jour des règles :", error);
      } else {
          console.log("✅ Règles sauvegardées !");
          if (typeof onClose === "function") {
              onClose();
          }
      }
  };      
            

    return (
      <div className="rulesModal">
        <div className="rulesModal__content">
          <h2>Configuration des règles</h2>
          <div className="content__rules">
            <div className="rules__left">
                <div className="left__time rules">
                    <p>Temps pour répondre (en s) :</p>
                    <div className="time">
                        {[15, 20, 30].map((time) => (
                            <button
                                key={time}
                                className={rules.timeLimit === time ? "selected" : ""}
                                onClick={() => handleChange("timeLimit", time)}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="left__url rules">
                    <p>Masquer l'URL de la session :</p>
                    <div className="url">
                        <button
                            className={rules.hideSessionUrl ? "selected" : ""}
                            onClick={() => handleChange("hideSessionUrl", true)}
                        >
                            Oui
                        </button>
                        <button
                            className={!rules.hideSessionUrl ? "selected" : ""}
                            onClick={() => handleChange("hideSessionUrl", false)}
                        >
                            Non
                        </button>
                    </div>
                </div>
                <div className="left__nb-themes rules">
                  <p>Nombre de thèmes :</p>
                  <div className="themes">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                              key={num}
                              className={rules.numThemes === num ? "selected" : ""}
                              onClick={() => handleChange("numThemes", num)}
                          >
                              {num}
                          </button>
                      ))}
                  </div>
                </div>
                <div className="left__max-players rules">
                    <p>Nombre max de joueurs :</p>
                    <input 
                      type="number" 
                      min="1" 
                      max="6" 
                      value={rules.maxPlayers} 
                      onChange={(e) => handleChange("maxPlayers", Number(e.target.value))} 
                    />
                </div>
            </div>

            <div className="rules__right">
                <div className="right__btn-themes">
                    <p>Thèmes aléatoires :</p>
                    <div className="btn-themes">
                        <button
                          className={rules.randomThemes ? "selected" : ""}
                          onClick={() => handleChange("randomThemes", true)}
                        >
                          Oui
                        </button>
                        <button
                          className={!rules.randomThemes ? "selected" : ""}
                          onClick={() => handleChange("randomThemes", false)}
                        >
                          Non
                        </button>
                    </div>
                </div>
                {!rules.randomThemes && (
                    <div className="right__tb-themes">
                        <p>Choisissez vos thèmes ({rules.numThemes} max) :</p>
                        <div className="themes-grid">
                          {allThemes.map((theme) => {
                            const isSelected = rules.selectedThemes?.includes(theme);
                            const isDisabled = !isSelected && rules.selectedThemes.length >= rules.numThemes; // ✅ Bloque seulement les thèmes non sélectionnés
                        
                            return (
                              <button
                                key={theme}
                                className={`${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                                onClick={() => toggleThemeSelection(theme)}
                                disabled={isDisabled && !isSelected} // ✅ Seuls les thèmes non sélectionnés sont désactivés
                              >
                                {theme}
                              </button>
                            );
                          })}
                        </div>
                    </div>
                )}
            </div>
          </div>
          <button
            onClick={saveRules}
            className={`save-button ${isValidSelection() ? "" : "disabled"}`}
            disabled={!isValidSelection()} // ✅ Désactive le bouton si la sélection est incomplète
          >
            Let's goooo
          </button>
        </div>
      </div>
    );
} 
