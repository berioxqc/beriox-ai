// Système d'apos;icônes dynamique pour optimiser les imports FontAwesome
import { IconDefinition } from 'apos;@fortawesome/fontawesome-svg-core'apos;;

// Cache pour les icônes déjà chargées
const iconCache = new Map<string, IconDefinition>();

// Mapping des icônes avec leurs imports dynamiques
const iconImports: Record<string, () => Promise<{ [key: string]: IconDefinition }>> = {
  // Navigation
  home: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ home: m.faHome })),
  tasks: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ tasks: m.faTasks })),
  users: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ users: m.faUsers })),
  cog: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ cog: m.faCog })),
  
  // Actions
  plus: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ plus: m.faPlus })),
  edit: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ edit: m.faEdit })),
  trash: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ trash: m.faTrash })),
  save: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ save: m.faSave })),
  check: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ check: m.faCheck })),
  times: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ times: m.faTimes })),
  
  // Navigation
  arrowLeft: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ arrowLeft: m.faArrowLeft })),
  arrowRight: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ arrowRight: m.faArrowRight })),
  chevronDown: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ chevronDown: m.faChevronDown })),
  chevronUp: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ chevronUp: m.faChevronUp })),
  chevronRight: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ chevronRight: m.faChevronRight })),
  
  // États
  spinner: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ spinner: m.faSpinner })),
  exclamationTriangle: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ exclamationTriangle: m.faExclamationTriangle })),
  infoCircle: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ infoCircle: m.faInfoCircle })),
  checkCircle: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ checkCircle: m.faCheckCircle })),
  timesCircle: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ timesCircle: m.faTimesCircle })),
  
  // Temps
  clock: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ clock: m.faClock })),
  calendar: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ calendar: m.faCalendar })),
  
  // Utilisateur
  user: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ user: m.faUser })),
  envelope: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ envelope: m.faEnvelope })),
  
  // Analytics
  chartLine: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ chartLine: m.faChartLine })),
  bullseye: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ bullseye: m.faBullseye })),
  
  // Actions spéciales
  rocket: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ rocket: m.faRocket })),
  lightbulb: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ lightbulb: m.faLightbulb })),
  palette: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ palette: m.faPalette })),
  calculator: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ calculator: m.faCalculator })),
  pen: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ pen: m.faPen })),
  
  // Finance
  dollarSign: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ dollarSign: m.faDollarSign })),
  creditCard: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ creditCard: m.faCreditCard })),
  gift: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ gift: m.faGift })),
  receipt: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ receipt: m.faReceipt })),
  
  // Interface
  eye: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ eye: m.faEye })),
  search: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ search: m.faSearch })),
  filter: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ filter: m.faFilter })),
  bars: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ bars: m.faBars })),
  ellipsisV: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ ellipsisV: m.faEllipsisV })),
  
  // Fichiers
  download: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ download: m.faDownload })),
  upload: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ upload: m.faUpload })),
  
  // Audio
  microphone: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ microphone: m.faMicrophone })),
  microphoneSlash: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ microphoneSlash: m.faMicrophoneSlash })),
  
  // Notifications
  flag: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ flag: m.faFlag })),
  exclamation: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ exclamation: m.faExclamation })),
  bolt: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ bolt: m.faBolt })),
  bell: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ bell: m.faBell })),
  
  // IA et Technologie
  robot: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ robot: m.faRobot })),
  brain: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ brain: m.faBrain })),
  
  // Émotions
  heart: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ heart: m.faHeart })),
  star: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ star: m.faStar })),
  crown: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ crown: m.faCrown })),
  
  // Sécurité
  shield: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ shield: m.faShield })),
  shieldAlt: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ shieldAlt: m.faShieldAlt })),
  lock: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ lock: m.faLock })),
  key: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ key: m.faKey })),
  
  // Communication
  comments: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ comments: m.faComments })),
  paperPlane: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ paperPlane: m.faPaperPlane })),
  
  // Interface avancée
  puzzlePiece: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ puzzlePiece: m.faPuzzlePiece })),
  desktop: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ desktop: m.faDesktop })),
  mobile: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ mobile: m.faMobile })),
  route: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ route: m.faRoute })),
  layerGroup: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ layerGroup: m.faLayerGroup })),
  universalAccess: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ universalAccess: m.faUniversalAccess })),
  
  // Actions avancées
  backward: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ backward: m.faBackward })),
  cookieBite: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ cookieBite: m.faCookieBite })),
  phone: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ phone: m.faPhone })),
  ban: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ ban: m.faBan })),
  ticket: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ ticket: m.faTicket })),
  gem: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ gem: m.faGem })),
  
  // Authentification
  signOutAlt: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ signOutAlt: m.faSignOutAlt })),
  userCheck: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ userCheck: m.faUserCheck })),
  
  // Base de données
  database: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ database: m.faDatabase })),
  certificate: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ certificate: m.faCertificate })),
  server: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ server: m.faServer })),
  
  // Arrows
  arrowUp: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ arrowUp: m.faArrowUp })),
  arrowDown: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ arrowDown: m.faArrowDown })),
  minus: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ minus: m.faMinus })),
  
  // Interface spécialisée
  th: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ th: m.faTh })),
  circle: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ circle: m.faCircle })),
  file: () => import('apos;@fortawesome/free-solid-svg-icons'apos;).then(m => ({ file: m.faFile })),
};

