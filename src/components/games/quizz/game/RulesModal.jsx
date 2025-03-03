import useRules from "@/hooks/games/quizz/useRules";

export default function RulesModal({ gameId, onClose }) {
  const { rules, allThemes, loading, handleChange, toggleThemeSelection, isValidSelection } = useRules(gameId);

  if (loading) return <p>Chargement...</p>;

  const saveRules = () => {
    if (!isValidSelection()) {
      alert("Vous devez remplir toutes les options avant de valider.");
      return;
    }

    localStorage.setItem(`rulesSeen-${gameId}`, "true");

    if (typeof onClose === "function") {
      onClose();
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
                <button className={rules.hideUrl ? "selected" : ""} onClick={() => handleChange("hideUrl", true)}>Oui</button>
                <button className={!rules.hideUrl ? "selected" : ""} onClick={() => handleChange("hideUrl", false)}>Non</button>
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
              <input type="number" min="1" max="6" value={rules.maxPlayers} onChange={(e) => handleChange("maxPlayers", Number(e.target.value))} />
            </div>
          </div>

          <div className="rules__right">
            {!rules.allowRandomThemes && (
              <div className="right__tb-themes">
                <p>Choisissez vos thèmes ({rules.numThemes} max) :</p>
                <div className="themes-grid">
                  {allThemes.map((theme) => {
                    const isSelected = rules.selectedThemes?.includes(theme);
                    return (
                      <button
                        key={theme}
                        className={isSelected ? "selected" : ""}
                        onClick={() => toggleThemeSelection(theme)}
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
        <button onClick={saveRules} className={`save-button ${isValidSelection() ? "" : "disabled"}`} disabled={!isValidSelection()}>
          Let's goooo
        </button>
      </div>
    </div>
  );
}
