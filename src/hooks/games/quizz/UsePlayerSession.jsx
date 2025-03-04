import { useEffect } from "react";
import { joinGame } from "@/services/gameService";
import usePlayersStore from "@/store/quizz/playerStore";

const usePlayerSession = (gameId) => {
  const { pseudo, setPseudo, uuid, setUuid } = usePlayersStore();
  
  useEffect(() => {
    const storedPseudo = localStorage.getItem("pseudo");
    if (storedPseudo) setPseudo(storedPseudo);

    const storedUuid = localStorage.getItem("uuid");
    if (storedUuid) setUuid(storedUuid);
    else if (gameId && pseudo) {
      joinGame(gameId, pseudo).then((user) => {
        if (user?.uuid) {
          localStorage.setItem("uuid", user.uuid);
          setUuid(user.uuid);
        }
      });
    }
  }, [gameId, pseudo]);

  return { pseudo, setPseudo, uuid };
};

export default usePlayerSession;
