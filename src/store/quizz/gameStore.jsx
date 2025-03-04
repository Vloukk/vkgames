import { create } from "zustand";

const useGameStore = create((set) => ({
  game: null,

  setGame: (newGame) => {
    console.log("🔄 [DEBUG] Mise à jour de game dans Zustand :", newGame);
    set({ game: newGame });
  },

  pseudo: "", 

  setPseudo: (pseudo) => { 
    if (typeof window !== "undefined") {
      localStorage.setItem("pseudo", pseudo);
    }
    set({ pseudo });
  },
}));

export default useGameStore;
