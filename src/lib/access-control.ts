/**
 * Système de contrôle d'apos;accès pour Beriox AI
 * Gestion des permissions basées sur les rôles et plans d'apos;abonnement
 */

export interface UserPermissions {
  role: 'apos;USER'apos; | 'apos;ADMIN'apos; | 'apos;SUPER_ADMIN'apos;;
  plan?: string;
  hasAccess?: boolean;
}

export interface RouteConfig {
  path: string;
  label: string;
  icon: string;
  requiredRole?: 'apos;USER'apos; | 'apos;ADMIN'apos; | 'apos;SUPER_ADMIN'apos;;
  requiredPlan?: string[];
  premiumOnly?: boolean;
  superAdminOnly?: boolean;
  description?: string;
}

// Configuration des routes avec leurs permissions
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Routes publiques (tous les utilisateurs connectés)
  {
    path: 'apos;/'apos;,
    label: 'apos;Tableau de bord'apos;,
    icon: 'apos;home'apos;,
    requiredRole: 'apos;USER'apos;
  },
  {
    path: 'apos;/missions'apos;,
    label: 'apos;Missions'apos;,
    icon: 'apos;tasks'apos;,
    requiredRole: 'apos;USER'apos;
  },
  {
    path: 'apos;/agents'apos;,
    label: 'apos;Équipe IA'apos;,
    icon: 'apos;users'apos;,
    requiredRole: 'apos;USER'apos;
  },
  {
    path: 'apos;/novabot'apos;,
    label: 'apos;NovaBot'apos;,
    icon: 'apos;brain'apos;,
    requiredRole: 'apos;USER'apos;
  },
  {
    path: 'apos;/profile'apos;,
    label: 'apos;Profil'apos;,
    icon: 'apos;user'apos;,
    requiredRole: 'apos;USER'apos;
  },
  {
    path: 'apos;/pricing'apos;,
    label: 'apos;Prix'apos;,
    icon: 'apos;dollar-sign'apos;,
    requiredRole: 'apos;USER'apos;
  },
  {
    path: 'apos;/settings'apos;,
    label: 'apos;Paramètres'apos;,
    icon: 'apos;cog'apos;,
    requiredRole: 'apos;USER'apos;
  },

  // Routes premium
  {
    path: 'apos;/time-tracking'apos;,
    label: 'apos;Time Tracking'apos;,
    icon: 'apos;clock'apos;,
    requiredRole: 'apos;USER'apos;,
    premiumOnly: true,
    description: 'apos;Gestion du temps et des projets'apos;
  },
  {
    path: 'apos;/form-optimization'apos;,
    label: 'apos;Optimisation Formulaires'apos;,
    icon: 'apos;edit'apos;,
    requiredRole: 'apos;USER'apos;,
    premiumOnly: true,
    description: 'apos;Optimisation des formulaires et conversion'apos;
  },
  {
    path: 'apos;/integrations'apos;,
    label: 'apos;Intégrations'apos;,
    icon: 'apos;puzzle-piece'apos;,
    requiredRole: 'apos;USER'apos;,
    premiumOnly: true,
    description: 'apos;Intégrations tierces'apos;
  },

  // Routes spécifiques aux plans
  {
    path: 'apos;/competitors'apos;,
    label: 'apos;Veille Concurrentielle'apos;,
    icon: 'apos;search'apos;,
    requiredRole: 'apos;USER'apos;,
    requiredPlan: ['apos;competitor-intelligence'apos;, 'apos;enterprise'apos;],
    description: 'apos;Analyse de la concurrence'apos;
  },

  // Routes admin
  {
    path: 'apos;/admin/premium-access'apos;,
    label: 'apos;Accès Premium'apos;,
    icon: 'apos;crown'apos;,
    requiredRole: 'apos;ADMIN'apos;,
    description: 'apos;Gestion des accès premium'apos;
  },

  // Routes super admin
  {
    path: 'apos;/super-admin'apos;,
    label: 'apos;Super-Admin'apos;,
    icon: 'apos;crown'apos;,
    requiredRole: 'apos;SUPER_ADMIN'apos;,
    superAdminOnly: true,
    description: 'apos;Panneau d\'apos;administration'apos;
  },
  {
    path: 'apos;/super-admin/users'apos;,
    label: 'apos;Gestion Utilisateurs'apos;,
    icon: 'apos;users'apos;,
    requiredRole: 'apos;SUPER_ADMIN'apos;,
    superAdminOnly: true,
    description: 'apos;Gestion des utilisateurs et rôles'apos;
  }
];

