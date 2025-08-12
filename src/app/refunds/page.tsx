"use client"
import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "@/hooks/useTheme"
interface RefundRequest {
  id: string
  missionId?: string
  amount: number
  reason: string
  description: string
  status: string
  createdAt: string
  reviewedAt?: string
  adminNotes?: string
}

interface UserCredits {
  id: string
  planId: string
  creditsUsed: number
  creditsLimit: number
  resetDate: string
}

export default function RefundsPage() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  // Form state
  const [formData, setFormData] = useState({
    missionId: "",
    amount: 1,
    reason: "NOT_SATISFIED" as const,
    description: ""
  })
  const theme = useTheme()
  useEffect(() => {
    fetchRefunds()
  }, [])
  const fetchRefunds = async () => {
    try {
      const response = await fetch("/api/refunds/request")
      const data = await response.json()
      if (response.ok) {
        setRefundRequests(data.refundRequests)
        setUserCredits(data.userCredits)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(data.message)
        setShowForm(false)
        setFormData({
          missionId: "",
          amount: 1,
          reason: "NOT_SATISFIED",
          description: ""
        })
        fetchRefunds(); // Recharger les données
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Erreur lors de la soumission")
    } finally {
      setSubmitting(false)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "#f59e0b"
      case "APPROVED": return "#10b981"
      case "REJECTED": return "#ef4444"
      case "CANCELLED": return "#6b7280"
      default: return "#6b7280"
    }
  }
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "En attente"
      case "APPROVED": return "Approuvé"
      case "REJECTED": return "Rejeté"
      case "CANCELLED": return "Annulé"
      default: return status
    }
  }
  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "QUALITY_ISSUE": return "Problème de qualité"
      case "TECHNICAL_PROBLEM": return "Problème technique"
      case "NOT_SATISFIED": return "Non satisfait"
      case "DUPLICATE_CHARGE": return "Facturation en double"
      case "OTHER": return "Autre"
      default: return reason
    }
  }
  if (loading) {
    return (
      <Layout title="Remboursements" subtitle="Gérez vos demandes de remboursement">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "24px", color: theme.colors.primary.main }} />
          <p style={{ marginTop: "16px", color: theme.colors.neutral[600] }}>Chargement...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Remboursements" subtitle="Gérez vos demandes de remboursement">
      <div style={{ display: "grid", gap: theme.spacing.xl }}>
        {/* Informations sur les crédits */}
        {userCredits && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: theme.spacing.lg,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e3e8ee"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.md
            }}>
              💳 Vos Crédits
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: theme.spacing.md }}>
              <div style={{
                background: "#f8fafc",
                padding: theme.spacing.md,
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                  Crédits utilisés
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: theme.colors.neutral[900] }}>
                  {userCredits.creditsUsed}
                </div>
              </div>
              
              <div style={{
                background: "#f8fafc",
                padding: theme.spacing.md,
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                  Limite mensuelle
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: theme.colors.neutral[900] }}>
                  {userCredits.creditsLimit}
                </div>
              </div>
              
              <div style={{
                background: "#f8fafc",
                padding: theme.spacing.md,
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                  Prochain reset
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.neutral[900] }}>
                  {new Date(userCredits.resetDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages d'erreur/succès */}
        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: theme.spacing.md,
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <FontAwesomeIcon icon="exclamation-triangle" />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: theme.spacing.md,
            color: "#166534",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <FontAwesomeIcon icon="check-circle" />
            {success}
          </div>
        )}

        {/* Bouton pour demander un remboursement */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: theme.spacing.lg,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e3e8ee"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.md
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: theme.colors.neutral[900]
            }}>
              🔄 Demande de Remboursement
            </h3>
            
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "8px 16px",
                background: showForm ? "#ef4444" : theme.colors.primary.main,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = showForm ? "#dc2626" : theme.colors.primary.dark}
              onMouseOut={(e) => e.currentTarget.style.background = showForm ? "#ef4444" : theme.colors.primary.main}
            >
              {showForm ? "Annuler" : "Nouvelle demande"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: theme.spacing.md }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing.md }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: theme.colors.neutral[700],
                    marginBottom: "4px"
                  }}>
                    Nombre de crédits à rembourser
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: theme.colors.neutral[700],
                    marginBottom: "4px"
                  }}>
                    Raison du remboursement
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="NOT_SATISFIED">Non satisfait</option>
                    <option value="QUALITY_ISSUE">Problème de qualité</option>
                    <option value="TECHNICAL_PROBLEM">Problème technique</option>
                    <option value="DUPLICATE_CHARGE">Facturation en double</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: theme.colors.neutral[700],
                  marginBottom: "4px"
                }}>
                  Explication détaillée *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Expliquez en détail pourquoi vous demandez un remboursement..."
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{
                display: "flex",
                gap: theme.spacing.md,
                justifyContent: "flex-end"
              }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  style={{
                    padding: "10px 20px",
                    background: "white",
                    color: theme.colors.neutral[600],
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: submitting ? "not-allowed" : "pointer"
                  }}
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || !formData.description.trim()}
                  style={{
                    padding: "10px 20px",
                    background: submitting ? "#9ca3af" : theme.colors.primary.main,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="paper-plane" />
                      Soumettre la demande
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Historique des demandes */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: theme.spacing.lg,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e3e8ee"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            📋 Historique des Demandes
          </h3>

          {refundRequests.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: theme.colors.neutral[500]
            }}>
              <FontAwesomeIcon icon="receipt" style={{ fontSize: "48px", marginBottom: "16px" }} />
              <p>Aucune demande de remboursement pour le moment</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: theme.spacing.md }}>
              {refundRequests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: theme.spacing.md,
                    background: "#f8fafc"
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px"
                  }}>
                    <div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px"
                      }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "white",
                          background: getStatusColor(request.status)
                        }}>
                          {getStatusLabel(request.status)}
                        </span>
                        <span style={{ fontSize: "14px", color: theme.colors.neutral[600] }}>
                          {request.amount} crédit{request.amount > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: "14px", color: theme.colors.neutral[700] }}>
                        Raison: {getReasonLabel(request.reason)}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: "12px", color: theme.colors.neutral[500] }}>
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: "14px", color: theme.colors.neutral[800], marginBottom: "8px" }}>
                    {request.description}
                  </div>
                  
                  {request.adminNotes && (
                    <div style={{
                      background: "white",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      color: theme.colors.neutral[600]
                    }}>
                      <strong>Réponse admin:</strong> {request.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
