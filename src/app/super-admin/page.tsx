"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import AccessGuard from "@/components/AccessGuard";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faRocket, 
  faChartLine, 
  faCog, 
  faShieldAlt, 
  faDatabase,
  faCreditCard,
  faTicketAlt,
  faArrowRight,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faServer,
  faNetworkWired,
  faBrain,
  faEye,
  faTools,
  faBell,
  faFileAlt,
  faKey,
  faCrown
} from "@fortawesome/free-solid-svg-icons";

interface SystemStats {
  users: {
    total: number;
    active: number;
    premium: number;
    newThisMonth: number;
  };
  missions: {
    total: number;
    completed: number;
    inProgress: number;
    failed: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  revenue: {
    monthly: number;
    total: number;
    growth: number;
  };
  system: {
    cpu: number;
    memory: number;
    disk: number;
    activeConnections: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  category: string;
}

export default function SuperAdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('apos;overview'apos;);



  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      // Simuler des données de système pour la démo
      const mockStats: SystemStats = {
        users: {
          total: 1247,
          active: 892,
          premium: 156,
          newThisMonth: 89
        },
        missions: {
          total: 3456,
          completed: 2891,
          inProgress: 234,
          failed: 331
        },
        performance: {
          avgResponseTime: 87,
          uptime: 99.97,
          cacheHitRate: 78.5,
          errorRate: 0.12
        },
        revenue: {
          monthly: 45230,
          total: 234567,
          growth: 23.4
        },
        system: {
          cpu: 34,
          memory: 67,
          disk: 45,
          activeConnections: 234
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('apos;Erreur lors du chargement des statistiques:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    // Gestion des Utilisateurs
    {
      id: 'apos;users'apos;,
      title: 'apos;Gestion Utilisateurs'apos;,
      description: 'apos;Gérer les comptes, permissions et profils'apos;,
      icon: faUsers,
      href: 'apos;/admin/users'apos;,
      color: 'apos;#3b82f6'apos;,
      category: 'apos;users'apos;
    },
    {
      id: 'apos;premium'apos;,
      title: 'apos;Accès Premium'apos;,
      description: 'apos;Gérer les abonnements et accès premium'apos;,
      icon: faCrown,
      href: 'apos;/admin/premium-access'apos;,
      color: 'apos;#f59e0b'apos;,
      category: 'apos;users'apos;
    },

    // Missions et IA
    {
      id: 'apos;missions'apos;,
      title: 'apos;Gestion Missions'apos;,
      description: 'apos;Surveiller et gérer les missions IA'apos;,
      icon: faRocket,
      href: 'apos;/admin/missions'apos;,
      color: 'apos;#10b981'apos;,
      category: 'apos;missions'apos;
    },
    {
      id: 'apos;agents'apos;,
      title: 'apos;Agents IA'apos;,
      description: 'apos;Configurer et optimiser les agents IA'apos;,
      icon: faBrain,
      href: 'apos;/agents'apos;,
      color: 'apos;#8b5cf6'apos;,
      category: 'apos;missions'apos;
    },
    {
      id: 'apos;recommendations'apos;,
      title: 'apos;Recommandations'apos;,
      description: 'apos;Gérer les recommandations d\'apos;agents'apos;,
      icon: faChartLine,
      href: 'apos;/admin/recommendations'apos;,
      color: 'apos;#06b6d4'apos;,
      category: 'apos;missions'apos;
    },

    // Paiements et Finances
    {
      id: 'apos;payments'apos;,
      title: 'apos;Paiements Stripe'apos;,
      description: 'apos;Gérer les paiements et facturations'apos;,
      icon: faCreditCard,
      href: 'apos;/admin/payments'apos;,
      color: 'apos;#6366f1'apos;,
      category: 'apos;finance'apos;
    },
    {
      id: 'apos;refunds'apos;,
      title: 'apos;Remboursements'apos;,
      description: 'apos;Traiter les demandes de remboursement'apos;,
      icon: faTicketAlt,
      href: 'apos;/admin/refunds'apos;,
      color: 'apos;#ef4444'apos;,
      category: 'apos;finance'apos;
    },
    {
      id: 'apos;coupons'apos;,
      title: 'apos;Codes Promo'apos;,
      description: 'apos;Créer et gérer les codes de réduction'apos;,
      icon: faTicketAlt,
      href: 'apos;/admin/coupons'apos;,
      color: 'apos;#84cc16'apos;,
      category: 'apos;finance'apos;
    },

    // Système et Performance
    {
      id: 'apos;monitoring'apos;,
      title: 'apos;Monitoring'apos;,
      description: 'apos;Surveiller les performances système'apos;,
      icon: faServer,
      href: 'apos;/admin/monitoring'apos;,
      color: 'apos;#f97316'apos;,
      category: 'apos;system'apos;
    },
    {
      id: 'apos;cache'apos;,
      title: 'apos;Cache Redis'apos;,
      description: 'apos;Gérer le cache et les performances'apos;,
      icon: faDatabase,
      href: 'apos;/admin/cache'apos;,
      color: 'apos;#dc2626'apos;,
      category: 'apos;system'apos;
    },
    {
      id: 'apos;rate-limit'apos;,
      title: 'apos;Rate Limiting'apos;,
      description: 'apos;Configurer les limites de requêtes'apos;,
      icon: faShieldAlt,
      href: 'apos;/admin/rate-limit'apos;,
      color: 'apos;#7c3aed'apos;,
      category: 'apos;system'apos;
    },

    // Sécurité
    {
      id: 'apos;security'apos;,
      title: 'apos;Sécurité'apos;,
      description: 'apos;Audit de sécurité et logs'apos;,
      icon: faShieldAlt,
      href: 'apos;/admin/security'apos;,
      color: 'apos;#059669'apos;,
      category: 'apos;security'apos;
    },
    {
      id: 'apos;logs'apos;,
      title: 'apos;Logs Système'apos;,
      description: 'apos;Consulter les logs d\'apos;application'apos;,
      icon: faFileAlt,
      href: 'apos;/admin/logs'apos;,
      color: 'apos;#6b7280'apos;,
      category: 'apos;security'apos;
    },

    // Analytics et Rapports
    {
      id: 'apos;analytics'apos;,
      title: 'apos;Analytics'apos;,
      description: 'apos;Analyses détaillées et rapports'apos;,
      icon: faChartLine,
      href: 'apos;/admin/analytics'apos;,
      color: 'apos;#0891b2'apos;,
      category: 'apos;analytics'apos;
    },
    {
      id: 'apos;reports'apos;,
      title: 'apos;Rapports'apos;,
      description: 'apos;Générer des rapports personnalisés'apos;,
      icon: faFileAlt,
      href: 'apos;/admin/reports'apos;,
      color: 'apos;#be185d'apos;,
      category: 'apos;analytics'apos;
    },

    // Configuration
    {
      id: 'apos;settings'apos;,
      title: 'apos;Configuration'apos;,
      description: 'apos;Paramètres système avancés'apos;,
      icon: faCog,
      href: 'apos;/admin/settings'apos;,
      color: 'apos;#374151'apos;,
      category: 'apos;config'apos;
    },
    {
      id: 'apos;integrations'apos;,
      title: 'apos;Intégrations'apos;,
      description: 'apos;Gérer les intégrations externes'apos;,
      icon: faNetworkWired,
      href: 'apos;/integrations'apos;,
      color: 'apos;#0ea5e9'apos;,
      category: 'apos;config'apos;
    }
  ];

  const categories = {
    users: { name: 'apos;Utilisateurs'apos;, color: 'apos;#3b82f6'apos; },
    missions: { name: 'apos;Missions & IA'apos;, color: 'apos;#10b981'apos; },
    finance: { name: 'apos;Finance'apos;, color: 'apos;#6366f1'apos; },
    system: { name: 'apos;Système'apos;, color: 'apos;#f97316'apos; },
    security: { name: 'apos;Sécurité'apos;, color: 'apos;#059669'apos; },
    analytics: { name: 'apos;Analytics'apos;, color: 'apos;#0891b2'apos; },
    config: { name: 'apos;Configuration'apos;, color: 'apos;#374151'apos; }
  };

  const getActionsByCategory = (category: string) => {
    return quickActions.filter(action => action.category === category);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{ padding: 'apos;40px'apos;, textAlign: 'apos;center'apos; }}>
            <div style={{ fontSize: 'apos;24px'apos;, color: 'apos;#6b7280'apos; }}>Chargement...</div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AccessGuard superAdminOnly={true}>
        <Layout>
        <div style={{ padding: 'apos;24px'apos;, maxWidth: 'apos;1400px'apos;, margin: 'apos;0 auto'apos; }}>
          {/* Header */}
          <div style={{ marginBottom: 'apos;32px'apos; }}>
            <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;16px'apos;, marginBottom: 'apos;8px'apos; }}>
              <div style={{ fontSize: 'apos;32px'apos; }}>👑</div>
              <h1 style={{ fontSize: 'apos;32px'apos;, fontWeight: 'apos;700'apos;, margin: 'apos;0'apos; }}>
                Super-Admin Dashboard
              </h1>
            </div>
            <p style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;16px'apos;, margin: 'apos;0'apos; }}>
              Contrôle total sur Beriox AI - {session?.user?.email}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'apos;flex'apos;, 
            gap: 'apos;8px'apos;, 
            marginBottom: 'apos;32px'apos;,
            borderBottom: 'apos;1px solid #e5e7eb'apos;,
            paddingBottom: 'apos;16px'apos;
          }}>
            {['apos;overview'apos;, 'apos;actions'apos;, 'apos;system'apos;, 'apos;analytics'apos;, 'apos;users'apos;].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'apos;12px 24px'apos;,
                  border: 'apos;none'apos;,
                  borderRadius: 'apos;8px'apos;,
                  cursor: 'apos;pointer'apos;,
                  fontWeight: 'apos;600'apos;,
                  backgroundColor: activeTab === tab ? 'apos;#635bff'apos; : 'apos;transparent'apos;,
                  color: activeTab === tab ? 'apos;white'apos; : 'apos;#6b7280'apos;,
                  transition: 'apos;all 0.2s'apos;
                }}
              >
                {tab === 'apos;overview'apos; && 'apos;Vue d\'apos;ensemble'apos;}
                {tab === 'apos;actions'apos; && 'apos;Actions Rapides'apos;}
                {tab === 'apos;system'apos; && 'apos;Système'apos;}
                {tab === 'apos;analytics'apos; && 'apos;Analytics'apos;}
                {tab === 'apos;users'apos; && 'apos;Gestion Utilisateurs'apos;}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'apos;overview'apos; && (
            <div>
              {/* Stats Cards */}
              <div style={{ 
                display: 'apos;grid'apos;, 
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(250px, 1fr))'apos;, 
                gap: 'apos;24px'apos;, 
                marginBottom: 'apos;32px'apos; 
              }}>
                {/* Users Stats */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;12px'apos;, marginBottom: 'apos;16px'apos; }}>
                    <FontAwesomeIcon icon={faUsers} style={{ color: 'apos;#3b82f6'apos;, fontSize: 'apos;20px'apos; }} />
                    <h3 style={{ margin: 'apos;0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>Utilisateurs</h3>
                  </div>
                  <div style={{ fontSize: 'apos;32px'apos;, fontWeight: 'apos;700'apos;, marginBottom: 'apos;8px'apos; }}>
                    {stats?.users.total.toLocaleString()}
                  </div>
                  <div style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;14px'apos; }}>
                    {stats?.users.premium} premium • {stats?.users.newThisMonth} nouveaux ce mois
                  </div>
                </div>

                {/* Missions Stats */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;12px'apos;, marginBottom: 'apos;16px'apos; }}>
                    <FontAwesomeIcon icon={faRocket} style={{ color: 'apos;#10b981'apos;, fontSize: 'apos;20px'apos; }} />
                    <h3 style={{ margin: 'apos;0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>Missions</h3>
                  </div>
                  <div style={{ fontSize: 'apos;32px'apos;, fontWeight: 'apos;700'apos;, marginBottom: 'apos;8px'apos; }}>
                    {stats?.missions.total.toLocaleString()}
                  </div>
                  <div style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;14px'apos; }}>
                    {stats?.missions.completed} complétées • {stats?.missions.inProgress} en cours
                  </div>
                </div>

                {/* Revenue Stats */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;12px'apos;, marginBottom: 'apos;16px'apos; }}>
                    <FontAwesomeIcon icon={faChartLine} style={{ color: 'apos;#f59e0b'apos;, fontSize: 'apos;20px'apos; }} />
                    <h3 style={{ margin: 'apos;0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>Revenus</h3>
                  </div>
                  <div style={{ fontSize: 'apos;32px'apos;, fontWeight: 'apos;700'apos;, marginBottom: 'apos;8px'apos; }}>
                    ${stats?.revenue.monthly.toLocaleString()}
                  </div>
                  <div style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;14px'apos; }}>
                    Ce mois • +{stats?.revenue.growth}% vs mois dernier
                  </div>
                </div>

                {/* Performance Stats */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;12px'apos;, marginBottom: 'apos;16px'apos; }}>
                    <FontAwesomeIcon icon={faServer} style={{ color: 'apos;#f97316'apos;, fontSize: 'apos;20px'apos; }} />
                    <h3 style={{ margin: 'apos;0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>Performance</h3>
                  </div>
                  <div style={{ fontSize: 'apos;32px'apos;, fontWeight: 'apos;700'apos;, marginBottom: 'apos;8px'apos; }}>
                    {stats?.performance.uptime}%
                  </div>
                  <div style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;14px'apos; }}>
                    Uptime • {stats?.performance.avgResponseTime}ms réponse
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h2 style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;600'apos;, marginBottom: 'apos;24px'apos; }}>
                  Actions Rapides
                </h2>
                <div style={{ 
                  display: 'apos;grid'apos;, 
                  gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;, 
                  gap: 'apos;16px'apos; 
                }}>
                  {quickActions.slice(0, 6).map(action => (
                    <Link
                      key={action.id}
                      href={action.href}
                      style={{
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        gap: 'apos;16px'apos;,
                        padding: 'apos;20px'apos;,
                        backgroundColor: 'apos;white'apos;,
                        borderRadius: 'apos;12px'apos;,
                        border: 'apos;1px solid #e5e7eb'apos;,
                        textDecoration: 'apos;none'apos;,
                        color: 'apos;inherit'apos;,
                        transition: 'apos;all 0.2s'apos;,
                        boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
                        e.currentTarget.style.boxShadow = 'apos;0 4px 12px rgba(0,0,0,0.15)'apos;;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
                        e.currentTarget.style.boxShadow = 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;;
                      }}
                    >
                      <div style={{ 
                        width: 'apos;48px'apos;, 
                        height: 'apos;48px'apos;, 
                        borderRadius: 'apos;12px'apos;, 
                        backgroundColor: action.color,
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        justifyContent: 'apos;center'apos;,
                        color: 'apos;white'apos;
                      }}>
                        <FontAwesomeIcon icon={action.icon} style={{ fontSize: 'apos;20px'apos; }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 'apos;0 0 4px 0'apos;, fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos; }}>
                          {action.title}
                        </h3>
                        <p style={{ margin: 'apos;0'apos;, fontSize: 'apos;14px'apos;, color: 'apos;#6b7280'apos; }}>
                          {action.description}
                        </p>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} style={{ color: 'apos;#9ca3af'apos; }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'apos;actions'apos; && (
            <div>
              <h2 style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;600'apos;, marginBottom: 'apos;24px'apos; }}>
                Toutes les Actions Administratives
              </h2>
              
              {Object.entries(categories).map(([categoryKey, category]) => (
                <div key={categoryKey} style={{ marginBottom: 'apos;32px'apos; }}>
                  <h3 style={{ 
                    fontSize: 'apos;20px'apos;, 
                    fontWeight: 'apos;600'apos;, 
                    marginBottom: 'apos;16px'apos;,
                    color: category.color
                  }}>
                    {category.name}
                  </h3>
                  <div style={{ 
                    display: 'apos;grid'apos;, 
                    gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;, 
                    gap: 'apos;16px'apos; 
                  }}>
                    {getActionsByCategory(categoryKey).map(action => (
                      <Link
                        key={action.id}
                        href={action.href}
                        style={{
                          display: 'apos;flex'apos;,
                          alignItems: 'apos;center'apos;,
                          gap: 'apos;16px'apos;,
                          padding: 'apos;20px'apos;,
                          backgroundColor: 'apos;white'apos;,
                          borderRadius: 'apos;12px'apos;,
                          border: 'apos;1px solid #e5e7eb'apos;,
                          textDecoration: 'apos;none'apos;,
                          color: 'apos;inherit'apos;,
                          transition: 'apos;all 0.2s'apos;,
                          boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
                          e.currentTarget.style.boxShadow = 'apos;0 4px 12px rgba(0,0,0,0.15)'apos;;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
                          e.currentTarget.style.boxShadow = 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;;
                        }}
                      >
                        <div style={{ 
                          width: 'apos;48px'apos;, 
                          height: 'apos;48px'apos;, 
                          borderRadius: 'apos;12px'apos;, 
                          backgroundColor: action.color,
                          display: 'apos;flex'apos;,
                          alignItems: 'apos;center'apos;,
                          justifyContent: 'apos;center'apos;,
                          color: 'apos;white'apos;
                        }}>
                          <FontAwesomeIcon icon={action.icon} style={{ fontSize: 'apos;20px'apos; }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 'apos;0 0 4px 0'apos;, fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos; }}>
                            {action.title}
                          </h3>
                          <p style={{ margin: 'apos;0'apos;, fontSize: 'apos;14px'apos;, color: 'apos;#6b7280'apos; }}>
                            {action.description}
                          </p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} style={{ color: 'apos;#9ca3af'apos; }} />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'apos;system'apos; && (
            <div>
              <h2 style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;600'apos;, marginBottom: 'apos;24px'apos; }}>
                État du Système
              </h2>
              
              <div style={{ 
                display: 'apos;grid'apos;, 
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;, 
                gap: 'apos;24px'apos; 
              }}>
                {/* System Resources */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <h3 style={{ margin: 'apos;0 0 16px 0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                    Ressources Système
                  </h3>
                  <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: 'apos;12px'apos; }}>
                    <div>
                      <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, marginBottom: 'apos;4px'apos; }}>
                        <span style={{ fontSize: 'apos;14px'apos; }}>CPU</span>
                        <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>{stats?.system.cpu}%</span>
                      </div>
                      <div style={{ 
                        width: 'apos;100%'apos;, 
                        height: 'apos;8px'apos;, 
                        backgroundColor: 'apos;#e5e7eb'apos;, 
                        borderRadius: 'apos;4px'apos;,
                        overflow: 'apos;hidden'apos;
                      }}>
                        <div style={{ 
                          width: `${stats?.system.cpu}%`, 
                          height: 'apos;100%'apos;, 
                          backgroundColor: stats?.system.cpu && stats.system.cpu > 80 ? 'apos;#ef4444'apos; : 'apos;#10b981'apos;,
                          transition: 'apos;width 0.3s'apos;
                        }} />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, marginBottom: 'apos;4px'apos; }}>
                        <span style={{ fontSize: 'apos;14px'apos; }}>Mémoire</span>
                        <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>{stats?.system.memory}%</span>
                      </div>
                      <div style={{ 
                        width: 'apos;100%'apos;, 
                        height: 'apos;8px'apos;, 
                        backgroundColor: 'apos;#e5e7eb'apos;, 
                        borderRadius: 'apos;4px'apos;,
                        overflow: 'apos;hidden'apos;
                      }}>
                        <div style={{ 
                          width: `${stats?.system.memory}%`, 
                          height: 'apos;100%'apos;, 
                          backgroundColor: stats?.system.memory && stats.system.memory > 80 ? 'apos;#ef4444'apos; : 'apos;#10b981'apos;,
                          transition: 'apos;width 0.3s'apos;
                        }} />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, marginBottom: 'apos;4px'apos; }}>
                        <span style={{ fontSize: 'apos;14px'apos; }}>Disque</span>
                        <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>{stats?.system.disk}%</span>
                      </div>
                      <div style={{ 
                        width: 'apos;100%'apos;, 
                        height: 'apos;8px'apos;, 
                        backgroundColor: 'apos;#e5e7eb'apos;, 
                        borderRadius: 'apos;4px'apos;,
                        overflow: 'apos;hidden'apos;
                      }}>
                        <div style={{ 
                          width: `${stats?.system.disk}%`, 
                          height: 'apos;100%'apos;, 
                          backgroundColor: stats?.system.disk && stats.system.disk > 80 ? 'apos;#ef4444'apos; : 'apos;#10b981'apos;,
                          transition: 'apos;width 0.3s'apos;
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <h3 style={{ margin: 'apos;0 0 16px 0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                    Métriques de Performance
                  </h3>
                  <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: 'apos;16px'apos; }}>
                    <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, alignItems: 'apos;center'apos; }}>
                      <span style={{ fontSize: 'apos;14px'apos; }}>Temps de réponse moyen</span>
                      <span style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                        {stats?.performance.avgResponseTime}ms
                      </span>
                    </div>
                    
                    <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, alignItems: 'apos;center'apos; }}>
                      <span style={{ fontSize: 'apos;14px'apos; }}>Uptime</span>
                      <span style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                        {stats?.performance.uptime}%
                      </span>
                    </div>
                    
                    <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, alignItems: 'apos;center'apos; }}>
                      <span style={{ fontSize: 'apos;14px'apos; }}>Cache Hit Rate</span>
                      <span style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                        {stats?.performance.cacheHitRate}%
                      </span>
                    </div>
                    
                    <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;space-between'apos;, alignItems: 'apos;center'apos; }}>
                      <span style={{ fontSize: 'apos;14px'apos; }}>Taux d'apos;erreur</span>
                      <span style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#ef4444'apos; }}>
                        {stats?.performance.errorRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Actions */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <h3 style={{ margin: 'apos;0 0 16px 0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                    Actions Système
                  </h3>
                  <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: 'apos;12px'apos; }}>
                    <Link
                      href="/admin/monitoring"
                      style={{
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        gap: 'apos;12px'apos;,
                        padding: 'apos;12px'apos;,
                        backgroundColor: 'apos;#f3f4f6'apos;,
                        borderRadius: 'apos;8px'apos;,
                        textDecoration: 'apos;none'apos;,
                        color: 'apos;inherit'apos;,
                        transition: 'apos;all 0.2s'apos;
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} style={{ color: 'apos;#f97316'apos; }} />
                      <span>Monitoring en temps réel</span>
                    </Link>
                    
                    <Link
                      href="/admin/cache"
                      style={{
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        gap: 'apos;12px'apos;,
                        padding: 'apos;12px'apos;,
                        backgroundColor: 'apos;#f3f4f6'apos;,
                        borderRadius: 'apos;8px'apos;,
                        textDecoration: 'apos;none'apos;,
                        color: 'apos;inherit'apos;,
                        transition: 'apos;all 0.2s'apos;
                      }}
                    >
                      <FontAwesomeIcon icon={faDatabase} style={{ color: 'apos;#dc2626'apos; }} />
                      <span>Gestion du cache</span>
                    </Link>
                    
                    <Link
                      href="/admin/logs"
                      style={{
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        gap: 'apos;12px'apos;,
                        padding: 'apos;12px'apos;,
                        backgroundColor: 'apos;#f3f4f6'apos;,
                        borderRadius: 'apos;8px'apos;,
                        textDecoration: 'apos;none'apos;,
                        color: 'apos;inherit'apos;,
                        transition: 'apos;all 0.2s'apos;
                      }}
                    >
                      <FontAwesomeIcon icon={faFileAlt} style={{ color: 'apos;#6b7280'apos; }} />
                      <span>Logs système</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'apos;analytics'apos; && (
            <div>
              <h2 style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;600'apos;, marginBottom: 'apos;24px'apos; }}>
                Analytics et Rapports
              </h2>
              
              <div style={{ 
                display: 'apos;grid'apos;, 
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;, 
                gap: 'apos;24px'apos; 
              }}>
                {/* Revenue Analytics */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <h3 style={{ margin: 'apos;0 0 16px 0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                    Revenus
                  </h3>
                  <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: 'apos;16px'apos; }}>
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Revenus ce mois
                      </div>
                      <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#10b981'apos; }}>
                        ${stats?.revenue.monthly.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Revenus totaux
                      </div>
                      <div style={{ fontSize: 'apos;20px'apos;, fontWeight: 'apos;600'apos; }}>
                        ${stats?.revenue.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Croissance
                      </div>
                      <div style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                        +{stats?.revenue.growth}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Analytics */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <h3 style={{ margin: 'apos;0 0 16px 0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                    Utilisateurs
                  </h3>
                  <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: 'apos;16px'apos; }}>
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Total utilisateurs
                      </div>
                      <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos; }}>
                        {stats?.users.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Utilisateurs premium
                      </div>
                      <div style={{ fontSize: 'apos;20px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#f59e0b'apos; }}>
                        {stats?.users.premium.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Nouveaux ce mois
                      </div>
                      <div style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                        +{stats?.users.newThisMonth}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Analytics */}
                <div style={{ 
                  padding: 'apos;24px'apos;, 
                  backgroundColor: 'apos;white'apos;, 
                  borderRadius: 'apos;12px'apos;, 
                  border: 'apos;1px solid #e5e7eb'apos;,
                  boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
                }}>
                  <h3 style={{ margin: 'apos;0 0 16px 0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                    Missions
                  </h3>
                  <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: 'apos;16px'apos; }}>
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Total missions
                      </div>
                      <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos; }}>
                        {stats?.missions.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        Taux de succès
                      </div>
                      <div style={{ fontSize: 'apos;20px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                        {stats?.missions.total ? Math.round((stats.missions.completed / stats.missions.total) * 100) : 0}%
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                        En cours
                      </div>
                      <div style={{ fontSize: 'apos;16px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#f59e0b'apos; }}>
                        {stats?.missions.inProgress}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'apos;users'apos; && (
            <div>
              <div style={{ 
                padding: 'apos;24px'apos;, 
                backgroundColor: 'apos;white'apos;, 
                borderRadius: 'apos;12px'apos;, 
                border: 'apos;1px solid #e5e7eb'apos;,
                boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;,
                marginBottom: 'apos;24px'apos;
              }}>
                <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;12px'apos;, marginBottom: 'apos;16px'apos; }}>
                  <FontAwesomeIcon icon={faUsers} style={{ color: 'apos;#3b82f6'apos;, fontSize: 'apos;20px'apos; }} />
                  <h3 style={{ margin: 'apos;0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>Gestion des Utilisateurs</h3>
                </div>
                <p style={{ color: 'apos;#6b7280'apos;, margin: 'apos;0 0 24px 0'apos; }}>
                  Gérez les utilisateurs, assignez les rôles et surveillez l'apos;activité.
                </p>
                <Link href="/super-admin/users" style={{
                  display: 'apos;inline-flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;8px'apos;,
                  padding: 'apos;12px 24px'apos;,
                  backgroundColor: 'apos;#635bff'apos;,
                  color: 'apos;white'apos;,
                  textDecoration: 'apos;none'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontWeight: 'apos;600'apos;,
                  transition: 'apos;all 0.2s'apos;
                }}>
                  <FontAwesomeIcon icon={faUsers} />
                  Accéder à la gestion des utilisateurs
                </Link>
              </div>
            </div>
          )}
        </div>
      </Layout>
      </AccessGuard>
    </AuthGuard>
  );
}
