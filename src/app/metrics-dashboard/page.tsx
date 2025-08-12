import { Metadata } from 'next'
import { Suspense } from 'react'
import Layout from '@/components/Layout'
import MetricsDashboard from '@/components/metrics/MetricsDashboard'
export const metadata: Metadata = {
  title: 'Dashboard Métriques - Beriox AI',
  description: 'Suivez les performances de vos agents IA, le ROI et les métriques système en temps réel.',
  keywords: 'métriques, dashboard, performance, ROI, agents IA',
}
export default function MetricsDashboardPage() {
  return (
    <Layout
      title="Dashboard Métriques"
      subtitle="Suivez les performances de vos agents IA en temps réel"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }>
        <MetricsDashboard />
      </Suspense>
    </Layout>
  )
}
