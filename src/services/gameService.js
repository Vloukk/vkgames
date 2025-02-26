import { supabase } from "@/utils/supabaseClient";
import { getOrCreateUserId } from "@/utils/userUtils";

// ✅ Récupérer les infos d'une partie
export const fetchGame = async (gameId) => {
  try {
    if (!gameId) throw new Error("gameId est requis.");

    const { data, error } = await supabase
      .from("games")
      .select("id, host_pseudo, rules")
      .eq("id", gameId)
      .single();

    if (error) throw error;

    console.log("🔍 Données récupérées pour la partie :", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur fetchGame() :", error);
    return null;
  }
};

// ✅ Créer une partie et ajouter l'hôte automatiquement
export const createGame = async (hostPseudo) => {
  try {
    if (!hostPseudo) throw new Error("Le pseudo de l'hôte est requis.");

    const userUuid = getOrCreateUserId();
    console.log("🎮 Création d'une nouvelle partie pour :", hostPseudo);
    console.log("🆔 UUID de l'hôte :", userUuid);

    // ✅ Création de la partie
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert([{ host_pseudo: hostPseudo, status: "waiting" }])
      .select("*")
      .single();

    if (gameError) {
      console.error("❌ Erreur création partie :", gameError);
      throw gameError;
    }

    console.log("✅ Partie créée avec succès :", game);

    // 🔥 DEBUG : Vérification de `game.id`
    if (!game?.id) {
      console.error("❌ Erreur: ID de la partie non récupéré !");
      return null;
    }

    // ✅ Ajout de l'hôte comme joueur
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert([{ game_id: game.id, uuid: userUuid, pseudo: hostPseudo, score: 0, is_ready: false }])
      .select("*")
      .single();

    if (playerError) {
      console.error("❌ Erreur ajout de l'hôte dans players :", playerError);
      throw playerError;
    }

    console.log("✅ Hôte ajouté dans la partie :", player);
    return game.id;
  } catch (error) {
    console.error("❌ Erreur createGame() :", error);
    throw error;
  }
};


// ✅ Récupérer les joueurs d'une partie
export const fetchPlayers = async (gameId) => {
  try {
    if (!gameId) { 
      console.error("❌ Erreur : gameId est manquant !");
      return [];
    }

    console.log("📡 Récupération des joueurs pour la partie :", gameId);

    const { data, error } = await supabase
      .from("players")
      .select("id, uuid, pseudo, score, is_ready, is_spectator") // ✅ Vérifie que toutes ces colonnes existent
      .eq("game_id", gameId);

    if (error) {
      console.error("❌ Erreur récupération joueurs :", error);
      return [];
    }

    console.log("✅ Liste complète des joueurs (y compris l'host) :", data);
    console.log("🎮 Nombre de joueurs actifs :", data.filter(p => !p.is_spectator).length);

    return data;
  } catch (error) {
    console.error("❌ Erreur fetchPlayers() :", error);
    return [];
  }
};


// ✅ Quitter une partie
export const leaveGame = async (gameId) => {
  try {
    const userUuid = localStorage.getItem("uuid");
    if (!gameId || !userUuid) {
      console.error("❌ Erreur: gameId ou uuid manquant !");
      return false;
    }

    console.log("🔍 Vérification du joueur en base...");

    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("is_spectator")
      .eq("game_id", gameId)
      .eq("uuid", userUuid)
      .single();

    if (fetchError) {
      console.error("❌ Erreur lors de la récupération du joueur :", fetchError);
      return false;
    }

    if (!player) {
      console.warn("⚠️ Joueur introuvable !");
      return false;
    }

    // 🔥 Suppression si le joueur est spectateur
    if (player.is_spectator) {
      console.log("👀 Suppression du spectateur :", userUuid);
      const { error: deleteError } = await supabase
        .from("players")
        .delete()
        .eq("game_id", gameId)
        .eq("uuid", userUuid);

      if (deleteError) {
        console.error("❌ Erreur lors de la suppression du spectateur :", deleteError);
        return false;
      }
      console.log("✅ Spectateur supprimé avec succès !");
    }

    localStorage.removeItem("uuid");
    return true;
  } catch (error) {
    console.error("❌ Erreur leaveGame() :", error);
    return false;
  }
};

// ✅ Copier le lien de la partie
export const copyGameLink = async (gameId, setCopySuccess) => {
  try {
    const gameLink = `${window.location.origin}/game/${gameId}`;
    await navigator.clipboard.writeText(gameLink);
    setCopySuccess("Lien copié !");
    setTimeout(() => setCopySuccess(""), 2000);
  } catch (err) {
    console.error("❌ Erreur copie du lien :", err);
  }
};

// ✅ Ajouter un joueur à une partie
export const joinGame = async (gameId, pseudo) => {
  try {
    if (!gameId || !pseudo) {
      throw new Error("❌ Erreur : gameId ou pseudo manquant !");
    }

    const userUuid = getOrCreateUserId();
    console.log(`🚀 Tentative de rejoindre la partie ${gameId} avec UUID: ${userUuid}`);

    // ✅ 1. Récupérer les règles du jeu
    const game = await fetchGame(gameId);
    if (!game || !game.rules) {
      console.error("❌ Erreur : Impossible de récupérer les règles du jeu !");
      return null;
    }

    const maxPlayers = game.rules.maxPlayers || 1;
    console.log("👥 Nombre max de joueurs autorisés :", maxPlayers);

    // ✅ 2. Récupérer la liste des joueurs
    const existingPlayers = await fetchPlayers(gameId);
    if (!existingPlayers) {
      console.error("❌ Erreur : Impossible de récupérer la liste des joueurs !");
      return null;
    }

    console.log("📡 Liste complète des joueurs (y compris l'host) :", existingPlayers);

    const currentPlayersCount = existingPlayers.filter(p => !p.is_spectator).length;
    console.log("🎮 Nombre de joueurs actifs (hors spectateurs) :", currentPlayersCount);

    // ✅ 3. Vérifier si l'utilisateur est déjà dans la base
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id, uuid, is_spectator")
      .eq("game_id", gameId)
      .eq("uuid", userUuid)
      .single();

    if (existingPlayer) {
      console.log("⚠️ Joueur déjà existant :", existingPlayer);
      localStorage.setItem("uuid", existingPlayer.uuid);
      return existingPlayer;
    }

    // 🚨 TEST CRITIQUE : Pourquoi la condition ne fonctionne pas ?
    console.log("🔍 Vérification avant ajout : maxPlayers =", maxPlayers, ", currentPlayersCount =", currentPlayersCount);
    
    if (currentPlayersCount >= maxPlayers) {
      console.warn("⛔ La partie est pleine, passage en mode spectateur !");
    }

    // ✅ 4. Déterminer si le joueur doit être spectateur
    const isSpectator = currentPlayersCount >= maxPlayers;

    console.log(isSpectator ? "👀 Mode spectateur activé" : "🎮 Joueur actif ajouté");

    // ✅ 5. Ajouter le joueur dans la base
    const { data: newPlayer, error: playerError } = await supabase
      .from("players")
      .insert([{ 
        game_id: gameId, 
        uuid: userUuid.toString(), 
        pseudo, 
        score: 0, 
        is_ready: false, 
        is_spectator: isSpectator 
      }])
      .select("id, uuid, is_spectator")
      .single();

    if (playerError) {
      console.error("❌ Erreur ajout joueur :", playerError);
      return null;
    }

    console.log("✅ Joueur ajouté avec succès :", newPlayer);
    localStorage.setItem("uuid", newPlayer.uuid);

    return newPlayer;
  } catch (error) {
    console.error("❌ Erreur joinGame() :", error);
    return null;
  }
};



