"use client";

import { useState, useEffect } from 'apos;react'apos;;
import { useSession } from 'apos;next-auth/react'apos;;
import Icon from 'apos;@/components/ui/Icon'apos;;

interface BotRecommendation {
  id: string;
  type: 'apos;performance'apos; | 'apos;security'apos; | 'apos;ux'apos; | 'apos;business'apos; | 'apos;technical'apos;;
  priority: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos; | 'apos;critical'apos;;
  title: string;
  description: string;
  impact: string;
  effort: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  estimatedTime: string;
  category: string;
  tags: string[];
  status: 'apos;pending'apos; | 'apos;approved'apos; | 'apos;rejected'apos; | 'apos;implemented'apos;;
  implementationNotes?: string;
  createdAt: string;
  bot?: {
    id: string;
    name: string;
    type: string;
  };
  mission?: {
    id: string;
    title: string;
  };
}

interface BotRecommendationsProps {
  botId?: string;
  missionId?: string;
  autoGenerate?: boolean;
}

export default function BotRecommendations({ 
  botId, 
  missionId, 
  autoGenerate = false 
}: BotRecommendationsProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<BotRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState({
    type: 'apos;'apos;,
    priority: 'apos;'apos;,
    status: 'apos;'apos;
  });

  // Charger les recommandations
  const loadRecommendations = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (botId) params.append('apos;botId'apos;, botId);
      if (missionId) params.append('apos;missionId'apos;, missionId);
      if (filter.type) params.append('apos;type'apos;, filter.type);
      if (filter.priority) params.append('apos;priority'apos;, filter.priority);
      if (filter.status) params.append('apos;status'apos;, filter.status);

      const response = await fetch(`/api/bots/recommendations?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations);
      } else {
        console.error('apos;Erreur lors du chargement des recommandations:'apos;, data.error);
      }
    } catch (error) {
      console.error('apos;Erreur lors du chargement des recommandations:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  // Générer de nouvelles recommandations
  const generateRecommendations = async () => {
    if (!session?.user?.id) return;

    setGenerating(true);
    try {
      const response = await fetch('apos;/api/bots/recommendations'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          botId,
          missionId,
          forceRegenerate: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadRecommendations();
        // Notification de succès
        console.log(`${data.recommendations} recommandations générées`);
      } else {
        console.error('apos;Erreur lors de la génération:'apos;, data.error);
      }
    } catch (error) {
      console.error('apos;Erreur lors de la génération des recommandations:'apos;, error);
    } finally {
      setGenerating(false);
    }
  };

  // Mettre à jour le statut d'apos;une recommandation
  const updateRecommendationStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/bots/recommendations/${id}`, {
        method: 'apos;PATCH'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          status,
          implementationNotes: notes
        }),
      });

      if (response.ok) {
        await loadRecommendations();
      } else {
        console.error('apos;Erreur lors de la mise à jour'apos;);
      }
    } catch (error) {
      console.error('apos;Erreur lors de la mise à jour:'apos;, error);
    }
  };

  // Supprimer une recommandation
  const deleteRecommendation = async (id: string) => {
    if (!confirm('apos;Êtes-vous sûr de vouloir supprimer cette recommandation ?'apos;)) return;

    try {
      const response = await fetch(`/api/bots/recommendations/${id}`, {
        method: 'apos;DELETE'apos;,
      });

      if (response.ok) {
        await loadRecommendations();
      } else {
        console.error('apos;Erreur lors de la suppression'apos;);
      }
    } catch (error) {
      console.error('apos;Erreur lors de la suppression:'apos;, error);
    }
  };

  // Charger les recommandations au montage et quand les filtres changent
  useEffect(() => {
    loadRecommendations();
  }, [session?.user?.id, botId, missionId, filter]);

  // Génération automatique si activée
  useEffect(() => {
    if (autoGenerate && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [autoGenerate, recommendations.length]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'apos;critical'apos;: return 'apos;bg-red-500 text-white'apos;;
      case 'apos;high'apos;: return 'apos;bg-orange-500 text-white'apos;;
      case 'apos;medium'apos;: return 'apos;bg-yellow-500 text-black'apos;;
      case 'apos;low'apos;: return 'apos;bg-green-500 text-white'apos;;
      default: return 'apos;bg-gray-500 text-white'apos;;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'apos;performance'apos;: return 'apos;bg-blue-500 text-white'apos;;
      case 'apos;security'apos;: return 'apos;bg-red-500 text-white'apos;;
      case 'apos;ux'apos;: return 'apos;bg-purple-500 text-white'apos;;
      case 'apos;business'apos;: return 'apos;bg-green-500 text-white'apos;;
      case 'apos;technical'apos;: return 'apos;bg-gray-500 text-white'apos;;
      default: return 'apos;bg-gray-400 text-white'apos;;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'apos;implemented'apos;: return 'apos;bg-green-500 text-white'apos;;
      case 'apos;approved'apos;: return 'apos;bg-blue-500 text-white'apos;;
      case 'apos;rejected'apos;: return 'apos;bg-red-500 text-white'apos;;
      case 'apos;pending'apos;: return 'apos;bg-yellow-500 text-black'apos;;
      default: return 'apos;bg-gray-400 text-white'apos;;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'apos;high'apos;: return 'apos;text-red-500'apos;;
      case 'apos;medium'apos;: return 'apos;text-yellow-500'apos;;
      case 'apos;low'apos;: return 'apos;text-green-500'apos;;
      default: return 'apos;text-gray-500'apos;;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-2 text-gray-600">Chargement des recommandations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres et actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommandations IA</h2>
          <p className="text-gray-600">
            {recommendations.length} recommandation(s) trouvée(s)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Filtres */}
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Tous les types</option>
            <option value="performance">Performance</option>
            <option value="security">Sécurité</option>
            <option value="ux">UX</option>
            <option value="business">Business</option>
            <option value="technical">Technique</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Toutes les priorités</option>
            <option value="critical">Critique</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
            <option value="implemented">Implémenté</option>
          </select>

          {/* Bouton de génération */}
          <button
            onClick={generateRecommendations}
            disabled={generating}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Génération...
              </>
            ) : (
              <>
                <Icon name="refresh" size={16} />
                Générer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Liste des recommandations */}
      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="lightbulb" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune recommandation
          </h3>
          <p className="text-gray-600 mb-4">
            Cliquez sur "Générer" pour créer de nouvelles recommandations basées sur l'apos;analyse du système.
          </p>
          <button
            onClick={generateRecommendations}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            Générer des recommandations
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Header de la recommandation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(recommendation.type)}`}>
                      {recommendation.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recommendation.status)}`}>
                      {recommendation.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {recommendation.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {recommendation.category} • Effort: 
                    <span className={`font-medium ${getEffortColor(recommendation.effort)}`}>
                      {'apos; 'apos;}{recommendation.effort}
                    </span>
                    {'apos; 'apos;}• Temps estimé: {recommendation.estimatedTime}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={recommendation.status}
                    onChange={(e) => updateRecommendationStatus(recommendation.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                    <option value="implemented">Implémenté</option>
                  </select>

                  <button
                    onClick={() => deleteRecommendation(recommendation.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Supprimer"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>

              {/* Contenu de la recommandation */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-700 text-sm">{recommendation.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Impact</h4>
                  <p className="text-gray-700 text-sm">{recommendation.impact}</p>
                </div>

                {/* Tags */}
                {recommendation.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes d'apos;implémentation */}
                {recommendation.implementationNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Notes d'apos;implémentation</h4>
                    <p className="text-gray-700 text-sm">{recommendation.implementationNotes}</p>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>
                    Créé le {new Date(recommendation.createdAt).toLocaleDateString('apos;fr-FR'apos;)}
                  </span>
                  {recommendation.bot && (
                    <span>Bot: {recommendation.bot.name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
