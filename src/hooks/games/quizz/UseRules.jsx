import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";

export default function useRules(gameId) {
  const [rules, setRules] = useState({
    selectedThemes: [],
    maxPlayers: 1,
    roundTime: 30,
    hideUrl: false,
    numThemes: 1,
    allowRandomThemes: true,
  });

  const [allThemes, setAllThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Récupération des thèmes depuis Supabase
  useEffect(() => {
    const fetchThemes = async () => {
      const { data, error } = await supabase.from("themes").select("name");
      if (error) {
        console.error("❌ Erreur récupération des thèmes :", error);
        return;
      }
      setAllThemes(data.map(theme => theme.name));
    };

    fetchThemes();
  }, []);

  // ✅ Charger les règles existantes
  useEffect(() => {
    const fetchRules = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("rules")
        .eq("id", gameId)
        .single();

      if (error) {
        console.error("❌ Erreur récupération des règles :", error);
        return;
      }

      if (data.rules) {
        setRules({
          ...data.rules,
          selectedThemes: Array.isArray(data.rules.selectedThemes) ? data.rules.selectedThemes : [],
          maxPlayers: data.rules.maxPlayers || 6,
        });
      }

      setLoading(false);
    };

    fetchRules();
  }, [gameId]);

  // ✅ Sauvegarde des règles
  const updateRules = async (newRules) => {
    console.log("📡 Sauvegarde des règles :", newRules);
    const { error } = await supabase
      .from("games")
      .update({ rules: newRules })
      .eq("id", gameId);

    if (error) {
      console.error("❌ Erreur enregistrement des règles :", error);
      return;
    }

    console.log("✅ Règles sauvegardées !");
    useGameStore.setState((state) => ({
      game: { ...state.game, rules: newRules },
    }));
  };

  // ✅ Modification des règles
  const handleChange = (name, value) => {
    let updatedRules = { ...rules, [name]: value };

    if (name === "numThemes" && value < rules.selectedThemes.length) {
      updatedRules.selectedThemes = [];
    }

    if (name === "maxPlayers" && value < 1) return;

    setRules(updatedRules);
    updateRules(updatedRules);
  };

  // ✅ Gère la sélection/désélection des thèmes
  const toggleThemeSelection = (theme) => {
    let newSelectedThemes = [...rules.selectedThemes];

    if (newSelectedThemes.includes(theme)) {
      newSelectedThemes = newSelectedThemes.filter(t => t !== theme);
    } else if (newSelectedThemes.length < rules.numThemes) {
      newSelectedThemes.push(theme);
    }

    setRules({ ...rules, selectedThemes: newSelectedThemes });
    updateRules({ ...rules, selectedThemes: newSelectedThemes });
  };

  // ✅ Vérifie si les règles sont complètes
  const isValidSelection = () => {
    return (
      rules.timeLimit &&
      rules.hideUrl !== null &&
      rules.numThemes &&
      rules.selectedThemes.length === rules.numThemes &&
      rules.maxPlayers >= 1
    );
  };

  return {
    rules,
    allThemes,
    loading,
    handleChange,
    toggleThemeSelection,
    isValidSelection,
  };
}
