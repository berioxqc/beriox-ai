'use client';

import { useState, useEffect } from 'react';
import { MetricsCalculator, SystemMetrics, AgentMetrics } from '@/lib/ai-orchestrator/metrics-calculator';

export default function MetricsDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const [system, agents] = await Promise.all([
        MetricsCalculator.calculateSystemMetrics(),
        Promise.all([
          'karine-ai',
          'hugo-ai', 
          'jp-bot',
          'elodie-ai',
          'clara-la-closeuse',
          'faucon-le-maitre-focus'
        ].map(id => MetricsCalculator.calculateAgentMetrics(id)))
      ]);
      
      setSystemMetrics(system);
      setAgentMetrics(agents);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des métriques');
      console.error('Erreur métriques:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadMetrics}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!systemMetrics) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-8">
      {/* Métriques Système */}
      <SystemMetricsSection metrics={systemMetrics} />
      
      {/* Métriques des Agents */}
      <AgentMetricsSection agents={agentMetrics} />
      
      {/* Graphiques de Performance */}
      <PerformanceChartsSection systemMetrics={systemMetrics} agentMetrics={agentMetrics} />
    </div>
  );
}

function SystemMetricsSection({ metrics }: { metrics: SystemMetrics }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Métriques Système</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          title="Missions Totales"
          value={metrics.totalMissions}
          icon="📊"
          color="blue"
        />
        <MetricCard
          title="Missions Actives"
          value={metrics.activeMissions}
          icon="🔄"
          color="green"
        />
        <MetricCard
          title="ROI Moyen"
          value={`${metrics.averageROI.toFixed(1)}%`}
          icon="💰"
          color="purple"
        />
        <MetricCard
          title="Efficacité Moyenne"
          value={`${(metrics.averageEfficiency * 100).toFixed(1)}%`}
          icon="⚡"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Économies de Coûts</p>
              <p className="text-2xl font-bold">${metrics.costSavings.toFixed(0)}</p>
            </div>
            <div className="text-3xl">💸</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Gain de Productivité</p>
              <p className="text-2xl font-bold">{metrics.productivityGain.toFixed(1)}%</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Santé du Système</p>
              <p className="text-2xl font-bold">{(metrics.systemHealth * 100).toFixed(1)}%</p>
            </div>
            <div className="text-3xl">❤️</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentMetricsSection({ agents }: { agents: AgentMetrics[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance des Agents</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.agentId} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentMetrics }) {
  const getPerformanceColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return '📈';
    if (trend < -0.1) return '📉';
    return '➡️';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{agent.agentName}</h3>
        <span className={`text-sm font-medium ${getPerformanceColor(agent.averageQuality)}`}>
          {(agent.averageQuality * 100).toFixed(1)}%
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Missions complétées</span>
          <span className="font-medium">{agent.completedMissions}/{agent.totalMissions}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taux de succès</span>
          <span className="font-medium">{(agent.successRate * 100).toFixed(1)}%</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Satisfaction</span>
          <span className="font-medium">{(agent.averageSatisfaction * 100).toFixed(1)}%</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tendance</span>
          <span className="font-medium flex items-center gap-1">
            {getTrendIcon(agent.performanceTrend)}
            {(agent.performanceTrend * 100).toFixed(1)}%
          </span>
        </div>

        <div className="pt-2">
          <div className="flex flex-wrap gap-1">
            {agent.specializations.slice(0, 2).map((spec, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
            {agent.specializations.length > 2 && (
              <span className="text-gray-500 text-xs">+{agent.specializations.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceChartsSection({ 
  systemMetrics, 
  agentMetrics 
}: { 
  systemMetrics: SystemMetrics;
  agentMetrics: AgentMetrics[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Graphiques de Performance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique de qualité des agents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualité par Agent</h3>
          <div className="space-y-3">
            {agentMetrics
              .sort((a, b) => b.averageQuality - a.averageQuality)
              .map((agent) => (
                <div key={agent.agentId} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-24 truncate">
                    {agent.agentName}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${agent.averageQuality * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {(agent.averageQuality * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Graphique de ROI */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques Clés</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">ROI Moyen</span>
              <span className="text-lg font-bold text-green-600">
                {systemMetrics.averageROI.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Efficacité</span>
              <span className="text-lg font-bold text-blue-600">
                {(systemMetrics.averageEfficiency * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Santé Système</span>
              <span className="text-lg font-bold text-purple-600">
                {(systemMetrics.systemHealth * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
