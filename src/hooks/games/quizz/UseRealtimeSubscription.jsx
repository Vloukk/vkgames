import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import useGameStore from "@/store/quizz/gameStore";
import usePlayersStore from "@/store/quizz/playerStore"; // ✅ Ajout de l'import

export function useRealtimeSubscription(gameId, playerId) {
    const setGame = useGameStore((state) => state.setGame);
    const { setSelectedTheme } = usePlayersStore(); // ✅ Utilisation du store des joueurs

    useEffect(() => {
        if (!gameId) return;

        console.log("📡 [DEBUG] Activation du Realtime global pour game :", gameId);

        const gameChannel = supabase
            .channel(`game_${gameId}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
                (payload) => {
                    console.log("🟢 [REALTIME] Mise à jour de game :", payload.new);
                    if (payload.new) setGame(payload.new);
                }
            )
            .subscribe();

        return () => {
            console.log("❌ [DEBUG] Désabonnement global pour game :", gameId);
            supabase.removeChannel(gameChannel);
        };
    }, [gameId, setGame]);

    useEffect(() => {
        if (!playerId) return;

        console.log("📡 [DEBUG] Activation du Realtime global pour player :", playerId);

        const playerChannel = supabase
            .channel(`player_${playerId}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "players", filter: `uuid=eq.${playerId}` },
                (payload) => {
                    console.log("🟢 [REALTIME] Mise à jour de player :", payload.new);

                    if (payload.new.selected_theme_id) {
                        console.log("🎨 [REALTIME] Mise à jour du thème sélectionné :", payload.new.selected_theme_id);
                        setTimeout(() => {
                            setSelectedTheme(payload.new.selected_theme_id);
                            console.log("✅ [DEBUG] selectedTheme mis à jour dans Zustand :", usePlayersStore.getState().selectedTheme);
                        }, 200);                        
                    }                    
                }
            )
            .subscribe();

        return () => {
            console.log("❌ [DEBUG] Désabonnement global pour player :", playerId);
            supabase.removeChannel(playerChannel);
        };
    }, [playerId]);
}
