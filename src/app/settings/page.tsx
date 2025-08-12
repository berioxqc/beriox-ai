"use client"
import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("")
  const [notionKey, setNotionKey] = useState("")
  const [slackWebhook, setSlackWebhook] = useState("")
  const [emailSettings, setEmailSettings] = useState({
    provider: "resend",
    apiKey: "",
    fromEmail: ""
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  // Charger les paramètres depuis localStorage au démarrage
  useEffect(() => {
    const savedSettings = localStorage.getItem('beriox-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setOpenaiKey(settings.openaiKey || "")
      setNotionKey(settings.notionKey || "")
      setSlackWebhook(settings.slackWebhook || "")
      setEmailSettings(settings.emailSettings || {
        provider: "resend",
        apiKey: "",
        fromEmail: ""
      })
    }
  }, [])
  const saveSettings = () => {
    setLoading(true)
    const settings = {
      openaiKey,
      notionKey,
      slackWebhook,
      emailSettings
    }
    localStorage.setItem('beriox-settings', JSON.stringify(settings))
    setSaved(true)
    setLoading(false)
    // Reset le feedback après 3 secondes
    setTimeout(() => setSaved(false), 3000)
  }
  const resetSettings = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer tous les paramètres ?")) {
      localStorage.removeItem('beriox-settings')
      setOpenaiKey("")
      setNotionKey("")
      setSlackWebhook("")
      setEmailSettings({
        provider: "resend",
        apiKey: "",
        fromEmail: ""
      })
    }
  }
  const testConnection = async (service: string) => {
    alert(`Test de connexion pour ${service} - Fonctionnalité à venir !`)
  }
  const headerActions = (
    <div style={{
      display: "flex",
      gap: "12px",
      alignItems: "center"
    }}>
      <div style={{
        background: "#e0e7ff",
        color: "#3b82f6",
        padding: "10px 16px",
        borderRadius: 12,
        fontSize: "14px",
        fontWeight: "500",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        🔧 Configuration
      </div>
      <a
        href="/cookies"
        style={{
          background: "#fef3c7",
          color: "#d97706",
          padding: "10px 16px",
          borderRadius: 12,
          fontSize: "14px",
          fontWeight: "500",
          textDecoration: "none",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#fde68a"
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "#fef3c7"
        }}
      >
        🍪 Cookies
      </a>
    </div>
  )
  return (
    <AuthGuard>
      <Layout
        title="Paramètres"
        subtitle="Configurez vos clés API et intégrations pour activer toutes les fonctionnalités de Beriox AI"
        headerActions={headerActions}
      >
        <div style={{ padding: "24px 40px" }}>

          {/* Feedback de sauvegarde */}
          {saved && (
            <div style={{
              background: "#d1fae5",
              border: "1px solid #10b981",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              textAlign: "center",
              color: "#065f46",
              fontWeight: "500",
              fontSize: "14px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              ✅ Paramètres sauvegardés avec succès !
            </div>
          )}

          {/* Section OpenAI */}
          <div style={{
            background: "white",
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            border: "1px solid #e3e8ee",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20
            }}>
              <div style={{
                fontSize: "24px",
                opacity: 0.8
              }}>
                🤖
              </div>
              <div>
                <h2 style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  color: "#0a2540", 
                  margin: 0,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  OpenAI Configuration
                </h2>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#8898aa", 
                  margin: "4px 0 0 0",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Clé API pour les agents IA et la génération de contenu
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8
                }}>
                  Clé API OpenAI
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid rgba(90, 95, 202, 0.2)",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5a5fca"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(90, 95, 202, 0.2)"}
                />
              </div>
              <button
                onClick={() => testConnection("OpenAI")}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                🧪 Tester
              </button>
            </div>
          </div>

          {/* Section Notion */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #000000, #333333)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                📝
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333", margin: 0 }}>
                  Notion Integration
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#666", margin: "4px 0 0 0" }}>
                  Archivage automatique des missions et rapports
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8
                }}>
                  Token d'intégration Notion
                </label>
                <input
                  type="password"
                  placeholder="secret_..."
                  value={notionKey}
                  onChange={e => setNotionKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid rgba(90, 95, 202, 0.2)",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5a5fca"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(90, 95, 202, 0.2)"}
                />
              </div>
              <button
                onClick={() => testConnection("Notion")}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #000000, #333333)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                🧪 Tester
              </button>
            </div>
          </div>

          {/* Section Slack */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4a154b, #350d36)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                💬
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333", margin: 0 }}>
                  Slack Notifications
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#666", margin: "4px 0 0 0" }}>
                  Notifications automatiques des missions terminées
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8
                }}>
                  Webhook URL Slack
                </label>
                <input
                  type="password"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={e => setSlackWebhook(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid rgba(90, 95, 202, 0.2)",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5a5fca"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(90, 95, 202, 0.2)"}
                />
              </div>
              <button
                onClick={() => testConnection("Slack")}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #4a154b, #350d36)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                🧪 Tester
              </button>
            </div>
          </div>

          {/* Section Email */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 16,
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                📧
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333", margin: 0 }}>
                  Email Configuration
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#666", margin: "4px 0 0 0" }}>
                  Envoi automatique des rapports finaux par email
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 2fr 1fr", alignItems: "end" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8
                }}>
                  Fournisseur
                </label>
                <select
                  value={emailSettings.provider}
                  onChange={e => setEmailSettings({...emailSettings, provider: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid rgba(90, 95, 202, 0.2)",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#333",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="resend">Resend</option>
                  <option value="nodemailer">Nodemailer</option>
                </select>
              </div>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8
                }}>
                  Clé API / Configuration
                </label>
                <input
                  type="password"
                  placeholder={emailSettings.provider === "resend" ? "re_..." : "Configuration SMTP"}
                  value={emailSettings.apiKey}
                  onChange={e => setEmailSettings({...emailSettings, apiKey: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid rgba(90, 95, 202, 0.2)",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5a5fca"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(90, 95, 202, 0.2)"}
                />
              </div>
              <button
                onClick={() => testConnection("Email")}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                🧪 Tester
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#333",
                marginBottom: 8
              }}>
                Email expéditeur
              </label>
              <input
                type="email"
                placeholder="noreply@votre-domaine.com"
                value={emailSettings.fromEmail}
                onChange={e => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid rgba(90, 95, 202, 0.2)",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "#333",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#5a5fca"}
                onBlur={(e) => e.target.style.borderColor = "rgba(90, 95, 202, 0.2)"}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            gap: 16,
            justifyContent: "center"
          }}>
            <button
              onClick={resetSettings}
              style={{
                padding: "16px 32px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)"
              }}
            >
              🗑️ Réinitialiser
            </button>
            <button
              onClick={saveSettings}
              disabled={loading}
              style={{
                padding: "16px 48px",
                background: loading 
                  ? "linear-gradient(135deg, #ccc, #999)" 
                  : "linear-gradient(135deg, #5a5fca, #4c51bf)",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: loading 
                  ? "none" 
                  : "0 4px 16px rgba(90, 95, 202, 0.3)"
              }}
            >
              {loading ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
            </button>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  )
}
