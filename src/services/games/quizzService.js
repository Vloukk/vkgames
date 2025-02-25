import { createGame } from "../gameService";

export const createQuizzGame = async (pseudo) => {
  console.log("🧩 createQuizzGame() appelé avec pseudo :", pseudo);
  return await createGame(pseudo, "quizz");
};

