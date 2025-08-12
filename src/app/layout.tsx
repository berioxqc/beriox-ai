import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beriox AI - Plateforme d'Automatisation IA",
  description: "Votre équipe d'agents IA pour automatiser et optimiser vos processus business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4BNMH2FQMZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4BNMH2FQMZ');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
