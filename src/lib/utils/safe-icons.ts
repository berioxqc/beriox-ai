import React from 'react'

// 🎨 Système d'Icônes Sécurisé - Beriox AI
// Évite les problèmes d'encodage et de corruption

export interface SafeIcon {
  name: string
  unicode: string
  fallback: string
  category: 'status' | 'action' | 'navigation' | 'feedback' | 'system'
}

// Icônes sécurisées avec fallbacks
export const SAFE_ICONS: Record<string, SafeIcon> = {
  // Status
  success: {
    name: 'success',
    unicode: '✓',
    fallback: '[OK]',
    category: 'status'
  },
  error: {
    name: 'error',
    unicode: '✗',
    fallback: '[ERREUR]',
    category: 'status'
  },
  warning: {
    name: 'warning',
    unicode: '⚠',
    fallback: '[ATTENTION]',
    category: 'status'
  },
  info: {
    name: 'info',
    unicode: 'ℹ',
    fallback: '[INFO]',
    category: 'status'
  },
  loading: {
    name: 'loading',
    unicode: '⟳',
    fallback: '[CHARGEMENT]',
    category: 'status'
  },
  
  // Actions
  add: {
    name: 'add',
    unicode: '+',
    fallback: '[AJOUTER]',
    category: 'action'
  },
  remove: {
    name: 'remove',
    unicode: '−',
    fallback: '[SUPPRIMER]',
    category: 'action'
  },
  edit: {
    name: 'edit',
    unicode: '✎',
    fallback: '[MODIFIER]',
    category: 'action'
  },
  delete: {
    name: 'delete',
    unicode: '🗑',
    fallback: '[SUPPRIMER]',
    category: 'action'
  },
  save: {
    name: 'save',
    unicode: '💾',
    fallback: '[SAUVEGARDER]',
    category: 'action'
  },
  search: {
    name: 'search',
    unicode: '🔍',
    fallback: '[RECHERCHER]',
    category: 'action'
  },
  filter: {
    name: 'filter',
    unicode: '🔧',
    fallback: '[FILTRER]',
    category: 'action'
  },
  
  // Navigation
  home: {
    name: 'home',
    unicode: '🏠',
    fallback: '[ACCUEIL]',
    category: 'navigation'
  },
  back: {
    name: 'back',
    unicode: '←',
    fallback: '[RETOUR]',
    category: 'navigation'
  },
  forward: {
    name: 'forward',
    unicode: '→',
    fallback: '[SUIVANT]',
    category: 'navigation'
  },
  up: {
    name: 'up',
    unicode: '↑',
    fallback: '[HAUT]',
    category: 'navigation'
  },
  down: {
    name: 'down',
    unicode: '↓',
    fallback: '[BAS]',
    category: 'navigation'
  },
  menu: {
    name: 'menu',
    unicode: '☰',
    fallback: '[MENU]',
    category: 'navigation'
  },
  close: {
    name: 'close',
    unicode: '✕',
    fallback: '[FERMER]',
    category: 'navigation'
  },
  
  // Feedback
  like: {
    name: 'like',
    unicode: '👍',
    fallback: '[J\'AIME]',
    category: 'feedback'
  },
  dislike: {
    name: 'dislike',
    unicode: '👎',
    fallback: '[J\'AIME PAS]',
    category: 'feedback'
  },
  star: {
    name: 'star',
    unicode: '★',
    fallback: '[ÉTOILE]',
    category: 'feedback'
  },
  heart: {
    name: 'heart',
    unicode: '❤',
    fallback: '[CŒUR]',
    category: 'feedback'
  },
  
  // System
  settings: {
    name: 'settings',
    unicode: '⚙',
    fallback: '[PARAMÈTRES]',
    category: 'system'
  },
  user: {
    name: 'user',
    unicode: '👤',
    fallback: '[UTILISATEUR]',
    category: 'system'
  },
  lock: {
    name: 'lock',
    unicode: '🔒',
    fallback: '[VERROUILLÉ]',
    category: 'system'
  },
  unlock: {
    name: 'unlock',
    unicode: '🔓',
    fallback: '[DÉVERROUILLÉ]',
    category: 'system'
  },
  refresh: {
    name: 'refresh',
    unicode: '🔄',
    fallback: '[ACTUALISER]',
    category: 'system'
  },
  download: {
    name: 'download',
    unicode: '⬇',
    fallback: '[TÉLÉCHARGER]',
    category: 'system'
  },
  upload: {
    name: 'upload',
    unicode: '⬆',
    fallback: '[TÉLÉVERSER]',
    category: 'system'
  },
  calendar: {
    name: 'calendar',
    unicode: '📅',
    fallback: '[CALENDRIER]',
    category: 'system'
  },
  clock: {
    name: 'clock',
    unicode: '🕐',
    fallback: '[HORLOGE]',
    category: 'system'
  },
  email: {
    name: 'email',
    unicode: '✉',
    fallback: '[EMAIL]',
    category: 'system'
  },
  phone: {
    name: 'phone',
    unicode: '📞',
    fallback: '[TÉLÉPHONE]',
    category: 'system'
  },
  link: {
    name: 'link',
    unicode: '🔗',
    fallback: '[LIEN]',
    category: 'system'
  },
  copy: {
    name: 'copy',
    unicode: '📋',
    fallback: '[COPIER]',
    category: 'system'
  },
  paste: {
    name: 'paste',
    unicode: '📄',
    fallback: '[COLLER]',
    category: 'system'
  },
  cut: {
    name: 'cut',
    unicode: '✂',
    fallback: '[COUPER]',
    category: 'system'
  },
  undo: {
    name: 'undo',
    unicode: '↶',
    fallback: '[ANNULER]',
    category: 'system'
  },
  redo: {
    name: 'redo',
    unicode: '↷',
    fallback: '[RÉPÉTER]',
    category: 'system'
  },
  zoomIn: {
    name: 'zoomIn',
    unicode: '🔍+',
    fallback: '[ZOOM +]',
    category: 'system'
  },
  zoomOut: {
    name: 'zoomOut',
    unicode: '🔍-',
    fallback: '[ZOOM -]',
    category: 'system'
  },
  fullscreen: {
    name: 'fullscreen',
    unicode: '⛶',
    fallback: '[PLEIN ÉCRAN]',
    category: 'system'
  },
  minimize: {
    name: 'minimize',
    unicode: '🗕',
    fallback: '[RÉDUIRE]',
    category: 'system'
  },
  maximize: {
    name: 'maximize',
    unicode: '🗗',
    fallback: '[AGRANDIR]',
    category: 'system'
  }
}
export class SafeIconManager {
  private useUnicode: boolean = true
  private fallbackMode: boolean = false
  constructor(options?: { useUnicode?: boolean; fallbackMode?: boolean }) {
    this.useUnicode = options?.useUnicode ?? true
    this.fallbackMode = options?.fallbackMode ?? false
  }

