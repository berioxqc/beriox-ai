"use client";
import { useSession } from "next-auth/react";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import TrialBanner from "./TrialBanner";
import TrialModal from "./TrialModal";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { showTrialModal, closeTrialModal } = useFreeTrial();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Pages publiques qui ne nécessitent pas d'apos;authentification
  const publicPages = ['apos;/auth/signin'apos;, 'apos;/auth/error'apos;, 'apos;/consent'apos;, 'apos;/privacy'apos;, 'apos;/cookies'apos;];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));

  // Timeout après 3 secondes de loading (augmenté pour éviter les problèmes)
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        console.log("AuthGuard: Timeout atteint, forçage du rendu");
        setLoadingTimeout(true);
      }, 3000); // Augmenté à 3 secondes
      
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [status]);

  // Gestion de l'apos;authentification
  useEffect(() => {
    if (status === "loading" || isRedirecting) return;

    // Si c'apos;est une page publique, permettre l'apos;accès
    if (isPublicPage) {
      return;
    }

    // Si l'apos;utilisateur n'apos;est pas authentifié, rediriger immédiatement
    if (status === "unauthenticated") {
      console.log("AuthGuard: Utilisateur non authentifié, redirection vers signin");
      setIsRedirecting(true);
      router.push("/auth/signin");
      return;
    }

    // Si l'apos;utilisateur est authentifié, vérifier l'apos;onboarding
    if (status === "authenticated" && session?.user && !checkingOnboarding) {
      // Éviter l'apos;onboarding sur certaines pages
      const skipOnboardingPages = ['apos;/onboarding'apos;, 'apos;/consent'apos;, 'apos;/privacy'apos;, 'apos;/auth'apos;];
      const shouldSkip = skipOnboardingPages.some(page => pathname.startsWith(page));
      
      if (!shouldSkip) {
        checkOnboardingStatus();
      }
    }
  }, [status, session, pathname, checkingOnboarding, isRedirecting, router, isPublicPage]);

  const checkOnboardingStatus = async () => {
    setCheckingOnboarding(true);
    
    try {
      // Vérifier d'apos;abord le localStorage pour éviter des appels API inutiles
      const onboardingCompleted = localStorage.getItem('apos;beriox_onboarding_completed'apos;);
      
      if (!onboardingCompleted) {
        // Vérifier si c'apos;est un nouvel utilisateur
        const response = await fetch('apos;/api/user/onboarding'apos;);
        
        if (response.ok) {
          const data = await response.json();
          
          // Si c'apos;est un nouvel utilisateur ou qu'apos;il n'apos;a pas complété l'apos;onboarding
          if (data.isNewUser || !data.hasCompletedOnboarding) {
            router.push('apos;/onboarding'apos;);
            return;
          } else {
            // Marquer l'apos;onboarding comme complété
            localStorage.setItem('apos;beriox_onboarding_completed'apos;, 'apos;true'apos;);
          }
        }
      }
    } catch (error) {
      console.error('apos;Erreur lors de la vérification de l\'apos;onboarding:'apos;, error);
      // En cas d'apos;erreur, continuer normalement
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Affichage de debug (uniquement en dev)
  useEffect(() => {
    if (process.env.NODE_ENV === 'apos;development'apos;) {
      console.log("AuthGuard status:", status, "session:", !!session, "timeout:", loadingTimeout, "pathname:", pathname, "isPublicPage:", isPublicPage);
    }
  }, [status, session, loadingTimeout, pathname, isPublicPage]);

  // Pages publiques - pas besoin d'apos;authentification
  if (isPublicPage) {
    return <>{children}</>;
  }

  // État de chargement
  if (status === "loading" && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'apos;authentification...</p>
        </div>
      </div>
    );
  }

  // Utilisateur non authentifié - afficher la page de connexion
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection vers la page de connexion...</p>
          <p className="mt-2 text-sm text-gray-500">Vous devez être connecté pour accéder à cette page</p>
        </div>
      </div>
    );
  }

  // Utilisateur authentifié - afficher le contenu
  return (
    <>
      {children}
      <TrialBanner />
      {showTrialModal && <TrialModal onClose={closeTrialModal} />}
    </>
  );
}
