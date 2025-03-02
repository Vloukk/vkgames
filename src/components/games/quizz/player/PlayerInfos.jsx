import { useThemes } from "@/hooks/games/quizz/useThemes";

export default function PlayerInfos({ pseudo, gameId, playerId, onChangeTheme }) {
  const { selectedThemeName } = useThemes(gameId, playerId); // ✅ Récupérer le nom du thème depuis le hook

  console.log("🔍 [DEBUG] Thème sélectionné pour", pseudo, ":", selectedThemeName);
  console.log("🔍 [DEBUG] selectedThemeName reçu dans PlayerInfos :", selectedThemeName);


  return (
    <div className="playerInfos">
      <h2>{pseudo}</h2>
      <p>
        Thème sélectionné :{" "}
        <span className={selectedThemeName ? "theme-selected" : "theme-empty"}>
          {selectedThemeName || "Aucun thème choisi"}
        </span>
      </p>
      <button onClick={onChangeTheme} className="btn btn-primary">
        Changer de thème
      </button>
    </div>
  );
}

