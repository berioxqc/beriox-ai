"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import AccessGuard from "@/components/AccessGuard"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
} from "@fortawesome/free-solid-svg-icons"
interface SystemStats {
  users: {
    total: number
    active: number
    premium: number
    newThisMonth: number
  }
  missions: {
    total: number
    completed: number
    inProgress: number
    failed: number
  }
  performance: {
    avgResponseTime: number
    uptime: number
    cacheHitRate: number
    errorRate: number
  }
  revenue: {
    monthly: number
    total: number
    growth: number
  }
  system: {
    cpu: number
    memory: number
    disk: number
    activeConnections: number
  }
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  href: string
  color: string
  category: string
}

export default function SuperAdminPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  useEffect(() => {
    fetchSystemStats()
  }, [])
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
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }
  const quickActions: QuickAction[] = [
    // Gestion des Utilisateurs
    {
      id: 'users',
      title: 'Gestion Utilisateurs',
      description: 'Gérer les comptes, permissions et profils',
      icon: faUsers,
      href: '/admin/users',
      color: '#3b82f6',
      category: 'users'
    },
    {
      id: 'premium',
      title: 'Accès Premium',
      description: 'Gérer les abonnements et accès premium',
      icon: faCrown,
      href: '/admin/premium-access',
      color: '#f59e0b',
      category: 'users'
    },

    // Missions et IA
    {
      id: 'missions',
      title: 'Gestion Missions',
      description: 'Surveiller et gérer les missions IA',
      icon: faRocket,
      href: '/admin/missions',
      color: '#10b981',
      category: 'missions'
    },
    {
      id: 'agents',
      title: 'Agents IA',
      description: 'Configurer et optimiser les agents IA',
      icon: faBrain,
      href: '/agents',
      color: '#8b5cf6',
      category: 'missions'
    },
    {
      id: 'recommendations',
      title: 'Recommandations',
      description: 'Gérer les recommandations d\'agents',
      icon: faChartLine,
      href: '/admin/recommendations',
      color: '#06b6d4',
      category: 'missions'
    },

    // Paiements et Finances
    {
      id: 'payments',
      title: 'Paiements Stripe',
      description: 'Gérer les paiements et facturations',
      icon: faCreditCard,
      href: '/admin/payments',
      color: '#6366f1',
      category: 'finance'
    },
    {
      id: 'refunds',
      title: 'Remboursements',
      description: 'Traiter les demandes de remboursement',
      icon: faTicketAlt,
      href: '/admin/refunds',
      color: '#ef4444',
      category: 'finance'
    },
    {
      id: 'coupons',
      title: 'Codes Promo',
      description: 'Créer et gérer les codes de réduction',
      icon: faTicketAlt,
      href: '/admin/coupons',
      color: '#84cc16',
      category: 'finance'
    },

    // Système et Performance
    {
      id: 'monitoring',
      title: 'Monitoring',
      description: 'Surveiller les performances système',
      icon: faServer,
      href: '/admin/monitoring',
      color: '#f97316',
      category: 'system'
    },
    {
      id: 'cache',
      title: 'Cache Redis',
      description: 'Gérer le cache et les performances',
      icon: faDatabase,
      href: '/admin/cache',
      color: '#dc2626',
      category: 'system'
    },
    {
      id: 'rate-limit',
      title: 'Rate Limiting',
      description: 'Configurer les limites de requêtes',
      icon: faShieldAlt,
      href: '/admin/rate-limit',
      color: '#7c3aed',
      category: 'system'
    },

    // Sécurité
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Audit de sécurité et logs',
      icon: faShieldAlt,
      href: '/admin/security',
      color: '#059669',
      category: 'security'
    },
    {
      id: 'logs',
      title: 'Logs Système',
      description: 'Consulter les logs d\'application',
      icon: faFileAlt,
      href: '/admin/logs',
      color: '#6b7280',
      category: 'security'
    },

    // Analytics et Rapports
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Analyses détaillées et rapports',
      icon: faChartLine,
      href: '/admin/analytics',
      color: '#0891b2',
      category: 'analytics'
    },
    {
      id: 'reports',
      title: 'Rapports',
      description: 'Générer des rapports personnalisés',
      icon: faFileAlt,
      href: '/admin/reports',
      color: '#be185d',
      category: 'analytics'
    },

    // Configuration
    {
      id: 'settings',
      title: 'Configuration',
      description: 'Paramètres système avancés',
      icon: faCog,
      href: '/admin/settings',
      color: '#374151',
      category: 'config'
    },
    {
      id: 'integrations',
      title: 'Intégrations',
      description: 'Gérer les intégrations externes',
      icon: faNetworkWired,
      href: '/integrations',
      color: '#0ea5e9',
      category: 'config'
    }
  ]
  const categories = {
    users: { name: 'Utilisateurs', color: '#3b82f6' },
    missions: { name: 'Missions & IA', color: '#10b981' },
    finance: { name: 'Finance', color: '#6366f1' },
    system: { name: 'Système', color: '#f97316' },
    security: { name: 'Sécurité', color: '#059669' },
    analytics: { name: 'Analytics', color: '#0891b2' },
    config: { name: 'Configuration', color: '#374151' }
  }
  const getActionsByCategory = (category: string) => {
    return quickActions.filter(action => action.category === category)
  }
  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', color: '#6b7280' }}>Chargement...</div>
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AccessGuard superAdminOnly={true}>
        <Layout>
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ fontSize: '32px' }}>👑</div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0' }}>
                Super-Admin Dashboard
              </h1>
            </div>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
              Contrôle total sur Beriox AI - {session?.user?.email}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '32px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '16px'
          }}>
            {['overview', 'actions', 'system', 'analytics', 'users'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  backgroundColor: activeTab === tab ? '#635bff' : 'transparent',
                  color: activeTab === tab ? 'white' : '#6b7280',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'overview' && 'Vue d\'ensemble'}
                {tab === 'actions' && 'Actions Rapides'}
                {tab === 'system' && 'Système'}
                {tab === 'analytics' && 'Analytics'}
                {tab === 'users' && 'Gestion Utilisateurs'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '24px', 
                marginBottom: '32px' 
              }}>
                {/* Users Stats */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FontAwesomeIcon icon={faUsers} style={{ color: '#3b82f6', fontSize: '20px' }} />
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>Utilisateurs</h3>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    {stats?.users.total.toLocaleString()}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>
                    {stats?.users.premium} premium • {stats?.users.newThisMonth} nouveaux ce mois
                  </div>
                </div>

                {/* Missions Stats */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FontAwesomeIcon icon={faRocket} style={{ color: '#10b981', fontSize: '20px' }} />
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>Missions</h3>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    {stats?.missions.total.toLocaleString()}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>
                    {stats?.missions.completed} complétées • {stats?.missions.inProgress} en cours
                  </div>
                </div>

                {/* Revenue Stats */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FontAwesomeIcon icon={faChartLine} style={{ color: '#f59e0b', fontSize: '20px' }} />
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>Revenus</h3>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    ${stats?.revenue.monthly.toLocaleString()}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>
                    Ce mois • +{stats?.revenue.growth}% vs mois dernier
                  </div>
                </div>

                {/* Performance Stats */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FontAwesomeIcon icon={faServer} style={{ color: '#f97316', fontSize: '20px' }} />
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>Performance</h3>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    {stats?.performance.uptime}%
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>
                    Uptime • {stats?.performance.avgResponseTime}ms réponse
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                  Actions Rapides
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '16px' 
                }}>
                  {quickActions.slice(0, 6).map(action => (
                    <Link
                      key={action.id}
                      href={action.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        backgroundColor: action.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <FontAwesomeIcon icon={action.icon} style={{ fontSize: '20px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                          {action.title}
                        </h3>
                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                          {action.description}
                        </p>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} style={{ color: '#9ca3af' }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Toutes les Actions Administratives
              </h2>
              
              {Object.entries(categories).map(([categoryKey, category]) => (
                <div key={categoryKey} style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    color: category.color
                  }}>
                    {category.name}
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '16px' 
                  }}>
                    {getActionsByCategory(categoryKey).map(action => (
                      <Link
                        key={action.id}
                        href={action.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '20px',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '12px', 
                          backgroundColor: action.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <FontAwesomeIcon icon={action.icon} style={{ fontSize: '20px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                            {action.title}
                          </h3>
                          <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                            {action.description}
                          </p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} style={{ color: '#9ca3af' }} />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                État du Système
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px' 
              }}>
                {/* System Resources */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                    Ressources Système
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px' }}>CPU</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{stats?.system.cpu}%</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${stats?.system.cpu}%`, 
                          height: '100%', 
                          backgroundColor: stats?.system.cpu && stats.system.cpu > 80 ? '#ef4444' : '#10b981',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px' }}>Mémoire</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{stats?.system.memory}%</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${stats?.system.memory}%`, 
                          height: '100%', 
                          backgroundColor: stats?.system.memory && stats.system.memory > 80 ? '#ef4444' : '#10b981',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px' }}>Disque</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{stats?.system.disk}%</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${stats?.system.disk}%`, 
                          height: '100%', 
                          backgroundColor: stats?.system.disk && stats.system.disk > 80 ? '#ef4444' : '#10b981',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                    Métriques de Performance
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>Temps de réponse moyen</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                        {stats?.performance.avgResponseTime}ms
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>Uptime</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                        {stats?.performance.uptime}%
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>Cache Hit Rate</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                        {stats?.performance.cacheHitRate}%
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>Taux d'erreur</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
                        {stats?.performance.errorRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Actions */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                    Actions Système
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link
                      href="/admin/monitoring"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} style={{ color: '#f97316' }} />
                      <span>Monitoring en temps réel</span>
                    </Link>
                    
                    <Link
                      href="/admin/cache"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FontAwesomeIcon icon={faDatabase} style={{ color: '#dc2626' }} />
                      <span>Gestion du cache</span>
                    </Link>
                    
                    <Link
                      href="/admin/logs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FontAwesomeIcon icon={faFileAlt} style={{ color: '#6b7280' }} />
                      <span>Logs système</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Analytics et Rapports
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px' 
              }}>
                {/* Revenue Analytics */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                    Revenus
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Revenus ce mois
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                        ${stats?.revenue.monthly.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Revenus totaux
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '600' }}>
                        ${stats?.revenue.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Croissance
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                        +{stats?.revenue.growth}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Analytics */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                    Utilisateurs
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Total utilisateurs
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>
                        {stats?.users.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Utilisateurs premium
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#f59e0b' }}>
                        {stats?.users.premium.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Nouveaux ce mois
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                        +{stats?.users.newThisMonth}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Analytics */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                    Missions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Total missions
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>
                        {stats?.missions.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Taux de succès
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981' }}>
                        {stats?.missions.total ? Math.round((stats.missions.completed / stats.missions.total) * 100) : 0}%
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        En cours
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                        {stats?.missions.inProgress}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div style={{ 
                padding: '24px', 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FontAwesomeIcon icon={faUsers} style={{ color: '#3b82f6', fontSize: '20px' }} />
                  <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>Gestion des Utilisateurs</h3>
                </div>
                <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
                  Gérez les utilisateurs, assignez les rôles et surveillez l'activité.
                </p>
                <Link href="/super-admin/users" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#635bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
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
  )
}
