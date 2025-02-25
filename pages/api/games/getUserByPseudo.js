// pages/api/games/getUserByPseudo.js
import { supabase } from "../../../src/utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { pseudo } = req.body;
  if (!pseudo) {
    return res.status(400).json({ error: "Pseudo requis" });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("pseudo", pseudo)
      .single();

    if (userError) {
      return res.status(500).json({ error: "Erreur lors de la recherche de l'utilisateur" });
    }

    if (!user) {
      // Si l'utilisateur n'existe pas, on l'ajoute
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ pseudo }])
        .single();

      if (insertError) {
        return res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur" });
      }

      user = newUser; // Utiliser l'utilisateur nouvellement créé
    }

    // Création de la partie avec l'ID de l'utilisateur
    const { data: newGame, error: gameError } = await supabase
      .from("games")
      .insert([{ host_id: user.id }])
      .single();

    if (gameError) {
      return res.status(500).json({ error: "Erreur lors de la création de la partie" });
    }

    // Réponse avec l'ID de l'utilisateur et de la partie
    res.status(200).json({ userId: user.id, gameId: newGame.id });

  } catch (error) {
    console.error("Erreur : ", error);
    res.status(500).json({ error: "Erreur serveur interne" });
  }
}
