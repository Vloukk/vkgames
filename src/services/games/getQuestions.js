import { supabase } from "../../utils/supabaseClient";

/**
 * Récupère 10 questions aléatoires basées sur les thèmes sélectionnés.
 * @param {string[]} selectedThemes - Liste des noms de thèmes choisis.
 * @returns {Promise<object[]>} - Liste des questions.
 */
export const getQuestions = async (selectedThemes) => {
  if (!selectedThemes || selectedThemes.length === 0) {
    console.error("❌ Aucun thème sélectionné !");
    return [];
  }

  try {
    console.log("🔍 Recherche des ID pour les thèmes :", selectedThemes);

    // Étape 1 : Récupérer les `id` des thèmes sélectionnés
    const { data: themes, error: themesError } = await supabase
      .from("themes")
      .select("id")
      .in("name", selectedThemes);

    if (themesError) throw themesError;
    if (!themes || themes.length === 0) {
      console.warn("⚠️ Aucun thème trouvé pour :", selectedThemes);
      return [];
    }

    const themeIds = themes.map((t) => t.id);
    console.log("✅ ID des thèmes récupérés :", themeIds);

    // Étape 2 : Récupérer les questions liées aux thèmes sélectionnés
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .in("theme_id", themeIds)
      .order("random") // Assure un tirage aléatoire
      .limit(10);

    if (questionsError) throw questionsError;

    console.log("✅ Questions récupérées :", questions);
    return questions;
  } catch (error) {
    console.error("❌ Erreur dans getQuestions :", error);
    return [];
  }
};
