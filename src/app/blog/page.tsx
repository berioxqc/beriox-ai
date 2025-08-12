import { Metadata } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
export const metadata: Metadata = {
  title: 'Blog Beriox AI - Intelligence Artificielle et Automatisation',
  description: 'Découvrez les dernières tendances en IA, automatisation et productivité. Articles techniques, tutoriels et insights sur l\'intelligence artificielle.',
  keywords: 'IA, intelligence artificielle, automatisation, productivité, blog technique, tutoriels IA',
  openGraph: {
    title: 'Blog Beriox AI - Intelligence Artificielle et Automatisation',
    description: 'Découvrez les dernières tendances en IA, automatisation et productivité.',
    type: 'website',
    url: 'https://beriox-ai.vercel.app/blog',
  },
}
const blogPosts = [
  {
    id: 'ia-automatisation-2024',
    title: 'L\'IA d\'Automatisation en 2024 : Tendances et Opportunités',
    excerpt: 'Découvrez comment l\'intelligence artificielle révolutionne l\'automatisation des tâches et améliore la productivité des entreprises.',
    category: 'Tendances IA',
    readTime: '8 min',
    publishedAt: '2024-01-15',
    image: '/blog/ia-automatisation-2024.jpg',
    featured: true,
  },
  {
    id: 'agents-ia-productivite',
    title: 'Comment les Agents IA Transforment la Productivité',
    excerpt: 'Les agents intelligents comme KarineAI, HugoAI et JPBot révolutionnent la façon dont nous travaillons et collaborons.',
    category: 'Agents IA',
    readTime: '6 min',
    publishedAt: '2024-01-10',
    image: '/blog/agents-ia-productivite.jpg',
    featured: false,
  },
  {
    id: 'orchestration-ia-avancee',
    title: 'L\'Orchestration IA Avancée : Au-delà de l\'Automatisation Simple',
    excerpt: 'Comment orchestrer intelligemment plusieurs agents IA pour des résultats exceptionnels et une efficacité maximale.',
    category: 'Orchestration',
    readTime: '10 min',
    publishedAt: '2024-01-05',
    image: '/blog/orchestration-ia-avancee.jpg',
    featured: false,
  },
  {
    id: 'seo-ia-2024',
    title: 'SEO et IA en 2024 : Stratégies Gagnantes',
    excerpt: 'Comment utiliser l\'intelligence artificielle pour optimiser votre référencement et améliorer votre visibilité en ligne.',
    category: 'SEO',
    readTime: '7 min',
    publishedAt: '2024-01-01',
    image: '/blog/seo-ia-2024.jpg',
    featured: false,
  },
]
const categories = [
  { name: 'Tendances IA', count: 1 },
  { name: 'Agents IA', count: 1 },
  { name: 'Orchestration', count: 1 },
  { name: 'SEO', count: 1 },
  { name: 'Productivité', count: 2 },
  { name: 'Tutoriels', count: 0 },
]
export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)
  return (
    <Layout
      title="Blog Beriox AI"
      subtitle="Découvrez les dernières tendances en IA et automatisation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Blog Beriox AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les dernières tendances en intelligence artificielle, 
            automatisation et productivité. Articles techniques, tutoriels 
            et insights pour optimiser votre workflow.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Article à la Une</h2>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="text-6xl mb-4">🤖</div>
                      <p className="text-lg opacity-90">Image: {featuredPost.title}</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-4">{featuredPost.readTime}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Lire l'article complet
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catégories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className="bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm opacity-90">Image: {post.title}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-xs ml-3">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.id}`}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Lire la suite →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Restez informé des dernières tendances IA
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Recevez nos articles exclusifs, tutoriels et insights sur l'intelligence 
            artificielle directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              S'abonner
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
