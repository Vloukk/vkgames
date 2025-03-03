'use client';  // Cette ligne doit être ajoutée

import { SessionProvider } from "next-auth/react"; // Import du SessionProvider
import "../styles/app.scss";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <title>Vkgames</title>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
