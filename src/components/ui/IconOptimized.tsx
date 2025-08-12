"use client";
import React, { useState, useEffect } from 'apos;react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { IconDefinition } from 'apos;@fortawesome/fontawesome-svg-core'apos;;
import { getIconDynamic, preloadCommonIcons } from 'apos;@/lib/icons-dynamic'apos;;

interface IconOptimizedProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  spin?: boolean;
  size?: 'apos;xs'apos; | 'apos;sm'apos; | 'apos;lg'apos; | 'apos;1x'apos; | 'apos;2x'apos; | 'apos;3x'apos; | 'apos;4x'apos; | 'apos;5x'apos; | 'apos;6x'apos; | 'apos;7x'apos; | 'apos;8x'apos; | 'apos;9x'apos; | 'apos;10x'apos;;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const IconOptimized: React.FC<IconOptimizedProps> = ({ 
  name, 
  className = 'apos;'apos;, 
  style = {}, 
  spin = false,
  size = 'apos;1x'apos;,
  fallback = 'apos;⚠️'apos;,
  onLoad,
  onError
}) => {
  const [icon, setIcon] = useState<IconDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadIcon = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedIcon = await getIconDynamic(name);
        
        if (isMounted) {
          if (loadedIcon) {
            setIcon(loadedIcon);
            onLoad?.();
          } else {
            const error = new Error(`Icon "${name}" not found`);
            setError(error);
            onError?.(error);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('apos;Failed to load icon'apos;);
          setError(error);
          onError?.(error);
          setLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      isMounted = false;
    };
  }, [name, onLoad, onError]);

  // Préchargement des icônes communes au montage du composant
  useEffect(() => {
    preloadCommonIcons().catch(console.warn);
  }, []);

  // Affichage du fallback pendant le chargement ou en cas d'apos;erreur
  if (loading || error || !icon) {
    return (
      <span 
        className={className} 
        style={{ 
          ...style, 
          display: 'apos;inline-block'apos;,
          width: size === 'apos;1x'apos; ? 'apos;1em'apos; : size,
          height: size === 'apos;1x'apos; ? 'apos;1em'apos; : size,
          textAlign: 'apos;center'apos;
        }}
      >
        {fallback}
      </span>
    );
  }

  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      style={style}
      spin={spin}
      size={size}
    />
  );
};

// Hook personnalisé pour utiliser les icônes optimisées
export function useIconOptimized(name: string) {
  const [icon, setIcon] = useState<IconDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadIcon = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedIcon = await getIconDynamic(name);
        
        if (isMounted) {
          if (loadedIcon) {
            setIcon(loadedIcon);
          } else {
            setError(new Error(`Icon "${name}" not found`));
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('apos;Failed to load icon'apos;));
          setLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      isMounted = false;
    };
  }, [name]);

  return { icon, loading, error };
}

// Composant pour précharger les icônes
export const IconPreloader: React.FC<{ icons: string[] }> = ({ icons }) => {
  useEffect(() => {
    const preloadIcons = async () => {
      const loadPromises = icons.map(async (iconName) => {
        try {
          await getIconDynamic(iconName);
        } catch (error) {
          console.warn(`Failed to preload icon "${iconName}":`, error);
        }
      });
      
      await Promise.allSettled(loadPromises);
    };

    preloadIcons();
  }, [icons]);

  return null; // Composant invisible
};

// Composant pour afficher les statistiques du cache
export const IconCacheStats: React.FC = () => {
  const [stats, setStats] = useState<{ size: number; keys: string[] } | null>(null);

  useEffect(() => {
    // Importer dynamiquement pour éviter le chargement côté serveur
    import('apos;@/lib/icons-dynamic'apos;).then(({ getIconCacheStats }) => {
      setStats(getIconCacheStats());
    });
  }, []);

  if (!stats) return null;

  return (
    <div style={{ 
      position: 'apos;fixed'apos;, 
      bottom: 10, 
      right: 10, 
      background: 'apos;#f0f0f0'apos;, 
      padding: 'apos;8px'apos;, 
      borderRadius: 'apos;4px'apos;,
      fontSize: 'apos;12px'apos;,
      zIndex: 1000
    }}>
      <div>Cache: {stats.size} icônes</div>
      <div>Dernières: {stats.keys.slice(-3).join('apos;, 'apos;)}</div>
    </div>
  );
};

export default IconOptimized;
