"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Icon from '@/components/ui/Icon';

interface BotRecommendation {
  id: string;
  type: 'performance' | 'security' | 'ux' | 'business' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedTime: string;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
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
    type: '',
    priority: '',
    status: ''
  });

  // Charger les recommandations
  const loadRecommendations = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (botId) params.append('botId', botId);
      if (missionId) params.append('missionId', missionId);
      if (filter.type) params.append('type', filter.type);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`/api/bots/recommendations?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations);
      } else {
        console.error('Erreur lors du chargement des recommandations:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer de nouvelles recommandations
  const generateRecommendations = async () => {
    if (!session?.user?.id) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/bots/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        console.error('Erreur lors de la génération:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Mettre à jour le statut d'une recommandation
  const updateRecommendationStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/bots/recommendations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          implementationNotes: notes
        }),
      });

      if (response.ok) {
        await loadRecommendations();
      } else {
        console.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Supprimer une recommandation
  const deleteRecommendation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recommandation ?')) return;

    try {
      const response = await fetch(`/api/bots/recommendations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRecommendations();
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-500 text-white';
      case 'security': return 'bg-red-500 text-white';
      case 'ux': return 'bg-purple-500 text-white';
      case 'business': return 'bg-green-500 text-white';
      case 'technical': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-500 text-white';
      case 'approved': return 'bg-blue-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
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
            Cliquez sur "Générer" pour créer de nouvelles recommandations basées sur l'analyse du système.
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
                      {' '}{recommendation.effort}
                    </span>
                    {' '}• Temps estimé: {recommendation.estimatedTime}
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

                {/* Notes d'implémentation */}
                {recommendation.implementationNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Notes d'implémentation</h4>
                    <p className="text-gray-700 text-sm">{recommendation.implementationNotes}</p>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>
                    Créé le {new Date(recommendation.createdAt).toLocaleDateString('fr-FR')}
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
