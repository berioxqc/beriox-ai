"use client"
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Icon from '@/components/ui/Icon'
import BotRecommendations from '@/components/bots/BotRecommendations'
interface BotStats {
  botId: string
  botName: string
  botType: string
  capabilities: string[]
  totalRecommendations: number
  pendingRecommendations: number
  implementedRecommendations: number
  lastAnalysis?: string
  autoRecommendations: boolean
}

export default function BotsDashboardPage() {
  const { data: session } = useSession()
  const [botStats, setBotStats] = useState<BotStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  // Charger les statistiques des bots
  const loadBotStats = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const response = await fetch('/api/bots/stats')
      const data = await response.json()
      if (response.ok) {
        setBotStats(data.stats)
      } else {
        console.error('Erreur lors du chargement des stats:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }
  // Générer des recommandations pour tous les bots
  const generateAllRecommendations = async () => {
    if (!session?.user?.id) return
    setGenerating(true)
    try {
      const response = await fetch('/api/bots/recommendations/generate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        await loadBotStats()
        console.log(`${data.totalRecommendations} recommandations générées`)
      } else {
        console.error('Erreur lors de la génération:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      setGenerating(false)
    }
  }
  // Charger les stats au montage
  useEffect(() => {
    loadBotStats()
  }, [session?.user?.id])
  const getBotTypeColor = (type: string) => {
    switch (type) {
      case 'analyst': return 'bg-blue-500'
      case 'developer': return 'bg-green-500'
      case 'business': return 'bg-purple-500'
      case 'qa': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }
  const getCapabilityColor = (capability: string) => {
    switch (capability) {
      case 'performance': return 'bg-blue-100 text-blue-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'ux': return 'bg-purple-100 text-purple-800'
      case 'business': return 'bg-green-100 text-green-800'
      case 'technical': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard des Bots IA
          </h1>
          <p className="text-gray-600">
            Gérez vos bots IA et leurs recommandations intelligentes
          </p>
        </div>

        {/* Actions globales */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Actions Globales
              </h2>
              <p className="text-sm text-gray-600">
                Générez des recommandations pour tous les bots
              </p>
            </div>
            <button
              onClick={generateAllRecommendations}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Icon name="refresh" size={16} />
                  Générer toutes les recommandations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grille des bots */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {botStats.map((bot) => (
            <div
              key={bot.botId}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBot(bot.botId)}
            >
              <div className="p-6">
                {/* Header du bot */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getBotTypeColor(bot.botType)} flex items-center justify-center`}>
                      <Icon name="bot" size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{bot.botName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{bot.botType}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${bot.autoRecommendations ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>

                {/* Capacités */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Capacités:</p>
                  <div className="flex flex-wrap gap-1">
                    {bot.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className={`px-2 py-1 rounded text-xs font-medium ${getCapabilityColor(capability)}`}
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{bot.totalRecommendations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">En attente:</span>
                    <span className="font-medium text-yellow-600">{bot.pendingRecommendations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Implémentées:</span>
                    <span className="font-medium text-green-600">{bot.implementedRecommendations}</span>
                  </div>
                </div>

                {/* Dernière analyse */}
                {bot.lastAnalysis && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Dernière analyse: {new Date(bot.lastAnalysis).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recommandations du bot sélectionné */}
        {selectedBot && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommandations de {botStats.find(b => b.botId === selectedBot)?.botName}
                </h2>
                <button
                  onClick={() => setSelectedBot(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <BotRecommendations botId={selectedBot} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
