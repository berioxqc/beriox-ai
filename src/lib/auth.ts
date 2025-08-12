/**
 * Configuration d'authentification simplifiée pour Beriox AI
 */

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
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
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
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
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)