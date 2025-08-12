"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
export default function HomeSimple() {
  const { data: session } = useSession()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Simuler le chargement des missions
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])
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
            <FontAwesomeIcon icon="check-circle" style={{ color: "#10b981" }} />
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
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            <div style={{
              padding: "16px",
              background: "rgba(99, 91, 255, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(99, 91, 255, 0.1)"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#635bff",
                marginBottom: "8px"
              }}>
                <FontAwesomeIcon icon="rocket" style={{ marginRight: "8px" }} />
                Créer une Mission
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Lancez une nouvelle mission avec votre équipe IA
              </div>
            </div>

            <div style={{
              padding: "16px",
              background: "rgba(34, 197, 94, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(34, 197, 94, 0.1)"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#16a34a",
                marginBottom: "8px"
              }}>
                <FontAwesomeIcon icon="users" style={{ marginRight: "8px" }} />
                Équipe IA
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Gérez vos agents intelligents
              </div>
            </div>

            <div style={{
              padding: "16px",
              background: "rgba(245, 158, 11, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(245, 158, 11, 0.1)"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#f59e0b",
                marginBottom: "8px"
              }}>
                <FontAwesomeIcon icon="brain" style={{ marginRight: "8px" }} />
                NovaBot
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Assistant conversationnel intelligent
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280"
            }}>
              <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "24px", marginBottom: "16px" }} />
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
  )
}
