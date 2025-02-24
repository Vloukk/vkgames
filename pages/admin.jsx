'use client';  // Cette ligne doit être ajoutée

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const Admin = () => {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // S'assurer que ce code s'exécute uniquement côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne pas rendre le composant tant que le client n'est pas prêt
  if (!isClient || status === "loading") {
    return <p>Chargement...</p>;
  }

  if (!session) {
    return (
      <div>
        <h1>Accès réservé aux administrateurs</h1>
        <button onClick={() => signIn("google")}>Se connecter</button>
      </div>
    );
  }

  if (session.user.email !== "admin@example.com") {
    return <p>Accès refusé, vous n'êtes pas administrateur.</p>;
  }

  return (
    <div>
      <h1>Bienvenue dans le panneau d'administration</h1>
      <button onClick={() => signOut()}>Se déconnecter</button>
      <p>Contenu réservé aux administrateurs</p>
    </div>
  );
};

export default Admin;
