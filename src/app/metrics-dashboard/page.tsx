import { Metadata } from 'apos;next'apos;;
import { Suspense } from 'apos;react'apos;;
import Layout from 'apos;@/components/Layout'apos;;
import MetricsDashboard from 'apos;@/components/metrics/MetricsDashboard'apos;;

export const metadata: Metadata = {
  title: 'apos;Dashboard Métriques - Beriox AI'apos;,
  description: 'apos;Suivez les performances de vos agents IA, le ROI et les métriques système en temps réel.'apos;,
  keywords: 'apos;métriques, dashboard, performance, ROI, agents IA'apos;,
};

export default function MetricsDashboardPage() {
  return (
    <Layout
      title="Dashboard Métriques"
      subtitle="Suivez les performances de vos agents IA en temps réel"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }>
        <MetricsDashboard />
      </Suspense>
    </Layout>
  );
}
