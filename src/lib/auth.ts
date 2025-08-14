/**
 * Configuration d'authentification simplifiée pour Beriox AI
 */

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Log simple pour debug
      console.log("🔐 Connexion:", user.email)
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirection simple et directe
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return `${baseUrl}/missions`
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)