// Fonction pour charger une icône dynamiquement
export async function getIconDynamic(name: string): Promise<IconDefinition | null> {
  // Vérifier le cache d'apos;abord
  if (iconCache.has(name)) {
    return iconCache.get(name)!;
  }
  
  // Vérifier si l'apos;icône existe dans nos imports
  if (!iconImports[name]) {
    console.warn(`Icon "${name}" not found in dynamic imports`);
    return null;
  }
  
  try {
    // Charger l'apos;icône dynamiquement
    const iconModule = await iconImports[name]();
    const icon = iconModule[name];
    
    if (icon) {
      // Mettre en cache pour les prochaines utilisations
      iconCache.set(name, icon);
      return icon;
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading icon "${name}":`, error);
    return null;
  }
}

// Fonction pour précharger les icônes les plus utilisées
export async function preloadCommonIcons(): Promise<void> {
  const commonIcons = [
    'apos;home'apos;, 'apos;tasks'apos;, 'apos;users'apos;, 'apos;cog'apos;, 'apos;plus'apos;, 'apos;edit'apos;, 'apos;trash'apos;, 'apos;check'apos;, 'apos;times'apos;,
    'apos;arrowLeft'apos;, 'apos;arrowRight'apos;, 'apos;chevronDown'apos;, 'apos;chevronUp'apos;, 'apos;spinner'apos;,
    'apos;user'apos;, 'apos;envelope'apos;, 'apos;chartLine'apos;, 'apos;dollarSign'apos;, 'apos;creditCard'apos;,
    'apos;eye'apos;, 'apos;search'apos;, 'apos;filter'apos;, 'apos;bars'apos;, 'apos;download'apos;, 'apos;upload'apos;,
    'apos;microphone'apos;, 'apos;flag'apos;, 'apos;bolt'apos;, 'apos;bell'apos;, 'apos;robot'apos;, 'apos;brain'apos;,
    'apos;heart'apos;, 'apos;star'apos;, 'apos;shield'apos;, 'apos;lock'apos;, 'apos;comments'apos;
  ];
  
  console.log('apos;🔄 Préchargement des icônes communes...'apos;);
  
  const loadPromises = commonIcons.map(async (iconName) => {
    try {
      await getIconDynamic(iconName);
    } catch (error) {
      console.warn(`Failed to preload icon "${iconName}":`, error);
    }
  });
  
  await Promise.allSettled(loadPromises);
  console.log(`✅ ${commonIcons.length} icônes communes préchargées`);
}

// Fonction pour vider le cache (utile pour les tests)
export function clearIconCache(): void {
  iconCache.clear();
}

// Fonction pour obtenir les statistiques du cache
export function getIconCacheStats(): { size: number; keys: string[] } {
  return {
    size: iconCache.size,
    keys: Array.from(iconCache.keys())
  };
}

// Export des types
export type IconName = keyof typeof iconImports;
