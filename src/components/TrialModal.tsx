"use client";
import { signIn } from "next-auth/react";

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialModal({ isOpen, onClose }: TrialModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      backdropFilter: "blur(8px)"
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: 0,
        maxWidth: 480,
        width: "90%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        border: "1px solid #e3e8ee",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Header avec gradient */}
        <div style={{
          background: "linear-gradient(135deg, #635bff, #7c3aed)",
          color: "white",
          padding: "32px 32px 24px 32px",
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: 16
          }}>
            🎯
          </div>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            margin: 0,
            marginBottom: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            Bravo ! Vous avez testé Beriox AI
          </h2>
          <p style={{
            fontSize: "16px",
            margin: 0,
            opacity: 0.9,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            Vos 10 essais gratuits sont terminés
          </p>
        </div>

        {/* Contenu */}
        <div style={{ padding: "32px" }}>
          <div style={{
            marginBottom: 32
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#0a2540",
              margin: 0,
              marginBottom: 16,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Continuez avec un compte gratuit
            </h3>
            
            <div style={{
              display: "grid",
              gap: 12,
              marginBottom: 24
            }}>
              {[
                "✨ Missions illimitées avec votre équipe IA",
                "🔄 Synchronisation automatique avec Notion",
                "📊 Historique complet de vos projets",
                "🎯 Accès à tous les agents spécialisés"
              ].map((benefit, index) => (
                <div key={index} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0"
                }}>
                  <div style={{
                    fontSize: "16px"
                  }}>
                    {benefit.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#425466",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    {benefit.substring(benefit.indexOf(' ') + 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: "flex",
            gap: 12,
            flexDirection: "column"
          }}>
            <button
              onClick={() => signIn("google")}
              style={{
                background: "#635bff",
                color: "white",
                border: "none",
                padding: "14px 24px",
                borderRadius: 8,
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
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
                style={{ width: 20, height: 20 }} 
              />
              Continuer avec Google
            </button>
            
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                color: "#8898aa",
                border: "none",
                padding: "12px 24px",
                borderRadius: 8,
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "color 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#425466"}
              onMouseOut={(e) => e.currentTarget.style.color = "#8898aa"}
            >
              Peut-être plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
