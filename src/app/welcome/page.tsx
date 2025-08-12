"use client";
import { signIn } from "next-auth/react";

export default function WelcomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "48px",
        maxWidth: 600,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)"
      }}>
        <div style={{
          fontSize: "64px",
          marginBottom: 24
        }}>
          🚀
        </div>
        
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#0a2540",
          margin: 0,
          marginBottom: 16,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          Bienvenue sur Beriox AI
        </h1>
        
        <p style={{
          fontSize: "18px",
          color: "#425466",
          margin: 0,
          marginBottom: 32,
          lineHeight: "1.6",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          Votre équipe d&apos;agents IA pour automatiser et optimiser vos processus business. 
          Créez un compte gratuit pour commencer dès maintenant.
        </p>

        <div style={{
          display: "grid",
          gap: 16,
          marginBottom: 32
        }}>
          {[
            "🎯 Sophie, Marc, Emma et toute l'équipe à votre service",
            "⚡ Missions illimitées et résultats en temps réel",
            "🔄 Synchronisation automatique avec vos outils",
            "📊 Analyses et rapports détaillés"
          ].map((feature, index) => (
            <div key={index} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              background: "#f7f9fc",
              borderRadius: 8,
              textAlign: "left"
            }}>
              <div style={{ fontSize: "20px" }}>
                {feature.split(&apos; &apos;)[0]}
              </div>
              <div style={{
                fontSize: "16px",
                color: "#425466",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                {feature.substring(feature.indexOf(&apos; &apos;) + 1)}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => signIn("google")}
          style={{
            background: "#635bff",
            color: "white",
            border: "none",
            padding: "16px 32px",
            borderRadius: 8,
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            margin: "0 auto",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#5a51e5";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(99, 91, 255, 0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#635bff";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <img 
            src="https://www.svgrepo.com/show/355037/google.svg" 
            alt="Google" 
            style={{ width: 24, height: 24 }} 
          />
          Créer un compte gratuit
        </button>

        <p style={{
          fontSize: "14px",
          color: "#8898aa",
          margin: 0,
          marginTop: 24,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          Aucune carte de crédit requise • Accès immédiat • 100% gratuit
        </p>
      </div>
    </div>
  );
}
