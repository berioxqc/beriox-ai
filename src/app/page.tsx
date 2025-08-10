"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default function HomeSimple() {
  const { data: session } = useSession();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // CSS pour l'animation de spin
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    // Simuler le chargement des missions
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <AuthGuard>
      <Layout 
        title="Accueil" 
        subtitle="Vue d'ensemble de vos missions et de votre équipe IA"
      >
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#0a2540",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <Icon name="check" style={{ color: "#10b981" }} size={24} />
            Bienvenue sur Beriox AI
          </h2>
          
          <p style={{
            fontSize: "16px",
            color: "#6b7280",
            lineHeight: "1.6",
            marginBottom: "24px"
          }}>
            Votre plateforme d'intelligence artificielle pour la gestion de missions et d'équipes.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {/* Tuile Créer une Mission */}
            <Link href="/missions" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, rgba(99, 91, 255, 0.05) 0%, rgba(99, 91, 255, 0.1) 100%)",
                borderRadius: "16px",
                border: "1px solid rgba(99, 91, 255, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(99, 91, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#635bff",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <Icon name="rocket" size={20} />
                    Créer une Mission
                  </div>
                  <Icon name="arrow-right" size={16} style={{ color: "#635bff" }} />
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#6b7280",
                  marginBottom: "16px",
                  lineHeight: "1.5"
                }}>
                  Lancez une nouvelle mission avec votre équipe IA et obtenez des résultats exceptionnels
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #635bff, #8b5cf6)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}>
                  Commencer maintenant →
                </div>
              </div>
            </Link>

            {/* Tuile Équipe IA */}
            <Link href="/agents" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%)",
                borderRadius: "16px",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(34, 197, 94, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <Icon name="users" size={20} />
                    Équipe IA
                  </div>
                  <Icon name="arrow-right" size={16} style={{ color: "#16a34a" }} />
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#6b7280",
                  marginBottom: "16px",
                  lineHeight: "1.5"
                }}>
                  Gérez vos agents intelligents et optimisez leurs performances
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}>
                  Gérer l'équipe →
                </div>
              </div>
            </Link>

            {/* Tuile NovaBot */}
            <Link href="/novabot" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.1) 100%)",
                borderRadius: "16px",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(245, 158, 11, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <Icon name="brain" size={20} />
                    NovaBot
                  </div>
                  <Icon name="arrow-right" size={16} style={{ color: "#f59e0b" }} />
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#6b7280",
                  marginBottom: "16px",
                  lineHeight: "1.5"
                }}>
                  Assistant conversationnel intelligent pour toutes vos questions
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}>
                  Discuter avec NovaBot →
                </div>
              </div>
            </Link>
          </div>

          {loading ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280"
            }}>
              <div style={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                border: "2px solid #e5e7eb",
                borderTop: "2px solid #635bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "16px"
              }} />
              <div>Chargement...</div>
            </div>
          ) : (
            <div style={{
              marginTop: "32px",
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px"
              }}>
                Statut du système
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#10b981"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981"
                }} />
                <span style={{ fontSize: "14px" }}>Tous les systèmes opérationnels</span>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
