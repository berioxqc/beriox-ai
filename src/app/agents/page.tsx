"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Icon from "@/components/ui/Icon";

type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
  active: boolean;
  icon: string;
  color: string;
  category: 'marketing' | 'creative' | 'analytics' | 'content' | 'sales' | 'productivity' | 'technical' | 'system';
  skills: string[];
  performance: number;
  lastUsed?: Date;
};

type SpecializedAgent = {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'beta' | 'premium' | 'enterprise';
  icon: string;
  color: string;
  category: 'intelligence' | 'automation' | 'analysis' | 'optimization';
  capabilities: string[];
  complexity: 'basic' | 'advanced' | 'expert';
  lastUpdated: Date;
};

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
    role: "Coach Productivité & Focus",
    description: "Le maître du focus absolu ! FauconLeMaitreFocus vous aide à rester concentré sur l'essentiel et à maximiser votre productivité.",
    active: false,
    icon: "🦅",
    color: "#8898aa",
    category: "productivity",
    skills: ["Productivité", "Focus", "Gestion temps", "Priorisation"],
    performance: 91,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  },
  {
    id: "speedbot",
    name: "SpeedBot",
    role: "Optimiseur Performance",
    description: "L'expert de la vitesse ! SpeedBot analyse et optimise vos performances techniques pour des résultats ultra-rapides.",
    active: false,
    icon: "⚡",
    color: "#ff6b35",
    category: "technical",
    skills: ["Performance", "Optimisation", "Monitoring", "Debugging"],
    performance: 94,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: "securitybot",
    name: "SecurityBot",
    role: "Expert Sécurité",
    description: "Le gardien de la sécurité ! SecurityBot protège vos données et systèmes avec une vigilance constante.",
    active: false,
    icon: "🔒",
    color: "#e74c3c",
    category: "technical",
    skills: ["Sécurité", "Audit", "Protection", "Conformité"],
    performance: 96,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
  },
  {
    id: "prioritybot",
    name: "PriorityBot",
    role: "Gestionnaire de Priorités",
    description: "Le maître des priorités ! PriorityBot analyse vos tâches et vous aide à vous concentrer sur ce qui compte vraiment.",
    active: true,
    icon: "🎯",
    color: "#9b59b6",
    category: "productivity",
    skills: ["Priorisation", "Analyse", "Décision", "Organisation"],
    performance: 93,
    lastUsed: new Date(Date.now() - 1000 * 60 * 10)
  },
  {
    id: "competitorbot",
    name: "CompetitorBot",
    role: "Expert Veille Concurrentielle",
    description: "L'espion stratégique ! CompetitorBot surveille vos concurrents avec SimilarWeb et SEMrush, analyse leurs performances, identifie les opportunités et vous alerte des changements importants.",
    active: false,
    icon: "🔍",
    color: "#10b981",
    category: "marketing",
    skills: ["Veille", "Concurrence", "Analyse", "Alertes"],
    performance: 88,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
  }
];

