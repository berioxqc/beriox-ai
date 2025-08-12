"use client"
import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "@/hooks/useTheme"
interface RefundRequest {
  id: string
  userId: string
  missionId?: string
  amount: number
  reason: string
  description: string
  status: string
  createdAt: string
  reviewedAt?: string
  adminNotes?: string
  user: {
    id: string
    name: string
    email: string
    planId: string
  }
  userCredits: {
    creditsUsed: number
    creditsLimit: number
  }
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const theme = useTheme()
  useEffect(() => {
    fetchRefunds()
  }, [filter, page])
  const fetchRefunds = async () => {
    try {
      const response = await fetch(`/api/admin/refunds?status=${filter}&page=${page}`)
      const data = await response.json()
      if (response.ok) {
        setRefunds(data.refunds)
        setTotalPages(data.pagination.pages)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }
  const processRefund = async (refundId: string, status: "APPROVED" | "REJECTED", adminNotes?: string) => {
    setProcessing(refundId)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId,
          status,
          adminNotes
        })
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(data.message)
        fetchRefunds(); // Recharger les données
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Erreur lors du traitement")
    } finally {
      setProcessing(null)
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
      <Layout title="Gestion des Remboursements" subtitle="Traitez les demandes de remboursement">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "24px", color: theme.colors.primary.main }} />
          <p style={{ marginTop: "16px", color: theme.colors.neutral[600] }}>Chargement...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Gestion des Remboursements" subtitle="Traitez les demandes de remboursement">
      <div style={{ display: "grid", gap: theme.spacing.xl }}>
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

        {/* Filtres et pagination */}
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
            <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "center" }}>
              <label style={{
                fontSize: "14px",
                fontWeight: "500",
                color: theme.colors.neutral[700]
              }}>
                Filtrer par statut:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              >
                <option value="ALL">Tous</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvés</option>
                <option value="REJECTED">Rejetés</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: theme.spacing.sm, alignItems: "center" }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 12px",
                  background: page === 1 ? "#f3f4f6" : theme.colors.primary.main,
                  color: page === 1 ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: page === 1 ? "not-allowed" : "pointer"
                }}
              >
                <FontAwesomeIcon icon="chevron-left" />
              </button>
              
              <span style={{ fontSize: "14px", color: theme.colors.neutral[600] }}>
                Page {page} sur {totalPages}
              </span>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "6px 12px",
                  background: page === totalPages ? "#f3f4f6" : theme.colors.primary.main,
                  color: page === totalPages ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: page === totalPages ? "not-allowed" : "pointer"
                }}
              >
                <FontAwesomeIcon icon="chevron-right" />
              </button>
            </div>
          </div>
        </div>

        {/* Liste des remboursements */}
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
            📋 Demandes de Remboursement
          </h3>

          {refunds.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: theme.colors.neutral[500]
            }}>
              <FontAwesomeIcon icon="receipt" style={{ fontSize: "48px", marginBottom: "16px" }} />
              <p>Aucune demande de remboursement trouvée</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: theme.spacing.md }}>
              {refunds.map((refund) => (
                <div
                  key={refund.id}
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
                    marginBottom: "12px"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px"
                      }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "white",
                          background: getStatusColor(refund.status)
                        }}>
                          {getStatusLabel(refund.status)}
                        </span>
                        <span style={{ fontSize: "14px", color: theme.colors.neutral[600] }}>
                          {refund.amount} crédit{refund.amount > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: "14px", color: theme.colors.neutral[700], marginBottom: "4px" }}>
                        <strong>Utilisateur:</strong> {refund.user.name} ({refund.user.email})
                      </div>
                      
                      <div style={{ fontSize: "14px", color: theme.colors.neutral[700], marginBottom: "4px" }}>
                        <strong>Plan:</strong> {refund.user.planId} | <strong>Crédits:</strong> {refund.userCredits.creditsUsed}/{refund.userCredits.creditsLimit}
                      </div>
                      
                      <div style={{ fontSize: "14px", color: theme.colors.neutral[700] }}>
                        <strong>Raison:</strong> {getReasonLabel(refund.reason)}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: "12px", color: theme.colors.neutral[500], textAlign: "right" }}>
                      {new Date(refund.createdAt).toLocaleDateString('fr-FR')}
                      <br />
                      {new Date(refund.createdAt).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: "14px", 
                    color: theme.colors.neutral[800], 
                    marginBottom: "12px",
                    background: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <strong>Description:</strong> {refund.description}
                  </div>
                  
                  {refund.adminNotes && (
                    <div style={{
                      background: "#fef3c7",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #f59e0b",
                      fontSize: "12px",
                      color: "#92400e",
                      marginBottom: "12px"
                    }}>
                      <strong>Notes admin:</strong> {refund.adminNotes}
                    </div>
                  )}
                  
                  {/* Actions pour les demandes en attente */}
                  {refund.status === "PENDING" && (
                    <div style={{
                      display: "flex",
                      gap: theme.spacing.sm,
                      justifyContent: "flex-end"
                    }}>
                      <button
                        onClick={() => {
                          const notes = prompt("Notes admin (optionnel):")
                          if (notes !== null) {
                            processRefund(refund.id, "REJECTED", notes)
                          }
                        }}
                        disabled={processing === refund.id}
                        style={{
                          padding: "8px 16px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: processing === refund.id ? "not-allowed" : "pointer",
                          opacity: processing === refund.id ? 0.6 : 1
                        }}
                      >
                        {processing === refund.id ? (
                          <FontAwesomeIcon icon="spinner" spin />
                        ) : (
                          "Rejeter"
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          const notes = prompt("Notes admin (optionnel):")
                          if (notes !== null) {
                            processRefund(refund.id, "APPROVED", notes)
                          }
                        }}
                        disabled={processing === refund.id}
                        style={{
                          padding: "8px 16px",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: processing === refund.id ? "not-allowed" : "pointer",
                          opacity: processing === refund.id ? 0.6 : 1
                        }}
                      >
                        {processing === refund.id ? (
                          <FontAwesomeIcon icon="spinner" spin />
                        ) : (
                          "Approuver"
                        )}
                      </button>
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
