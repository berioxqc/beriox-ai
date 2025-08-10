import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import AuthGuard from "@/components/AuthGuard";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beriox AI - Plateforme d'Automatisation IA",
  description: "Votre équipe d'agents IA pour automatiser et optimiser vos processus business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  );
}
