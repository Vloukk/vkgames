import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";

export function useThemes(gameId, playerId) {
    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const game = useGameStore((state) => state.game);

    // ✅ 1. Récupérer les thèmes depuis les règles du jeu
    useEffect(() => {
        console.log("📡 [DEBUG] game.rules.availableThemes :", game?.rules?.availableThemes);
        if (game?.rules?.availableThemes) {
            setThemes(game.rules.availableThemes);
        }
    }, [game?.rules?.availableThemes]);    

    // ✅ 2. Récupérer le thème déjà sélectionné par le joueur
    useEffect(() => {
        if (!playerId) return;
    
        async function fetchSelectedTheme() {
            console.log("🔍 Vérification du thème sélectionné pour le joueur :", playerId);
    
            const { data, error } = await supabase
                .from("players")
                .select("selected_theme_id")
                .eq("uuid", playerId)
                .single();
    
            if (error) {
                console.error("❌ Erreur récupération du thème du joueur :", error);
                return;
            }
    
            console.log("🎯 [DEBUG] Thème sélectionné récupéré :", data?.selected_theme_id);
    
            if (data?.selected_theme_id) {
                setSelectedTheme(data.selected_theme_id);
            }
        }
    
        fetchSelectedTheme();
    }, [playerId]);    

    // ✅ 3. Écouter les mises à jour en temps réel sur `selected_theme_id`
    useEffect(() => {
        if (!gameId) return;

        console.log("📡 [DEBUG] Abonnement Realtime pour les thèmes du jeu :", gameId);

        const channel = supabase
            .channel(`theme_selection_${gameId}`) // Canal unique par partie
            .on(
                "postgres_changes", 
                { 
                    event: "UPDATE", 
                    schema: "public", 
                    table: "players",
                    filter: `game_id=eq.${gameId}`
                },
                (payload) => {
                    console.log("🟢 [REALTIME] Mise à jour détectée :", payload.new.selected_theme_id);
                    
                    // Si c'est le joueur actuel, mettre à jour son thème
                    if (payload.new.uuid === playerId) {
                        setSelectedTheme(payload.new.selected_theme_id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId, playerId]);

    // ✅ 4. Fonction pour sélectionner un thème
    async function selectTheme(themeName) {
        console.log("🔥 [DEBUG] Thème sélectionné :", themeName);

        // 🔍 Récupérer l'ID du thème
        const { data: themeData, error: themeError } = await supabase
            .from("themes")
            .select("id")
            .eq("name", themeName)
            .single();

        if (themeError) {
            console.error("❌ Erreur lors de la récupération du thème :", themeError);
            return;
        }

        const themeId = themeData?.id;
        if (!themeId) {
            console.error("❌ Aucun ID trouvé pour le thème :", themeName);
            return;
        }

        // 🔄 Mettre à jour le thème sélectionné par le joueur
        const { error: updateError } = await supabase
            .from("players")
            .update({ selected_theme_id: themeId })
            .eq("uuid", playerId);

        if (updateError) {
            console.error("❌ Erreur lors de la mise à jour du thème du joueur :", updateError);
            return;
        }

        console.log("✅ Thème mis à jour avec succès !");
        setSelectedTheme(themeId);
    }

    return { themes, selectedTheme, selectTheme };
}
