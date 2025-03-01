import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";

export function useThemes(gameId, playerId) {
    const [themes, setThemes] = useState([]);tu
    const [selectedTheme, setSelectedTheme] = useState(null);
    const game = useGameStore((state) => state.game);

    useEffect(() => {
        if (game?.rules?.availableThemes) {
            console.log("📡 Mise à jour des thèmes dans useThemes :", game.rules.availableThemes);
            setThemes(game.rules.availableThemes);
        }
    }, [game?.rules?.availableThemes]);

    useEffect(() => {
        async function fetchThemes() {
            console.log("🔄 Récupération des thèmes après mise à jour des règles...");

            const { data, error } = await supabase
                .from("games")
                .select("rules")
                .eq("id", gameId)
                .single();

            if (error) {
                console.error("❌ Erreur lors de la récupération des thèmes :", error);
                return;
            }

            if (!data?.rules || !data.rules.availableThemes) {
                console.warn("⚠️ Aucune règle trouvée ou availableThemes vide.");
                return;
            }

            console.log("🎨 Nouvelles règles récupérées :", data.rules);
            setThemes(data.rules.availableThemes);
        }

        if (gameId) fetchThemes();
    }, [gameId]);

    useEffect(() => {
        if (!gameId) return;

        console.log("📡 Écoute en temps réel des mises à jour des thèmes...");

        const channel = supabase
          .channel(`game-themes-${gameId}`) // ✅ Correct
            .on(
              "postgres_changes",
              { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
              (payload) => {
                if (payload.new.rules.availableThemes) {
                  setThemes(payload.new.rules.availableThemes);
                }
              }
            )
            .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }, [gameId]);

    ////////////////////////

    async function selectTheme(themeName) {
        console.log("🔥 [DEBUG] selectTheme() appelée avec theme :", themeName);

        // 🔍 Vérifie d'abord si l'UUID du thème existe
        const { data: themeData, error: themeError } = await supabase
            .from("themes")
            .select("id")
            .eq("name", themeName)
            .single();

        if (themeError) {
            console.error("❌ Erreur lors de la récupération de l’UUID du thème :", themeError);
            return;
        }

        const themeId = themeData?.id;
        console.log("🎯 UUID du thème sélectionné :", themeId);

        if (!themeId) {
            console.error("❌ Aucun UUID trouvé pour le thème :", themeName);
            return;
        }

        // 🔄 Mise à jour du thème dans la table `players`
        const { error: updateError } = await supabase
            .from("players")
            .update({ selected_theme_id: themeId })
            .eq("uuid", playerId);

        if (updateError) {
            console.error("❌ Erreur lors de la mise à jour du thème :", updateError);
            return;
        }

        console.log("✅ Thème mis à jour avec succès !");

        // 🔍 Attendre un peu avant de récupérer la mise à jour pour éviter le problème de délai Supabase
        setTimeout(async () => {
            const { data: checkData, error: checkError } = await supabase
                .from("players")
                .select("selected_theme_id")
                .eq("uuid", playerId);

            if (checkError) {
                console.error("❌ [ERREUR] Impossible de récupérer après update :", checkError);
            } else {
                console.log("🎨 [VÉRIFICATION] selected_theme_id après update :", checkData);

                if (checkData && checkData.length > 0 && checkData[0].selected_theme_id) {
                    console.log("🎨 [Mise à jour] Nouvelle valeur de selectedTheme :", checkData[0].selected_theme_id);
                    setSelectedTheme(checkData[0].selected_theme_id); // ✅ Mets à jour l'état local
                } else {
                    console.warn("⚠️ Aucun selected_theme_id trouvé après l'update !");
                }
            }
        }, 1000); // ⏳ Attente de 500ms pour que Supabase enregistre la donnée
    }

    useEffect(() => {
        console.log("🎯 [DEBUG] selectedTheme a changé :", selectedTheme);
    }, [selectedTheme]);

    console.log("🔗 [DEBUG] useThemes() retourne selectTheme :", selectTheme);

    return { themes, selectedTheme, selectTheme };
}
