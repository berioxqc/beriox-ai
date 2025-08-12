import { useState, useEffect } from 'apos;react'apos;;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('apos;resize'apos;, listener);
    return () => window.removeEventListener('apos;resize'apos;, listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('apos;(max-width: 767px)'apos;);
}

export function useIsTablet(): boolean {
  return useMediaQuery('apos;(min-width: 768px) and (max-width: 1023px)'apos;);
}

export function useIsDesktop(): boolean {
  return useMediaQuery('apos;(min-width: 1024px)'apos;);
}
