"use client";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { signIn } from "next-auth/react";

export default function TrialBanner() {
  const { trialsLeft, isAuthenticated } = useFreeTrial();

  // Ne pas afficher le banner si l'utilisateur est connecté
  if (isAuthenticated) {
    return null;
  }

  // Ne pas afficher si plus d'essais
  if (trialsLeft <= 0) {
    return null;
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #635bff, #7c3aed)",
      color: "white",
      padding: "12px 24px",
      paddingLeft: "280px", // Décalage pour éviter la sidebar
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "14px",
      fontWeight: "500",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxShadow: "0 2px 8px rgba(99, 91, 255, 0.2)",
      position: "relative",
      zIndex: 50,
      overflow: "hidden"
    }}>
      {/* Background pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "url('data:image/svg+xml,<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"2\" cy=\"2\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></svg>') repeat",
        pointerEvents: "none"
      }} />

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "relative",
        zIndex: 1
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px"
        }}>
          🎁
        </div>
        <div>
          <strong>Essai gratuit :</strong> {trialsLeft} utilisation{trialsLeft !== 1 ? 's' : ''} restante{trialsLeft !== 1 ? 's' : ''}
          <span style={{ opacity: 0.9, marginLeft: 8 }}>
            • Découvrez Beriox AI sans engagement
          </span>
        </div>
      </div>

      <button
        onClick={() => signIn("google")}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          color: "white",
          padding: "6px 16px",
          borderRadius: 6,
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s",
          position: "relative",
          zIndex: 1,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        🚀 Créer un compte gratuit
      </button>
    </div>
  );
}
