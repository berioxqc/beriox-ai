"use client"
import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import AdminGuard from "@/components/AdminGuard"
import { Icon } from "@/components/ui/Icon"
import { useTheme, useStyles } from "@/hooks/useTheme"
type PremiumAccess = {
  id: string
  userId: string
  planId: string
  startDate: string
  endDate: string
  isActive: boolean
  source: string
  sourceId?: string
  createdAt: string
  notes?: string
  user: {
    id: string
    email: string
    name?: string
    image?: string
  }
}
type Stats = {
  total: number
  active: number
  expired: number
  byPlan: {
    starter: number
    pro: number
    enterprise: number
  }
  bySource: {
    coupon: number
    admin_grant: number
    stripe: number
  }
}
export default function AdminPremiumAccessPage() {
  const [premiumAccesses, setPremiumAccesses] = useState<PremiumAccess[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [granting, setGranting] = useState(false)
  // Formulaire d'attribution
  const [formData, setFormData] = useState({
    userEmail: '',
    planId: 'starter',
    duration: 90,
    notes: ''
  })
  const theme = useTheme()
  const styles = useStyles()
  useEffect(() => {
    fetchPremiumAccesses()
  }, [])
  const fetchPremiumAccesses = async () => {
    try {
      const response = await fetch('/api/admin/premium-access')
      if (response.ok) {
        const data = await response.json()
        setPremiumAccesses(data.premiumAccesses)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur récupération accès premium:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleGrantAccess = async () => {
    if (!formData.userEmail.trim()) return
    setGranting(true)
    try {
      const response = await fetch('/api/admin/premium-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowGrantModal(false)
        setFormData({
          userEmail: '',
          planId: 'starter',
          duration: 90,
          notes: ''
        })
        fetchPremiumAccesses(); // Recharger la liste
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'attribution')
      }
    } catch (error) {
      alert('Erreur de connexion')
    } finally {
      setGranting(false)
    }
  }
  const revokeAccess = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cet accès premium ?')) return
    try {
      const response = await fetch(`/api/admin/premium-access?userId=${userId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchPremiumAccesses(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur révocation accès:', error)
    }
  }
  const getPlanName = (planId: string) => {
    const plans: Record<string, string> = {
      'starter': 'Starter',
      'pro': 'Professionnel',
      'enterprise': 'Enterprise'
    }
    return plans[planId] || planId
  }
  const getSourceLabel = (source: string) => {
    const sources: Record<string, string> = {
      'coupon': 'Coupon',
      'admin_grant': 'Attribution admin',
      'stripe': 'Abonnement Stripe'
    }
    return sources[source] || source
  }
  const isExpired = (endDate: string) => {
    return new Date(endDate) <= new Date()
  }
  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }
  if (loading) {
    return (
      <AdminGuard>
        <Layout>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px' 
          }}>
                          <Icon name="spinner" style={{ fontSize: '24px' }} />
          </div>
        </Layout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <Layout>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#0a2540',
                margin: '0 0 8px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                💎 Accès Premium
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Gérez les accès premium temporaires des utilisateurs
              </p>
            </div>
            
            <button
              onClick={() => setShowGrantModal(true)}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Icon name="crown" />
              Accorder un accès
            </button>
          </div>

          {/* Statistiques */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#0a2540' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Accès</div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                  {stats.active}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Actifs</div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
                  {stats.expired}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Expirés</div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Par plan</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Starter: {stats.byPlan.starter} • Pro: {stats.byPlan.pro} • Enterprise: {stats.byPlan.enterprise}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liste des accès premium */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0a2540',
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Accès Premium ({premiumAccesses.length})
              </h2>
            </div>
            
            <div style={{ padding: '20px' }}>
              {premiumAccesses.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <Icon name="crown" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <p>Aucun accès premium accordé pour le moment</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {premiumAccesses.map((access) => {
                    const expired = isExpired(access.endDate)
                    const daysLeft = getDaysRemaining(access.endDate)
                    return (
                      <div key={access.id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        background: expired ? '#fef2f2' : '#f9fafb'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {access.user.image && (
                              <img
                                src={access.user.image}
                                alt={access.user.name || access.user.email}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%'
                                }}
                              />
                            )}
                            <div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#0a2540',
                                marginBottom: '2px'
                              }}>
                                {access.user.name || access.user.email}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: '#6b7280'
                              }}>
                                {access.user.email}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              background: expired ? '#ef4444' : access.isActive ? '#10b981' : '#6b7280',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {expired ? 'Expiré' : access.isActive ? 'Actif' : 'Inactif'}
                            </div>
                            
                            <div style={{
                              background: '#f3f4f6',
                              color: '#374151',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {getPlanName(access.planId)}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '12px',
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <strong>Source:</strong> {getSourceLabel(access.source)}
                          </div>
                          <div>
                            <strong>Début:</strong> {new Date(access.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Fin:</strong> {new Date(access.endDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Reste:</strong> {expired ? '0 jours' : `${daysLeft} jours`}
                          </div>
                        </div>
                        
                        {access.notes && (
                          <div style={{
                            marginBottom: '12px',
                            padding: '8px 12px',
                            background: '#e5e7eb',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#374151'
                          }}>
                            <strong>Notes:</strong> {access.notes}
                          </div>
                        )}
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '8px'
                        }}>
                          {access.isActive && !expired && (
                            <button
                              onClick={() => revokeAccess(access.userId)}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Icon name="times-circle" />
                              Révoquer
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal d'attribution */}
        {showGrantModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0a2540',
                  margin: 0,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Accorder un accès premium
                </h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Email utilisateur *
                    </label>
                    <input
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      placeholder="utilisateur@exemple.com"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Plan premium *
                    </label>
                    <select
                      value={formData.planId}
                      onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="starter">Starter (39$ CAD)</option>
                      <option value="pro">Professionnel (129$ CAD)</option>
                      <option value="enterprise">Enterprise (399$ CAD)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Durée (jours) *
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="7">1 semaine (7 jours)</option>
                      <option value="30">1 mois (30 jours)</option>
                      <option value="90">3 mois (90 jours)</option>
                      <option value="180">6 mois (180 jours)</option>
                      <option value="365">1 an (365 jours)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Raison de l'attribution, contexte..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{
                padding: '24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowGrantModal(false)}
                  disabled={granting}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: granting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleGrantAccess}
                  disabled={!formData.userEmail.trim() || granting}
                  style={{
                    background: granting ? '#9ca3af' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (!formData.userEmail.trim() || granting) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {granting ? (
                    <>
                      <Icon name="spinner" />
                      Attribution...
                    </>
                  ) : (
                    <>
                      <Icon name="crown" />
                      Accorder l'accès
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </AdminGuard>
  )
}
