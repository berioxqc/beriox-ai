"use client"
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { getIconDynamic, preloadCommonIcons } from '@/lib/icons-dynamic'
interface IconOptimizedProps {
  name: string
  className?: string
  style?: React.CSSProperties
  spin?: boolean
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x'
  fallback?: React.ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
}

export const IconOptimized: React.FC<IconOptimizedProps> = ({ 
  name, 
  className = '', 
  style = {}, 
  spin = false,
  size = '1x',
  fallback = '⚠️',
  onLoad,
  onError
}) => {
  const [icon, setIcon] = useState<IconDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    let isMounted = true
    const loadIcon = async () => {
      try {
        setLoading(true)
        setError(null)
        const loadedIcon = await getIconDynamic(name)
        if (isMounted) {
          if (loadedIcon) {
            setIcon(loadedIcon)
            onLoad?.()
          } else {
            const error = new Error(`Icon "${name}" not found`)
            setError(error)
            onError?.(error)
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to load icon')
          setError(error)
          onError?.(error)
          setLoading(false)
        }
      }
    }
    loadIcon()
    return () => {
      isMounted = false
    }
  }, [name, onLoad, onError])
  // Préchargement des icônes communes au montage du composant
  useEffect(() => {
    preloadCommonIcons().catch(console.warn)
  }, [])
  // Affichage du fallback pendant le chargement ou en cas d'erreur
  if (loading || error || !icon) {
    return (
      <span 
        className={className} 
        style={{ 
          ...style, 
          display: 'inline-block',
          width: size === '1x' ? '1em' : size,
          height: size === '1x' ? '1em' : size,
          textAlign: 'center'
        }}
      >
        {fallback}
      </span>
    )
  }

  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      style={style}
      spin={spin}
      size={size}
    />
  )
}
// Hook personnalisé pour utiliser les icônes optimisées
export function useIconOptimized(name: string) {
  const [icon, setIcon] = useState<IconDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    let isMounted = true
    const loadIcon = async () => {
      try {
        setLoading(true)
        setError(null)
        const loadedIcon = await getIconDynamic(name)
        if (isMounted) {
          if (loadedIcon) {
            setIcon(loadedIcon)
          } else {
            setError(new Error(`Icon "${name}" not found`))
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load icon'))
          setLoading(false)
        }
      }
    }
    loadIcon()
    return () => {
      isMounted = false
    }
  }, [name])
  return { icon, loading, error }
}

// Composant pour précharger les icônes
export const IconPreloader: React.FC<{ icons: string[] }> = ({ icons }) => {
  useEffect(() => {
    const preloadIcons = async () => {
      const loadPromises = icons.map(async (iconName) => {
        try {
          await getIconDynamic(iconName)
        } catch (error) {
          console.warn(`Failed to preload icon "${iconName}":`, error)
        }
      })
      await Promise.allSettled(loadPromises)
    }
    preloadIcons()
  }, [icons])
  return null; // Composant invisible
}
// Composant pour afficher les statistiques du cache
export const IconCacheStats: React.FC = () => {
  const [stats, setStats] = useState<{ size: number; keys: string[] } | null>(null)
  useEffect(() => {
    // Importer dynamiquement pour éviter le chargement côté serveur
    import('@/lib/icons-dynamic').then(({ getIconCacheStats }) => {
      setStats(getIconCacheStats())
    })
  }, [])
  if (!stats) return null
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: '#f0f0f0', 
      padding: '8px', 
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <div>Cache: {stats.size} icônes</div>
      <div>Dernières: {stats.keys.slice(-3).join(', ')}</div>
    </div>
  )
}
export default IconOptimized