// Nouveaux agents spécialisés avancés
const specializedAgents: SpecializedAgent[] = [
  {
    id: "radar-fox",
    name: "RadarFoxAI",
    role: "Stratège de Veille Ultra-Précis",
    description: "Analyse les concurrents et le marché en temps réel avec une précision chirurgicale. Détecte les opportunités cachées et les menaces émergentes.",
    status: "premium",
    icon: "🦊",
    color: "#8b5cf6",
    category: "intelligence",
    capabilities: ["Veille concurrentielle", "Analyse de marché", "Détection de tendances", "Alertes proactives"],
    complexity: "advanced",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: "insight-pulse",
    name: "InsightPulseBot",
    role: "Détecteur d'Insights Avancés",
    description: "Transforme vos données brutes en insights actionnables. Identifie les patterns cachés et génère des recommandations stratégiques.",
    status: "premium",
    icon: "💡",
    color: "#06b6d4",
    category: "analysis",
    capabilities: ["Analyse de données", "Détection de patterns", "Recommandations", "Prédictions"],
    complexity: "advanced",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: "echo-brand",
    name: "EchoBrandAI",
    role: "Architecte d'Identité de Marque",
    description: "Crée et optimise votre identité de marque avec une approche data-driven. Assure la cohérence sur tous les canaux.",
    status: "enterprise",
    icon: "🎭",
    color: "#f59e0b",
    category: "optimization",
    capabilities: ["Branding", "Cohérence visuelle", "Analyse de perception", "Optimisation"],
    complexity: "expert",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: "trend-sculptor",
    name: "TrendSculptorBot",
    role: "Sculpteur de Tendances",
    description: "Anticipe et façonne les tendances de votre secteur. Transforme les insights en stratégies d'innovation.",
    status: "enterprise",
    icon: "🎨",
    color: "#ec4899",
    category: "intelligence",
    capabilities: ["Anticipation", "Innovation", "Stratégie", "Créativité"],
    complexity: "expert",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 18)
  },
  {
    id: "conversion-hacker",
    name: "ConversionHackerAI",
    role: "Hacker de Conversion",
    description: "Optimise vos taux de conversion avec des techniques avancées d'A/B testing et d'analyse comportementale.",
    status: "premium",
    icon: "🚀",
    color: "#10b981",
    category: "optimization",
    capabilities: ["A/B Testing", "Analyse comportementale", "Optimisation", "ROI"],
    complexity: "advanced",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 8)
  }
];

const agentPackages = [
  {
    id: "startup",
    name: "Pack Essentiel",
    description: "KarineAI, HugoAI, JPBot et ElodieAI : les 4 piliers pour démarrer fort !",
    agents: ["karine", "hugo", "jpbot", "elodie"],
    color: "#635bff"
  },
  {
    id: "growth",
    name: "Pack Business",
    description: "L'équipe essentielle + ClaraLaCloseuse pour booster vos conversions",
    agents: ["karine", "hugo", "jpbot", "elodie", "clara"],
    color: "#00d924"
  },
  {
    id: "technical",
    name: "Pack Technique",
    description: "SpeedBot et SecurityBot pour une performance et sécurité optimales",
    agents: ["speedbot", "securitybot"],
    color: "#e74c3c"
  },
  {
    id: "enterprise",
    name: "Dream Team Complète",
    description: "Toute la bande au complet : tous les agents workflow mobilisés !",
    agents: ["karine", "hugo", "jpbot", "elodie", "clara", "faucon", "speedbot", "securitybot"],
    color: "#0570de"
  }
];

