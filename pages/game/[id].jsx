import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/utils/supabaseClient";
import useGameStore from "../../src/store/quizz/gameStore";
import { getQuestions } from "@/services/games/getQuestions";

//components
import RulesModal from "@/components/games/quizz/RulesModal";
import PlayersList from "@/components/games/quizz/PlayerList";
import PlayerInfos from "@/components/games/quizz/PlayerInfos";
import ReadyStatus from "@/components/games/quizz/ReadyStatus";

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { pseudo } = useGameStore();
  const [userId, setUserId] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  console.log("🚀 Pseudo dans Zustand au chargement de la page :", pseudo);

  // ✅ Récupérer `pseudo` depuis localStorage si nécessaire
  useEffect(() => {
    if (!pseudo) {
      const storedPseudo = localStorage.getItem("pseudo");
      if (storedPseudo) {
        console.log("🔄 Récupération du pseudo depuis localStorage :", storedPseudo);
        useGameStore.getState().setPseudo(storedPseudo);
      }
    }
  }, []);

  // ✅ Récupérer l'UUID de l'utilisateur
  useEffect(() => {
    if (!pseudo) return;

    const fetchUserId = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("pseudo", pseudo)
        .single();

      if (userError) {
        console.error("❌ Erreur lors de la récupération de l'UUID du joueur :", userError);
        return;
      }

      console.log("✅ UUID du joueur récupéré :", userData.id);
      setUserId(userData.id);
    };

    fetchUserId();
  }, [pseudo]);

  // ✅ Récupérer les données de la partie
  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      console.log("🔍 Fetching game data for ID :", gameId);

      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) {
        console.error("❌ Erreur Supabase :", gameError);
        return;
      }

      console.log("✅ Données du jeu récupérées :", gameData);
      setGame(gameData);
      setLoading(false);
    };

    fetchGame();
  }, [gameId]);

  // ✅ Gérer l'affichage de la modal uniquement au premier affichage
  useEffect(() => {
    if (!gameId) return;

    const hasSeenModal = localStorage.getItem(`seenModal-${gameId}`);
    if (!hasSeenModal) {
      setShowModal(true);
    }
  }, [gameId]);

  // ✅ Charger les questions après la configuration des règles
  useEffect(() => {
    if (!game?.rules?.selectedThemes || game.rules.selectedThemes.length === 0) return;

    const fetchQuestions = async () => {
      const questions = await getQuestions(game.rules.selectedThemes);
      if (questions) {
        setGame((prevGame) => ({ ...prevGame, questions }));
      }
    };

    fetchQuestions();
  }, [game?.rules?.selectedThemes]);

  // ✅ Quitter la partie
  const leaveGame = async () => {
    if (!gameId || !userId) return;

    const { error } = await supabase
      .from("players")
      .delete()
      .match({ game_id: gameId, user_id: userId });

    if (error) {
      console.error("❌ Erreur lors de la sortie de la partie :", error);
      return;
    }

    console.log("🚪 Joueur supprimé de la partie !");
    router.push("/"); // ✅ Redirection vers la page d'accueil
  };

  // ✅ Copier le lien de la partie
  const copyGameLink = async () => {
    const gameLink = `${window.location.origin}/game/${gameId}`;
    try {
      await navigator.clipboard.writeText(gameLink);
      setCopySuccess("Lien copié !");
      setTimeout(() => setCopySuccess(""), 2000); // ✅ Réinitialisation du message
    } catch (err) {
      console.error("❌ Erreur lors de la copie du lien :", err);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!game) return <p>Aucune partie trouvée.</p>;

  return (
    <div className="gameQuizz">
      <h1>Partie {game.id}</h1>
      <p>Type de jeu : {game.type}</p>
      <p>Hôte : {game.host_id}</p>
      
      <section className="gameQuizz__utils">
        <div className="utils__actions">
          <button onClick={leaveGame} className="btn btn-danger">Quitter la partie</button>
          <button onClick={copyGameLink} className="btn btn-primary">
            Copier le lien
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <PlayerInfos 
          pseudo={pseudo} 
          selectedTheme={game?.rules?.selectedTheme || ""} 
          onChangeTheme={() => console.log("🌀 Changer de thème cliqué !")}
        />
        {gameId && <PlayersList gameId={gameId} />}
        <ReadyStatus gameId={gameId} userId={userId} isGameStarted={game?.is_started} />
      </section>

      {showModal && (
        <RulesModal
          gameId={gameId}
          onClose={() => {
            setShowModal(false);
            localStorage.setItem(`seenModal-${gameId}`, "true"); // ✅ Empêcher le réaffichage
          }}
        />
      )}
    </div>
  );
}
