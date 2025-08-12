/**
 * Système de contrôle d'accès pour Beriox AI
 * Gestion des permissions basées sur les rôles et plans d'abonnement
 */

export interface UserPermissions {
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  plan?: string
  hasAccess?: boolean
}

export interface RouteConfig {
  path: string
  label: string
  icon: string
  requiredRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  requiredPlan?: string[]
  premiumOnly?: boolean
  superAdminOnly?: boolean
  description?: string
}

// Configuration des routes avec leurs permissions
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Routes publiques (tous les utilisateurs connectés)
  {
    path: '/',
    label: 'Tableau de bord',
    icon: 'home',
    requiredRole: 'USER'
  },
  {
    path: '/missions',
    label: 'Missions',
    icon: 'tasks',
    requiredRole: 'USER'
  },
  {
    path: '/agents',
    label: 'Équipe IA',
    icon: 'users',
    requiredRole: 'USER'
  },
  {
    path: '/novabot',
    label: 'NovaBot',
    icon: 'brain',
    requiredRole: 'USER'
  },
  {
    path: '/profile',
    label: 'Profil',
    icon: 'user',
    requiredRole: 'USER'
  },
  {
    path: '/pricing',
    label: 'Prix',
    icon: 'dollar-sign',
    requiredRole: 'USER'
  },
  {
    path: '/settings',
    label: 'Paramètres',
    icon: 'cog',
    requiredRole: 'USER'
  },

  // Routes premium
  {
    path: '/time-tracking',
    label: 'Time Tracking',
    icon: 'clock',
    requiredRole: 'USER',
    premiumOnly: true,
    description: 'Gestion du temps et des projets'
  },
  {
    path: '/form-optimization',
    label: 'Optimisation Formulaires',
    icon: 'edit',
    requiredRole: 'USER',
    premiumOnly: true,
    description: 'Optimisation des formulaires et conversion'
  },
  {
    path: '/integrations',
    label: 'Intégrations',
    icon: 'puzzle-piece',
    requiredRole: 'USER',
    premiumOnly: true,
    description: 'Intégrations tierces'
  },

  // Routes spécifiques aux plans
  {
    path: '/competitors',
    label: 'Veille Concurrentielle',
    icon: 'search',
    requiredRole: 'USER',
    requiredPlan: ['competitor-intelligence', 'enterprise'],
    description: 'Analyse de la concurrence'
  },

  // Routes admin
  {
    path: '/admin/premium-access',
    label: 'Accès Premium',
    icon: 'crown',
    requiredRole: 'ADMIN',
    description: 'Gestion des accès premium'
  },

  // Routes super admin
  {
    path: '/super-admin',
    label: 'Super-Admin',
    icon: 'crown',
    requiredRole: 'SUPER_ADMIN',
    superAdminOnly: true,
    description: 'Panneau d\'administration'
  },
  {
    path: '/super-admin/users',
    label: 'Gestion Utilisateurs',
    icon: 'users',
    requiredRole: 'SUPER_ADMIN',
    superAdminOnly: true,
    description: 'Gestion des utilisateurs et rôles'
  }
]
/**
 * Vérifie si un utilisateur a accès à une route
 */
export function hasRouteAccess(
  routePath: string,
  userPermissions: UserPermissions
): boolean {
  const route = ROUTE_CONFIGS.find(r => r.path === routePath)
  if (!route) {
    // Route non configurée - accès par défaut
    return true
  }

  // Vérifier le rôle requis
  if (route.requiredRole) {
    const roleHierarchy = {
      'USER': 1,
      'ADMIN': 2,
      'SUPER_ADMIN': 3
    }
    const userRoleLevel = roleHierarchy[userPermissions.role] || 0
    const requiredRoleLevel = roleHierarchy[route.requiredRole] || 0
    if (userRoleLevel < requiredRoleLevel) {
      return false
    }
  }

  // Vérifier si c'est réservé aux super admins
  if (route.superAdminOnly && userPermissions.role !== 'SUPER_ADMIN') {
    return false
  }

  // Vérifier si c'est premium seulement
  if (route.premiumOnly && !userPermissions.hasAccess) {
    return false
  }

  // Vérifier le plan requis
  if (route.requiredPlan && route.requiredPlan.length > 0) {
    if (!userPermissions.plan || !route.requiredPlan.includes(userPermissions.plan)) {
      return false
    }
  }

  return true
}

/**
 * Filtre les routes visibles pour un utilisateur
 */
export function getVisibleRoutes(userPermissions: UserPermissions): RouteConfig[] {
  return ROUTE_CONFIGS.filter(route => hasRouteAccess(route.path, userPermissions))
}

/**
 * Obtient les informations d'une route
 */
export function getRouteInfo(routePath: string): RouteConfig | null {
  return ROUTE_CONFIGS.find(r => r.path === routePath) || null
}

/**
 * Vérifie si un utilisateur peut voir un lien dans le menu
 */
export function canSeeInMenu(
  routePath: string,
  userPermissions: UserPermissions
): boolean {
  return hasRouteAccess(routePath, userPermissions)
}

/**
 * Obtient le message d'erreur pour une route inaccessible
 */
export function getAccessDeniedMessage(routePath: string, userPermissions: UserPermissions): string {
  const route = getRouteInfo(routePath)
  if (!route) {
    return 'Page non trouvée'
  }

  if (route.superAdminOnly && userPermissions.role !== 'SUPER_ADMIN') {
    return 'Accès réservé aux super administrateurs'
  }

  if (route.premiumOnly && !userPermissions.hasAccess) {
    return 'Cette fonctionnalité nécessite un abonnement premium'
  }

  if (route.requiredPlan && route.requiredPlan.length > 0) {
    if (!userPermissions.plan || !route.requiredPlan.includes(userPermissions.plan)) {
      return `Cette fonctionnalité nécessite le plan ${route.requiredPlan.join(' ou ')}`
    }
  }

  if (route.requiredRole) {
    const roleLabels = {
      'USER': 'utilisateur',
      'ADMIN': 'administrateur',
      'SUPER_ADMIN': 'super administrateur'
    }
    const userRoleLevel = {
      'USER': 1,
      'ADMIN': 2,
      'SUPER_ADMIN': 3
    }
    if (userRoleLevel[userPermissions.role] < userRoleLevel[route.requiredRole]) {
      return `Cette fonctionnalité nécessite le rôle ${roleLabels[route.requiredRole]}`
    }
  }

  return 'Accès refusé'
}
