"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Icon from "@/components/ui/Icon"

type Agent = {
  id: string
  name: string
  role: string
  description: string
  active: boolean
  icon: string
  color: string
  category: 'marketing' | 'creative' | 'analytics' | 'content' | 'sales' | 'productivity' | 'technical' | 'system'
  skills: string[]
  performance: number
  lastUsed?: Date
}

const defaultAgents: Agent[] = [
  {
    id: "karine",
    name: "KarineAI",
    role: "Stratège Marketing & Communication",
    description: "La stratège en chef ! KarineAI analyse votre marché, identifie les opportunités et conçoit des stratégies marketing qui font mouche.",
    active: true,
    icon: "🎯",
    color: "#635bff",
    category: "marketing",
    skills: ["Stratégie", "Analyse marché", "Positionnement", "Communication"],
    performance: 95,
    lastUsed: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: "hugo",
    name: "HugoAI",
    role: "Créatif & Designer",
    description: "L'âme créative de l'équipe ! HugoAI transforme vos idées en concepts visuels percutants et crée des contenus qui marquent les esprits.",
    active: true,
    icon: "🎨",
    color: "#00d924",
    category: "creative",
    skills: ["Design", "Créativité", "Branding", "UX/UI"],
    performance: 92,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: "jpbot",
    name: "JPBot",
    role: "Analyste Data & Performance",
    description: "Le cerveau analytique de Beriox ! JPBot décortique vos données, identifie les patterns et optimise vos performances avec une précision chirurgicale.",
    active: true,
    icon: "📊",
    color: "#0570de",
    category: "analytics",
    skills: ["Analytics", "Data", "ROI", "Optimisation"],
    performance: 98,
    lastUsed: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: "elodie",
    name: "ElodieAI",
    role: "Rédactrice & Content Manager",
    description: "La plume magique qui donne vie à vos idées ! ElodieAI maîtrise l'art des mots pour créer des contenus qui convertissent et engagent votre audience.",
    active: true,
    icon: "✍️",
    color: "#f79009",
    category: "content",
    skills: ["Rédaction", "SEO", "Storytelling", "Content Strategy"],
    performance: 89,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 4)
  },
  {
    id: "clara",
    name: "ClaraLaCloseuse",
    role: "Experte Conversion & Closing",
    description: "La reine du closing ! ClaraLaCloseuse transforme vos prospects en clients fidèles grâce à ses techniques de persuasion redoutables.",
    active: false,
    icon: "💰",
    color: "#df1b41",
    category: "sales",
    skills: ["Conversion", "Closing", "Persuasion", "CRM"],
    performance: 87,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
  },
  {
    id: "faucon",
    name: "FauconLeMaitreFocus",
    role: "Product Manager & Stratège Produit",
    description: "Le maître de la stratégie produit ! FauconLeMaitreFocus optimise vos processus, améliore l'expérience utilisateur et maximise votre ROI.",
    active: true,
    icon: "🦅",
    color: "#8b5cf6",
    category: "productivity",
    skills: ["Product Management", "Processus", "UX", "Stratégie"],
    performance: 94,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 6)
  }
]

export default function AgentsPage() {
  const { data: session, status } = useSession()
  const [agents, setAgents] = useState<Agent[]>(defaultAgents)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // Si pas connecté, afficher un message
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Accès requis</h1>
          <p className="text-xl mb-8">Connectez-vous pour accéder à votre équipe IA</p>
          <button 
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  // État de chargement
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/30 border-t-purple-400 mx-auto mb-4" />
          <p className="text-lg">Chargement de votre équipe IA...</p>
        </div>
      </div>
    )
  }

  const categories = [
    { id: 'all', name: 'Tous', icon: '👥' },
    { id: 'marketing', name: 'Marketing', icon: '🎯' },
    { id: 'creative', name: 'Créatif', icon: '🎨' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'content', name: 'Content', icon: '✍️' },
    { id: 'sales', name: 'Ventes', icon: '💰' },
    { id: 'productivity', name: 'Productivité', icon: '⚡' }
  ]

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-500'
    if (performance >= 85) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusColor = (active: boolean) => {
    return active ? 'bg-green-500' : 'bg-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="users" className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Équipe IA</h1>
                <p className="text-purple-200">Vos agents intelligents spécialisés</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                <Icon name="plus" className="mr-2" size={16} />
                Nouvel Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et recherche */}
        <div className="mb-8 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Icon name="search" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-200" size={20} />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-lg text-purple-200 hover:bg-white/20 border border-white/20'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des agents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              {/* Header de l'agent */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: agent.color + '20' }}
                  >
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                    <p className="text-purple-200 text-sm">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.active)}`} />
                  <span className="text-xs text-purple-200">
                    {agent.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-purple-200 text-sm mb-4 leading-relaxed">
                {agent.description}
              </p>

              {/* Compétences */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">Compétences</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-600/20 text-purple-200 text-xs rounded-lg border border-purple-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                  {agent.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-600/20 text-gray-300 text-xs rounded-lg">
                      +{agent.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Performance et actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-purple-200">Performance:</span>
                  <span className={`text-sm font-semibold ${getPerformanceColor(agent.performance)}`}>
                    {agent.performance}%
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200">
                    <Icon name="play" className="text-purple-200" size={16} />
                  </button>
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200">
                    <Icon name="settings" className="text-purple-200" size={16} />
                  </button>
                </div>
              </div>

              {/* Dernière utilisation */}
              {agent.lastUsed && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-purple-200">
                    Dernière utilisation: {agent.lastUsed.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message si aucun agent trouvé */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="search" className="text-purple-200" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun agent trouvé</h3>
            <p className="text-purple-200">Essayez de modifier vos filtres ou votre recherche</p>
          </div>
        )}
      </main>
    </div>
  )
}