import { supabase } from "../utils/supabaseClient";

/**
 * Crée une nouvelle partie dans Supabase et retourne son ID.
 * @param {string} pseudo - Pseudo du joueur qui crée la partie.
 * @param {string} gameType - Type de jeu (ex: "quizz", "memory").
 * @returns {string} gameId - L'ID de la partie créée.
 */
export const createGame = async (pseudo, gameType) => {
  if (!pseudo.trim()) {
    throw new Error("Veuillez entrer un pseudo !");
  }

  console.log("🔍 createGame() appelé avec :", { pseudo, gameType });

  if (!gameType) {
    throw new Error("Le type de jeu (gameType) est requis !");
  }

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("pseudo", pseudo)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    let userId = user ? user.id : null;

    // Si l'utilisateur n'existe pas, on le crée
    if (!userId) {
      const { data: newUser, error: newUserError } = await supabase
        .from("users")
        .insert([{ pseudo }])
        .select("id")
        .single();

      if (newUserError) throw newUserError;
      userId = newUser.id;
    }

    // Créer la partie en indiquant le type de jeu
    const { data: newGame, error: gameError } = await supabase
      .from("games")
      .insert([{ host_id: userId, type: gameType, status: "waiting" }])
      .select("id")
      .single();

    if (gameError) throw gameError;

    return newGame.id;
  } catch (error) {
    console.error("❌ Erreur lors de la création de la partie :", error);
    throw error;
  }
};

