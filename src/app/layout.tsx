import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beriox AI - Plateforme d'apos;Automatisation IA",
  description: "Votre équipe d'apos;agents IA pour automatiser et optimiser vos processus business",
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
            gtag('apos;js'apos;, new Date());
            gtag('apos;config'apos;, 'apos;G-4BNMH2FQMZ'apos;);
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
