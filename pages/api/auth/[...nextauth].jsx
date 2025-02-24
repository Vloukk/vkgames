// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/admin", // Redirige les utilisateurs vers la page /admin pour la connexion
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user.email === "admin@example.com") {
        session.user.isAdmin = true;
      }
      return session;
    },
  },
});


