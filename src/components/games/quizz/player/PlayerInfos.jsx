export default function PlayerInfos({ pseudo, selectedTheme, onChangeTheme }) {
    return (
      <div className="playerInfos">
        <h2>{pseudo}</h2>
        <p>
          Thème sélectionné :{" "}
          <span className={selectedTheme ? "theme-selected" : "theme-empty"}>
            {selectedTheme || "Aucun thème choisi"}
          </span>
        </p>
        <button onClick={onChangeTheme} className="btn btn-primary">
          Changer de thème
        </button>
      </div>
    );
  }
  