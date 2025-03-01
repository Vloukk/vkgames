import { useEffect, useState, useRef } from "react";
import useGameStore from "@/store/quizz/gameStore";
import { joinGame } from "@/services/gameService";

const usePlayerSession = (gameId) => {
  const { pseudo, setPseudo } = useGameStore();
  const [uuid, setUuid] = useState(null);
  const [showPseudoModal, setShowPseudoModal] = useState(false);
  const uuidRef = useRef(null);

  useEffect(() => {
    const storedPseudo = localStorage.getItem("pseudo");
    if (storedPseudo) {
      setPseudo(storedPseudo);
      setShowPseudoModal(false); // ✅ Fermer la modale si on a un pseudo
    } else {
      setShowPseudoModal(true);
    }

    const storedUuid = localStorage.getItem("uuid");
    if (storedUuid) {
      uuidRef.current = storedUuid;
      setUuid(storedUuid);
    } else if (gameId && pseudo) {
      joinGame(gameId, pseudo).then((user) => {
        if (user?.uuid) {
          localStorage.setItem("uuid", user.uuid);
          uuidRef.current = user.uuid;
          setUuid(user.uuid);
        }
      });
    }
  }, [gameId, pseudo]);

  return { pseudo, setPseudo, uuid, showPseudoModal, setShowPseudoModal };
};

export default usePlayerSession;

