"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Mission {
  id: string;
  objective: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  priority: string;
  context: string | null;
  source: string;
  userId: string;
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
}

interface MissionsResponse {
  missions: Mission[];
}

export default function AdminMissionsPage() {
  const { data: session } = useSession();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/missions');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des missions');
      }
      
      const data: MissionsResponse = await response.json();
      setMissions(data.missions || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les missions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'notified':
        return { icon: 'check-circle', color: '#10b981' };
      case 'processing':
      case 'in_progress':
        return { icon: 'clock', color: '#f59e0b' };
      case 'error':
        return { icon: 'exclamation-triangle', color: '#ef4444' };
      default:
        return { icon: 'circle', color: '#6b7280' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  };

  const filterMissions = (missions: Mission[]) => {
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return missions.filter(mission => {
          const missionDate = new Date(mission.createdAt);
          return missionDate.toDateString() === now.toDateString();
        });
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return missions.filter(mission => new Date(mission.createdAt) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return missions.filter(mission => new Date(mission.createdAt) >= monthAgo);
      default:
        return missions;
    }
  };

  const filteredMissions = filterMissions(missions);

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e3e8ee',
              borderTop: '4px solid #635bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280' }}>Chargement des missions...</p>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: '24px'
          }}>
            <div style={{ fontSize: '64px', color: '#ef4444' }}>⚠️</div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: '0 0 12px 0' }}>
                Erreur de chargement
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 32px 0' }}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#635bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Réessayer
              </button>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#0a2540',
                margin: '0 0 8px 0'
              }}>
                <FontAwesomeIcon icon="crown" style={{ color: '#f59e0b', marginRight: '12px' }} />
                Administration - Toutes les missions
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0
              }}>
                Vue d'ensemble de toutes les missions créées par les utilisateurs
              </p>
            </div>

            <button
              onClick={fetchMissions}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#635bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <FontAwesomeIcon icon="refresh" />
              Actualiser
            </button>
          </div>

          {/* Filtres */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
            border: '1px solid #e3e8ee'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Filtrer par période :
              </span>
              
              {[
                { id: 'all', label: 'Toutes', count: missions.length },
                { id: 'today', label: 'Aujourd\'hui', count: filterMissions(missions).length },
                { id: 'week', label: 'Cette semaine', count: filterMissions(missions).length },
                { id: 'month', label: 'Ce mois', count: filterMissions(missions).length }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: filter === filterOption.id ? '#635bff' : 'transparent',
                    color: filter === filterOption.id ? 'white' : '#6b7280',
                    border: `1px solid ${filter === filterOption.id ? '#635bff' : '#e3e8ee'}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {filterOption.label}
                  <span style={{
                    backgroundColor: filter === filterOption.id ? 'rgba(255,255,255,0.3)' : '#f3f4f6',
                    color: filter === filterOption.id ? 'white' : '#6b7280',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {filter === filterOption.id ? filteredMissions.length : filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Statistiques rapides */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #e3e8ee',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="list" style={{ 
                fontSize: '24px', 
                color: '#635bff',
                marginBottom: '8px'
              }} />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#0a2540',
                marginBottom: '4px'
              }}>
                {filteredMissions.length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Missions totales
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #e3e8ee',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="check-circle" style={{ 
                fontSize: '24px', 
                color: '#10b981',
                marginBottom: '8px'
              }} />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#0a2540',
                marginBottom: '4px'
              }}>
                {filteredMissions.filter(m => m.status === 'completed' || m.status === 'notified').length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Terminées
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #e3e8ee',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="users" style={{ 
                fontSize: '24px', 
                color: '#f59e0b',
                marginBottom: '8px'
              }} />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#0a2540',
                marginBottom: '4px'
              }}>
                {new Set(filteredMissions.map(m => m.userId)).size}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Utilisateurs actifs
              </div>
            </div>
          </div>

          {/* Liste des missions */}
          {filteredMissions.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '64px 32px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #e3e8ee'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                margin: '0 0 8px 0'
              }}>
                Aucune mission trouvée
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0
              }}>
                Aucune mission ne correspond aux critères sélectionnés.
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #e3e8ee'
            }}>
              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {filteredMissions.map((mission) => {
                  const statusInfo = getStatusIcon(mission.status);
                  
                  return (
                    <div key={mission.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e3e8ee',
                      transition: 'all 0.2s'
                    }}>
                      {/* Status icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: statusInfo.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FontAwesomeIcon 
                          icon={statusInfo.icon as any} 
                          style={{ 
                            color: statusInfo.color,
                            fontSize: '16px'
                          }} 
                        />
                      </div>

                      {/* Mission info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#0a2540',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {mission.objective}
                          </h3>
                          
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: getPriorityColor(mission.priority) + '20',
                            color: getPriorityColor(mission.priority),
                            fontSize: '11px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {mission.priority}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '13px',
                          color: '#6b7280',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FontAwesomeIcon icon="user" />
                            {mission.user.name || mission.user.email}
                          </span>
                          
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FontAwesomeIcon icon="clock" />
                            {formatTimeAgo(mission.createdAt)}
                          </span>
                          
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FontAwesomeIcon icon="calendar" />
                            {new Date(mission.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FontAwesomeIcon icon="tag" />
                            #{mission.id.slice(-8)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0
                      }}>
                        <Link
                          href={`/missions/${mission.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: '#635bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <FontAwesomeIcon icon="eye" />
                          Voir
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
