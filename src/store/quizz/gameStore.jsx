import { create } from "zustand";
import { supabase } from "@/utils/supabaseClient";

const useGameStore = create((set, get) => ({
  game: null,

  setGame: (newGame) => {
    console.log("🔄 [DEBUG] Mise à jour de game dans Zustand :", newGame);
    console.log("🎯 [DEBUG] selectedThemes mis à jour :", newGame.rules?.selectedThemes);
    set({ game: newGame });
  },  

  pseudo: "", // ✅ Ajout d'un état pour le pseudo

  setPseudo: (pseudo) => { // ✅ Correction de l'erreur "setPseudo is not a function"
    console.log("📝 [DEBUG] Mise à jour du pseudo dans Zustand :", pseudo);

    if (typeof window !== "undefined") {
      localStorage.setItem("pseudo", pseudo);
    }

    set({ pseudo });
  },

  subscribeToGameUpdates: async (gameId) => {
    if (!gameId) return;
  
    console.log("📡 [DEBUG] Abonnement Realtime pour le jeu :", gameId);
  
    // 🔄 Récupérer le jeu immédiatement au chargement
    const { data: initialGame, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();
  
    if (gameError) {
      console.error("❌ [ERROR] Impossible de récupérer le jeu :", gameError);
    } else {
      console.log("✅ [DEBUG] Game récupéré au chargement :", initialGame);
      set({ game: initialGame }); // Mise à jour immédiate de Zustand
    }
  
    // 🔄 Activer l'écoute en temps réel avec la **nouvelle API**
    const gameListener = supabase
      .channel(`game_${gameId}`)
      .on(
        "postgres_changes", 
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` }, 
        (payload) => {
          console.log("🟢 [REALTIME] Mise à jour détectée :", payload.new);
          
          if (!payload.new) {
            console.error("❌ [ERROR] Données de mise à jour invalides :", payload);
            return;
          }
  
          set({ game: payload.new });
        }
      )
      .subscribe();
  
    return () => {
      console.log("❌ [DEBUG] Désabonnement du jeu :", gameId);
      supabase.removeChannel(gameListener);
    };
  },  
}));

export default useGameStore;