/**
 * Vérifie si un utilisateur a accès à une route
 */
export function hasRouteAccess(
  routePath: string,
  userPermissions: UserPermissions
): boolean {
  const route = ROUTE_CONFIGS.find(r => r.path === routePath);
  
  if (!route) {
    // Route non configurée - accès par défaut
    return true;
  }

  // Vérifier le rôle requis
  if (route.requiredRole) {
    const roleHierarchy = {
      'apos;USER'apos;: 1,
      'apos;ADMIN'apos;: 2,
      'apos;SUPER_ADMIN'apos;: 3
    };

    const userRoleLevel = roleHierarchy[userPermissions.role] || 0;
    const requiredRoleLevel = roleHierarchy[route.requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return false;
    }
  }

  // Vérifier si c'apos;est réservé aux super admins
  if (route.superAdminOnly && userPermissions.role !== 'apos;SUPER_ADMIN'apos;) {
    return false;
  }

  // Vérifier si c'apos;est premium seulement
  if (route.premiumOnly && !userPermissions.hasAccess) {
    return false;
  }

  // Vérifier le plan requis
  if (route.requiredPlan && route.requiredPlan.length > 0) {
    if (!userPermissions.plan || !route.requiredPlan.includes(userPermissions.plan)) {
      return false;
    }
  }

  return true;
}

/**
 * Filtre les routes visibles pour un utilisateur
 */
export function getVisibleRoutes(userPermissions: UserPermissions): RouteConfig[] {
  return ROUTE_CONFIGS.filter(route => hasRouteAccess(route.path, userPermissions));
}

/**
 * Obtient les informations d'apos;une route
 */
export function getRouteInfo(routePath: string): RouteConfig | null {
  return ROUTE_CONFIGS.find(r => r.path === routePath) || null;
}

/**
 * Vérifie si un utilisateur peut voir un lien dans le menu
 */
export function canSeeInMenu(
  routePath: string,
  userPermissions: UserPermissions
): boolean {
  return hasRouteAccess(routePath, userPermissions);
}

/**
 * Obtient le message d'apos;erreur pour une route inaccessible
 */
export function getAccessDeniedMessage(routePath: string, userPermissions: UserPermissions): string {
  const route = getRouteInfo(routePath);
  
  if (!route) {
    return 'apos;Page non trouvée'apos;;
  }

  if (route.superAdminOnly && userPermissions.role !== 'apos;SUPER_ADMIN'apos;) {
    return 'apos;Accès réservé aux super administrateurs'apos;;
  }

  if (route.premiumOnly && !userPermissions.hasAccess) {
    return 'apos;Cette fonctionnalité nécessite un abonnement premium'apos;;
  }

  if (route.requiredPlan && route.requiredPlan.length > 0) {
    if (!userPermissions.plan || !route.requiredPlan.includes(userPermissions.plan)) {
      return `Cette fonctionnalité nécessite le plan ${route.requiredPlan.join('apos; ou 'apos;)}`;
    }
  }

  if (route.requiredRole) {
    const roleLabels = {
      'apos;USER'apos;: 'apos;utilisateur'apos;,
      'apos;ADMIN'apos;: 'apos;administrateur'apos;,
      'apos;SUPER_ADMIN'apos;: 'apos;super administrateur'apos;
    };
    
    const userRoleLevel = {
      'apos;USER'apos;: 1,
      'apos;ADMIN'apos;: 2,
      'apos;SUPER_ADMIN'apos;: 3
    };

    if (userRoleLevel[userPermissions.role] < userRoleLevel[route.requiredRole]) {
      return `Cette fonctionnalité nécessite le rôle ${roleLabels[route.requiredRole]}`;
    }
  }

  return 'apos;Accès refusé'apos;;
}
