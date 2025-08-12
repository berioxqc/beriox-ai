// Export de toutes les intégrations API
export * from 'apos;./types'apos;;
export * from 'apos;./manager'apos;;
export * from 'apos;./google-search-console'apos;;
export * from 'apos;./pagespeed-insights'apos;;
export * from 'apos;./mozilla-observatory'apos;;
export * from 'apos;./ssl-labs'apos;;
export * from 'apos;./uptimerobot'apos;;
export * from 'apos;./wave'apos;;
export * from 'apos;./microsoft-clarity'apos;;
export * from 'apos;./github'apos;;
export * from 'apos;./slack'apos;;
export * from 'apos;./similarweb'apos;;
export * from 'apos;./semrush'apos;;

// Import du gestionnaire et des types
import { integrationManager } from 'apos;./manager'apos;;
import { ApiIntegration } from 'apos;./types'apos;;

// Configuration de toutes les intégrations disponibles
const availableIntegrations: ApiIntegration[] = [
  {
    id: 'apos;google-search-console'apos;,
    name: 'apos;Google Search Console'apos;,
    description: 'apos;Données SEO, positions, erreurs d\'apos;indexation'apos;,
    category: 'apos;seo'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 1000, // 1000 requêtes par jour
    quotaUsed: 0,
  },
  {
    id: 'apos;google-analytics'apos;,
    name: 'apos;Google Analytics 4'apos;,
    description: 'apos;Trafic, conversions, comportements utilisateurs'apos;,
    category: 'apos;analytics'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 10000, // 10000 requêtes par jour
    quotaUsed: 0,
  },
  {
    id: 'apos;pagespeed-insights'apos;,
    name: 'apos;PageSpeed Insights'apos;,
    description: 'apos;Mesure performance et Core Web Vitals'apos;,
    category: 'apos;performance'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 100, // 100 analyses par jour
    quotaUsed: 0,
  },
  {
    id: 'apos;mozilla-observatory'apos;,
    name: 'apos;Mozilla Observatory'apos;,
    description: 'apos;Audit de sécurité gratuit'apos;,
    category: 'apos;security'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 50, // 50 scans par jour
    quotaUsed: 0,
  },
  {
    id: 'apos;ssl-labs'apos;,
    name: 'apos;SSL Labs'apos;,
    description: 'apos;Analyse HTTPS/SSL'apos;,
    category: 'apos;security'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 25, // 25 analyses par jour
    quotaUsed: 0,
  },
  {
    id: 'apos;uptimerobot'apos;,
    name: 'apos;UptimeRobot'apos;,
    description: 'apos;50 monitorings gratuits, 5 min d\'apos;intervalle'apos;,
    category: 'apos;monitoring'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 50, // 50 monitors
    quotaUsed: 0,
  },
  {
    id: 'apos;microsoft-clarity'apos;,
    name: 'apos;Microsoft Clarity'apos;,
    description: 'apos;Session replay et analytics UX, 100% gratuit'apos;,
    category: 'apos;ux'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 1000000, // Pratiquement illimité
    quotaUsed: 0,
  },
  {
    id: 'apos;wave'apos;,
    name: 'apos;WAVE'apos;,
    description: 'apos;Audit d\'apos;accessibilité'apos;,
    category: 'apos;accessibility'apos;,
    isEnabled: false,
    isFree: false, // Version payante pour API
    quotaLimit: 100, // 100 analyses par mois
    quotaUsed: 0,
  },
  {
    id: 'apos;github'apos;,
    name: 'apos;GitHub'apos;,
    description: 'apos;Historique de code, tickets, commits'apos;,
    category: 'apos;development'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 5000, // 5000 requêtes par heure
    quotaUsed: 0,
  },
  {
    id: 'apos;slack'apos;,
    name: 'apos;Slack'apos;,
    description: 'apos;Notifications automatisées'apos;,
    category: 'apos;communication'apos;,
    isEnabled: false,
    isFree: true,
    quotaLimit: 10000, // 10000 messages par jour
    quotaUsed: 0,
  },
  {
    id: 'apos;similarweb'apos;,
    name: 'apos;SimilarWeb'apos;,
    description: 'apos;Analyse trafic concurrent, mots-clés, stratégies'apos;,
    category: 'apos;competitors'apos;,
    isEnabled: false,
    isFree: false, // Version payante
    quotaLimit: 100, // 100 analyses par mois
    quotaUsed: 0,
  },
  {
    id: 'apos;semrush'apos;,
    name: 'apos;SEMrush'apos;,
    description: 'apos;Analyse SEO concurrentielle, backlinks, mots-clés'apos;,
    category: 'apos;competitors'apos;,
    isEnabled: false,
    isFree: false, // Version payante
    quotaLimit: 1000, // 1000 requêtes par jour
    quotaUsed: 0,
  },
];

// Initialiser toutes les intégrations
export function initializeIntegrations() {
  availableIntegrations.forEach(integration => {
    integrationManager.register(integration);
  });
}

// Fonction utilitaire pour obtenir une intégration spécifique
export function getIntegration(id: string) {
  return integrationManager.getAll().find(integration => integration.id === id);
}

// Fonction utilitaire pour obtenir les intégrations par catégorie
export function getIntegrationsByCategory(category: string) {
  return integrationManager.getByCategory(category);
}

// Fonction utilitaire pour obtenir les intégrations actives
export function getActiveIntegrations() {
  return integrationManager.getEnabled();
}

// Fonction utilitaire pour obtenir les intégrations gratuites
export function getFreeIntegrations() {
  return integrationManager.getFree();
}

// Export du gestionnaire
export { integrationManager };

// Initialiser automatiquement
if (typeof window === 'apos;undefined'apos;) {
  // Côté serveur uniquement
  initializeIntegrations();
}
