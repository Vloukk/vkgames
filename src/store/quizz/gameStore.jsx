import { create } from "zustand";

const useGameStore = create((set, get) => ({
  game: null,
  setGame: (newGame) => {
    const currentGame = get().game;
    if (JSON.stringify(currentGame) !== JSON.stringify(newGame)) {
      console.log("✅ [DEBUG] Mise à jour de game dans Zustand :", newGame);
      set({ game: newGame });
    } else {
      console.log("⚠️ [DEBUG] Pas de mise à jour de game (identique)");
    }
  },

  pseudo: "",
  setPseudo: (pseudo) => {
    if (get().pseudo !== pseudo) {
      console.log("📝 Mise à jour du pseudo dans Zustand :", pseudo);
      if (typeof window !== "undefined") {
        localStorage.setItem("pseudo", pseudo);
      }
      set({ pseudo });
    } else {
      console.log("⚠️ [DEBUG] Le pseudo est déjà défini, pas de mise à jour");
    }
  },
}));

export default useGameStore;









