'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/Layout';

interface UserStats {
  totalMissions: number;
  completedMissions: number;
  subscriptionStatus: string;
  planId: string;
  joinDate: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  industry: string;
  company: string;
  role: string;
  experience: string;
  goals: string[];
  preferredAgents: string[];
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    weekly: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    autoSave: boolean;
  };
}

interface ApiUsageData {
  apiName: string;
  displayName: string;
  used: number;
  limit: number;
  lastUpdate: string;
  status: 'healthy' | 'warning' | 'error';
  data?: any[];
}

interface DashboardData {
  apiUsage: ApiUsageData[];
  recentAlerts: {
    type: 'security' | 'performance' | 'seo' | 'uptime';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  performanceMetrics: {
    avgLoadTime: number;
    uptimePercentage: number;
    securityScore: number;
    seoScore: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const theme = useTheme();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'apis' | 'metrics' | 'preferences' | 'subscription'>('overview');

  useEffect(() => {
    if (session?.user) {
      fetchUserStats();
      fetchUserProfile();
      fetchDashboardData();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      if (res.ok) {
        const stats = await res.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const profile = await res.json();
        setUserProfile(profile.user);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Simulation des données de tableau de bord pour la démonstration
      // En production, ceci viendrait d'une vraie API
      const mockData: DashboardData = {
        apiUsage: [
          {
            apiName: 'pagespeed',
            displayName: 'PageSpeed Insights',
            used: 127,
            limit: 500,
            lastUpdate: new Date().toISOString(),
            status: 'healthy',
            data: [
              { date: '2024-01-01', score: 85 },
              { date: '2024-01-02', score: 87 },
              { date: '2024-01-03', score: 89 }
            ]
          },
          {
            apiName: 'security',
            displayName: 'Security Scan',
            used: 45,
            limit: 100,
            lastUpdate: new Date().toISOString(),
            status: 'warning',
            data: [
              { date: '2024-01-01', vulnerabilities: 3 },
              { date: '2024-01-02', vulnerabilities: 2 },
              { date: '2024-01-03', vulnerabilities: 1 }
            ]
          },
          {
            apiName: 'uptime',
            displayName: 'Uptime Monitoring',
            used: 234,
            limit: 1000,
            lastUpdate: new Date().toISOString(),
            status: 'healthy',
            data: [
              { date: '2024-01-01', uptime: 99.9 },
              { date: '2024-01-02', uptime: 99.8 },
              { date: '2024-01-03', uptime: 100 }
            ]
          }
        ],
        recentAlerts: [
          {
            type: 'security',
            message: 'Nouvelle vulnérabilité détectée sur example.com',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'medium'
          },
          {
            type: 'performance',
            message: 'Temps de chargement élevé détecté (3.2s)',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            severity: 'low'
          }
        ],
        performanceMetrics: {
          avgLoadTime: 2.4,
          uptimePercentage: 99.7,
          securityScore: 87,
          seoScore: 92
        }
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des données dashboard:', error);
    }
  };

  const handleSaveName = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setEditing(false);
        // Rafraîchir la session
        window.location.reload();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const getSubscriptionBadge = (status: string, planId: string) => {
    if (status === 'active') {
      const color = planId === 'pro' ? theme.colors.primary.main : theme.colors.warning;
      const label = planId === 'pro' ? 'Pro' : planId === 'enterprise' ? 'Enterprise' : 'Actif';
      return (
        <span style={{
          backgroundColor: color + '20',
          color: color,
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          border: `1px solid ${color}40`
        }}>
          {label}
        </span>
      );
    }
    return (
      <span style={{
        backgroundColor: theme.colors.neutral[100],
        color: theme.colors.neutral[600],
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        Essai Gratuit
      </span>
    );
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: '32px', color: theme.colors.neutral[400] }} />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FontAwesomeIcon icon="user" style={{ fontSize: '48px', color: theme.colors.neutral[400], marginBottom: '20px' }} />
          <h2 style={{ color: theme.colors.neutral[700], marginBottom: '10px' }}>
            Connexion requise
          </h2>
          <p style={{ color: theme.colors.neutral[600] }}>
            Veuillez vous connecter pour accéder à votre profil.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ 
        maxWidth: '800px',
        margin: '0 auto',
        padding: theme.spacing.xl
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: theme.spacing.xl
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
            {/* Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundImage: session.user.image ? `url(${session.user.image})` : 'none',
              backgroundColor: session.user.image ? 'transparent' : theme.colors.primary.main,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {!session.user.image && (session.user.name ? session.user.name.charAt(0).toUpperCase() : &apos;U&apos;)}
            </div>

            {/* Info utilisateur */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                {editing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        border: `2px solid ${theme.colors.primary.main}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      style={{
                        backgroundColor: theme.colors.success,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      <FontAwesomeIcon icon="check" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setName(session.user.name || '');
                      }}
                      style={{
                        backgroundColor: theme.colors.neutral[300],
                        color: theme.colors.neutral[700],
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 style={{ 
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: theme.colors.neutral[900],
                      margin: 0
                    }}>
                      {session.user.name || &apos;Utilisateur&apos;}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: theme.colors.neutral[500],
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <FontAwesomeIcon icon="edit" />
                    </button>
                  </>
                )}
              </div>
              
              <p style={{ 
                color: theme.colors.neutral[600],
                margin: 0,
                marginBottom: theme.spacing.sm
              }}>
                {session.user.email}
              </p>

              {userStats && getSubscriptionBadge(userStats.subscriptionStatus, userStats.planId)}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FontAwesomeIcon icon="spinner" spin style={{ fontSize: '24px', color: theme.colors.neutral[400] }} />
          </div>
        ) : userStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.xl
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: theme.spacing.lg,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="tasks" style={{ 
                fontSize: '24px', 
                color: theme.colors.primary.main,
                marginBottom: theme.spacing.sm
              }} />
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: theme.colors.neutral[900] 
              }}>
                {userStats.totalMissions}
              </div>
              <div style={{ color: theme.colors.neutral[600], fontSize: '14px' }}>
                Missions créées
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: theme.spacing.lg,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="check-circle" style={{ 
                fontSize: '24px', 
                color: theme.colors.success,
                marginBottom: theme.spacing.sm
              }} />
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: theme.colors.neutral[900] 
              }}>
                {userStats.completedMissions}
              </div>
              <div style={{ color: theme.colors.neutral[600], fontSize: '14px' }}>
                Missions terminées
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: theme.spacing.lg,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="calendar" style={{ 
                fontSize: '24px', 
                color: theme.colors.info,
                marginBottom: theme.spacing.sm
              }} />
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: theme.colors.neutral[900] 
              }}>
                {new Date(userStats.joinDate).toLocaleDateString(&apos;fr-FR&apos;)}
              </div>
              <div style={{ color: theme.colors.neutral[600], fontSize: '14px' }}>
                Membre depuis
              </div>
            </div>
          </div>
        )}

        {/* Tableaux de Bord API */}
        {userStats && userStats.planId !== 'free' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: theme.spacing.xl
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <h3 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: theme.colors.neutral[900],
                margin: 0
              }}>
                📊 Tableaux de Bord API
              </h3>
              
              {/* Onglets */}
              <div style={{
                display: 'flex',
                backgroundColor: theme.colors.neutral[100],
                borderRadius: '8px',
                padding: '4px'
              }}>
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: 'chart-bar' },
                  { id: 'profile', label: 'Profil', icon: 'user' },
                  { id: 'subscription', label: 'Abonnement', icon: 'credit-card' },
                  { id: 'apis', label: 'APIs', icon: 'plug' },
                  { id: 'metrics', label: 'Métriques', icon: 'tachometer-alt' },
                  { id: 'preferences', label: 'Préférences', icon: 'cog' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                      color: activeTab === tab.id ? theme.colors.primary.main : theme.colors.neutral[600],
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === tab.id ? '600' : '400',
                      boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FontAwesomeIcon icon={tab.icon as any} style={{ marginRight: '6px' }} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'overview' && dashboardData && (
              <div>
                {/* Métriques de performance */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.lg
                }}>
                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FontAwesomeIcon icon="clock" style={{ 
                      fontSize: '20px', 
                      color: theme.colors.info,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.avgLoadTime}s
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: '12px' }}>
                      Temps de chargement moyen
                    </div>
                  </div>

                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FontAwesomeIcon icon="shield-alt" style={{ 
                      fontSize: '20px', 
                      color: theme.colors.success,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.securityScore}/100
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: '12px' }}>
                      Score de sécurité
                    </div>
                  </div>

                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FontAwesomeIcon icon="search" style={{ 
                      fontSize: '20px', 
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.seoScore}/100
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: '12px' }}>
                      Score SEO
                    </div>
                  </div>

                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FontAwesomeIcon icon="server" style={{ 
                      fontSize: '20px', 
                      color: theme.colors.warning,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.uptimePercentage}%
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: '12px' }}>
                      Temps de fonctionnement
                    </div>
                  </div>
                </div>

                {/* Alertes récentes */}
                {dashboardData.recentAlerts.length > 0 && (
                  <div style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: '8px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.md
                    }}>
                      🚨 Alertes récentes
                    </h4>
                    
                    {dashboardData.recentAlerts.map((alert, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: theme.spacing.sm,
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        marginBottom: theme.spacing.xs,
                        border: `1px solid ${
                          alert.severity === 'high' ? theme.colors.error + '40' :
                          alert.severity === 'medium' ? theme.colors.warning + '40' :
                          theme.colors.info + '40'
                        }`
                      }}>
                        <FontAwesomeIcon 
                          icon={
                            alert.type === 'security' ? 'shield-alt' :
                            alert.type === 'performance' ? 'tachometer-alt' :
                            alert.type === 'seo' ? 'search' : 'server'
                          }
                          style={{ 
                            color: alert.severity === 'high' ? theme.colors.error :
                                   alert.severity === 'medium' ? theme.colors.warning :
                                   theme.colors.info,
                            marginRight: theme.spacing.sm
                          }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            color: theme.colors.neutral[900],
                            marginBottom: '2px'
                          }}>
                            {alert.message}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: theme.colors.neutral[600]
                          }}>
                            {new Date(alert.timestamp).toLocaleString(&apos;fr-FR&apos;)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'apis' && dashboardData && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: theme.spacing.lg
              }}>
                {dashboardData.apiUsage.map((api) => (
                  <div key={api.apiName} style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: '8px',
                    border: `2px solid ${
                      api.status === 'healthy' ? theme.colors.success + '40' :
                      api.status === 'warning' ? theme.colors.warning + '40' :
                      theme.colors.error + '40'
                    }`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: theme.spacing.md
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: theme.colors.neutral[900],
                        margin: 0
                      }}>
                        {api.displayName}
                      </h4>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: api.status === 'healthy' ? theme.colors.success + '20' :
                                        api.status === 'warning' ? theme.colors.warning + '20' :
                                        theme.colors.error + '20',
                        color: api.status === 'healthy' ? theme.colors.success :
                               api.status === 'warning' ? theme.colors.warning :
                               theme.colors.error
                      }}>
                        {api.status === &apos;healthy&apos; ? &apos;✓ OK&apos; :
                         api.status === &apos;warning&apos; ? &apos;⚠ Attention&apos; : &apos;✗ Erreur&apos;}
                      </span>
                    </div>

                    <div style={{ marginBottom: theme.spacing.md }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '14px', color: theme.colors.neutral[600] }}>
                          Utilisation
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>
                          {api.used}/{api.limit}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: theme.colors.neutral[200],
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(api.used / api.limit) * 100}%`,
                          height: '100%',
                          backgroundColor: api.status === 'healthy' ? theme.colors.success :
                                          api.status === 'warning' ? theme.colors.warning :
                                          theme.colors.error,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: theme.colors.neutral[600]
                    }}>
                      Dernière mise à jour: {new Date(api.lastUpdate).toLocaleString(&apos;fr-FR&apos;)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div style={{
                textAlign: 'center',
                padding: theme.spacing.xl,
                color: theme.colors.neutral[600]
              }}>
                <FontAwesomeIcon icon="chart-line" style={{ fontSize: '48px', marginBottom: theme.spacing.lg }} />
                <h4 style={{ marginBottom: theme.spacing.md }}>
                  Graphiques détaillés disponibles bientôt
                </h4>
                <p>
                  Cette section contiendra des graphiques interactifs pour visualiser
                  l&apos;évolution de vos métriques dans le temps.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upgrade pour le plan gratuit */}
        {userStats && userStats.planId === 'free' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: theme.spacing.xl,
            border: `2px solid ${theme.colors.primary.main}20`
          }}>
            <div style={{ textAlign: 'center' }}>
              <FontAwesomeIcon 
                icon="chart-bar" 
                style={{ 
                  fontSize: '48px', 
                  color: theme.colors.primary.main,
                  marginBottom: theme.spacing.lg 
                }} 
              />
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing.md
              }}>
                Débloquez les Tableaux de Bord API
              </h3>
              <p style={{
                color: theme.colors.neutral[600],
                marginBottom: theme.spacing.lg,
                lineHeight: '1.6'
              }}>
                Accédez à des données détaillées sur la performance, la sécurité, le SEO et plus encore.
                Surveillez vos sites web avec des métriques en temps réel et des alertes proactives.
              </p>
              <button
                onClick={() => window.location.href = '/pricing'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.primary.main,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary.dark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary.main}
              >
                <FontAwesomeIcon icon="rocket" style={{ marginRight: '8px' }} />
                Voir les Plans
              </button>
            </div>
          </div>
        )}

        {/* Onglet Profil */}
        {activeTab === 'profile' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: theme.spacing.xl
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              📋 Informations personnelles
            </h3>

            <div style={{ display: 'grid', gap: theme.spacing.lg }}>
              {/* Informations de base */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[700],
                    marginBottom: '8px'
                  }}>
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={userProfile?.name || session?.user?.name || ''}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    style={{
                      width: &apos;100%&apos;,
                      padding: &apos;12px&apos;,
                      border: &apos;1px solid #e3e8ee&apos;,
                      borderRadius: &apos;6px&apos;,
                      fontSize: &apos;14px&apos;
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[700],
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email || session?.user?.email || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e3e8ee',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8fafc',
                      color: '#6b7280'
                    }}
                  />
                </div>
              </div>

              {/* Informations professionnelles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[700],
                    marginBottom: '8px'
                  }}>
                    Industrie
                  </label>
                  <select
                    value={userProfile?.industry || ''}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, industry: e.target.value } : null)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e3e8ee',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner une industrie</option>
                    <option value="technology">Technologie</option>
                    <option value="healthcare">Santé</option>
                    <option value="finance">Finance</option>
                    <option value="education">Éducation</option>
                    <option value="retail">Commerce</option>
                    <option value="manufacturing">Manufacture</option>
                    <option value="consulting">Conseil</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[700],
                    marginBottom: '8px'
                  }}>
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={userProfile?.company || ''}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, company: e.target.value } : null)}
                    style={{
                      width: &apos;100%&apos;,
                      padding: &apos;12px&apos;,
                      border: &apos;1px solid #e3e8ee&apos;,
                      borderRadius: &apos;6px&apos;,
                      fontSize: &apos;14px&apos;
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[700],
                    marginBottom: '8px'
                  }}>
                    Rôle
                  </label>
                  <select
                    value={userProfile?.role || ''}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, role: e.target.value } : null)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e3e8ee',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="owner">Propriétaire</option>
                    <option value="manager">Gestionnaire</option>
                    <option value="developer">Développeur</option>
                    <option value="marketer">Marketeur</option>
                    <option value="consultant">Consultant</option>
                    <option value="student">Étudiant</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[700],
                    marginBottom: '8px'
                  }}>
                    Expérience
                  </label>
                  <select
                    value={userProfile?.experience || ''}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, experience: e.target.value } : null)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e3e8ee',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Sélectionner l&apos;expérience</option>
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  // Sauvegarder les modifications du profil
                  console.log('Sauvegarde du profil:', userProfile);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                <FontAwesomeIcon icon="save" style={{ marginRight: '8px' }} />
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        )}

        {/* Onglet Préférences */}
        {activeTab === 'preferences' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: theme.spacing.xl
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              ⚙️ Préférences et notifications
            </h3>

            <div style={{ display: 'grid', gap: theme.spacing.lg }}>
              {/* Thème */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.neutral[700],
                  marginBottom: '8px'
                }}>
                  Thème d&apos;affichage
                </label>
                <select
                  value={userProfile?.preferences?.theme || 'auto'}
                  onChange={(e) => setUserProfile(prev => prev ? {
                    ...prev,
                    preferences: { ...prev.preferences, theme: e.target.value as any }
                  } : null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e3e8ee',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>

              {/* Notifications */}
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  🔔 Notifications
                </h4>
                <div style={{ display: 'grid', gap: theme.spacing.sm }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <input
                      type="checkbox"
                      checked={userProfile?.notifications?.email || false}
                      onChange={(e) => setUserProfile(prev => prev ? {
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      } : null)}
                    />
                    <span>Notifications par email</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <input
                      type="checkbox"
                      checked={userProfile?.notifications?.push || false}
                      onChange={(e) => setUserProfile(prev => prev ? {
                        ...prev,
                        notifications: { ...prev.notifications, push: e.target.checked }
                      } : null)}
                    />
                    <span>Notifications push</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <input
                      type="checkbox"
                      checked={userProfile?.notifications?.weekly || false}
                      onChange={(e) => setUserProfile(prev => prev ? {
                        ...prev,
                        notifications: { ...prev.notifications, weekly: e.target.checked }
                      } : null)}
                    />
                    <span>Résumé hebdomadaire</span>
                  </label>
                </div>
              </div>

              {/* Préférences d'interface */}
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  🎨 Interface
                </h4>
                <div style={{ display: 'grid', gap: theme.spacing.sm }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <input
                      type="checkbox"
                      checked={userProfile?.preferences?.compactMode || false}
                      onChange={(e) => setUserProfile(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, compactMode: e.target.checked }
                      } : null)}
                    />
                    <span>Mode compact</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <input
                      type="checkbox"
                      checked={userProfile?.preferences?.autoSave || false}
                      onChange={(e) => setUserProfile(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, autoSave: e.target.checked }
                      } : null)}
                    />
                    <span>Sauvegarde automatique</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => {
                  // Sauvegarder les préférences
                  console.log('Sauvegarde des préférences:', userProfile);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.primary.main,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                <FontAwesomeIcon icon="save" style={{ marginRight: '8px' }} />
                Sauvegarder les préférences
              </button>
            </div>
          </div>
        )}

