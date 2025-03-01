import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";

export function useThemes(gameId, playerId) {
    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const game = useGameStore((state) => state.game);

    console.log("🛠️ [DEBUG] useThemes monté avec :", { gameId, playerId });

    useEffect(() => {
        console.log("📡 [DEBUG] game.rules.selectedThemes :", game?.rules?.selectedThemes);
        console.log("🎯 [DEBUG] selectedTheme actuel :", selectedTheme);

        if (game?.rules?.selectedThemes) {
            setThemes(game.rules.selectedThemes);
        }
    }, [game?.rules?.selectedThemes]);

    // ✅ Déplacer fetchSelectedTheme() ici
    async function fetchSelectedTheme() {
        if (!playerId) {
            console.warn("⚠️ [WARNING] fetchSelectedTheme() : playerId est undefined !");
            return;
        }

        console.log("🔍 [DEBUG] Vérification du thème sélectionné pour le joueur :", playerId);

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

    // ✅ Exécuter fetchSelectedTheme() au chargement du composant
    useEffect(() => {
        fetchSelectedTheme();
    }, [playerId]);

    useEffect(() => {
        if (!gameId || !playerId) {
            console.warn("⚠️ [WARNING] Impossible de s'abonner au Realtime : gameId ou playerId manquant !");
            return;
        }

        console.log("📡 [DEBUG] Abonnement Realtime pour le jeu :", { gameId, playerId });

        const channel = supabase
            .channel(`theme_selection_${gameId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "players",
                    filter: `uuid=eq.${playerId}`
                },
                (payload) => {
                    console.log("🟢 [REALTIME] Mise à jour détectée :", payload.new.selected_theme_id);
                    
                    if (payload.new.uuid === playerId) {
                        console.log("🎯 [DEBUG] Mise à jour de selectedTheme via Realtime :", payload.new.selected_theme_id);
                        setSelectedTheme(payload.new.selected_theme_id);
                    }
                }
            )
            .subscribe();

        console.log("✅ [DEBUG] Abonnement Realtime activé :", channel);

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId, playerId]);

    // ✅ Correction : selectTheme() peut maintenant appeler fetchSelectedTheme()
    async function selectTheme(themeName, onClose) {
        console.log("🚀 [DEBUG] Envoi de la requête pour sélectionner le thème :", themeName);
        console.log("🔍 [DEBUG] Vérification avant UPDATE - playerId :", playerId, "gameId :", gameId);

        if (!playerId || !gameId) {
            console.error("❌ [ERREUR] selectTheme() : playerId ou gameId est undefined !");
            return;
        }

        if (!themes.includes(themeName)) {
            console.error("❌ Thème sélectionné non valide :", themeName);
            return;
        }

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

        const { data: updateData, error: updateError } = await supabase
            .from("players")
            .update({ selected_theme_id: themeId })
            .eq("uuid", playerId)
            .select();

        if (updateError) {
            console.error("❌ [ERREUR] Échec de la mise à jour :", updateError);
        } else {
            console.log("✅ [DEBUG] Données après update :", updateData);

            // 🔄 Attendre avant de récupérer les nouvelles données et fermer la modale
            setTimeout(async () => {
                console.log("🔄 [DEBUG] Vérification après mise à jour, récupération du thème...");
                await fetchSelectedTheme();

                console.log("✅ [DEBUG] Thème bien récupéré, fermeture de la modale !");
                onClose(); // 🚀 Fermer la modale seulement maintenant
            }, 500);
        }
    }

    return { themes, selectedTheme, selectTheme };
}
