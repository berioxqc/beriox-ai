"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>("Une erreur inattendue s'est produite");
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    const errorType = searchParams?.get("error");
    
    switch (errorType) {
      case "Configuration":
        setError("Erreur de configuration");
        setDetails("Il y a un problème avec la configuration du serveur. Veuillez contacter l'administrateur.");
        break;
      case "AccessDenied":
        setError("Accès refusé");
        setDetails("Vous n'avez pas l'autorisation d'accéder à cette application.");
        break;
      case "Verification":
        setError("Erreur de vérification");
        setDetails("Le token de vérification a expiré ou est invalide.");
        break;
      case "OAuthSignin":
        setError("Erreur d'authentification");
        setDetails("Impossible d'initialiser l'authentification avec Google.");
        break;
      case "OAuthCallback":
        setError("Erreur de callback");
        setDetails("Erreur lors de la réception de la réponse de Google.");
        break;
      case "OAuthCreateAccount":
        setError("Création de compte impossible");
        setDetails("Impossible de créer votre compte. Vérifiez que votre email Google est valide.");
        break;
      case "EmailCreateAccount":
        setError("Email invalide");
        setDetails("Impossible de créer le compte avec cet email.");
        break;
      case "Callback":
        setError("Erreur de connexion");
        setDetails("Une erreur s'est produite lors de la finalisation de votre connexion.");
        break;
      case "OAuthAccountNotLinked":
        setError("Compte déjà existant");
        setDetails("Un compte existe déjà avec cet email mais avec un autre fournisseur d'authentification.");
        break;
      case "EmailSignin":
        setError("Envoi d'email impossible");
        setDetails("Impossible d'envoyer l'email de connexion.");
        break;
      case "CredentialsSignin":
        setError("Identifiants incorrects");
        setDetails("Les identifiants fournis ne sont pas valides.");
        break;
      case "SessionRequired":
        setError("Session requise");
        setDetails("Vous devez être connecté pour accéder à cette page.");
        break;
      default:
        setError("Erreur inconnue");
        setDetails("Une erreur inattendue s'est produite lors de l'authentification.");
    }
  }, [searchParams]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f9fc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "48px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e3e8ee",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center"
      }}>
        {/* Icône d'erreur */}
        <div style={{
          fontSize: "64px",
          marginBottom: "24px"
        }}>
          ⚠️
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#dc2626",
          margin: "0 0 16px 0"
        }}>
          {error}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: "16px",
          color: "#6b7280",
          margin: "0 0 32px 0",
          lineHeight: "1.5"
        }}>
          {details}
        </p>

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center"
        }}>
          <button
            onClick={() => router.push("/auth/signin")}
            style={{
              padding: "12px 24px",
              background: "#635bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#5b52ff"}
            onMouseOut={(e) => e.currentTarget.style.background = "#635bff"}
          >
            Réessayer la connexion
          </button>
          
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            Retour à l'accueil
          </button>
        </div>

        {/* Aide */}
        <div style={{
          marginTop: "32px",
          padding: "16px",
          background: "#f3f4f6",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#4b5563"
        }}>
          <strong>Besoin d'aide ?</strong><br />
          Si le problème persiste, veuillez contacter le support technique avec le code d'erreur affiché ci-dessus.
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9fc"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e3e8ee",
          borderTop: "4px solid #635bff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
