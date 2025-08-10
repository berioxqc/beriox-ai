"use client";
import { signIn, getSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get("callbackUrl") || "/missions";
  const authError = searchParams?.get("error");

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          console.log("SignIn: Utilisateur déjà connecté, redirection vers:", callbackUrl);
          router.push(callbackUrl);
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [callbackUrl, router]);

  useEffect(() => {
    // Gérer les erreurs d'authentification
    if (authError) {
      switch (authError) {
        case "OAuthSignin":
          setError("Erreur lors de l'initialisation de l'authentification Google");
          break;
        case "OAuthCallback":
          setError("Erreur lors de la réception de la réponse Google");
          break;
        case "OAuthCreateAccount":
          setError("Impossible de créer votre compte");
          break;
        case "EmailCreateAccount":
          setError("Impossible de créer le compte avec cet email");
          break;
        case "Callback":
          setError("Erreur lors de la connexion");
          break;
        case "OAuthAccountNotLinked":
          setError("Ce compte est déjà associé à un autre fournisseur");
          break;
        case "EmailSignin":
          setError("Impossible d'envoyer l'email de connexion");
          break;
        case "CredentialsSignin":
          setError("Identifiants incorrects");
          break;
        case "SessionRequired":
          setError("Vous devez être connecté pour accéder à cette page");
          break;
        default:
          setError("Une erreur inattendue s'est produite");
      }
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Erreur lors de la connexion avec Google");
        console.error("Erreur de connexion Google:", result.error);
      } else if (result?.url) {
        console.log("Connexion Google réussie, redirection vers:", result.url);
        router.push(result.url);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  // Affichage de chargement pendant la vérification de session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à Beriox AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accédez à votre dashboard d'intelligence artificielle
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Se connecter avec Google
              </div>
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez nos{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
