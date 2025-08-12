// 🔑 Gestion centralisée des clés API - Beriox AI
// Évite la duplication et améliore la sécurité

export const API_KEYS = {
  // OpenAI
  OPENAI: process.env.OPENAI_API_KEY,
  OPENAI_ORG: process.env.OPENAI_ORG_ID,
  
  // Stripe
  STRIPE_SECRET: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK: process.env.STRIPE_WEBHOOK_SECRET,
  
  // SEMrush
  SEMRUSH: process.env.SEMRUSH_API_KEY,
  
  // GitHub
  GITHUB: process.env.GITHUB_TOKEN,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  
  // Google
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_SEARCH_CONSOLE: process.env.GOOGLE_SEARCH_CONSOLE_KEY,
  
  // Microsoft
  MICROSOFT_CLARITY: process.env.MICROSOFT_CLARITY_ID,
  
  // Email
  RESEND: process.env.RESEND_API_KEY,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Redis
  REDIS_URL: process.env.REDIS_URL,
  
  // NextAuth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  
  // Analytics
  GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GA_ID,
  GOOGLE_TAG_MANAGER: process.env.NEXT_PUBLIC_GTM_ID,
  
  // Performance
  PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY,
  
  // Security
  MOZILLA_OBSERVATORY: process.env.MOZILLA_OBSERVATORY_API_KEY,
  
  // Vercel
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
} as const;

// Types pour les clés API
export type ApiKeyName = keyof typeof API_KEYS;
export type ApiKeyValue = string | undefined;

// Interface pour la validation des clés
export interface ApiKeyValidation {
  name: ApiKeyName;
  required: boolean;
  pattern?: RegExp;
  description: string;
}

// Configuration de validation des clés
export const API_KEY_VALIDATION: Record<ApiKeyName, ApiKeyValidation> = {
  OPENAI: {
    name: 'apos;OPENAI'apos;,
    required: true,
    pattern: /^sk-[a-zA-Z0-9]{32,}$/,
    description: 'apos;Clé API OpenAI pour les modèles GPT'apos;
  },
  OPENAI_ORG: {
    name: 'apos;OPENAI_ORG'apos;,
    required: false,
    description: 'apos;ID d\'apos;organisation OpenAI'apos;
  },
  STRIPE_SECRET: {
    name: 'apos;STRIPE_SECRET'apos;,
    required: true,
    pattern: /^sk_(test|live)_[a-zA-Z0-9]{24}$/,
    description: 'apos;Clé secrète Stripe pour les paiements'apos;
  },
  STRIPE_PUBLISHABLE: {
    name: 'apos;STRIPE_PUBLISHABLE'apos;,
    required: true,
    pattern: /^pk_(test|live)_[a-zA-Z0-9]{24}$/,
    description: 'apos;Clé publique Stripe pour le frontend'apos;
  },
  STRIPE_WEBHOOK: {
    name: 'apos;STRIPE_WEBHOOK'apos;,
    required: true,
    pattern: /^whsec_[a-zA-Z0-9]{32,}$/,
    description: 'apos;Secret webhook Stripe'apos;
  },
  SEMRUSH: {
    name: 'apos;SEMRUSH'apos;,
    required: false,
    pattern: /^[a-zA-Z0-9]{32}$/,
    description: 'apos;Clé API SEMrush pour l\'apos;analyse SEO'apos;
  },
  GITHUB: {
    name: 'apos;GITHUB'apos;,
    required: false,
    pattern: /^ghp_[a-zA-Z0-9]{36}$/,
    description: 'apos;Token GitHub pour l\'apos;authentification'apos;
  },
  GITHUB_CLIENT_ID: {
    name: 'apos;GITHUB_CLIENT_ID'apos;,
    required: false,
    description: 'apos;Client ID GitHub OAuth'apos;
  },
  GITHUB_CLIENT_SECRET: {
    name: 'apos;GITHUB_CLIENT_SECRET'apos;,
    required: false,
    description: 'apos;Client Secret GitHub OAuth'apos;
  },
  GOOGLE_CLIENT_ID: {
    name: 'apos;GOOGLE_CLIENT_ID'apos;,
    required: false,
    description: 'apos;Client ID Google OAuth'apos;
  },
  GOOGLE_CLIENT_SECRET: {
    name: 'apos;GOOGLE_CLIENT_SECRET'apos;,
    required: false,
    description: 'apos;Client Secret Google OAuth'apos;
  },
  GOOGLE_SEARCH_CONSOLE: {
    name: 'apos;GOOGLE_SEARCH_CONSOLE'apos;,
    required: false,
    description: 'apos;Clé API Google Search Console'apos;
  },
  MICROSOFT_CLARITY: {
    name: 'apos;MICROSOFT_CLARITY'apos;,
    required: false,
    description: 'apos;ID Microsoft Clarity pour l\'apos;analytics'apos;
  },
  RESEND: {
    name: 'apos;RESEND'apos;,
    required: false,
    pattern: /^re_[a-zA-Z0-9]{32}$/,
    description: 'apos;Clé API Resend pour l\'apos;envoi d\'apos;emails'apos;
  },
  DATABASE_URL: {
    name: 'apos;DATABASE_URL'apos;,
    required: true,
    pattern: /^postgresql:\/\/.+/,
    description: 'apos;URL de connexion à la base de données PostgreSQL'apos;
  },
  REDIS_URL: {
    name: 'apos;REDIS_URL'apos;,
    required: false,
    pattern: /^redis:\/\/.+/,
    description: 'apos;URL de connexion Redis'apos;
  },
  NEXTAUTH_SECRET: {
    name: 'apos;NEXTAUTH_SECRET'apos;,
    required: true,
    description: 'apos;Secret pour NextAuth.js'apos;
  },
  NEXTAUTH_URL: {
    name: 'apos;NEXTAUTH_URL'apos;,
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'apos;URL de base pour NextAuth.js'apos;
  },
  SENTRY_DSN: {
    name: 'apos;SENTRY_DSN'apos;,
    required: false,
    pattern: /^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+\/[0-9]+$/,
    description: 'apos;DSN Sentry pour le monitoring d\'apos;erreurs'apos;
  },
  GOOGLE_ANALYTICS: {
    name: 'apos;GOOGLE_ANALYTICS'apos;,
    required: false,
    pattern: /^G-[A-Z0-9]{10}$/,
    description: 'apos;ID Google Analytics 4'apos;
  },
  GOOGLE_TAG_MANAGER: {
    name: 'apos;GOOGLE_TAG_MANAGER'apos;,
    required: false,
    pattern: /^GTM-[A-Z0-9]{6}$/,
    description: 'apos;ID Google Tag Manager'apos;
  },
  PAGESPEED_API_KEY: {
    name: 'apos;PAGESPEED_API_KEY'apos;,
    required: false,
    description: 'apos;Clé API PageSpeed Insights'apos;
  },
  MOZILLA_OBSERVATORY: {
    name: 'apos;MOZILLA_OBSERVATORY'apos;,
    required: false,
    description: 'apos;Clé API Mozilla Observatory'apos;
  },
  VERCEL_TOKEN: {
    name: 'apos;VERCEL_TOKEN'apos;,
    required: false,
    description: 'apos;Token Vercel pour le déploiement'apos;
  },
  VERCEL_ORG_ID: {
    name: 'apos;VERCEL_ORG_ID'apos;,
    required: false,
    description: 'apos;ID d\'apos;organisation Vercel'apos;
  },
  VERCEL_PROJECT_ID: {
    name: 'apos;VERCEL_PROJECT_ID'apos;,
    required: false,
    description: 'apos;ID de projet Vercel'apos;
  }
};

