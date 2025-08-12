import { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata: Metadata = {
  title: 'Beriox AI vs Concurrents - Comparaison Complète 2024',
  description: 'Comparez Beriox AI avec les meilleures plateformes d\'IA. Découvrez pourquoi Beriox AI est la solution la plus avancée pour l\'orchestration d\'agents IA.',
  keywords: 'beriox ai vs concurrents, comparaison IA, orchestration agents, plateforme IA',
  openGraph: {
    title: 'Beriox AI vs Concurrents - Comparaison Complète 2024',
    description: 'Comparez Beriox AI avec les meilleures plateformes d\'IA.',
    type: 'website',
    url: 'https://beriox-ai.vercel.app/beriox-vs-competitors',
  },
};

const competitors = [
  {
    name: 'Zapier',
    logo: '🔗',
    pros: ['Intégrations nombreuses', 'Interface simple', 'Large communauté'],
    cons: ['Pas d\'IA native', 'Workflows statiques', 'Coût élevé à l\'échelle'],
    pricing: 'À partir de 20$/mois',
    rating: 4.2,
  },
  {
    name: 'Make (Integromat)',
    logo: '⚙️',
    pros: ['Workflows visuels', 'Fonctionnalités avancées', 'Bon support'],
    cons: ['Courbe d\'apprentissage', 'Pas d\'orchestration IA', 'Complexe'],
    pricing: 'À partir de 9$/mois',
    rating: 4.0,
  },
  {
    name: 'n8n',
    logo: '🔄',
    pros: ['Open source', 'Auto-hébergé', 'Flexible'],
    cons: ['Technique', 'Pas d\'IA intégrée', 'Support limité'],
    pricing: 'Gratuit (self-hosted)',
    rating: 3.8,
  },
  {
    name: 'Microsoft Power Automate',
    logo: '🪟',
    pros: ['Intégration Microsoft', 'IA basique', 'Enterprise'],
    cons: ['Cher', 'Complexe', 'Vendor lock-in'],
    pricing: 'À partir de 15$/mois',
    rating: 3.9,
  },
];

const berioxFeatures = [
  {
    feature: 'Orchestration IA Avancée',
    beriox: '✅ Orchestration intelligente multi-agents',
    competitors: '❌ Workflows statiques',
  },
  {
    feature: 'Agents IA Spécialisés',
    beriox: '✅ KarineAI, HugoAI, JPBot, etc.',
    competitors: '❌ Pas d\'agents IA',
  },
  {
    feature: 'Apprentissage Automatique',
    beriox: '✅ Amélioration continue des performances',
    competitors: '❌ Pas d\'apprentissage',
  },
  {
    feature: 'Analyse Prédictive',
    beriox: '✅ Prédiction des besoins et optimisation',
    competitors: '❌ Analyses basiques',
  },
  {
    feature: 'Personnalisation Avancée',
    beriox: '✅ Adaptation aux besoins spécifiques',
    competitors: '⚠️ Personnalisation limitée',
  },
  {
    feature: 'ROI Mesurable',
    beriox: '✅ Métriques détaillées et ROI calculé',
    competitors: '❌ Métriques basiques',
  },
];

export default function BerioxVsCompetitorsPage() {
  return (
    <>
      <SchemaMarkup
        type="article"
        data={{
          title: 'Beriox AI vs Concurrents - Comparaison Complète 2024',
          excerpt: 'Comparez Beriox AI avec les meilleures plateformes d\'IA.',
          image: '/beriox-vs-competitors-2024.jpg',
          publishedAt: '2024-01-20',
          id: 'beriox-vs-competitors',
        }}
      />
      
      <Layout
        title="Beriox AI vs Concurrents"
        subtitle="Comparaison complète avec les meilleures plateformes d'automatisation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Beriox AI vs Concurrents
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comparaison objective et détaillée avec les meilleures plateformes 
              d'automatisation. Découvrez pourquoi Beriox AI révolutionne 
              l'orchestration d'agents IA.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/features-demo"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                🎬 Voir la Démo
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                💰 Voir les Prix
              </Link>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Comparaison Détaillée
            </h2>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Fonctionnalités
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Beriox AI
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Concurrents
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {berioxFeatures.map((feature, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {feature.feature}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-green-600 font-medium">
                          {feature.beriox}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-red-600 font-medium">
                          {feature.competitors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Competitors Analysis */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Analyse des Concurrents
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {competitors.map((competitor, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{competitor.logo}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{competitor.name}</h3>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(competitor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{competitor.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Prix</p>
                    <p className="text-sm text-gray-600">{competitor.pricing}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-green-600 mb-2">✅ Avantages</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {competitor.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">❌ Inconvénients</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {competitor.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Beriox */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Pourquoi Choisir Beriox AI ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  IA Native
                </h3>
                <p className="text-gray-600">
                  Seule plateforme avec orchestration IA native et agents spécialisés.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  ROI Garanti
                </h3>
                <p className="text-gray-600">
                  Augmentation moyenne de 300% de la productivité avec ROI mesurable.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Innovation Continue
                </h3>
                <p className="text-gray-600">
                  Mises à jour régulières et nouvelles fonctionnalités IA.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à essayer Beriox AI ?
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Rejoignez des milliers d'entreprises qui ont déjà choisi Beriox AI 
              pour révolutionner leur automatisation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/features-demo"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                🎬 Voir la Démo Gratuite
              </Link>
              <Link
                href="/pricing"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                💰 Voir les Prix
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
