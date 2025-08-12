"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ComponentsOverview() {
  const components = [
    {
      name: "Sidebar.tsx",
      icon: "sidebar",
      color: "#635bff",
      description: "Menu latéral principal avec organisation par catégories",
      features: [
        "Organisation par catégories (Principal, Outils IA, Compte)",
        "Menu utilisateur avec dropdown et informations premium",
        "Indicateurs visuels et badges",
        "Navigation responsive avec scroll"
      ]
    },
    {
      name: "Navigation.tsx",
      icon: "bars",
      color: "#16a34a",
      description: "Barre de navigation horizontale responsive",
      features: [
        "Navigation simplifiée pour desktop",
        "Intégration du menu mobile",
        "Actions rapides contextuelles",
        "Indicateur de statut utilisateur"
      ]
    },
    {
      name: "MobileMenu.tsx",
      icon: "mobile",
      color: "#f59e0b",
      description: "Menu mobile complet avec animation",
      features: [
        "Menu hamburger avec animation CSS",
        "Overlay de fermeture",
        "Navigation complète avec tous les éléments",
        "Bouton de déconnexion intégré"
      ]
    },
    {
      name: "Breadcrumb.tsx",
      icon: "route",
      color: "#ef4444",
      description: "Navigation contextuelle avec fil d'Ariane",
      features: [
        "Support des pages dynamiques",
        "Hiérarchie parent-enfant",
        "Icônes descriptives pour chaque niveau",
        "Navigation cliquable"
      ]
    },
    {
      name: "QuickActions.tsx",
      icon: "bolt",
      color: "#8b5cf6",
      description: "Menu d'actions rapides contextuelles",
      features: [
        "Actions adaptées selon la page actuelle",
        "Menu déroulant élégant",
        "Descriptions détaillées",
        "Icônes colorées pour chaque action"
      ]
    },
    {
      name: "Layout.tsx",
      icon: "layer-group",
      color: "#06b6d4",
      description: "Layout principal avec intégration des composants",
      features: [
        "Intégration harmonieuse de tous les composants",
        "Options de configuration (sidebar, navigation)",
        "Responsive design complet",
        "Modal de création rapide de mission"
      ]
    }
  ];

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "32px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
    }}>
      <h3 style={{
        fontSize: "20px",
        fontWeight: "600",
        color: "#0a2540",
        marginBottom: "24px",
        textAlign: "center"
      }}>
        Vue d'Ensemble des Composants
      </h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "24px"
      }}>
        {components.map((component, index) => (
          <div
            key={component.name}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px",
              background: `linear-gradient(135deg, ${component.color}, ${component.color}dd)`,
              color: "white"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px"
                }}>
                  <FontAwesomeIcon icon={component.icon as any} />
                </div>
                <div>
                  <div style={{
                    fontSize: "18px",
                    fontWeight: "700"
                  }}>
                    {component.name}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    opacity: 0.9
                  }}>
                    Composant #{index + 1}
                  </div>
                </div>
              </div>
              
              <p style={{
                fontSize: "14px",
                opacity: 0.9,
                margin: 0,
                lineHeight: "1.4"
              }}>
                {component.description}
              </p>
            </div>

            {/* Features */}
            <div style={{ padding: "20px" }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px"
              }}>
                Fonctionnalités :
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#6b7280",
                fontSize: "13px",
                lineHeight: "1.5"
              }}>
                {component.features.map((feature, featureIndex) => (
                  <li key={featureIndex} style={{ marginBottom: "6px" }}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div style={{
              padding: "12px 20px",
              background: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "500"
              }}>
                TypeScript + React
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981"
                }} />
                <span style={{
                  fontSize: "12px",
                  color: "#10b981",
                  fontWeight: "600"
                }}>
                  Prêt
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        marginTop: "32px",
        padding: "24px",
        background: "#f9fafb",
        borderRadius: "12px",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
          textAlign: "center"
        }}>
          <div>
            <div style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#635bff"
            }}>
              6
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Composants créés
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#16a34a"
            }}>
              100%
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Responsive
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#f59e0b"
            }}>
              25+
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Fonctionnalités
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#ef4444"
            }}>
              <FontAwesomeIcon icon="check-circle" />
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Prêt à utiliser
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
