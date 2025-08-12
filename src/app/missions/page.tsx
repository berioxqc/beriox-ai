"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useAuthGuard, LimitedContentWrapper, LoginPrompt } from "@/hooks/useAuthGuard";

type Mission = {
  id: string;
  objective: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string | null;
  priority?: string | null;
  notionPageId?: string | null;
};

export default function MissionsPage() {
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [orchestrating, setOrchestrating] = useState<string | null>(null);

  async function fetchMissions() {
    try {
      setLoading(true);
      const res = await fetch("/api/missions");
      const json = await res.json();
      setMissions(json.missions || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMissions();
    }
  }, [isAuthenticated]);

  async function handleOrchestrateMission(missionId: string) {
    try {
      setOrchestrating(missionId);
      
      const response = await fetch("/api/missions/orchestrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ missionId }),
      });

      const result = await response.json();

      if (result.success) {
        alert("🎯 Orchestration IA lancée avec succès !\n\n" + 
              `Confiance: ${result.plan.confidence}%\n` +
              `Durée estimée: ${result.plan.estimatedDuration} minutes\n` +
              `Agents sélectionnés: ${result.plan.agents.map((a: any) => a.name).join(", ")}\n\n` +
              "Les agents travaillent maintenant sur votre mission !");
        
        // Recharger les missions pour voir les changements
        await fetchMissions();
      } else {
        alert("❌ Erreur lors de l'orchestration: " + (result.error || "Erreur inconnue"));
      }
    } catch (error) {
      console.error("Erreur orchestration:", error);
      alert("❌ Erreur lors de l'orchestration: " + (error instanceof Error ? error.message : "Erreur inconnue"));
    } finally {
      setOrchestrating(null);
    }
  }

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const matchesSearch = mission.objective.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || mission.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || mission.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [missions, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "#8898aa";
      case "split": return "#f79009";
      case "in_progress": return "#0570de";
      case "compiled": return "#00d924";
      case "archived": return "#00a86b";
      case "notified": return "#00d924";
      case "failed": return "#df1b41";
      default: return "#8898aa";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "Reçue";
      case "split": return "Découpée";
      case "in_progress": return "En cours";
      case "compiled": return "Compilée";
      case "archived": return "Archivée";
      case "notified": return "Terminée";
      case "failed": return "Échouée";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#df1b41";
      case "medium": return "#f79009";
      case "low": return "#00a86b";
      default: return "#8898aa";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Haute";
      case "medium": return "Moyenne";
      case "low": return "Basse";
      default: return "—";
    }
  };

  const getMissionIcon = (objective: string) => {
    const lower = objective.toLowerCase();
    if (lower.includes('marketing') || lower.includes('campagne')) return '📊';
    if (lower.includes('développement') || lower.includes('site') || lower.includes('app')) return '💻';
    if (lower.includes('contenu') || lower.includes('article') || lower.includes('blog')) return '✍️';
    if (lower.includes('design') || lower.includes('logo') || lower.includes('graphique')) return '🎨';
    if (lower.includes('vente') || lower.includes('commercial')) return '💰';
    if (lower.includes('formation') || lower.includes('cours')) return '🎓';
    return '🎯';
  };

  const notionUrl = (mission: Mission) =>
    mission.notionPageId ? `https://www.notion.so/${mission.notionPageId.replace(/-/g, "")}` : null;

  const headerActions = (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <button
        onClick={fetchMissions}
        disabled={loading}
        style={{
          padding: "10px 16px",
          background: loading ? "#8898aa" : "white",
          color: loading ? "white" : "#425466",
          border: "1px solid #e3e8ee",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        onMouseOver={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = "#c7d2fe";
            e.currentTarget.style.color = "#0a2540";
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = "#e3e8ee";
            e.currentTarget.style.color = "#425466";
          }
        }}
      >
        {loading ? "⏳" : "🔄"} Actualiser
      </button>
      <div style={{
        background: "#e0e7ff",
        color: "#3b82f6",
        padding: "10px 16px",
        borderRadius: 12,
        fontSize: "14px",
        fontWeight: "500",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {filteredMissions.length} mission{filteredMissions.length !== 1 ? &apos;s&apos; : &apos;&apos;}
      </div>
    </div>
  );

  // Contenu limité pour les utilisateurs non connectés
  const limitedContent = (
    <LoginPrompt 
      message="Connectez-vous pour accéder à vos missions et utiliser l&apos;orchestration IA"
      showSignUp={true}
    />
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <LimitedContentWrapper 
      isAuthenticated={isAuthenticated}
      limitedContent={limitedContent}
    >
      <Layout
        title="Missions"
        subtitle="Gérez et suivez toutes vos missions Beriox AI"
        headerActions={headerActions}
      >
      {/* Filtres et Actions */}
      <div style={{
        background: "white",
        borderRadius: 8,
        padding: 24,
        marginBottom: 24,
        border: "1px solid #e3e8ee",
        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr auto",
          gap: 16,
          alignItems: "end"
        }}>
          {/* Recherche */}
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#425466",
              marginBottom: 6,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Rechercher
            </label>
            <input
              type="text"
              placeholder="🔍 Rechercher par objectif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e3e8ee",
                borderRadius: 6,
                fontSize: "14px",
                color: "#0a2540",
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, &apos;Segoe UI&apos;, Roboto, sans-serif"
              }}
              onFocus={(e) => e.target.style.borderColor = "#635bff"}
              onBlur={(e) => e.target.style.borderColor = "#e3e8ee"}
            />
          </div>

          {/* Filtre Statut */}
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#425466",
              marginBottom: 6,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e3e8ee",
                borderRadius: 6,
                fontSize: "14px",
                color: "#0a2540",
                background: "white",
                outline: "none",
                cursor: "pointer",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="received">Reçue</option>
              <option value="split">Découpée</option>
              <option value="in_progress">En cours</option>
              <option value="compiled">Compilée</option>
              <option value="archived">Archivée</option>
              <option value="notified">Terminée</option>
              <option value="failed">Échouée</option>
            </select>
          </div>

          {/* Filtre Priorité */}
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#425466",
              marginBottom: 6,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Priorité
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e3e8ee",
                borderRadius: 6,
                fontSize: "14px",
                color: "#0a2540",
                background: "white",
                outline: "none",
                cursor: "pointer",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              <option value="all">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>

          {/* Reset */}
          {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              style={{
                padding: "10px 16px",
                background: "white",
                color: "#425466",
                border: "1px solid #e3e8ee",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, &apos;Segoe UI&apos;, Roboto, sans-serif"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#fecaca";
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.color = "#dc2626";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e3e8ee";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#425466";
              }}
            >
              Effacer filtres
            </button>
          )}
        </div>
      </div>

      {/* Liste des missions */}
      <div style={{
        background: "white",
        borderRadius: 8,
        border: "1px solid #e3e8ee",
        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: 60,
            color: "#8898aa",
            fontSize: "14px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            ⏳ Chargement des missions...
          </div>
        ) : error ? (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: "#df1b41",
            fontSize: "14px",
            background: "rgba(223, 27, 65, 0.05)",
            border: "1px solid rgba(223, 27, 65, 0.2)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            ⚠️ {error}
          </div>
        ) : filteredMissions.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 80,
            color: "#8898aa"
          }}>
            <div style={{ fontSize: "48px", marginBottom: 16 }}>🎯</div>
            <div style={{
              fontSize: "16px",
              marginBottom: 8,
              fontWeight: "500",
              color: "#425466",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Aucune mission trouvée avec ces filtres
            </div>
            <div style={{
              fontSize: "14px",
              color: "#8898aa",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Essayez d&apos;ajuster vos critères de recherche
            </div>
          </div>
        ) : (
          <div>
            {filteredMissions.map((mission, index) => (
              <div key={mission.id} style={{
                padding: "20px 24px",
                borderBottom: index < filteredMissions.length - 1 ? "1px solid #f6f9fc" : "none",
                transition: "background-color 0.2s",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto auto auto",
                gap: 20,
                alignItems: "center"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f7f9fc"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                  {/* Icône */}
                  <div style={{
                    fontSize: "20px",
                    opacity: 0.8
                  }}>
                    {getMissionIcon(mission.objective)}
                  </div>

                  {/* Titre et date */}
                  <div>
                    <div style={{
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#0a2540",
                      marginBottom: 4,
                      lineHeight: "1.4",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      {mission.objective}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "#8898aa",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      Créée le {new Date(mission.createdAt).toLocaleDateString(&apos;fr-FR&apos;)}
                    </div>
                  </div>

                  {/* Statut */}
                  <div style={{
                    background: `${getStatusColor(mission.status)}15`,
                    color: getStatusColor(mission.status),
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: "12px",
                    fontWeight: "500",
                    textAlign: "center",
                    minWidth: 80,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {getStatusLabel(mission.status)}
                  </div>

                  {/* Priorité */}
                  <div style={{
                    background: `${getPriorityColor(mission.priority || "")}15`,
                    color: getPriorityColor(mission.priority || ""),
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: "12px",
                    fontWeight: "500",
                    textAlign: "center",
                    minWidth: 70,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    {getPriorityLabel(mission.priority || "")}
                  </div>

                  {/* Boutons d'action */}
                  <div style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center"
                  }}>
                    {/* Bouton Orchestration IA */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOrchestrateMission(mission.id);
                      }}
                      disabled={orchestrating === mission.id}
                      style={{
                        background: orchestrating === mission.id ? "#e5e7eb" : "#8b5cf6",
                        color: orchestrating === mission.id ? "#6b7280" : "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: orchestrating === mission.id ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        fontFamily: "-apple-system, BlinkMacSystemFont, &apos;Segoe UI&apos;, Roboto, sans-serif"
                      }}
                      onMouseOver={(e) => {
                        if (orchestrating !== mission.id) {
                          e.currentTarget.style.background = "#7c3aed";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (orchestrating !== mission.id) {
                          e.currentTarget.style.background = "#8b5cf6";
                        }
                      }}
                    >
                      {orchestrating === mission.id ? "⏳ Orchestration..." : "🤖 Orchestrer"}
                    </button>

                    {/* Bouton Voir détails */}
                    <Link href={`/missions/${mission.id}`} style={{ textDecoration: "none" }}>
                      <button
                        style={{
                          background: "transparent",
                          color: "#8898aa",
                          border: "1px solid #e3e8ee",
                          padding: "8px 12px",
                          borderRadius: 6,
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#f7f9fc";
                          e.currentTarget.style.borderColor = "#8898aa";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "#e3e8ee";
                        }}
                      >
                        Voir
                      </button>
                    </Link>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
      </Layout>
    </LimitedContentWrapper>
  );
}