const categories = [
  { id: 'all', name: 'Tous', color: '#6b7280' },
  { id: 'marketing', name: 'Marketing', color: '#635bff' },
  { id: 'creative', name: 'Créatif', color: '#00d924' },
  { id: 'analytics', name: 'Analytics', color: '#0570de' },
  { id: 'content', name: 'Content', color: '#f79009' },
  { id: 'sales', name: 'Sales', color: '#df1b41' },
  { id: 'productivity', name: 'Productivité', color: '#8898aa' },
  { id: 'technical', name: 'Technique', color: '#e74c3c' },
  { id: 'system', name: 'Système', color: '#ff6b35' }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [specializedAgentsList, setSpecializedAgentsList] = useState<SpecializedAgent[]>(specializedAgents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "performance" | "lastUsed" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeTab, setActiveTab] = useState<"workflow" | "specialized">("workflow");

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, active: !agent.active } : agent
    ));
  };

  const applyPackage = (packageId: string) => {
    const package_ = agentPackages.find(p => p.id === packageId);
    if (package_) {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        active: package_.agents.includes(agent.id)
      })));
    }
  };

  const saveConfiguration = async () => {
    try {
      const activeAgents = agents.filter(agent => agent.active).map(agent => agent.name);
      
      const response = await fetch('/api/agents/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agents: activeAgents }),
      });

      if (response.ok) {
        console.log('Configuration sauvegardée avec succès');
      } else {
        console.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Filtrage et tri des agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(agent.category);
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "performance":
        comparison = b.performance - a.performance;
        break;
      case "lastUsed":
        comparison = (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return "text-green-600";
    if (performance >= 85) return "text-blue-600";
    if (performance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const formatLastUsed = (date?: Date) => {
    if (!date) return "Jamais";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'beta':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">BETA</span>;
      case 'premium':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">PREMIUM</span>;
      case 'enterprise':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">ENTERPRISE</span>;
      default:
        return null;
    }
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'basic':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">BASIC</span>;
      case 'advanced':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">ADVANCED</span>;
      case 'expert':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">EXPERT</span>;
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <Layout 
        title="Équipe IA" 
        subtitle="Gérez vos agents intelligents et optimisez votre workflow"
        headerActions={
          <button
            onClick={saveConfiguration}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Sauvegarder
          </button>
        }
      >
        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("workflow")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "workflow"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Agents Workflow
              </button>
              <button
                onClick={() => setActiveTab("specialized")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "specialized"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Agents Spécialisés
                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">NOUVEAU</span>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "workflow" ? (
          <>
            {/* Contrôles */}
            <div className="mb-6 space-y-4">
              {/* Recherche et filtres */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher un agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {["marketing", "creative", "analytics", "content", "sales", "productivity", "technical", "system"].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategories(prev => 
                        prev.includes(category) 
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      )}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategories.includes(category)
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tri et vue */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="name">Nom</option>
                    <option value="performance">Performance</option>
                    <option value="lastUsed">Dernière utilisation</option>
                    <option value="category">Catégorie</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Icon 
                      name={sortOrder === "asc" ? "arrow-up" : "arrow-down"} 
                      size={16} 
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid" 
                        ? "bg-purple-100 text-purple-600" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon name="th" size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "table" 
                        ? "bg-purple-100 text-purple-600" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon name="bars" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Packages d'agents */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Packages Recommandés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agentPackages.map(package_ => (
                  <div
                    key={package_.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => applyPackage(package_.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: package_.color }}
                      />
                      <h4 className="font-medium text-gray-900">{package_.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{package_.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {package_.agents.map(agentId => {
                        const agent = agents.find(a => a.id === agentId);
                        return agent ? (
                          <span
                            key={agentId}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {agent.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liste des agents */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map(agent => (
                  <div
                    key={agent.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: agent.color + '20' }}
                        >
                          {agent.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-600">{agent.role}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agent.active}
                          onChange={() => toggleAgent(agent.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Performance</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(agent.performance)}`}>
                          {agent.performance}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Dernière utilisation</span>
                        <span className="text-sm text-gray-600">{formatLastUsed(agent.lastUsed)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {agent.skills.map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière utilisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAgents.map(agent => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-3"
                              style={{ backgroundColor: agent.color + '20' }}
                            >
                              {agent.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                              <div className="text-sm text-gray-500">{agent.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPerformanceColor(agent.performance)}`}>
                            {agent.performance}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLastUsed(agent.lastUsed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            agent.active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {agent.active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={agent.active}
                              onChange={() => toggleAgent(agent.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;"] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Section Agents Spécialisés */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="info-circle" className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Agents Spécialisés Avancés</h3>
                    <p className="text-sm text-blue-700">
                      Ces agents utilisent des algorithmes d&apos;IA avancés pour des tâches spécialisées. 
                      Ils sont disponibles selon votre plan d&apos;abonnement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des agents spécialisés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specializedAgentsList.map(agent => (
                <div
                  key={agent.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow relative"
                >
                  {/* Badges de statut */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {getStatusBadge(agent.status)}
                    {getComplexityBadge(agent.complexity)}
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: agent.color + '20' }}
                    >
                      {agent.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.role}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Dernière mise à jour</span>
                      <span className="text-sm text-gray-600">{formatLastUsed(agent.lastUpdated)}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">Capacités :</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map(capability => (
                          <span
                            key={capability}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <button
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        disabled={agent.status === 'enterprise'}
                      >
                        {agent.status === &apos;enterprise&apos; ? &apos;Plan Enterprise requis&apos; : &apos;Activer l\&apos;agent&apos;}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Layout>
    </AuthGuard>
  );
}