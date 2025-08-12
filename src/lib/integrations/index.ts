// Export de toutes les intégrations API
export * from './types'
export * from './manager'
export * from './google-search-console'
export * from './pagespeed-insights'
export * from './mozilla-observatory'
export * from './ssl-labs'
export * from './uptimerobot'
export * from './wave'
export * from './microsoft-clarity'
export * from './github'
export * from './slack'
export * from './similarweb'
export * from './semrush'
// Import du gestionnaire et des types
import { integrationManager } from './manager'
import { ApiIntegration } from './types'
// Configuration de toutes les intégrations disponibles
const availableIntegrations: ApiIntegration[] = [
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    description: 'Données SEO, positions, erreurs d\'indexation',
    category: 'seo',
    isEnabled: false,
    isFree: true,
    quotaLimit: 1000, // 1000 requêtes par jour
    quotaUsed: 0,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    description: 'Trafic, conversions, comportements utilisateurs',
    category: 'analytics',
    isEnabled: false,
    isFree: true,
    quotaLimit: 10000, // 10000 requêtes par jour
    quotaUsed: 0,
  },
  {
    id: 'pagespeed-insights',
    name: 'PageSpeed Insights',
    description: 'Mesure performance et Core Web Vitals',
    category: 'performance',
    isEnabled: false,
    isFree: true,
    quotaLimit: 100, // 100 analyses par jour
    quotaUsed: 0,
  },
  {
    id: 'mozilla-observatory',
    name: 'Mozilla Observatory',
    description: 'Audit de sécurité gratuit',
    category: 'security',
    isEnabled: false,
    isFree: true,
    quotaLimit: 50, // 50 scans par jour
    quotaUsed: 0,
  },
  {
    id: 'ssl-labs',
    name: 'SSL Labs',
    description: 'Analyse HTTPS/SSL',
    category: 'security',
    isEnabled: false,
    isFree: true,
    quotaLimit: 25, // 25 analyses par jour
    quotaUsed: 0,
  },
  {
    id: 'uptimerobot',
    name: 'UptimeRobot',
    description: '50 monitorings gratuits, 5 min d\'intervalle',
    category: 'monitoring',
    isEnabled: false,
    isFree: true,
    quotaLimit: 50, // 50 monitors
    quotaUsed: 0,
  },
  {
    id: 'microsoft-clarity',
    name: 'Microsoft Clarity',
    description: 'Session replay et analytics UX, 100% gratuit',
    category: 'ux',
    isEnabled: false,
    isFree: true,
    quotaLimit: 1000000, // Pratiquement illimité
    quotaUsed: 0,
  },
  {
    id: 'wave',
    name: 'WAVE',
    description: 'Audit d\'accessibilité',
    category: 'accessibility',
    isEnabled: false,
    isFree: false, // Version payante pour API
    quotaLimit: 100, // 100 analyses par mois
    quotaUsed: 0,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Historique de code, tickets, commits',
    category: 'development',
    isEnabled: false,
    isFree: true,
    quotaLimit: 5000, // 5000 requêtes par heure
    quotaUsed: 0,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notifications automatisées',
    category: 'communication',
    isEnabled: false,
    isFree: true,
    quotaLimit: 10000, // 10000 messages par jour
    quotaUsed: 0,
  },
  {
    id: 'similarweb',
    name: 'SimilarWeb',
    description: 'Analyse trafic concurrent, mots-clés, stratégies',
    category: 'competitors',
    isEnabled: false,
    isFree: false, // Version payante
    quotaLimit: 100, // 100 analyses par mois
    quotaUsed: 0,
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    description: 'Analyse SEO concurrentielle, backlinks, mots-clés',
    category: 'competitors',
    isEnabled: false,
    isFree: false, // Version payante
    quotaLimit: 1000, // 1000 requêtes par jour
    quotaUsed: 0,
  },
]
// Initialiser toutes les intégrations
export function initializeIntegrations() {
  availableIntegrations.forEach(integration => {
    integrationManager.register(integration)
  })
}

// Fonction utilitaire pour obtenir une intégration spécifique
export function getIntegration(id: string) {
  return integrationManager.getAll().find(integration => integration.id === id)
}

// Fonction utilitaire pour obtenir les intégrations par catégorie
export function getIntegrationsByCategory(category: string) {
  return integrationManager.getByCategory(category)
}

// Fonction utilitaire pour obtenir les intégrations actives
export function getActiveIntegrations() {
  return integrationManager.getEnabled()
}

// Fonction utilitaire pour obtenir les intégrations gratuites
export function getFreeIntegrations() {
  return integrationManager.getFree()
}

// Export du gestionnaire
export { integrationManager }
// Initialiser automatiquement
if (typeof window === 'undefined') {
  // Côté serveur uniquement
  initializeIntegrations()
}