        {/* Onglet Abonnement */}
        {activeTab === 'subscription' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: theme.spacing.xl
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              💳 Gestion de l&apos;abonnement
            </h3>

            <div style={{ display: 'grid', gap: theme.spacing.lg }}>
              {/* Statut actuel */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: theme.spacing.lg
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  📊 Statut actuel
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
                  <div style={{
                    background: 'white',
                    padding: theme.spacing.md,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: theme.colors.neutral[600], marginBottom: '4px' }}>
                      Plan actuel
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.neutral[900] }}>
                      {userStats?.planId === &apos;free&apos; ? &apos;Gratuit&apos; : userStats?.planId === &apos;pro&apos; ? &apos;Pro&apos; : &apos;Enterprise&apos;}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'white',
                    padding: theme.spacing.md,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: theme.colors.neutral[600], marginBottom: '4px' }}>
                      Statut
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.neutral[900] }}>
                      {userStats?.subscriptionStatus === &apos;active&apos; ? &apos;Actif&apos; : &apos;Essai&apos;}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'white',
                    padding: theme.spacing.md,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: theme.colors.neutral[600], marginBottom: '4px' }}>
                      Membre depuis
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.neutral[900] }}>
                      {userStats?.joinDate ? new Date(userStats.joinDate).toLocaleDateString(&apos;fr-FR&apos;) : &apos;N/A&apos;}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plans disponibles */}
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  🚀 Plans disponibles
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: theme.spacing.md }}>
                  {/* Plan Gratuit */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: theme.spacing.lg,
                    position: 'relative'
                  }}>
                    {userStats?.planId === 'free' && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: theme.colors.primary.main,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Plan actuel
                      </div>
                    )}
                    
                    <h5 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.sm
                    }}>
                      Gratuit
                    </h5>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.md
                    }}>
                      $0
                      <span style={{ fontSize: '14px', color: theme.colors.neutral[600], fontWeight: '400' }}>/mois</span>
                    </div>
                    
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      marginBottom: theme.spacing.lg
                    }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>5 missions par mois</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Agents de base</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Support communautaire</span>
                      </li>
                    </ul>
                  </div>

                  {/* Plan Pro */}
                  <div style={{
                    background: 'white',
                    border: `2px solid ${theme.colors.primary.main}`,
                    borderRadius: '12px',
                    padding: theme.spacing.lg,
                    position: 'relative'
                  }}>
                    {userStats?.planId === 'pro' && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: theme.colors.primary.main,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Plan actuel
                      </div>
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#fbbf24',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      POPULAIRE
                    </div>
                    
                    <h5 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.sm
                    }}>
                      Pro
                    </h5>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.md
                    }}>
                      $29
                      <span style={{ fontSize: '14px', color: theme.colors.neutral[600], fontWeight: '400' }}>/mois</span>
                    </div>
                    
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      marginBottom: theme.spacing.lg
                    }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Missions illimitées</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Tous les agents</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>NovaBot inclus</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Support prioritaire</span>
                      </li>
                    </ul>
                    
                    {userStats?.planId !== 'pro' && (
                      <button
                        onClick={() => window.location.href = &apos;/pricing&apos;}
                        style={{
                          width: &apos;100%&apos;,
                          padding: &apos;12px&apos;,
                          background: theme.colors.primary.main,
                          color: &apos;white&apos;,
                          border: &apos;none&apos;,
                          borderRadius: &apos;8px&apos;,
                          fontSize: &apos;14px&apos;,
                          fontWeight: &apos;600&apos;,
                          cursor: &apos;pointer&apos;,
                          transition: &apos;background-color 0.2s&apos;
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = theme.colors.primary.dark}
                        onMouseOut={(e) => e.currentTarget.style.background = theme.colors.primary.main}
                      >
                        Passer au Pro
                      </button>
                    )}
                  </div>

                  {/* Plan Enterprise */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: theme.spacing.lg,
                    position: 'relative'
                  }}>
                    {userStats?.planId === 'enterprise' && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: theme.colors.primary.main,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Plan actuel
                      </div>
                    )}
                    
                    <h5 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.sm
                    }}>
                      Enterprise
                    </h5>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.md
                    }}>
                      $99
                      <span style={{ fontSize: '14px', color: theme.colors.neutral[600], fontWeight: '400' }}>/mois</span>
                    </div>
                    
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      marginBottom: theme.spacing.lg
                    }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Tout du plan Pro</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>APIs intégrées</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Support dédié</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: '12px' }} />
                        <span style={{ fontSize: '14px' }}>Formation personnalisée</span>
                      </li>
                    </ul>
                    
                    {userStats?.planId !== 'enterprise' && (
                      <button
                        onClick={() => window.location.href = &apos;/pricing&apos;}
                        style={{
                          width: &apos;100%&apos;,
                          padding: &apos;12px&apos;,
                          background: &apos;white&apos;,
                          color: theme.colors.primary.main,
                          border: `1px solid ${theme.colors.primary.main}`,
                          borderRadius: &apos;8px&apos;,
                          fontSize: &apos;14px&apos;,
                          fontWeight: &apos;600&apos;,
                          cursor: &apos;pointer&apos;,
                          transition: &apos;all 0.2s&apos;
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = theme.colors.primary.main;
                          e.currentTarget.style.color = &apos;white&apos;;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = &apos;white&apos;;
                          e.currentTarget.style.color = theme.colors.primary.main;
                        }}
                      >
                        Contacter l&apos;équipe
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions d'abonnement */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: theme.spacing.lg
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  ⚙️ Actions
                </h4>
                
                <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.location.href = '/pricing'}
                    style={{
                      padding: '12px 20px',
                      background: theme.colors.primary.main,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FontAwesomeIcon icon="credit-card" />
                    Gérer l&apos;abonnement
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/coupon'}
                    style={{
                      padding: '12px 20px',
                      background: 'white',
                      color: theme.colors.primary.main,
                      border: `1px solid ${theme.colors.primary.main}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FontAwesomeIcon icon="gift" />
                    Utiliser un coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: theme.spacing.xl,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg
          }}>
            Actions du compte
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <button
              onClick={() => window.location.href = '/pricing'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.primary.light,
                border: `1px solid ${theme.colors.primary.main}`,
                borderRadius: '8px',
                color: theme.colors.primary.dark,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <FontAwesomeIcon icon="credit-card" />
              <div>
                <div style={{ fontWeight: 'bold' }}>Gérer mon abonnement</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  Voir les plans et gérer la facturation
                </div>
              </div>
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                backgroundColor: 'white',
                border: `1px solid ${theme.colors.error}40`,
                borderRadius: '8px',
                color: theme.colors.error,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <FontAwesomeIcon icon="sign-out-alt" />
              <div>
                <div style={{ fontWeight: 'bold' }}>Se déconnecter</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  Fermer la session actuelle
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
