"use client"
import Layout from "@/components/Layout"
import ComponentsOverview from "./components-overview"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
export default function MenuDemoPage() {
  return (
    <Layout 
      title="Démonstration du Menu Principal"
      subtitle="Découvrez la nouvelle structure de navigation de Beriox AI"
      headerActions={
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button style={{
            padding: "8px 16px",
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <FontAwesomeIcon icon="eye" style={{ marginRight: "8px" }} />
            Voir le code
          </button>
        </div>
      }
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Vue d'ensemble des composants */}
        <ComponentsOverview />
        
        {/* Section 1: Vue d'ensemble */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "24px",
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
            Structure du Menu Principal
          </h2>
          
          <p style={{
            fontSize: "16px",
            color: "#6b7280",
            lineHeight: "1.6",
            marginBottom: "24px"
          }}>
            Le menu principal de Beriox AI a été complètement restructuré pour offrir une expérience de navigation moderne, intuitive et responsive.
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
                <FontAwesomeIcon icon="sidebar" style={{ marginRight: "8px" }} />
                Sidebar Organisée
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Menu latéral avec catégories et hiérarchie visuelle
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
                <FontAwesomeIcon icon="mobile" style={{ marginRight: "8px" }} />
                Menu Mobile
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Navigation adaptée pour les appareils mobiles
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
                <FontAwesomeIcon icon="route" style={{ marginRight: "8px" }} />
                Breadcrumb
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Navigation contextuelle avec fil d'Ariane
              </div>
            </div>

            <div style={{
              padding: "16px",
              background: "rgba(239, 68, 68, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.1)"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#ef4444",
                marginBottom: "8px"
              }}>
                <FontAwesomeIcon icon="bolt" style={{ marginRight: "8px" }} />
                Actions Rapides
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Menu contextuel avec actions adaptées
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Fonctionnalités */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "24px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#0a2540",
            marginBottom: "20px"
          }}>
            Fonctionnalités Principales
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#635bff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                flexShrink: 0
              }}>
                <FontAwesomeIcon icon="desktop" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                  Design Responsive
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Adaptation automatique sur tous les appareils
                </div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                flexShrink: 0
              }}>
                <FontAwesomeIcon icon="brain" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                  Navigation Intelligente
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Actions contextuelles selon la page
                </div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                flexShrink: 0
              }}>
                <FontAwesomeIcon icon="palette" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                  Design System Unifié
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Couleurs, typographie et espacement cohérents
                </div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "8px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                flexShrink: 0
              }}>
                <FontAwesomeIcon icon="universal-access" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                  Accessibilité
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Navigation au clavier et lecteurs d'écran
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Instructions */}
        <div style={{
          background: "linear-gradient(135deg, #635bff, #a855f7)",
          borderRadius: "16px",
          padding: "32px",
          color: "white"
        }}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <FontAwesomeIcon icon="info-circle" />
            Comment Utiliser
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px"
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                <FontAwesomeIcon icon="desktop" style={{ marginRight: "8px" }} />
                Desktop
              </div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>
                Utilisez la sidebar pour la navigation principale et la barre horizontale pour les actions rapides
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                <FontAwesomeIcon icon="mobile" style={{ marginRight: "8px" }} />
                Mobile
              </div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>
                Appuyez sur le bouton hamburger pour ouvrir le menu mobile complet
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                <FontAwesomeIcon icon="route" style={{ marginRight: "8px" }} />
                Navigation
              </div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>
                Utilisez les breadcrumbs pour comprendre votre position dans l'application
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
