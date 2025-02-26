import { v4 as uuidv4 } from "uuid";

export function getOrCreateUserId() {
  let storedUuid = localStorage.getItem("uuid");
  if (!storedUuid) {
    storedUuid = uuidv4();
    localStorage.setItem("uuid", storedUuid);
    console.log("🆕 Nouvel UUID généré et sauvegardé :", storedUuid);
  }
  return storedUuid;
}

