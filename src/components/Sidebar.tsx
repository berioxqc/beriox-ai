"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useTheme } from "@/hooks/useTheme";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [premiumInfo, setPremiumInfo] = useState<{
    hasAccess: boolean;
    planId?: string;
    daysLeft?: number;
  } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const theme = useTheme();

  // Récupérer les informations utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('apos;/api/user/profile'apos;);
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.user?.role || 'apos;USER'apos;);
            
            // Calculer les infos premium
            if (data.user?.premiumAccess && data.user.premiumAccess.isActive) {
              const endDate = new Date(data.user.premiumAccess.endDate);
              const now = new Date();
              
              if (endDate > now) {
                const diffTime = endDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                setPremiumInfo({
                  hasAccess: true,
                  planId: data.user.premiumAccess.planId,
                  daysLeft
                });
              } else {
                setPremiumInfo({ hasAccess: false });
              }
            } else {
              setPremiumInfo({ hasAccess: false });
            }
          }
        } catch (error) {
          console.error('apos;Erreur lors de la récupération des infos utilisateur:'apos;, error);
        }
      }
    };

    fetchUserInfo();
  }, [session]);

  // Écouter les événements de toggle du sidebar
  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsCollapsed(!isCollapsed);
    };

    window.addEventListener('apos;sidebar-toggle'apos;, handleSidebarToggle);
    return () => window.removeEventListener('apos;sidebar-toggle'apos;, handleSidebarToggle);
  }, [isCollapsed]);

  // Structure du menu organisée par catégories
  const menuStructure = [
    {
      category: "Principal",
      items: [
        { 
          href: "/", 
          label: "Tableau de bord", 
          icon: "home",
          description: "Vue d'apos;ensemble de vos activités"
        },
        { 
          href: "/missions", 
          label: "Mes missions", 
          icon: "tasks",
          description: "Gérer vos missions en cours"
        }
      ]
    },
    {
      category: "Outils IA",
      items: [
        { 
          href: "/agents", 
          label: "Équipe IA", 
          icon: "users",
          description: "Vos agents intelligents"
        },
        { 
          href: "/novabot", 
          label: "NovaBot", 
          icon: "brain",
          description: "Assistant conversationnel"
        },
        ...(premiumInfo?.hasAccess && (premiumInfo.planId === 'apos;competitor-intelligence'apos; || premiumInfo.planId === 'apos;enterprise'apos;) ? [{
          href: "/competitors",
          label: "Veille Concurrentielle",
          icon: "search",
          description: "Surveillez vos concurrents en temps réel",
          isPremium: true
        }] : [])
      ]
    },
    {
      category: "Compte",
      items: [
        { 
          href: "/profile", 
          label: "Mon profil", 
          icon: "user",
          description: "Informations personnelles"
        },
        { 
          href: "/pricing", 
          label: "Abonnements", 
          icon: "credit-card",
          description: "Gérer votre abonnement"
        },
        {
          href: "/coupon",
          label: "Utiliser un coupon",
          icon: "gift",
          description: "Activer un code promo"
        },
        {
          href: "/refunds",
          label: "Remboursements",
          icon: "receipt",
          description: "Demander un remboursement"
        },
        { 
          href: "/settings", 
          label: "Paramètres", 
          icon: "cog",
          description: "Configuration de l'apos;application"
        }
      ]
    }
  ];

  const sidebarWidth = isCollapsed ? 64 : theme.components.sidebar.width;

  return (
    <div style={{
      width: sidebarWidth,
      height: "100vh",
      background: theme.components.sidebar.background,
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      overflowY: "auto",
      transition: "width 0.3s ease"
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        background: theme.components.sidebar.background,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        gap: 12
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
          flex: isCollapsed ? "none" : "1"
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "#635bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px"
          }}>
            <Icon name="bolt" className="text-white" size={16} />
          </div>
          {!isCollapsed && (
            <div>
              <div style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "white",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Beriox AI
              </div>
            </div>
          )}
        </Link>
        
        {/* Bouton toggle */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "4px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              transition: "background-color 0.2s",
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
            title="Réduire le menu"
          >
            <Icon 
              name="chevron-left" 
              className="text-white" 
              size={12} 
            />
          </button>
        )}
        
        {/* Bouton toggle pour mode collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "4px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
            title="Étendre le menu"
          >
            <Icon 
              name="chevron-right" 
              className="text-white" 
              size={12} 
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ 
        flex: 1,
        padding: "16px 0"
      }}>
        {menuStructure.map((section, sectionIndex) => (
          <div key={section.category}>
            {/* Titre de section */}
            {!isCollapsed && (
              <div style={{
                padding: "8px 20px 4px 20px",
                fontSize: "11px",
                fontWeight: "600",
                color: "rgba(255, 255, 255, 0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                {section.category}
              </div>
            )}
            
            {/* Items de la section */}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    textDecoration: "none",
                    color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                    background: isActive ? "rgba(99, 91, 255, 0.2)" : "transparent",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    borderRight: isActive ? "2px solid #635bff" : "2px solid transparent",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    position: "relative",
                    justifyContent: isCollapsed ? "center" : "flex-start"
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  title={isCollapsed ? item.description : undefined}
                >
                  <Icon 
                    name={item.icon} 
                    className="text-white opacity-80" 
                    size={16}
                  />
                  {!isCollapsed && (
                    <>
                      <span>{item.label}</span>
                      
                      {/* Indicateur pour les éléments spéciaux */}
                      {(item.href === "/pricing" && !premiumInfo?.hasAccess) || item.isPremium ? (
                        <div style={{
                          marginLeft: "auto",
                          padding: "2px 6px",
                          background: item.isPremium ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 215, 0, 0.2)",
                          borderRadius: "10px",
                          fontSize: "10px",
                          color: item.isPremium ? "#10b981" : "#ffd700",
                          fontWeight: "600"
                        }}>
                          {item.isPremium ? "PRO" : "PRO"}
                        </div>
                      ) : null}
                    </>
                  )}
                </Link>
              );
            })}
            
            {/* Séparateur entre sections (sauf pour la dernière) */}
            {!isCollapsed && sectionIndex < menuStructure.length - 1 && (
              <div style={{
                margin: "8px 20px",
                height: "1px",
                background: "rgba(255, 255, 255, 0.1)"
              }} />
            )}
          </div>
        ))}
      </nav>

      {/* User Menu */}
      <div style={{
        padding: "20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        background: theme.components.sidebar.background
      }}>
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
            cursor: "pointer",
            borderRadius: 6,
            transition: "background-color 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: session?.user?.image ? "transparent" : "#635bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "white",
            fontWeight: "600",
            backgroundImage: session?.user?.image ? `url(${session.user.image})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            {!session?.user?.image && (session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U")}
          </div>
          {!isCollapsed && (
            <>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "white",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}>
                  {session?.user?.name || "Utilisateur"}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.6)",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}>
                  {session?.user?.email || "Non connecté"}
                </div>
                
                {/* Indicateur Premium */}
                {premiumInfo?.hasAccess && (
                  <div style={{
                    fontSize: "10px",
                    color: "#ffd700",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                  }}>
                    <Icon name="crown" className="text-yellow-400" size={10} />
                    {premiumInfo.planId?.toUpperCase()} • {premiumInfo.daysLeft}j restants
                  </div>
                )}
              </div>
              <div style={{
                transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s"
              }}>
                <Icon 
                  name="chevron-down" 
                  className="text-white opacity-60"
                  size={12}
                />
              </div>
            </>
          )}
        </div>

        {/* Dropdown Menu - seulement si pas collapsed */}
        {showUserMenu && !isCollapsed && (
          <div style={{
            position: "absolute",
            bottom: "100%",
            left: 20,
            right: 20,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e3e8ee",
            marginBottom: 8,
            overflow: "hidden",
            zIndex: 1000
          }}>
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f6f9fc"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#0a2540",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                {session?.user?.name}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#8898aa",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                {session?.user?.email}
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setShowUserMenu(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                textDecoration: "none",
                fontSize: "14px",
                color: "#0a2540",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                transition: "background-color 0.2s",
                borderBottom: "1px solid #f6f9fc"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f6f9fc"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Icon name="user" className="mr-2" size={14} />
              Mon profil
            </Link>
            
            {/* Liens Administration pour Super Admin */}
            {session?.user?.email === 'apos;info@beriox.ca'apos; && (
              <>
                <div style={{
                  padding: "8px 16px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: "1px solid #f6f9fc",
                  background: "#f9fafb"
                }}>
                  Administration
                </div>
                
                <Link
                  href="/admin"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    background: "transparent",
                    textDecoration: "none",
                    fontSize: "14px",
                    color: "#0a2540",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    transition: "background-color 0.2s",
                    borderBottom: "1px solid #f6f9fc"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f6f9fc"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Icon name="crown" className="mr-2 text-yellow-500" size={14} />
                  Tableau de bord
                </Link>
                
                <Link
                  href="/admin/coupons"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px 8px 32px",
                    background: "transparent",
                    textDecoration: "none",
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f6f9fc"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Icon name="gift" className="mr-2" size={13} />
                  Gestion Coupons
                </Link>
                
                <Link
                  href="/admin/premium-access"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px 8px 32px",
                    background: "transparent",
                    textDecoration: "none",
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    transition: "background-color 0.2s",
                    borderBottom: "1px solid #f6f9fc"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f6f9fc"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Icon name="star" className="mr-2" size={13} />
                  Accès Premium
                </Link>
                
                <Link
                  href="/admin/refunds"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px 8px 32px",
                    background: "transparent",
                    textDecoration: "none",
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f6f9fc"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Icon name="receipt" className="mr-2" size={13} />
                  Remboursements
                </Link>
                
                <Link
                  href="/admin/recommendations"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px 8px 32px",
                    background: "transparent",
                    textDecoration: "none",
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    transition: "background-color 0.2s",
                    borderBottom: "1px solid #f6f9fc"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f6f9fc"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Icon name="lightbulb" className="mr-2" size={13} />
                  Recommandations
                </Link>
              </>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                textAlign: "left",
                fontSize: "14px",
                color: "#df1b41",
                cursor: "pointer",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Icon name="sign-out-alt" className="mr-2" size={14} />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}