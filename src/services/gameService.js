import { supabase } from "../utils/supabaseClient";

/**
 * Crée une nouvelle partie et ajoute l'hôte dans la table `players`
 * @param {string} pseudo - Le pseudo du joueur qui crée la partie.
 * @param {string} gameType - Type de jeu ("quizz", "memory", etc.).
 * @returns {string} gameId - L'ID de la partie créée.
 */
export const createGame = async (pseudo, gameType) => {
  if (!pseudo.trim()) {
    throw new Error("Veuillez entrer un pseudo !");
  }

  console.log("🔍 Création de la partie pour :", { pseudo, gameType });

  try {
    // 1️⃣ Vérifier si l'utilisateur existe déjà
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("pseudo", pseudo)
      .single();

    if (userError && userError.code !== "PGRST116") throw userError;

    let userId = user ? user.id : null;

    // 2️⃣ Si l'utilisateur n'existe pas, le créer
    if (!userId) {
      const { data: newUser, error: newUserError } = await supabase
        .from("users")
        .insert([{ pseudo }])
        .select("id")
        .single();

      if (newUserError) throw newUserError;
      userId = newUser.id;
    }

    // 3️⃣ Créer la partie
    const { data: newGame, error: gameError } = await supabase
      .from("games")
      .insert([{ host_id: userId, type: gameType, status: "waiting", rules: {} }])
      .select("id")
      .single();

    if (gameError) throw gameError;

    const gameId = newGame.id;
    console.log("✅ Partie créée avec ID :", gameId);

    // 4️⃣ Ajouter l'hôte à la table `players`
    const { error: playerError } = await supabase
      .from("players")
      .insert([{ game_id: gameId, user_id: userId, score: 0 }]);

    if (playerError) throw playerError;

    console.log("✅ Hôte ajouté à la partie dans `players`");

    return gameId;
  } catch (error) {
    console.error("❌ Erreur lors de la création de la partie :", error);
    throw error;
  }
};

