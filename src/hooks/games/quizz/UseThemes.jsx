import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";
import usePlayersStore from "@/store/quizz/playerStore";

export function useThemes(gameId, playerId) {
    const [themes, setThemes] = useState([]);
    const [selectedThemeName, setSelectedThemeName] = useState(""); 
    const { game } = useGameStore();
    const { selectedTheme, setSelectedTheme } = usePlayersStore();

    useEffect(() => {
        if (game?.rules?.selectedThemes) {
            setThemes(game.rules.selectedThemes);
        }
    }, [game?.rules?.selectedThemes]);

    async function fetchSelectedTheme() {
        if (!playerId) return; // ✅ Assurer la récupération même si selectedTheme existe déjà.

        const { data, error } = await supabase
            .from("players")
            .select("selected_theme_id")
            .eq("uuid", playerId)
            .single();

        if (error) {
            console.error("❌ [ERROR] Erreur lors de la récupération du thème :", error);
        } else {
            console.log("🟢 [DEBUG] Thème récupéré depuis Supabase :", data?.selected_theme_id);
            if (data?.selected_theme_id) {
                setSelectedTheme(data.selected_theme_id);
                fetchThemeName(data.selected_theme_id); // ✅ Récupérer immédiatement le nom du thème après l’assignation
            }
        }
    }

    async function fetchThemeName(themeId = selectedTheme) {
        if (!themeId) return;
        
        console.log("🔄 [DEBUG] Fetch du nom du thème après mise à jour realtime :", themeId);
    
        setTimeout(async () => {
            const { data, error } = await supabase
                .from("themes")
                .select("id, name") // ✅ Récupérer à la fois l'UUID et le nom
                .eq("id", themeId)
                .single();
    
            if (!error && data?.name) {
                console.log("🎯 [DEBUG] Nom du thème trouvé :", data.name, "| UUID :", data.id);
                setSelectedThemeName(data.name);
                console.log("✅ [DEBUG] selectedThemeName mis à jour :", data.name);
            } else {
                console.error("❌ [ERROR] Erreur lors de la récupération du nom du thème :", error);
            }
        }, 200);
    }    

    useEffect(() => {
        fetchSelectedTheme();
    }, [playerId]);

    // ✅ S'assurer que fetchThemeName est exécutée après la mise à jour de selectedTheme
    useEffect(() => {
        if (selectedTheme) {
            console.log("🔄 [DEBUG] Mise à jour du nom du thème après changement de selectedTheme :", selectedTheme);
            fetchThemeName(selectedTheme);
        }
    }, [selectedTheme]);

    async function selectTheme(themeName, onClose) {
        if (!playerId || !gameId) return;
        if (!themes.includes(themeName)) return;

        const { data, error } = await supabase
            .from("themes")
            .select("id")
            .eq("name", themeName)
            .single();

        if (error || !data?.id) return;

        const { error: updateError } = await supabase
            .from("players")
            .update({ selected_theme_id: data.id })
            .eq("uuid", playerId);

        if (!updateError) {
            setSelectedTheme(data.id);
            fetchThemeName(data.id); // ✅ Récupérer immédiatement le nom du thème après l’assignation
            onClose();
        }
    }

    useEffect(() => {
        console.log("🛠️ [DEBUG] Valeur de selectedTheme dans useThemes :", selectedTheme);
    }, [selectedTheme]);

    return { themes, selectedTheme, selectedThemeName, selectTheme, fetchThemeName }; // ✅ Ajout de fetchThemeName
}
