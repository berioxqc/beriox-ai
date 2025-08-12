import { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata: Metadata = {
  title: 'Essai Gratuit Beriox AI - Commencez Maintenant',
  description: 'Essayez Beriox AI gratuitement pendant 14 jours. Aucune carte de crédit requise. Transformez votre productivité avec l\'orchestration IA avancée.',
  keywords: 'essai gratuit beriox ai, test gratuit, orchestration IA, automatisation',
  openGraph: {
    title: 'Essai Gratuit Beriox AI - Commencez Maintenant',
    description: 'Essayez Beriox AI gratuitement pendant 14 jours.',
    type: 'website',
    url: 'https://beriox-ai.vercel.app/start-free-trial',
  },
};

const features = [
  {
    icon: '🤖',
    title: 'Agents IA Spécialisés',
    description: 'KarineAI, HugoAI, JPBot et plus - des agents intelligents pour chaque tâche',
  },
  {
    icon: '🎯',
    title: 'Orchestration Intelligente',
    description: 'Coordination automatique de plusieurs agents pour des résultats optimaux',
  },
  {
    icon: '📊',
    title: 'Analytics Avancés',
    description: 'Métriques détaillées et ROI mesurable en temps réel',
  },
  {
    icon: '⚡',
    title: 'Intégrations Illimitées',
    description: 'Connectez tous vos outils favoris en quelques clics',
  },
  {
    icon: '🔒',
    title: 'Sécurité Enterprise',
    description: 'Protection des données et conformité GDPR',
  },
  {
    icon: '🎨',
    title: 'Personnalisation Totale',
    description: 'Adaptez la plateforme à vos besoins spécifiques',
  },
];

const testimonials = [
  {
    name: 'Marie Dubois',
    role: 'CEO, TechStartup',
    content: 'Beriox AI a transformé notre productivité. Nous avons gagné 20h par semaine !',
    rating: 5,
  },
  {
    name: 'Jean Martin',
    role: 'Directeur Marketing',
    content: 'L\'orchestration IA nous a permis d\'automatiser 80% de nos tâches répétitives.',
    rating: 5,
  },
  {
    name: 'Sophie Bernard',
    role: 'Chef de Projet',
    content: 'Interface intuitive et résultats impressionnants. ROI de 300% en 3 mois.',
    rating: 5,
  },
];

const guarantees = [
  {
    icon: '🛡️',
    title: 'Garantie 30 Jours',
    description: 'Remboursement complet si vous n\'êtes pas satisfait',
  },
  {
    icon: '🔒',
    title: 'Aucune Carte de Crédit',
    description: 'Commencez gratuitement sans engagement',
  },
  {
    icon: '📞',
    title: 'Support Premium',
    description: 'Assistance dédiée pendant votre essai',
  },
  {
    icon: '📚',
    title: 'Formation Incluse',
    description: 'Tutoriels et webinaires gratuits',
  },
];

export default function StartFreeTrialPage() {
  return (
    <>
      <SchemaMarkup
        type="product"
        data={{
          name: 'Beriox AI Platform',
          description: 'Plateforme d\'orchestration IA avancée',
          offers: {
            price: '0',
            priceCurrency: 'USD',
            description: 'Essai gratuit 14 jours',
          },
        }}
      />
      
      <Layout
        title="Essai Gratuit Beriox AI"
        subtitle="Commencez votre transformation digitale aujourd&apos;hui"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
                🎉 Offre Limitée
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Commencez Gratuitement
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Essayez Beriox AI pendant 14 jours. Aucune carte de crédit requise. 
              Transformez votre productivité avec l&apos;orchestration IA la plus avancée.
            </p>
            
            {/* Trial Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Essai Gratuit 14 Jours
                </h3>
                <p className="text-gray-600">
                  Accès complet à toutes les fonctionnalités
                </p>
              </div>
              
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Email professionnel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom de l&apos;entreprise"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Taille de l&apos;entreprise</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201+">201+ employés</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Commencer Mon Essai Gratuit
                </button>
              </form>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Vos données sont protégées • Pas de spam • Annulation facile
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Tout ce que vous obtenez pendant l&apos;essai
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Ce que disent nos utilisateurs
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantees */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Nos Garanties
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {guarantees.map((guarantee, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{guarantee.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {guarantee.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {guarantee.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-16">
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Rejoignez plus de 10,000 entreprises
              </h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">10,000+</div>
                  <p className="text-gray-600">Utilisateurs actifs</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">300%</div>
                  <p className="text-gray-600">Gain de productivité</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
                  <p className="text-gray-600">Note moyenne</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                  <p className="text-gray-600">Taux de satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">
              Prêt à transformer votre productivité ?
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto text-lg">
              Rejoignez des milliers d&apos;entreprises qui ont déjà choisi Beriox AI. 
              Commencez votre essai gratuit aujourd&apos;hui.
            </p>
            <Link
              href="#trial-form"
              className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              🚀 Commencer Mon Essai Gratuit
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-purple-100 text-sm mt-4">
              ⏰ Offre limitée • Aucune carte de crédit requise • Annulation à tout moment
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}
