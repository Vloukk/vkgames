import { create } from "zustand";

const usePlayersStore = create((set) => ({
  players: [],
  isSpectator: false,
  selectedTheme: null,
  uuid: null,
  pseudo: "",

  setPlayers: (players) => set({ players }),
  setIsSpectator: (isSpectator) => set({ isSpectator }),
  setSelectedTheme: (selectedTheme) => set({ selectedTheme }),
  setUuid: (uuid) => set({ uuid }),
  setPseudo: (pseudo) => set({ pseudo }),
}));

export default usePlayersStore;
