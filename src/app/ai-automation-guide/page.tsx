import { Metadata } from 'apos;next'apos;;
import Link from 'apos;next/link'apos;;
import Layout from 'apos;@/components/Layout'apos;;
import SchemaMarkup from 'apos;@/components/seo/SchemaMarkup'apos;;

export const metadata: Metadata = {
  title: 'apos;Guide Complet IA et Automatisation 2024 - Beriox AI'apos;,
  description: 'apos;Téléchargez gratuitement notre guide complet sur l\'apos;IA et l\'apos;automatisation. Découvrez comment transformer votre productivité avec l\'apos;intelligence artificielle.'apos;,
  keywords: 'apos;guide IA, automatisation, productivité, intelligence artificielle, ebook gratuit'apos;,
  openGraph: {
    title: 'apos;Guide Complet IA et Automatisation 2024 - Beriox AI'apos;,
    description: 'apos;Téléchargez gratuitement notre guide complet sur l\'apos;IA et l\'apos;automatisation.'apos;,
    type: 'apos;website'apos;,
    url: 'apos;https://beriox-ai.vercel.app/ai-automation-guide'apos;,
  },
};

const benefits = [
  {
    icon: 'apos;🚀'apos;,
    title: 'apos;Augmentation de 300% de la productivité'apos;,
    description: 'apos;Découvrez comment les entreprises utilisent l\'apos;IA pour automatiser leurs tâches répétitives.'apos;,
  },
  {
    icon: 'apos;💰'apos;,
    title: 'apos;Économies de 40% sur les coûts opérationnels'apos;,
    description: 'apos;Réduisez vos dépenses grâce à l\'apos;automatisation intelligente.'apos;,
  },
  {
    icon: 'apos;⏰'apos;,
    title: 'apos;Gain de 15h par semaine en moyenne'apos;,
    description: 'apos;Libérez du temps pour vous concentrer sur ce qui compte vraiment.'apos;,
  },
  {
    icon: 'apos;📈'apos;,
    title: 'apos;Amélioration de 60% de la qualité'apos;,
    description: 'apos;L\'apos;IA élimine les erreurs humaines et améliore la précision.'apos;,
  },
];

const chapters = [
  'apos;Introduction à l\'apos;IA d\'apos;automatisation'apos;,
  'apos;Les agents IA : KarineAI, HugoAI, JPBot et plus'apos;,
  'apos;Orchestration intelligente des workflows'apos;,
  'apos;Cas d\'apos;usage concrets et ROI'apos;,
  'apos;Mise en place étape par étape'apos;,
  'apos;Outils et plateformes recommandés'apos;,
  'apos;Tendances 2024 et au-delà'apos;,
];

export default function AIAutomationGuidePage() {
  return (
    <>
      <SchemaMarkup
        type="article"
        data={{
          title: 'apos;Guide Complet IA et Automatisation 2024'apos;,
          excerpt: 'apos;Téléchargez gratuitement notre guide complet sur l\'apos;IA et l\'apos;automatisation.'apos;,
          image: 'apos;/guide-ia-automation-2024.jpg'apos;,
          publishedAt: 'apos;2024-01-20'apos;,
          id: 'apos;ai-automation-guide'apos;,
        }}
      />
      
      <Layout
        title="Guide Complet IA et Automatisation 2024"
        subtitle="Téléchargez gratuitement notre guide et transformez votre productivité"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-4 py-2 rounded-full">
                📚 Guide Gratuit
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Guide Complet IA et Automatisation 2024
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Découvrez comment l'apos;intelligence artificielle révolutionne l'apos;automatisation 
              et transforme la productivité des entreprises. Un guide pratique avec 
              des exemples concrets et des stratégies actionnables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Guide Gratuit
                  </h3>
                  <p className="text-gray-600 text-sm">
                    47 pages d'apos;experts • PDF + EPUB • Mise à jour 2024
                  </p>
                </div>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Votre prénom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Votre email professionnel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    📥 Télécharger le Guide Gratuit
                  </button>
                </form>
                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Vos données sont protégées • Pas de spam • Désabonnement facile
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Ce que vous découvrirez dans ce guide
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chapters Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Contenu du guide
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {chapters.map((chapter, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{chapter}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Ils ont déjà téléchargé le guide
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">2,847</div>
                <p className="text-gray-600">Téléchargements</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">4.9/5</div>
                <p className="text-gray-600">Note moyenne</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">89%</div>
                <p className="text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à transformer votre productivité ?
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Rejoignez plus de 2,800 professionnels qui ont déjà téléchargé 
              notre guide et commencé leur transformation digitale.
            </p>
            <Link
              href="#download"
              className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
            >
              📥 Télécharger Maintenant (Gratuit)
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}
