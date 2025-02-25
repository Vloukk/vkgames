import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/utils/supabaseClient";
import useGameStore from "../../src/store/quizz/gameStore";
import RulesModal from "@/components/games/quizz/RulesModal";

export default function GamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { pseudo } = useGameStore();
  const [userId, setUserId] = useState(null); // ✅ Ajout de `userId`

  console.log("🚀 Pseudo dans Zustand au chargement de la page :", pseudo);

  useEffect(() => {
    if (!pseudo) {
      const storedPseudo = localStorage.getItem("pseudo");
      if (storedPseudo) {
        console.log("🔄 Récupération du pseudo depuis localStorage :", storedPseudo);
        useGameStore.getState().setPseudo(storedPseudo);
      }
    }
  }, []);
  

  // ✅ Récupérer l'UUID de l'utilisateur à partir de son pseudo
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
      setUserId(userData.id); // ✅ Stocke l'UUID du joueur
    };

    fetchUserId();
  }, [pseudo]);

  // ✅ Récupérer les données de la partie
  useEffect(() => {
    if (!id) return;

    const fetchGame = async () => {
      console.log("🔍 Fetching game data for ID :", id);

      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
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
  }, [id]);

  // ✅ Vérifie si l'utilisateur est l'hôte après récupération de `userId`
  useEffect(() => {
    if (game?.host_id && userId) {
      console.log("👤 UUID du joueur récupéré :", userId);
      console.log("🎩 Host ID du jeu :", game.host_id);
      console.log("📌 Type de comparaison : ", typeof game.host_id, typeof userId);
  
      if (game.host_id === userId) {
        console.log("🎉 L'utilisateur est l'hôte, affichage de la modale !");
        setShowModal(true);
      } else {
        console.log("🚫 L'utilisateur n'est PAS l'hôte.");
      }
    }
  }, [game, userId]);
  

  if (loading) return <p>Chargement...</p>;
  if (!game) return <p>Aucune partie trouvée.</p>;

  return (
    <div>
      <h1>Partie {game.id}</h1>
      <p>Type de jeu : {game.type}</p>
      <p>Hôte : {game.host_id}</p>

      {showModal && <RulesModal gameId={id} onClose={() => setShowModal(false)} />}
    </div>
  );
}