  /**
   * Obtient une icône sécurisée
   */
  getIcon(iconName: string): string {
    const icon = SAFE_ICONS[iconName]
    if (!icon) {
      return this.fallbackMode ? '[ICÔNE MANQUANTE]' : '?'
    }

    return this.fallbackMode ? icon.fallback : icon.unicode
  }

  /**
   * Obtient une icône avec fallback automatique
   */
  getIconWithFallback(iconName: string): string {
    const icon = SAFE_ICONS[iconName]
    if (!icon) {
      return '[ICÔNE MANQUANTE]'
    }

    try {
      // Tester si l'unicode s'affiche correctement
      const testElement = document.createElement('span')
      testElement.textContent = icon.unicode
      const computedStyle = window.getComputedStyle(testElement)
      // Si l'unicode ne s'affiche pas (largeur = 0), utiliser le fallback
      if (computedStyle.width === '0px' || computedStyle.width === '0') {
        return icon.fallback
      }
      
      return icon.unicode
    } catch (error) {
      // En cas d'erreur (SSR, etc.), utiliser le fallback
      return icon.fallback
    }
  }

  /**
   * Obtient toutes les icônes d'une catégorie
   */
  getIconsByCategory(category: SafeIcon['category']): SafeIcon[] {
    return Object.values(SAFE_ICONS).filter(icon => icon.category === category)
  }

  /**
   * Vérifie si une icône existe
   */
  hasIcon(iconName: string): boolean {
    return iconName in SAFE_ICONS
  }

  /**
   * Active le mode fallback
   */
  enableFallbackMode(): void {
    this.fallbackMode = true
  }

  /**
   * Désactive le mode fallback
   */
  disableFallbackMode(): void {
    this.fallbackMode = false
  }

  /**
   * Obtient la liste de toutes les icônes disponibles
   */
  getAllIcons(): SafeIcon[] {
    return Object.values(SAFE_ICONS)
  }

  /**
   * Recherche des icônes par nom
   */
  searchIcons(query: string): SafeIcon[] {
    const lowerQuery = query.toLowerCase()
    return Object.values(SAFE_ICONS).filter(icon => 
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.fallback.toLowerCase().includes(lowerQuery)
    )
  }
}

// Instance singleton
export const safeIconManager = new SafeIconManager()
// Fonctions utilitaires
export function getSafeIcon(iconName: string): string {
  return safeIconManager.getIcon(iconName)
}

export function getSafeIconWithFallback(iconName: string): string {
  return safeIconManager.getIconWithFallback(iconName)
}

export function hasSafeIcon(iconName: string): boolean {
  return safeIconManager.hasIcon(iconName)
}

// Hook React pour les icônes sécurisées
export function useSafeIcon(iconName: string): string {
  const [icon, setIcon] = React.useState<string>('')
  React.useEffect(() => {
    setIcon(safeIconManager.getIconWithFallback(iconName))
  }, [iconName])
  return icon
}

// Composant React pour les icônes sécurisées
export const SafeIcon: React.FC<{
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fallback?: boolean
}> = ({ name, className = '', size = 'md', fallback = false }) => {
  const iconText = fallback 
    ? safeIconManager.getIcon(name)
    : safeIconManager.getIconWithFallback(name)
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  return (
    <span 
      className={`inline-block ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={SAFE_ICONS[name]?.fallback || name}
    >
      {iconText}
    </span>
  )
}