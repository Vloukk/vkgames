import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";
import usePlayersStore from "@/store/quizz/playerStore";

export function useThemes(gameId, playerId) {
    const [themes, setThemes] = useState([]);
    const { game } = useGameStore();
    const { selectedTheme, setSelectedTheme } = usePlayersStore();

    useEffect(() => {
        if (game?.rules?.selectedThemes) {
            setThemes(game.rules.selectedThemes);
        }
    }, [game?.rules?.selectedThemes]);

    async function fetchSelectedTheme() {
        if (!playerId || selectedTheme) return;

        const { data, error } = await supabase
            .from("players")
            .select("selected_theme_id")
            .eq("uuid", playerId)
            .single();

        if (!error && data?.selected_theme_id) {
            setSelectedTheme(data.selected_theme_id);
        }
    }

    useEffect(() => {
        async function fetchThemeName() {
            if (!selectedTheme) return;
            console.log("🔄 [DEBUG] Fetch du nom du thème après mise à jour realtime :", selectedTheme);
    
            const { data, error } = await supabase
                .from("themes")
                .select("name")
                .eq("id", selectedTheme)
                .single();
    
            if (!error && data?.name) {
                setSelectedThemeName(data.name);
                console.log("🎯 [DEBUG] Nom du thème mis à jour :", data.name);
            }
        }
    
        fetchThemeName();
    }, [selectedTheme]); // ✅ On surveille `selectedTheme`
    

    useEffect(() => {
        fetchSelectedTheme();
    }, [playerId]);

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
            onClose(); // ✅ On ferme la modale après la mise à jour
        }
    }

    return { themes, selectedTheme, selectTheme };
}
