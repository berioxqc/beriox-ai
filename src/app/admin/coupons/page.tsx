"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AdminGuard from "@/components/AdminGuard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme, useStyles } from "@/hooks/useTheme";

type Coupon = {
  id: string;
  code: string;
  type: 'PREMIUM_TRIAL' | 'PLAN_UPGRADE' | 'DISCOUNT';
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'DISABLED';
  description?: string;
  planId?: string;
  duration?: number;
  discount?: number;
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  notes?: string;
  redemptions: Array<{
    id: string;
    redeemedAt: string;
    user: {
      email: string;
      name?: string;
    };
  }>;
};

type Stats = {
  total: number;
  active: number;
  used: number;
  expired: number;
  totalRedemptions: number;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Formulaire de création
  const [formData, setFormData] = useState({
    code: '',
    type: 'PREMIUM_TRIAL' as const,
    description: '',
    planId: 'starter',
    duration: 90,
    discount: 0,
    maxUses: 1,
    validUntil: '',
    notes: ''
  });

  const theme = useTheme();
  const styles = useStyles();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur récupération coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!formData.code.trim()) return;
    
    setCreating(true);
    
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          validUntil: formData.validUntil || null
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          code: '',
          type: 'PREMIUM_TRIAL',
          description: '',
          planId: 'starter',
          duration: 90,
          discount: 0,
          maxUses: 1,
          validUntil: '',
          notes: ''
        });
        fetchCoupons(); // Recharger la liste
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setCreating(false);
    }
  };

  const updateCouponStatus = async (couponId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: couponId, status }),
      });

      if (response.ok) {
        fetchCoupons(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur mise à jour coupon:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'USED': return '#6b7280';
      case 'EXPIRED': return '#ef4444';
      case 'DISABLED': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PREMIUM_TRIAL': return 'Essai Premium';
      case 'PLAN_UPGRADE': return 'Mise à niveau';
      case 'DISCOUNT': return 'Réduction';
      default: return type;
    }
  };

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
            <FontAwesomeIcon icon="spinner" spin style={{ fontSize: '24px' }} />
          </div>
        </Layout>
      </AdminGuard>
    );
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
                🎫 Gestion des Coupons
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Créez et gérez les coupons d&apos;accès premium
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
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
              <FontAwesomeIcon icon="plus" />
              Nouveau Coupon
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
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Coupons</div>
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
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#6b7280' }}>
                  {stats.used}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Utilisés</div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                  {stats.totalRedemptions}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Utilisations</div>
              </div>
            </div>
          )}

          {/* Liste des coupons */}
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
                Coupons ({coupons.length})
              </h2>
            </div>
            
            <div style={{ padding: '20px' }}>
              {coupons.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <FontAwesomeIcon icon="ticket" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <p>Aucun coupon créé pour le moment</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {coupons.map((coupon) => (
                    <div key={coupon.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#f9fafb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#0a2540',
                            fontFamily: 'monospace',
                            marginBottom: '4px'
                          }}>
                            {coupon.code}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            marginBottom: '8px'
                          }}>
                            {getTypeLabel(coupon.type)} • {coupon.description}
                          </div>
                        </div>
                        
                        <div style={{
                          background: getStatusColor(coupon.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {coupon.status}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {coupon.planId && (
                          <div>
                            <strong>Plan:</strong> {coupon.planId}
                          </div>
                        )}
                        {coupon.duration && (
                          <div>
                            <strong>Durée:</strong> {coupon.duration} jours
                          </div>
                        )}
                        <div>
                          <strong>Utilisations:</strong> {coupon.currentUses}/{coupon.maxUses || &apos;∞&apos;}
                        </div>
                        <div>
                          <strong>Créé:</strong> {new Date(coupon.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {coupon.redemptions.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#e5e7eb',
                          borderRadius: '6px'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: '#374151'
                          }}>
                            Utilisé par:
                          </div>
                          {coupon.redemptions.map((redemption, idx) => (
                            <div key={redemption.id} style={{
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              {redemption.user.email} - {new Date(redemption.redeemedAt).toLocaleDateString()}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {coupon.status === 'ACTIVE' && (
                          <button
                            onClick={() => updateCouponStatus(coupon.id, &apos;DISABLED&apos;)}
                            style={{
                              background: &apos;#f59e0b&apos;,
                              color: &apos;white&apos;,
                              border: &apos;none&apos;,
                              borderRadius: &apos;4px&apos;,
                              padding: &apos;6px 12px&apos;,
                              fontSize: &apos;12px&apos;,
                              cursor: &apos;pointer&apos;
                            }}
                          >
                            Désactiver
                          </button>
                        )}
                        {coupon.status === 'DISABLED' && (
                          <button
                            onClick={() => updateCouponStatus(coupon.id, &apos;ACTIVE&apos;)}
                            style={{
                              background: &apos;#10b981&apos;,
                              color: &apos;white&apos;,
                              border: &apos;none&apos;,
                              borderRadius: &apos;4px&apos;,
                              padding: &apos;6px 12px&apos;,
                              fontSize: &apos;12px&apos;,
                              cursor: &apos;pointer&apos;
                            }}
                          >
                            Réactiver
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de création */}
        {showCreateModal && (
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
                  Créer un nouveau coupon
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
                      Code coupon *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="Ex: PREMIUM3MOIS"
                      style={{
                        width: &apos;100%&apos;,
                        padding: &apos;12px&apos;,
                        border: &apos;1px solid #d1d5db&apos;,
                        borderRadius: &apos;6px&apos;,
                        fontSize: &apos;14px&apos;,
                        textTransform: &apos;uppercase&apos;
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
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="PREMIUM_TRIAL">Essai Premium</option>
                      <option value="PLAN_UPGRADE">Mise à niveau</option>
                      <option value="DISCOUNT">Réduction</option>
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
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du coupon"
                      style={{
                        width: &apos;100%&apos;,
                        padding: &apos;12px&apos;,
                        border: &apos;1px solid #d1d5db&apos;,
                        borderRadius: &apos;6px&apos;,
                        fontSize: &apos;14px&apos;
                      }}
                    />
                  </div>
                  
                  {formData.type === 'PREMIUM_TRIAL' && (
                    <>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          Plan *
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
                          <option value="starter">Starter</option>
                          <option value="pro">Professionnel</option>
                          <option value="enterprise">Enterprise</option>
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
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          min="1"
                          style={{
                            width: &apos;100%&apos;,
                            padding: &apos;12px&apos;,
                            border: &apos;1px solid #d1d5db&apos;,
                            borderRadius: &apos;6px&apos;,
                            fontSize: &apos;14px&apos;
                          }}
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Nombre max d&apos;utilisations
                    </label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                      min="1"
                      style={{
                        width: &apos;100%&apos;,
                        padding: &apos;12px&apos;,
                        border: &apos;1px solid #d1d5db&apos;,
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
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Date d&apos;expiration
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      style={{
                        width: &apos;100%&apos;,
                        padding: &apos;12px&apos;,
                        border: &apos;1px solid #d1d5db&apos;,
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
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Notes internes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notes pour l&apos;équipe admin"
                      style={{
                        width: &apos;100%&apos;,
                        padding: &apos;12px&apos;,
                        border: &apos;1px solid #d1d5db&apos;,
                        borderRadius: &apos;6px&apos;,
                        fontSize: &apos;14px&apos;,
                        minHeight: &apos;80px&apos;,
                        resize: &apos;vertical&apos;
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
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  style={{
                    background: &apos;#f3f4f6&apos;,
                    color: &apos;#374151&apos;,
                    border: &apos;none&apos;,
                    borderRadius: &apos;6px&apos;,
                    padding: &apos;12px 20px&apos;,
                    fontSize: &apos;14px&apos;,
                    fontWeight: &apos;600&apos;,
                    cursor: creating ? &apos;not-allowed&apos; : &apos;pointer&apos;
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCoupon}
                  disabled={!formData.code.trim() || creating}
                  style={{
                    background: creating ? '#9ca3af' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (!formData.code.trim() || creating) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {creating ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Création...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="plus" />
                      Créer le coupon
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </AdminGuard>
  );
}