// Fonction pour obtenir une clé API
export function getApiKey(name: ApiKeyName): string | undefined {
  return API_KEYS[name];
}

// Fonction pour vérifier si une clé est définie
export function hasApiKey(name: ApiKeyName): boolean {
  return !!API_KEYS[name];
}

// Fonction pour valider une clé API
export function validateApiKey(name: ApiKeyName): { isValid: boolean; error?: string } {
  const key = API_KEYS[name];
  const validation = API_KEY_VALIDATION[name];
  
  if (validation.required && !key) {
    return {
      isValid: false,
      error: `Clé API requise manquante: ${name}`
    };
  }
  
  if (key && validation.pattern && !validation.pattern.test(key)) {
    return {
      isValid: false,
      error: `Format de clé API invalide pour ${name}`
    };
  }
  
  return { isValid: true };
}

// Fonction pour valider toutes les clés API
export function validateAllApiKeys(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  Object.keys(API_KEYS).forEach((key) => {
    const validation = validateApiKey(key as ApiKeyName);
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Fonction pour obtenir les clés manquantes
export function getMissingApiKeys(): ApiKeyName[] {
  return Object.keys(API_KEYS).filter((key) => {
    const validation = API_KEY_VALIDATION[key as ApiKeyName];
    return validation.required && !API_KEYS[key as ApiKeyName];
  }) as ApiKeyName[];
}

// Fonction pour masquer une clé API (pour les logs)
export function maskApiKey(key: string | undefined): string {
  if (!key) return 'apos;undefined'apos;;
  if (key.length <= 8) return 'apos;*'apos;.repeat(key.length);
  return key.substring(0, 4) + 'apos;*'apos;.repeat(key.length - 8) + key.substring(key.length - 4);
}

// Fonction pour obtenir un objet avec les clés masquées (pour les logs)
export function getMaskedApiKeys(): Record<string, string> {
  const masked: Record<string, string> = {};
  
  Object.keys(API_KEYS).forEach((key) => {
    masked[key] = maskApiKey(API_KEYS[key as ApiKeyName]);
  });
  
  return masked;
}

// Export par défaut pour faciliter l'apos;import
export default API_KEYS;
