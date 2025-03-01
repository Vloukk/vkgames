// pages/_app.js
import { SessionProvider } from "next-auth/react";
import "../src/styles/app.scss"; // ✅ Vérifie le chemin selon ton projet

//sécurtité
import "@/utils/sécurity/_errorHandler"


export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
