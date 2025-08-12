"use client";

import { useEffect, useState, ReactNode } from 'apos;react'apos;;
import { useSession } from 'apos;next-auth/react'apos;;

interface ABTestWrapperProps {
  experimentId: string;
  children: ReactNode | ((variant: any) => ReactNode);
  fallback?: ReactNode;
  onVariantLoad?: (variant: any) => void;
  onError?: (error: Error) => void;
}

interface ExperimentVariant {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  weight: number;
}

export default function ABTestWrapper({
  experimentId,
  children,
  fallback = null,
  onVariantLoad,
  onError
}: ABTestWrapperProps) {
  const { data: session } = useSession();
  const [variant, setVariant] = useState<ExperimentVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadVariant = async () => {
      try {
        setLoading(true);
        setError(null);

        // Générer un sessionId si pas d'apos;utilisateur connecté
        const sessionId = session?.user?.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const response = await fetch(`/api/ab-testing?action=variant&experimentId=${experimentId}&sessionId=${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Expérience non trouvée ou inactive - utiliser le fallback
            setVariant(null);
            return;
          }
          throw new Error(`Failed to load variant: ${response.statusText}`);
        }

        const data = await response.json();
        setVariant(data.variant);
        
        if (onVariantLoad) {
          onVariantLoad(data.variant);
        }

      } catch (err) {
        const error = err instanceof Error ? err : new Error('apos;Unknown error'apos;);
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        console.error('apos;AB Test Error:'apos;, error);
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [experimentId, session?.user?.id, onVariantLoad, onError]);

  // Enregistrer une conversion
  const recordConversion = async (goalId: string, value?: number, metadata?: Record<string, any>) => {
    if (!variant) return;

    try {
      await fetch('apos;/api/ab-testing?action=conversion'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          experimentId,
          variantId: variant.id,
          goalId,
          value,
          metadata
        })
      });
    } catch (error) {
      console.error('apos;Failed to record conversion:'apos;, error);
    }
  };

  // Exposer la fonction recordConversion via le contexte
  const contextValue = {
    variant,
    recordConversion,
    experimentId,
    loading,
    error
  };

  if (loading) {
    return <div className="ab-test-loading">Chargement...</div>;
  }

  if (error) {
    return fallback;
  }

  if (!variant) {
    return fallback;
  }

  // Si children est une fonction, l'apos;appeler avec la variante
  if (typeof children === 'apos;function'apos;) {
    return children(variant);
  }

  // Sinon, retourner les children directement
  return <>{children}</>;
}

// Hook pour utiliser l'apos;A/B testing
export function useABTest(experimentId: string) {
  const { data: session } = useSession();
  const [variant, setVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVariant = async () => {
      try {
        const sessionId = session?.user?.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const response = await fetch(`/api/ab-testing?action=variant&experimentId=${experimentId}&sessionId=${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          setVariant(data.variant);
        } else {
          setVariant(null);
        }
      } catch (error) {
        console.error('apos;AB Test Error:'apos;, error);
        setVariant(null);
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [experimentId, session?.user?.id]);

  const recordConversion = async (goalId: string, value?: number, metadata?: Record<string, any>) => {
    if (!variant) return;

    try {
      await fetch('apos;/api/ab-testing?action=conversion'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          experimentId,
          variantId: variant.id,
          goalId,
          value,
          metadata
        })
      });
    } catch (error) {
      console.error('apos;Failed to record conversion:'apos;, error);
    }
  };

  return {
    variant,
    loading,
    recordConversion,
    experimentId
  };
}

// Composant pour tester différents textes de boutons
export function ABTestButton({
  experimentId,
  defaultText,
  onClick,
  className = 'apos;'apos;,
  ...props
}: {
  experimentId: string;
  defaultText: string;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  const { variant, recordConversion } = useABTest(experimentId);

  const handleClick = () => {
    // Enregistrer la conversion
    recordConversion('apos;button_click'apos;, undefined, {
      buttonText: variant?.config?.buttonText || defaultText
    });

    // Appeler le onClick original
    if (onClick) {
      onClick();
    }
  };

  const buttonText = variant?.config?.buttonText || defaultText;

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {buttonText}
    </button>
  );
}

// Composant pour tester différents layouts
export function ABTestLayout({
  experimentId,
  controlLayout,
  variantLayout,
  children
}: {
  experimentId: string;
  controlLayout: ReactNode;
  variantLayout: ReactNode;
  children: ReactNode;
}) {
  const { variant } = useABTest(experimentId);

  if (!variant) {
    return <>{controlLayout}</>;
  }

  if (variant.type === 'apos;control'apos;) {
    return <>{controlLayout}</>;
  } else {
    return <>{variantLayout}</>;
  }
}

// Composant pour tester différents contenus
export function ABTestContent({
  experimentId,
  controlContent,
  variantContent,
  fallback = null
}: {
  experimentId: string;
  controlContent: ReactNode;
  variantContent: ReactNode;
  fallback?: ReactNode;
}) {
  const { variant, loading } = useABTest(experimentId);

  if (loading) {
    return fallback;
  }

  if (!variant) {
    return <>{controlContent}</>;
  }

  if (variant.type === 'apos;control'apos;) {
    return <>{controlContent}</>;
  } else {
    return <>{variantContent}</>;
  }
}
