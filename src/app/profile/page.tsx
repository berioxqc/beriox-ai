'apos;use client'apos;;

import { useSession, signOut } from 'apos;next-auth/react'apos;;
import { useState, useEffect } from 'apos;react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;
import Layout from 'apos;@/components/Layout'apos;;

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
    theme: 'apos;light'apos; | 'apos;dark'apos; | 'apos;auto'apos;;
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
  status: 'apos;healthy'apos; | 'apos;warning'apos; | 'apos;error'apos;;
  data?: any[];
}

interface DashboardData {
  apiUsage: ApiUsageData[];
  recentAlerts: {
    type: 'apos;security'apos; | 'apos;performance'apos; | 'apos;seo'apos; | 'apos;uptime'apos;;
    message: string;
    timestamp: string;
    severity: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
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
  const [activeTab, setActiveTab] = useState<'apos;overview'apos; | 'apos;profile'apos; | 'apos;apis'apos; | 'apos;metrics'apos; | 'apos;preferences'apos; | 'apos;subscription'apos;>('apos;overview'apos;);

  useEffect(() => {
    if (session?.user) {
      fetchUserStats();
      fetchUserProfile();
      fetchDashboardData();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const res = await fetch('apos;/api/user/stats'apos;);
      if (res.ok) {
        const stats = await res.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('apos;Erreur lors du chargement des stats:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('apos;/api/user/profile'apos;);
      if (res.ok) {
        const profile = await res.json();
        setUserProfile(profile.user);
      }
    } catch (error) {
      console.error('apos;Erreur lors du chargement du profil:'apos;, error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Simulation des données de tableau de bord pour la démonstration
      // En production, ceci viendrait d'apos;une vraie API
      const mockData: DashboardData = {
        apiUsage: [
          {
            apiName: 'apos;pagespeed'apos;,
            displayName: 'apos;PageSpeed Insights'apos;,
            used: 127,
            limit: 500,
            lastUpdate: new Date().toISOString(),
            status: 'apos;healthy'apos;,
            data: [
              { date: 'apos;2024-01-01'apos;, score: 85 },
              { date: 'apos;2024-01-02'apos;, score: 87 },
              { date: 'apos;2024-01-03'apos;, score: 89 }
            ]
          },
          {
            apiName: 'apos;security'apos;,
            displayName: 'apos;Security Scan'apos;,
            used: 45,
            limit: 100,
            lastUpdate: new Date().toISOString(),
            status: 'apos;warning'apos;,
            data: [
              { date: 'apos;2024-01-01'apos;, vulnerabilities: 3 },
              { date: 'apos;2024-01-02'apos;, vulnerabilities: 2 },
              { date: 'apos;2024-01-03'apos;, vulnerabilities: 1 }
            ]
          },
          {
            apiName: 'apos;uptime'apos;,
            displayName: 'apos;Uptime Monitoring'apos;,
            used: 234,
            limit: 1000,
            lastUpdate: new Date().toISOString(),
            status: 'apos;healthy'apos;,
            data: [
              { date: 'apos;2024-01-01'apos;, uptime: 99.9 },
              { date: 'apos;2024-01-02'apos;, uptime: 99.8 },
              { date: 'apos;2024-01-03'apos;, uptime: 100 }
            ]
          }
        ],
        recentAlerts: [
          {
            type: 'apos;security'apos;,
            message: 'apos;Nouvelle vulnérabilité détectée sur example.com'apos;,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'apos;medium'apos;
          },
          {
            type: 'apos;performance'apos;,
            message: 'apos;Temps de chargement élevé détecté (3.2s)'apos;,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            severity: 'apos;low'apos;
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
      console.error('apos;Erreur lors du chargement des données dashboard:'apos;, error);
    }
  };

  const handleSaveName = async () => {
    try {
      const res = await fetch('apos;/api/user/profile'apos;, {
        method: 'apos;PATCH'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setEditing(false);
        // Rafraîchir la session
        window.location.reload();
      } else {
        alert('apos;Erreur lors de la sauvegarde'apos;);
      }
    } catch (error) {
      alert('apos;Erreur lors de la sauvegarde'apos;);
    }
  };

  const getSubscriptionBadge = (status: string, planId: string) => {
    if (status === 'apos;active'apos;) {
      const color = planId === 'apos;pro'apos; ? theme.colors.primary.main : theme.colors.warning;
      const label = planId === 'apos;pro'apos; ? 'apos;Pro'apos; : planId === 'apos;enterprise'apos; ? 'apos;Enterprise'apos; : 'apos;Actif'apos;;
      return (
        <span style={{
          backgroundColor: color + 'apos;20'apos;,
          color: color,
          padding: 'apos;4px 12px'apos;,
          borderRadius: 'apos;20px'apos;,
          fontSize: 'apos;12px'apos;,
          fontWeight: 'apos;bold'apos;,
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
        padding: 'apos;4px 12px'apos;,
        borderRadius: 'apos;20px'apos;,
        fontSize: 'apos;12px'apos;,
        fontWeight: 'apos;bold'apos;
      }}>
        Essai Gratuit
      </span>
    );
  };

  if (status === 'apos;loading'apos;) {
    return (
      <Layout>
        <div style={{ 
          display: 'apos;flex'apos;, 
          justifyContent: 'apos;center'apos;, 
          alignItems: 'apos;center'apos;, 
          minHeight: 'apos;400px'apos; 
        }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: 'apos;32px'apos;, color: theme.colors.neutral[400] }} />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div style={{ textAlign: 'apos;center'apos;, padding: 'apos;60px 20px'apos; }}>
          <FontAwesomeIcon icon="user" style={{ fontSize: 'apos;48px'apos;, color: theme.colors.neutral[400], marginBottom: 'apos;20px'apos; }} />
          <h2 style={{ color: theme.colors.neutral[700], marginBottom: 'apos;10px'apos; }}>
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
        maxWidth: 'apos;800px'apos;,
        margin: 'apos;0 auto'apos;,
        padding: theme.spacing.xl
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
          marginBottom: theme.spacing.xl
        }}>
          <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.lg }}>
            {/* Avatar */}
            <div style={{
              width: 'apos;80px'apos;,
              height: 'apos;80px'apos;,
              borderRadius: 'apos;50%'apos;,
              backgroundImage: session.user.image ? `url(${session.user.image})` : 'apos;none'apos;,
              backgroundColor: session.user.image ? 'apos;transparent'apos; : theme.colors.primary.main,
              backgroundSize: 'apos;cover'apos;,
              backgroundPosition: 'apos;center'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              justifyContent: 'apos;center'apos;,
              fontSize: 'apos;32px'apos;,
              fontWeight: 'apos;bold'apos;,
              color: 'apos;white'apos;
            }}>
              {!session.user.image && (session.user.name ? session.user.name.charAt(0).toUpperCase() : 'apos;U'apos;)}
            </div>

            {/* Info utilisateur */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                {editing ? (
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        fontSize: 'apos;24px'apos;,
                        fontWeight: 'apos;bold'apos;,
                        border: `2px solid ${theme.colors.primary.main}`,
                        borderRadius: 'apos;8px'apos;,
                        padding: 'apos;8px 12px'apos;,
                        outline: 'apos;none'apos;
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      style={{
                        backgroundColor: theme.colors.success,
                        color: 'apos;white'apos;,
                        border: 'apos;none'apos;,
                        borderRadius: 'apos;6px'apos;,
                        padding: 'apos;8px 12px'apos;,
                        cursor: 'apos;pointer'apos;
                      }}
                    >
                      <FontAwesomeIcon icon="check" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setName(session.user.name || 'apos;'apos;);
                      }}
                      style={{
                        backgroundColor: theme.colors.neutral[300],
                        color: theme.colors.neutral[700],
                        border: 'apos;none'apos;,
                        borderRadius: 'apos;6px'apos;,
                        padding: 'apos;8px 12px'apos;,
                        cursor: 'apos;pointer'apos;
                      }}
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 style={{ 
                      fontSize: 'apos;24px'apos;,
                      fontWeight: 'apos;bold'apos;,
                      color: theme.colors.neutral[900],
                      margin: 0
                    }}>
                      {session.user.name || 'apos;Utilisateur'apos;}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        backgroundColor: 'apos;transparent'apos;,
                        border: 'apos;none'apos;,
                        color: theme.colors.neutral[500],
                        cursor: 'apos;pointer'apos;,
                        padding: 'apos;4px'apos;
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
          <div style={{ textAlign: 'apos;center'apos;, padding: 'apos;40px'apos; }}>
            <FontAwesomeIcon icon="spinner" spin style={{ fontSize: 'apos;24px'apos;, color: theme.colors.neutral[400] }} />
          </div>
        ) : userStats && (
          <div style={{
            display: 'apos;grid'apos;,
            gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.xl
          }}>
            <div style={{
              backgroundColor: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: theme.spacing.lg,
              boxShadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.05)'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <FontAwesomeIcon icon="tasks" style={{ 
                fontSize: 'apos;24px'apos;, 
                color: theme.colors.primary.main,
                marginBottom: theme.spacing.sm
              }} />
              <div style={{ 
                fontSize: 'apos;28px'apos;, 
                fontWeight: 'apos;bold'apos;, 
                color: theme.colors.neutral[900] 
              }}>
                {userStats.totalMissions}
              </div>
              <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;14px'apos; }}>
                Missions créées
              </div>
            </div>

            <div style={{
              backgroundColor: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: theme.spacing.lg,
              boxShadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.05)'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <FontAwesomeIcon icon="check-circle" style={{ 
                fontSize: 'apos;24px'apos;, 
                color: theme.colors.success,
                marginBottom: theme.spacing.sm
              }} />
              <div style={{ 
                fontSize: 'apos;28px'apos;, 
                fontWeight: 'apos;bold'apos;, 
                color: theme.colors.neutral[900] 
              }}>
                {userStats.completedMissions}
              </div>
              <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;14px'apos; }}>
                Missions terminées
              </div>
            </div>

            <div style={{
              backgroundColor: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: theme.spacing.lg,
              boxShadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.05)'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <FontAwesomeIcon icon="calendar" style={{ 
                fontSize: 'apos;24px'apos;, 
                color: theme.colors.info,
                marginBottom: theme.spacing.sm
              }} />
              <div style={{ 
                fontSize: 'apos;16px'apos;, 
                fontWeight: 'apos;bold'apos;, 
                color: theme.colors.neutral[900] 
              }}>
                {new Date(userStats.joinDate).toLocaleDateString('apos;fr-FR'apos;)}
              </div>
              <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;14px'apos; }}>
                Membre depuis
              </div>
            </div>
          </div>
        )}

        {/* Tableaux de Bord API */}
        {userStats && userStats.planId !== 'apos;free'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
            marginBottom: theme.spacing.xl
          }}>
            <div style={{
              display: 'apos;flex'apos;,
              justifyContent: 'apos;space-between'apos;,
              alignItems: 'apos;center'apos;,
              marginBottom: theme.spacing.lg
            }}>
              <h3 style={{ 
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;bold'apos;,
                color: theme.colors.neutral[900],
                margin: 0
              }}>
                📊 Tableaux de Bord API
              </h3>
              
              {/* Onglets */}
              <div style={{
                display: 'apos;flex'apos;,
                backgroundColor: theme.colors.neutral[100],
                borderRadius: 'apos;8px'apos;,
                padding: 'apos;4px'apos;
              }}>
                {[
                  { id: 'apos;overview'apos;, label: 'apos;Vue d\'apos;ensemble'apos;, icon: 'apos;chart-bar'apos; },
                  { id: 'apos;profile'apos;, label: 'apos;Profil'apos;, icon: 'apos;user'apos; },
                  { id: 'apos;subscription'apos;, label: 'apos;Abonnement'apos;, icon: 'apos;credit-card'apos; },
                  { id: 'apos;apis'apos;, label: 'apos;APIs'apos;, icon: 'apos;plug'apos; },
                  { id: 'apos;metrics'apos;, label: 'apos;Métriques'apos;, icon: 'apos;tachometer-alt'apos; },
                  { id: 'apos;preferences'apos;, label: 'apos;Préférences'apos;, icon: 'apos;cog'apos; }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: 'apos;8px 16px'apos;,
                      borderRadius: 'apos;6px'apos;,
                      border: 'apos;none'apos;,
                      backgroundColor: activeTab === tab.id ? 'apos;white'apos; : 'apos;transparent'apos;,
                      color: activeTab === tab.id ? theme.colors.primary.main : theme.colors.neutral[600],
                      cursor: 'apos;pointer'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: activeTab === tab.id ? 'apos;600'apos; : 'apos;400'apos;,
                      boxShadow: activeTab === tab.id ? 'apos;0 1px 3px rgba(0,0,0,0.1)'apos; : 'apos;none'apos;,
                      transition: 'apos;all 0.2s'apos;
                    }}
                  >
                    <FontAwesomeIcon icon={tab.icon as any} style={{ marginRight: 'apos;6px'apos; }} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'apos;overview'apos; && dashboardData && (
              <div>
                {/* Métriques de performance */}
                <div style={{
                  display: 'apos;grid'apos;,
                  gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.lg
                }}>
                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 'apos;8px'apos;,
                    textAlign: 'apos;center'apos;
                  }}>
                    <FontAwesomeIcon icon="clock" style={{ 
                      fontSize: 'apos;20px'apos;, 
                      color: theme.colors.info,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: 'apos;24px'apos;, 
                      fontWeight: 'apos;bold'apos;, 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.avgLoadTime}s
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;12px'apos; }}>
                      Temps de chargement moyen
                    </div>
                  </div>

                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 'apos;8px'apos;,
                    textAlign: 'apos;center'apos;
                  }}>
                    <FontAwesomeIcon icon="shield-alt" style={{ 
                      fontSize: 'apos;20px'apos;, 
                      color: theme.colors.success,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: 'apos;24px'apos;, 
                      fontWeight: 'apos;bold'apos;, 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.securityScore}/100
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;12px'apos; }}>
                      Score de sécurité
                    </div>
                  </div>

                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 'apos;8px'apos;,
                    textAlign: 'apos;center'apos;
                  }}>
                    <FontAwesomeIcon icon="search" style={{ 
                      fontSize: 'apos;20px'apos;, 
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: 'apos;24px'apos;, 
                      fontWeight: 'apos;bold'apos;, 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.seoScore}/100
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;12px'apos; }}>
                      Score SEO
                    </div>
                  </div>

                  <div style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 'apos;8px'apos;,
                    textAlign: 'apos;center'apos;
                  }}>
                    <FontAwesomeIcon icon="server" style={{ 
                      fontSize: 'apos;20px'apos;, 
                      color: theme.colors.warning,
                      marginBottom: theme.spacing.xs
                    }} />
                    <div style={{ 
                      fontSize: 'apos;24px'apos;, 
                      fontWeight: 'apos;bold'apos;, 
                      color: theme.colors.neutral[900] 
                    }}>
                      {dashboardData.performanceMetrics.uptimePercentage}%
                    </div>
                    <div style={{ color: theme.colors.neutral[600], fontSize: 'apos;12px'apos; }}>
                      Temps de fonctionnement
                    </div>
                  </div>
                </div>

                {/* Alertes récentes */}
                {dashboardData.recentAlerts.length > 0 && (
                  <div style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 'apos;8px'apos;
                  }}>
                    <h4 style={{
                      fontSize: 'apos;16px'apos;,
                      fontWeight: 'apos;600'apos;,
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.md
                    }}>
                      🚨 Alertes récentes
                    </h4>
                    
                    {dashboardData.recentAlerts.map((alert, index) => (
                      <div key={index} style={{
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        padding: theme.spacing.sm,
                        backgroundColor: 'apos;white'apos;,
                        borderRadius: 'apos;6px'apos;,
                        marginBottom: theme.spacing.xs,
                        border: `1px solid ${
                          alert.severity === 'apos;high'apos; ? theme.colors.error + 'apos;40'apos; :
                          alert.severity === 'apos;medium'apos; ? theme.colors.warning + 'apos;40'apos; :
                          theme.colors.info + 'apos;40'apos;
                        }`
                      }}>
                        <FontAwesomeIcon 
                          icon={
                            alert.type === 'apos;security'apos; ? 'apos;shield-alt'apos; :
                            alert.type === 'apos;performance'apos; ? 'apos;tachometer-alt'apos; :
                            alert.type === 'apos;seo'apos; ? 'apos;search'apos; : 'apos;server'apos;
                          }
                          style={{ 
                            color: alert.severity === 'apos;high'apos; ? theme.colors.error :
                                   alert.severity === 'apos;medium'apos; ? theme.colors.warning :
                                   theme.colors.info,
                            marginRight: theme.spacing.sm
                          }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: 'apos;14px'apos;, 
                            color: theme.colors.neutral[900],
                            marginBottom: 'apos;2px'apos;
                          }}>
                            {alert.message}
                          </div>
                          <div style={{ 
                            fontSize: 'apos;12px'apos;, 
                            color: theme.colors.neutral[600]
                          }}>
                            {new Date(alert.timestamp).toLocaleString('apos;fr-FR'apos;)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'apos;apis'apos; && dashboardData && (
              <div style={{
                display: 'apos;grid'apos;,
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;,
                gap: theme.spacing.lg
              }}>
                {dashboardData.apiUsage.map((api) => (
                  <div key={api.apiName} style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 'apos;8px'apos;,
                    border: `2px solid ${
                      api.status === 'apos;healthy'apos; ? theme.colors.success + 'apos;40'apos; :
                      api.status === 'apos;warning'apos; ? theme.colors.warning + 'apos;40'apos; :
                      theme.colors.error + 'apos;40'apos;
                    }`
                  }}>
                    <div style={{
                      display: 'apos;flex'apos;,
                      justifyContent: 'apos;space-between'apos;,
                      alignItems: 'apos;center'apos;,
                      marginBottom: theme.spacing.md
                    }}>
                      <h4 style={{
                        fontSize: 'apos;16px'apos;,
                        fontWeight: 'apos;600'apos;,
                        color: theme.colors.neutral[900],
                        margin: 0
                      }}>
                        {api.displayName}
                      </h4>
                      <span style={{
                        padding: 'apos;4px 8px'apos;,
                        borderRadius: 'apos;4px'apos;,
                        fontSize: 'apos;12px'apos;,
                        fontWeight: 'apos;600'apos;,
                        backgroundColor: api.status === 'apos;healthy'apos; ? theme.colors.success + 'apos;20'apos; :
                                        api.status === 'apos;warning'apos; ? theme.colors.warning + 'apos;20'apos; :
                                        theme.colors.error + 'apos;20'apos;,
                        color: api.status === 'apos;healthy'apos; ? theme.colors.success :
                               api.status === 'apos;warning'apos; ? theme.colors.warning :
                               theme.colors.error
                      }}>
                        {api.status === 'apos;healthy'apos; ? 'apos;✓ OK'apos; :
                         api.status === 'apos;warning'apos; ? 'apos;⚠ Attention'apos; : 'apos;✗ Erreur'apos;}
                      </span>
                    </div>

                    <div style={{ marginBottom: theme.spacing.md }}>
                      <div style={{
                        display: 'apos;flex'apos;,
                        justifyContent: 'apos;space-between'apos;,
                        marginBottom: 'apos;4px'apos;
                      }}>
                        <span style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600] }}>
                          Utilisation
                        </span>
                        <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                          {api.used}/{api.limit}
                        </span>
                      </div>
                      <div style={{
                        width: 'apos;100%'apos;,
                        height: 'apos;8px'apos;,
                        backgroundColor: theme.colors.neutral[200],
                        borderRadius: 'apos;4px'apos;,
                        overflow: 'apos;hidden'apos;
                      }}>
                        <div style={{
                          width: `${(api.used / api.limit) * 100}%`,
                          height: 'apos;100%'apos;,
                          backgroundColor: api.status === 'apos;healthy'apos; ? theme.colors.success :
                                          api.status === 'apos;warning'apos; ? theme.colors.warning :
                                          theme.colors.error,
                          transition: 'apos;width 0.3s'apos;
                        }} />
                      </div>
                    </div>

                    <div style={{
                      fontSize: 'apos;12px'apos;,
                      color: theme.colors.neutral[600]
                    }}>
                      Dernière mise à jour: {new Date(api.lastUpdate).toLocaleString('apos;fr-FR'apos;)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'apos;metrics'apos; && (
              <div style={{
                textAlign: 'apos;center'apos;,
                padding: theme.spacing.xl,
                color: theme.colors.neutral[600]
              }}>
                <FontAwesomeIcon icon="chart-line" style={{ fontSize: 'apos;48px'apos;, marginBottom: theme.spacing.lg }} />
                <h4 style={{ marginBottom: theme.spacing.md }}>
                  Graphiques détaillés disponibles bientôt
                </h4>
                <p>
                  Cette section contiendra des graphiques interactifs pour visualiser
                  l'apos;évolution de vos métriques dans le temps.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upgrade pour le plan gratuit */}
        {userStats && userStats.planId === 'apos;free'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
            marginBottom: theme.spacing.xl,
            border: `2px solid ${theme.colors.primary.main}20`
          }}>
            <div style={{ textAlign: 'apos;center'apos; }}>
              <FontAwesomeIcon 
                icon="chart-bar" 
                style={{ 
                  fontSize: 'apos;48px'apos;, 
                  color: theme.colors.primary.main,
                  marginBottom: theme.spacing.lg 
                }} 
              />
              <h3 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;bold'apos;,
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing.md
              }}>
                Débloquez les Tableaux de Bord API
              </h3>
              <p style={{
                color: theme.colors.neutral[600],
                marginBottom: theme.spacing.lg,
                lineHeight: 'apos;1.6'apos;
              }}>
                Accédez à des données détaillées sur la performance, la sécurité, le SEO et plus encore.
                Surveillez vos sites web avec des métriques en temps réel et des alertes proactives.
              </p>
              <button
                onClick={() => window.location.href = 'apos;/pricing'apos;}
                style={{
                  padding: 'apos;12px 24px'apos;,
                  backgroundColor: theme.colors.primary.main,
                  color: 'apos;white'apos;,
                  border: 'apos;none'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: 'apos;pointer'apos;,
                  transition: 'apos;all 0.2s'apos;
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary.dark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary.main}
              >
                <FontAwesomeIcon icon="rocket" style={{ marginRight: 'apos;8px'apos; }} />
                Voir les Plans
              </button>
            </div>
          </div>
        )}

        {/* Onglet Profil */}
        {activeTab === 'apos;profile'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
            marginBottom: theme.spacing.xl
          }}>
            <h3 style={{
              fontSize: 'apos;20px'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              📋 Informations personnelles
            </h3>

            <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.lg }}>
              {/* Informations de base */}
              <div style={{ display: 'apos;grid'apos;, gridTemplateColumns: 'apos;1fr 1fr'apos;, gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[700],
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={userProfile?.name || session?.user?.name || 'apos;'apos;}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[700],
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email || session?.user?.email || 'apos;'apos;}
                    disabled
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;,
                      backgroundColor: 'apos;#f8fafc'apos;,
                      color: 'apos;#6b7280'apos;
                    }}
                  />
                </div>
              </div>

              {/* Informations professionnelles */}
              <div style={{ display: 'apos;grid'apos;, gridTemplateColumns: 'apos;1fr 1fr'apos;, gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[700],
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Industrie
                  </label>
                  <select
                    value={userProfile?.industry || 'apos;'apos;}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, industry: e.target.value } : null)}
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;
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
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[700],
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={userProfile?.company || 'apos;'apos;}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, company: e.target.value } : null)}
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'apos;grid'apos;, gridTemplateColumns: 'apos;1fr 1fr'apos;, gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[700],
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Rôle
                  </label>
                  <select
                    value={userProfile?.role || 'apos;'apos;}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, role: e.target.value } : null)}
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;
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
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[700],
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Expérience
                  </label>
                  <select
                    value={userProfile?.experience || 'apos;'apos;}
                    onChange={(e) => setUserProfile(prev => prev ? { ...prev, experience: e.target.value } : null)}
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;
                    }}
                  >
                    <option value="">Sélectionner l'apos;expérience</option>
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
                  console.log('apos;Sauvegarde du profil:'apos;, userProfile);
                }}
                style={{
                  padding: 'apos;12px 24px'apos;,
                  backgroundColor: theme.colors.success,
                  color: 'apos;white'apos;,
                  border: 'apos;none'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: 'apos;pointer'apos;,
                  alignSelf: 'apos;flex-start'apos;
                }}
              >
                <FontAwesomeIcon icon="save" style={{ marginRight: 'apos;8px'apos; }} />
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        )}

        {/* Onglet Préférences */}
        {activeTab === 'apos;preferences'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
            marginBottom: theme.spacing.xl
          }}>
            <h3 style={{
              fontSize: 'apos;20px'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              ⚙️ Préférences et notifications
            </h3>

            <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.lg }}>
              {/* Thème */}
              <div>
                <label style={{
                  display: 'apos;block'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[700],
                  marginBottom: 'apos;8px'apos;
                }}>
                  Thème d'apos;affichage
                </label>
                <select
                  value={userProfile?.preferences?.theme || 'apos;auto'apos;}
                  onChange={(e) => setUserProfile(prev => prev ? {
                    ...prev,
                    preferences: { ...prev.preferences, theme: e.target.value as any }
                  } : null)}
                  style={{
                    width: 'apos;100%'apos;,
                    padding: 'apos;12px'apos;,
                    border: 'apos;1px solid #e3e8ee'apos;,
                    borderRadius: 'apos;6px'apos;,
                    fontSize: 'apos;14px'apos;
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
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  🔔 Notifications
                </h4>
                <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.sm }}>
                  <label style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
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
                  <label style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
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
                  <label style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
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

              {/* Préférences d'apos;interface */}
              <div>
                <h4 style={{
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  🎨 Interface
                </h4>
                <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.sm }}>
                  <label style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
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
                  <label style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
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
                  console.log('apos;Sauvegarde des préférences:'apos;, userProfile);
                }}
                style={{
                  padding: 'apos;12px 24px'apos;,
                  backgroundColor: theme.colors.primary.main,
                  color: 'apos;white'apos;,
                  border: 'apos;none'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: 'apos;pointer'apos;,
                  alignSelf: 'apos;flex-start'apos;
                }}
              >
                <FontAwesomeIcon icon="save" style={{ marginRight: 'apos;8px'apos; }} />
                Sauvegarder les préférences
              </button>
            </div>
          </div>
        )}

        {/* Onglet Abonnement */}
        {activeTab === 'apos;subscription'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
            marginBottom: theme.spacing.xl
          }}>
            <h3 style={{
              fontSize: 'apos;20px'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              💳 Gestion de l'apos;abonnement
            </h3>

            <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.lg }}>
              {/* Statut actuel */}
              <div style={{
                background: 'apos;#f8fafc'apos;,
                border: 'apos;1px solid #e2e8f0'apos;,
                borderRadius: 'apos;12px'apos;,
                padding: theme.spacing.lg
              }}>
                <h4 style={{
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  📊 Statut actuel
                </h4>
                
                <div style={{ display: 'apos;grid'apos;, gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;, gap: theme.spacing.md }}>
                  <div style={{
                    background: 'apos;white'apos;,
                    padding: theme.spacing.md,
                    borderRadius: 'apos;8px'apos;,
                    border: 'apos;1px solid #e2e8f0'apos;
                  }}>
                    <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600], marginBottom: 'apos;4px'apos; }}>
                      Plan actuel
                    </div>
                    <div style={{ fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                      {userStats?.planId === 'apos;free'apos; ? 'apos;Gratuit'apos; : userStats?.planId === 'apos;pro'apos; ? 'apos;Pro'apos; : 'apos;Enterprise'apos;}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'apos;white'apos;,
                    padding: theme.spacing.md,
                    borderRadius: 'apos;8px'apos;,
                    border: 'apos;1px solid #e2e8f0'apos;
                  }}>
                    <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600], marginBottom: 'apos;4px'apos; }}>
                      Statut
                    </div>
                    <div style={{ fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                      {userStats?.subscriptionStatus === 'apos;active'apos; ? 'apos;Actif'apos; : 'apos;Essai'apos;}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'apos;white'apos;,
                    padding: theme.spacing.md,
                    borderRadius: 'apos;8px'apos;,
                    border: 'apos;1px solid #e2e8f0'apos;
                  }}>
                    <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600], marginBottom: 'apos;4px'apos; }}>
                      Membre depuis
                    </div>
                    <div style={{ fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                      {userStats?.joinDate ? new Date(userStats.joinDate).toLocaleDateString('apos;fr-FR'apos;) : 'apos;N/A'apos;}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plans disponibles */}
              <div>
                <h4 style={{
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  🚀 Plans disponibles
                </h4>
                
                <div style={{ display: 'apos;grid'apos;, gridTemplateColumns: 'apos;repeat(auto-fit, minmax(280px, 1fr))'apos;, gap: theme.spacing.md }}>
                  {/* Plan Gratuit */}
                  <div style={{
                    background: 'apos;white'apos;,
                    border: 'apos;2px solid #e2e8f0'apos;,
                    borderRadius: 'apos;12px'apos;,
                    padding: theme.spacing.lg,
                    position: 'apos;relative'apos;
                  }}>
                    {userStats?.planId === 'apos;free'apos; && (
                      <div style={{
                        position: 'apos;absolute'apos;,
                        top: 'apos;-8px'apos;,
                        left: 'apos;50%'apos;,
                        transform: 'apos;translateX(-50%)'apos;,
                        background: theme.colors.primary.main,
                        color: 'apos;white'apos;,
                        padding: 'apos;4px 12px'apos;,
                        borderRadius: 'apos;12px'apos;,
                        fontSize: 'apos;12px'apos;,
                        fontWeight: 'apos;600'apos;
                      }}>
                        Plan actuel
                      </div>
                    )}
                    
                    <h5 style={{
                      fontSize: 'apos;20px'apos;,
                      fontWeight: 'apos;700'apos;,
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.sm
                    }}>
                      Gratuit
                    </h5>
                    <div style={{
                      fontSize: 'apos;32px'apos;,
                      fontWeight: 'apos;700'apos;,
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.md
                    }}>
                      $0
                      <span style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], fontWeight: 'apos;400'apos; }}>/mois</span>
                    </div>
                    
                    <ul style={{
                      listStyle: 'apos;none'apos;,
                      padding: 0,
                      margin: 0,
                      marginBottom: theme.spacing.lg
                    }}>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>5 missions par mois</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Agents de base</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Support communautaire</span>
                      </li>
                    </ul>
                  </div>

                  {/* Plan Pro */}
                  <div style={{
                    background: 'apos;white'apos;,
                    border: `2px solid ${theme.colors.primary.main}`,
                    borderRadius: 'apos;12px'apos;,
                    padding: theme.spacing.lg,
                    position: 'apos;relative'apos;
                  }}>
                    {userStats?.planId === 'apos;pro'apos; && (
                      <div style={{
                        position: 'apos;absolute'apos;,
                        top: 'apos;-8px'apos;,
                        left: 'apos;50%'apos;,
                        transform: 'apos;translateX(-50%)'apos;,
                        background: theme.colors.primary.main,
                        color: 'apos;white'apos;,
                        padding: 'apos;4px 12px'apos;,
                        borderRadius: 'apos;12px'apos;,
                        fontSize: 'apos;12px'apos;,
                        fontWeight: 'apos;600'apos;
                      }}>
                        Plan actuel
                      </div>
                    )}
                    
                    <div style={{
                      position: 'apos;absolute'apos;,
                      top: 'apos;12px'apos;,
                      right: 'apos;12px'apos;,
                      background: 'apos;#fbbf24'apos;,
                      color: 'apos;white'apos;,
                      padding: 'apos;2px 8px'apos;,
                      borderRadius: 'apos;8px'apos;,
                      fontSize: 'apos;10px'apos;,
                      fontWeight: 'apos;600'apos;
                    }}>
                      POPULAIRE
                    </div>
                    
                    <h5 style={{
                      fontSize: 'apos;20px'apos;,
                      fontWeight: 'apos;700'apos;,
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.sm
                    }}>
                      Pro
                    </h5>
                    <div style={{
                      fontSize: 'apos;32px'apos;,
                      fontWeight: 'apos;700'apos;,
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.md
                    }}>
                      $29
                      <span style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], fontWeight: 'apos;400'apos; }}>/mois</span>
                    </div>
                    
                    <ul style={{
                      listStyle: 'apos;none'apos;,
                      padding: 0,
                      margin: 0,
                      marginBottom: theme.spacing.lg
                    }}>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Missions illimitées</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Tous les agents</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>NovaBot inclus</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Support prioritaire</span>
                      </li>
                    </ul>
                    
                    {userStats?.planId !== 'apos;pro'apos; && (
                      <button
                        onClick={() => window.location.href = 'apos;/pricing'apos;}
                        style={{
                          width: 'apos;100%'apos;,
                          padding: 'apos;12px'apos;,
                          background: theme.colors.primary.main,
                          color: 'apos;white'apos;,
                          border: 'apos;none'apos;,
                          borderRadius: 'apos;8px'apos;,
                          fontSize: 'apos;14px'apos;,
                          fontWeight: 'apos;600'apos;,
                          cursor: 'apos;pointer'apos;,
                          transition: 'apos;background-color 0.2s'apos;
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
                    background: 'apos;white'apos;,
                    border: 'apos;2px solid #e2e8f0'apos;,
                    borderRadius: 'apos;12px'apos;,
                    padding: theme.spacing.lg,
                    position: 'apos;relative'apos;
                  }}>
                    {userStats?.planId === 'apos;enterprise'apos; && (
                      <div style={{
                        position: 'apos;absolute'apos;,
                        top: 'apos;-8px'apos;,
                        left: 'apos;50%'apos;,
                        transform: 'apos;translateX(-50%)'apos;,
                        background: theme.colors.primary.main,
                        color: 'apos;white'apos;,
                        padding: 'apos;4px 12px'apos;,
                        borderRadius: 'apos;12px'apos;,
                        fontSize: 'apos;12px'apos;,
                        fontWeight: 'apos;600'apos;
                      }}>
                        Plan actuel
                      </div>
                    )}
                    
                    <h5 style={{
                      fontSize: 'apos;20px'apos;,
                      fontWeight: 'apos;700'apos;,
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing.sm
                    }}>
                      Enterprise
                    </h5>
                    <div style={{
                      fontSize: 'apos;32px'apos;,
                      fontWeight: 'apos;700'apos;,
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.md
                    }}>
                      $99
                      <span style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], fontWeight: 'apos;400'apos; }}>/mois</span>
                    </div>
                    
                    <ul style={{
                      listStyle: 'apos;none'apos;,
                      padding: 0,
                      margin: 0,
                      marginBottom: theme.spacing.lg
                    }}>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Tout du plan Pro</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>APIs intégrées</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Support dédié</span>
                      </li>
                      <li style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos;, marginBottom: 'apos;8px'apos; }}>
                        <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, fontSize: 'apos;12px'apos; }} />
                        <span style={{ fontSize: 'apos;14px'apos; }}>Formation personnalisée</span>
                      </li>
                    </ul>
                    
                    {userStats?.planId !== 'apos;enterprise'apos; && (
                      <button
                        onClick={() => window.location.href = 'apos;/pricing'apos;}
                        style={{
                          width: 'apos;100%'apos;,
                          padding: 'apos;12px'apos;,
                          background: 'apos;white'apos;,
                          color: theme.colors.primary.main,
                          border: `1px solid ${theme.colors.primary.main}`,
                          borderRadius: 'apos;8px'apos;,
                          fontSize: 'apos;14px'apos;,
                          fontWeight: 'apos;600'apos;,
                          cursor: 'apos;pointer'apos;,
                          transition: 'apos;all 0.2s'apos;
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = theme.colors.primary.main;
                          e.currentTarget.style.color = 'apos;white'apos;;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'apos;white'apos;;
                          e.currentTarget.style.color = theme.colors.primary.main;
                        }}
                      >
                        Contacter l'apos;équipe
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions d'apos;abonnement */}
              <div style={{
                background: 'apos;#f8fafc'apos;,
                border: 'apos;1px solid #e2e8f0'apos;,
                borderRadius: 'apos;12px'apos;,
                padding: theme.spacing.lg
              }}>
                <h4 style={{
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[800],
                  marginBottom: theme.spacing.md
                }}>
                  ⚙️ Actions
                </h4>
                
                <div style={{ display: 'apos;flex'apos;, gap: theme.spacing.md, flexWrap: 'apos;wrap'apos; }}>
                  <button
                    onClick={() => window.location.href = 'apos;/pricing'apos;}
                    style={{
                      padding: 'apos;12px 20px'apos;,
                      background: theme.colors.primary.main,
                      color: 'apos;white'apos;,
                      border: 'apos;none'apos;,
                      borderRadius: 'apos;8px'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: 'apos;600'apos;,
                      cursor: 'apos;pointer'apos;,
                      display: 'apos;flex'apos;,
                      alignItems: 'apos;center'apos;,
                      gap: 'apos;8px'apos;
                    }}
                  >
                    <FontAwesomeIcon icon="credit-card" />
                    Gérer l'apos;abonnement
                  </button>
                  
                  <button
                    onClick={() => window.location.href = 'apos;/coupon'apos;}
                    style={{
                      padding: 'apos;12px 20px'apos;,
                      background: 'apos;white'apos;,
                      color: theme.colors.primary.main,
                      border: `1px solid ${theme.colors.primary.main}`,
                      borderRadius: 'apos;8px'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: 'apos;600'apos;,
                      cursor: 'apos;pointer'apos;,
                      display: 'apos;flex'apos;,
                      alignItems: 'apos;center'apos;,
                      gap: 'apos;8px'apos;
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
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;12px'apos;,
          padding: theme.spacing.xl,
          boxShadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.05)'apos;
        }}>
          <h3 style={{ 
            fontSize: 'apos;18px'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg
          }}>
            Actions du compte
          </h3>

          <div style={{ display: 'apos;flex'apos;, flexDirection: 'apos;column'apos;, gap: theme.spacing.md }}>
            <button
              onClick={() => window.location.href = 'apos;/pricing'apos;}
              style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.primary.light,
                border: `1px solid ${theme.colors.primary.main}`,
                borderRadius: 'apos;8px'apos;,
                color: theme.colors.primary.dark,
                cursor: 'apos;pointer'apos;,
                textAlign: 'apos;left'apos;,
                width: 'apos;100%'apos;
              }}
            >
              <FontAwesomeIcon icon="credit-card" />
              <div>
                <div style={{ fontWeight: 'apos;bold'apos; }}>Gérer mon abonnement</div>
                <div style={{ fontSize: 'apos;14px'apos;, opacity: 0.8 }}>
                  Voir les plans et gérer la facturation
                </div>
              </div>
            </button>

            <button
              onClick={() => signOut({ callbackUrl: 'apos;/'apos; })}
              style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                backgroundColor: 'apos;white'apos;,
                border: `1px solid ${theme.colors.error}40`,
                borderRadius: 'apos;8px'apos;,
                color: theme.colors.error,
                cursor: 'apos;pointer'apos;,
                textAlign: 'apos;left'apos;,
                width: 'apos;100%'apos;
              }}
            >
              <FontAwesomeIcon icon="sign-out-alt" />
              <div>
                <div style={{ fontWeight: 'apos;bold'apos; }}>Se déconnecter</div>
                <div style={{ fontSize: 'apos;14px'apos;, opacity: 0.8 }}>
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
