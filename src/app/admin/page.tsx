"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
interface DatabaseStats {
  missions: number
  briefs: number
  deliverables: number
  reports: number
  users: number
  executionLogs: number
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetLoading, setResetLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  useEffect(() => {
    fetchStats()
  }, [])
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleReset = async () => {
    try {
      setResetLoading(true)
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        setResetSuccess(true)
        setShowResetConfirm(false)
        // Recharger les stats après reset
        setTimeout(() => {
          fetchStats()
          setResetSuccess(false)
        }, 2000)
      } else {
        throw new Error('Erreur lors du reset')
      }
    } catch (error) {
      console.error('Erreur reset:', error)
      alert('Erreur lors du reset de la base de données')
    } finally {
      setResetLoading(false)
    }
  }
  // Vérifier si l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
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
            <div style={{ fontSize: '64px', color: '#ef4444' }}>🚫</div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: '0 0 12px 0' }}>
                Accès refusé
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 32px 0' }}>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <Link
                href="/"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#635bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    )
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
                Administration Super Admin
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0
              }}>
                Gestion et maintenance de la plateforme Beriox AI
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={fetchStats}
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
          </div>

          {/* Success Message */}
          {resetSuccess && (
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FontAwesomeIcon icon="check-circle" style={{ color: '#16a34a', fontSize: '20px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#15803d', fontSize: '14px' }}>
                  Reset effectué avec succès !
                </div>
                <div style={{ color: '#166534', fontSize: '13px' }}>
                  Toutes les données de missions, briefs, livrables et rapports ont été supprimées.
                </div>
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { icon: 'tasks', label: 'Missions', value: stats?.missions || 0, color: '#635bff' },
              { icon: 'file-alt', label: 'Briefs', value: stats?.briefs || 0, color: '#10b981' },
              { icon: 'box', label: 'Livrables', value: stats?.deliverables || 0, color: '#f59e0b' },
              { icon: 'chart-line', label: 'Rapports', value: stats?.reports || 0, color: '#ef4444' },
              { icon: 'users', label: 'Utilisateurs', value: stats?.users || 0, color: '#8b5cf6' },
              { icon: 'list', label: 'Logs', value: stats?.executionLogs || 0, color: '#6b7280' }
            ].map((stat, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
                border: '1px solid #e3e8ee',
                textAlign: 'center'
              }}>
                <FontAwesomeIcon icon={stat.icon as any} style={{ 
                  fontSize: '24px', 
                  color: stat.color,
                  marginBottom: '8px'
                }} />
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#0a2540',
                  marginBottom: '4px'
                }}>
                  {loading ? '...' : stat.value.toLocaleString()}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Navigation rapide */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #e3e8ee'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0a2540',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FontAwesomeIcon icon="compass" style={{ color: '#635bff' }} />
                Navigation rapide
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href="/admin/missions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#374151',
                    border: '1px solid #e3e8ee',
                    transition: 'all 0.2s'
                  }}
                >
                  <FontAwesomeIcon icon="tasks" style={{ color: '#635bff' }} />
                  <span>Toutes les missions</span>
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#635bff20',
                    color: '#635bff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {stats?.missions || 0}
                  </span>
                </Link>

                <Link
                  href="/admin/users"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#374151',
                    border: '1px solid #e3e8ee',
                    transition: 'all 0.2s'
                  }}
                >
                  <FontAwesomeIcon icon="users" style={{ color: '#8b5cf6' }} />
                  <span>Gestion des utilisateurs</span>
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#8b5cf620',
                    color: '#8b5cf6',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {stats?.users || 0}
                  </span>
                </Link>

                <Link
                  href="/admin/agents"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#374151',
                    border: '1px solid #e3e8ee',
                    transition: 'all 0.2s'
                  }}
                >
                  <FontAwesomeIcon icon="robot" style={{ color: '#10b981' }} />
                  <span>Configuration des agents</span>
                  <FontAwesomeIcon icon="arrow-right" style={{ 
                    marginLeft: 'auto', 
                    color: '#6b7280',
                    fontSize: '12px'
                  }} />
                </Link>
              </div>
            </div>

            {/* Actions dangereuses */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
              border: '1px solid #fecaca'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#dc2626',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FontAwesomeIcon icon="exclamation-triangle" style={{ color: '#dc2626' }} />
                Zone dangereuse
              </h3>
              
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#dc2626',
                  margin: '0 0 8px 0'
                }}>
                  Reset complet de la base de données
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: '#991b1b',
                  margin: '0 0 12px 0',
                  lineHeight: '1.4'
                }}>
                  Cette action supprimera définitivement toutes les missions, briefs, livrables et rapports. 
                  Les utilisateurs et leurs comptes seront conservés.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#7f1d1d',
                  marginBottom: '12px'
                }}>
                  <FontAwesomeIcon icon="info-circle" />
                  <span>Cette action est irréversible</span>
                </div>
                
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <FontAwesomeIcon icon="trash" />
                    Reset base de données
                  </button>
                ) : (
                  <div>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#dc2626',
                      margin: '0 0 12px 0'
                    }}>
                      Êtes-vous absolument sûr ?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleReset}
                        disabled={resetLoading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: resetLoading ? '#9ca3af' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: resetLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {resetLoading ? (
                          <>
                            <FontAwesomeIcon icon="spinner" className="fa-spin" />
                            Reset en cours...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon="check" />
                            Confirmer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        disabled={resetLoading}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: resetLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  )
}
