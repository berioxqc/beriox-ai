// Système d'icônes dynamique pour optimiser les imports FontAwesome
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
// Cache pour les icônes déjà chargées
const iconCache = new Map<string, IconDefinition>()
// Mapping des icônes avec leurs imports dynamiques
const iconImports: Record<string, () => Promise<{ [key: string]: IconDefinition }>> = {
  // Navigation
  home: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ home: m.faHome })),
  tasks: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ tasks: m.faTasks })),
  users: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ users: m.faUsers })),
  cog: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ cog: m.faCog })),
  
  // Actions
  plus: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ plus: m.faPlus })),
  edit: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ edit: m.faEdit })),
  trash: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ trash: m.faTrash })),
  save: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ save: m.faSave })),
  check: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ check: m.faCheck })),
  times: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ times: m.faTimes })),
  
  // Navigation
  arrowLeft: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ arrowLeft: m.faArrowLeft })),
  arrowRight: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ arrowRight: m.faArrowRight })),
  chevronDown: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ chevronDown: m.faChevronDown })),
  chevronUp: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ chevronUp: m.faChevronUp })),
  chevronRight: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ chevronRight: m.faChevronRight })),
  
  // États
  spinner: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ spinner: m.faSpinner })),
  exclamationTriangle: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ exclamationTriangle: m.faExclamationTriangle })),
  infoCircle: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ infoCircle: m.faInfoCircle })),
  checkCircle: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ checkCircle: m.faCheckCircle })),
  timesCircle: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ timesCircle: m.faTimesCircle })),
  
  // Temps
  clock: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ clock: m.faClock })),
  calendar: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ calendar: m.faCalendar })),
  
  // Utilisateur
  user: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ user: m.faUser })),
  envelope: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ envelope: m.faEnvelope })),
  
  // Analytics
  chartLine: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ chartLine: m.faChartLine })),
  bullseye: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ bullseye: m.faBullseye })),
  
  // Actions spéciales
  rocket: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ rocket: m.faRocket })),
  lightbulb: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ lightbulb: m.faLightbulb })),
  palette: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ palette: m.faPalette })),
  calculator: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ calculator: m.faCalculator })),
  pen: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ pen: m.faPen })),
  
  // Finance
  dollarSign: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ dollarSign: m.faDollarSign })),
  creditCard: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ creditCard: m.faCreditCard })),
  gift: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ gift: m.faGift })),
  receipt: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ receipt: m.faReceipt })),
  
  // Interface
  eye: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ eye: m.faEye })),
  search: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ search: m.faSearch })),
  filter: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ filter: m.faFilter })),
  bars: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ bars: m.faBars })),
  ellipsisV: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ ellipsisV: m.faEllipsisV })),
  
  // Fichiers
  download: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ download: m.faDownload })),
  upload: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ upload: m.faUpload })),
  
  // Audio
  microphone: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ microphone: m.faMicrophone })),
  microphoneSlash: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ microphoneSlash: m.faMicrophoneSlash })),
  
  // Notifications
  flag: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ flag: m.faFlag })),
  exclamation: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ exclamation: m.faExclamation })),
  bolt: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ bolt: m.faBolt })),
  bell: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ bell: m.faBell })),
  
  // IA et Technologie
  robot: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ robot: m.faRobot })),
  brain: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ brain: m.faBrain })),
  
  // Émotions
  heart: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ heart: m.faHeart })),
  star: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ star: m.faStar })),
  crown: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ crown: m.faCrown })),
  
  // Sécurité
  shield: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ shield: m.faShield })),
  shieldAlt: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ shieldAlt: m.faShieldAlt })),
  lock: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ lock: m.faLock })),
  key: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ key: m.faKey })),
  
  // Communication
  comments: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ comments: m.faComments })),
  paperPlane: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ paperPlane: m.faPaperPlane })),
  
  // Interface avancée
  puzzlePiece: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ puzzlePiece: m.faPuzzlePiece })),
  desktop: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ desktop: m.faDesktop })),
  mobile: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ mobile: m.faMobile })),
  route: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ route: m.faRoute })),
  layerGroup: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ layerGroup: m.faLayerGroup })),
  universalAccess: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ universalAccess: m.faUniversalAccess })),
  
  // Actions avancées
  backward: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ backward: m.faBackward })),
  cookieBite: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ cookieBite: m.faCookieBite })),
  phone: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ phone: m.faPhone })),
  ban: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ ban: m.faBan })),
  ticket: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ ticket: m.faTicket })),
  gem: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ gem: m.faGem })),
  
  // Authentification
  signOutAlt: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ signOutAlt: m.faSignOutAlt })),
  userCheck: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ userCheck: m.faUserCheck })),
  
  // Base de données
  database: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ database: m.faDatabase })),
  certificate: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ certificate: m.faCertificate })),
  server: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ server: m.faServer })),
  
  // Arrows
  arrowUp: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ arrowUp: m.faArrowUp })),
  arrowDown: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ arrowDown: m.faArrowDown })),
  minus: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ minus: m.faMinus })),
  
  // Interface spécialisée
  th: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ th: m.faTh })),
  circle: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ circle: m.faCircle })),
  file: () => import('@fortawesome/free-solid-svg-icons').then(m => ({ file: m.faFile })),
}
// Fonction pour charger une icône dynamiquement
export async function getIconDynamic(name: string): Promise<IconDefinition | null> {
  // Vérifier le cache d'abord
  if (iconCache.has(name)) {
    return iconCache.get(name)!
  }
  
  // Vérifier si l'icône existe dans nos imports
  if (!iconImports[name]) {
    console.warn(`Icon "${name}" not found in dynamic imports`)
    return null
  }
  
  try {
    // Charger l'icône dynamiquement
    const iconModule = await iconImports[name]()
    const icon = iconModule[name]
    if (icon) {
      // Mettre en cache pour les prochaines utilisations
      iconCache.set(name, icon)
      return icon
    }
    
    return null
  } catch (error) {
    console.error(`Error loading icon "${name}":`, error)
    return null
  }
}

// Fonction pour précharger les icônes les plus utilisées
export async function preloadCommonIcons(): Promise<void> {
  const commonIcons = [
    'home', 'tasks', 'users', 'cog', 'plus', 'edit', 'trash', 'check', 'times',
    'arrowLeft', 'arrowRight', 'chevronDown', 'chevronUp', 'spinner',
    'user', 'envelope', 'chartLine', 'dollarSign', 'creditCard',
    'eye', 'search', 'filter', 'bars', 'download', 'upload',
    'microphone', 'flag', 'bolt', 'bell', 'robot', 'brain',
    'heart', 'star', 'shield', 'lock', 'comments'
  ]
  console.log('🔄 Préchargement des icônes communes...')
  const loadPromises = commonIcons.map(async (iconName) => {
    try {
      await getIconDynamic(iconName)
    } catch (error) {
      console.warn(`Failed to preload icon "${iconName}":`, error)
    }
  })
  await Promise.allSettled(loadPromises)
  console.log(`✅ ${commonIcons.length} icônes communes préchargées`)
}

// Fonction pour vider le cache (utile pour les tests)
export function clearIconCache(): void {
  iconCache.clear()
}

// Fonction pour obtenir les statistiques du cache
export function getIconCacheStats(): { size: number; keys: string[] } {
  return {
    size: iconCache.size,
    keys: Array.from(iconCache.keys())
  }
}

// Export des types
export type IconName = keyof typeof iconImports