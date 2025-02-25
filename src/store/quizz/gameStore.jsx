import { create } from "zustand";

const useGameStore = create((set) => ({
  game: null,
  setGame: (game) => set({ game }),

  pseudo: "",
  setPseudo: (pseudo) => {
    console.log("📝 Mise à jour du pseudo dans Zustand :", pseudo);
    if (typeof window !== "undefined") {
      localStorage.setItem("pseudo", pseudo); // ✅ Sauvegarde dans localStorage
    }
    set({ pseudo });
  },
}));

export default useGameStore;







