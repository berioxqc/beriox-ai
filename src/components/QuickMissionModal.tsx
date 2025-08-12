"use client";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTheme } from "@/hooks/useTheme";

interface QuickMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated: (missionId: string) => void;
}

export default function QuickMissionModal({ isOpen, onClose, onMissionCreated }: QuickMissionModalProps) {
  const [prompt, setPrompt] = useState("");
  const [details, setDetails] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedAgents, setRecommendedAgents] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [agentReasoning, setAgentReasoning] = useState<string>("");
  const theme = useTheme();

  // Analyser la mission pour recommander des agents
  const analyzeMission = async () => {
    if (!prompt.trim()) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/missions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: prompt,
          context: details
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendedAgents(data.recommendedAgents || []);
        setAgentReasoning(data.reasoning || "");
      } else {
        // Fallback vers des agents par défaut
        setRecommendedAgents(["KarineAI", "HugoAI", "JPBot", "ElodieAI"]);
        setAgentReasoning("Analyse non disponible, utilisation des agents par défaut");
      }
    } catch (error) {
      // Fallback vers des agents par défaut
      setRecommendedAgents(["KarineAI", "HugoAI", "JPBot", "ElodieAI"]);
      setAgentReasoning("Erreur d'apos;analyse, utilisation des agents par défaut");
    } finally {
      setAnalyzing(false);
    }
  };

  const createMission = async () => {
    if (!prompt.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          details: details,
          priority: "auto",
          selectedAgents: recommendedAgents.length > 0 ? recommendedAgents : ["KarineAI", "HugoAI", "JPBot", "ElodieAI"]
        })
      });

      const data = await response.json();

      if (response.ok && data.missionId) {
        setPrompt("");
        setDetails("");
        setRecommendedAgents([]);
        setAgentReasoning("");
        onMissionCreated(data.missionId);
        onClose();
      } else {
        setError(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "32px",
        maxWidth: "600px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <div>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#0a2540",
              margin: "0 0 8px 0",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
            }}>
              🚀 Nouvelle Mission Rapide
            </h2>
            <p style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
            }}>
              Créez une mission en quelques secondes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "24px",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#6b7280"}
            onMouseOut={(e) => e.currentTarget.style.color = "#9ca3af"}
          >
            <Icon name="times" />
          </button>
        </div>

        {/* Formulaire */}
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Mission principale */}
          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              📋 Décrivez votre mission
            </label>
            <input
              type="text"
              placeholder="Ex: Créer un article SEO sur WordPress, Optimiser la vitesse de mon site..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createMission()}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e3e8ee",
                borderRadius: "8px",
                fontSize: "14px",
                background: "white",
                color: "#0a2540",
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}
              onFocus={(e) => e.target.style.borderColor = "#635bff"}
              onBlur={(e) => e.target.style.borderColor = "#e3e8ee"}
              disabled={creating}
            />
          </div>

          {/* Détails optionnels */}
          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              📝 Détails supplémentaires (optionnel)
            </label>
            <textarea
              placeholder="Contexte, contraintes, délais, ressources disponibles..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "12px 16px",
                border: "1px solid #e3e8ee",
                borderRadius: "8px",
                fontSize: "14px",
                background: "white",
                color: "#0a2540",
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                resize: "vertical"
              }}
              onFocus={(e) => e.target.style.borderColor = "#635bff"}
              onBlur={(e) => e.target.style.borderColor = "#e3e8ee"}
              disabled={creating}
            />
          </div>

          {/* Analyse et recommandations d'apos;agents */}
          {prompt.trim() && (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <label style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151"
                }}>
                  🤖 Agents Recommandés
                </label>
                <button
                  onClick={analyzeMission}
                  disabled={analyzing || !prompt.trim()}
                  style={{
                    background: analyzing ? "#9ca3af" : "#635bff",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: analyzing ? "not-allowed" : "pointer",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin">
                        <Icon name="refresh" />
                      </div>
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Icon name="brain" />
                      Analyser
                    </>
                  )}
                </button>
              </div>

              {recommendedAgents.length > 0 && (
                <div style={{
                  background: "#f8fafc",
                  border: "1px solid #e3e8ee",
                  borderRadius: "8px",
                  padding: "16px"
                }}>
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "12px",
                    flexWrap: "wrap"
                  }}>
                    {recommendedAgents.map(agent => (
                      <span key={agent} style={{
                        background: "#e0e7ff",
                        color: "#3730a3",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {agent}
                      </span>
                    ))}
                  </div>
                  {agentReasoning && (
                    <p style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0,
                      fontStyle: "italic"
                    }}>
                      💡 {agentReasoning}
                    </p>
                  )}
                </div>
              )}

              {!recommendedAgents.length && !analyzing && (
                <div style={{
                  background: "#f9fafb",
                  border: "1px solid #e3e8ee",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "14px"
                }}>
                  Cliquez sur "Analyser" pour obtenir des recommandations d'apos;agents optimisées
                </div>
              )}
            </div>
          )}

          {/* Message d'apos;erreur */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              color: "#991b1b",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Icon name="exclamation-triangle" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "8px"
          }}>
            <button
              onClick={onClose}
              disabled={creating}
              style={{
                padding: "12px 24px",
                background: "white",
                color: "#6b7280",
                border: "1px solid #e3e8ee",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: creating ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}
              onMouseOver={(e) => {
                if (!creating) {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.color = "#374151";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e3e8ee";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              Annuler
            </button>
            <button
              onClick={createMission}
              disabled={!prompt.trim() || creating}
              style={{
                padding: "12px 24px",
                background: creating || !prompt.trim() ? "#9ca3af" : "#635bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: creating || !prompt.trim() ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {creating ? (
                <>
                  <div className="animate-spin">
                    <Icon name="refresh" />
                  </div>
                  Création...
                </>
              ) : (
                <>
                  <Icon name="rocket" />
                  Créer la mission
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
