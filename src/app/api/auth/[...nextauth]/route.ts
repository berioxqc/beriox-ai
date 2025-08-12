import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
export const authOptions: any = {
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
      // Ajouter l'ID utilisateur à la session
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Vérifications de sécurité
      if (account?.provider === "google") {
        // Vérifier que l'email est vérifié
        if (!profile?.email_verified) {
          console.warn("Tentative de connexion avec email non vérifié:", profile?.email)
          return false
        }
        
        // Log de connexion pour sécurité
        console.log("✅ Connexion Google réussie:", {
          email: user.email,
          name: user.name,
          provider: account.provider,
          timestamp: new Date().toISOString()
        })
        return true
      }
      
      return false
    },
    async redirect({ url, baseUrl }) {
      // Gestion intelligente des redirections
      console.log("🔄 Redirection:", { url, baseUrl })
      // Si l'URL est relative, la construire avec baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Si l'URL appartient au même domaine
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Par défaut, rediriger vers le dashboard
      return `${baseUrl}/missions`
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  cookies: {
    sessionToken: {
      name: "beriox-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      },
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("🔐 Événement de connexion:", {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
        timestamp: new Date().toISOString()
      })
      // Redirection spéciale pour les nouveaux utilisateurs
      if (isNewUser) {
        console.log("👋 Nouvel utilisateur détecté - redirection vers welcome")
      }
    },
    async signOut({ session, token }) {
      console.log("🚪 Événement de déconnexion:", {
        userId: token?.userId || session?.user?.id,
        timestamp: new Date().toISOString()
      })
    },
  },
  debug: process.env.NODE_ENV === "development",
}
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }