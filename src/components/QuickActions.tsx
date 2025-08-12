"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface QuickAction {
  label: string;
  icon: string;
  href: string;
  description: string;
  color?: string;
}

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Actions rapides contextuelles basées sur la page actuelle
  const getContextualActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        label: "Nouvelle Mission",
        icon: "plus",
        href: "/missions",
        description: "Créer une nouvelle mission",
        color: "#635bff"
      },
      {
        label: "Mon Profil",
        icon: "user",
        href: "/profile",
        description: "Gérer mon profil"
      }
    ];

    // Actions spécifiques selon la page
    switch (pathname) {
      case "/":
        return [
          ...baseActions,
          {
            label: "Voir Mes Missions",
            icon: "tasks",
            href: "/missions",
            description: "Consulter toutes mes missions"
          },
          {
            label: "Équipe IA",
            icon: "users",
            href: "/agents",
            description: "Gérer mes agents IA"
          }
        ];
      
      case "/missions":
        return [
          ...baseActions,
          {
            label: "NovaBot",
            icon: "brain",
            href: "/novabot",
            description: "Utiliser NovaBot"
          },
          {
            label: "Paramètres",
            icon: "cog",
            href: "/settings",
            description: "Configurer l'apos;application"
          }
        ];
      
      case "/agents":
        return [
          ...baseActions,
          {
            label: "Nouvelle Mission",
            icon: "plus",
            href: "/missions",
            description: "Créer une mission pour mes agents"
          },
          {
            label: "NovaBot",
            icon: "brain",
            href: "/novabot",
            description: "Tester avec NovaBot"
          }
        ];
      
      default:
        return baseActions;
    }
  };

  const actions = getContextualActions();

  return (
    <div style={{ position: "relative" }}>
      {/* Bouton d'apos;ouverture */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          background: "rgba(99, 91, 255, 0.08)",
          border: "1px solid rgba(99, 91, 255, 0.2)",
          borderRadius: "8px",
          color: "#635bff",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(99, 91, 255, 0.12)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(99, 91, 255, 0.08)";
        }}
      >
        <FontAwesomeIcon icon="bolt" style={{ fontSize: "12px" }} />
        Actions rapides
        <FontAwesomeIcon 
          icon="chevron-down" 
          style={{ 
            fontSize: "10px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s"
          }} 
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100
            }}
          />
          
          {/* Menu */}
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
            minWidth: "280px",
            zIndex: 101,
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6",
              background: "#f9fafb"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Actions rapides
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "2px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Navigation contextuelle
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "8px 0" }}>
              {actions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 20px",
                    textDecoration: "none",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background-color 0.2s",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: action.color ? action.color : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "white"
                  }}>
                    <FontAwesomeIcon icon={action.icon as any} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {action.label}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "2px"
                    }}>
                      {action.description}
                    </div>
                  </div>
                  <FontAwesomeIcon 
                    icon="chevron-right" 
                    style={{ 
                      fontSize: "12px",
                      color: "#9ca3af"
                    }} 
                  />
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid #f3f4f6",
              background: "#f9fafb"
            }}>
              <div style={{
                fontSize: "11px",
                color: "#6b7280",
                textAlign: "center",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Actions adaptées à votre contexte
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
