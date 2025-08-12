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
    name: 'OPENAI',
    required: true,
    pattern: /^sk-[a-zA-Z0-9]{32,}$/,
    description: 'Clé API OpenAI pour les modèles GPT'
  },
  OPENAI_ORG: {
    name: 'OPENAI_ORG',
    required: false,
    description: 'ID d\'organisation OpenAI'
  },
  STRIPE_SECRET: {
    name: 'STRIPE_SECRET',
    required: true,
    pattern: /^sk_(test|live)_[a-zA-Z0-9]{24}$/,
    description: 'Clé secrète Stripe pour les paiements'
  },
  STRIPE_PUBLISHABLE: {
    name: 'STRIPE_PUBLISHABLE',
    required: true,
    pattern: /^pk_(test|live)_[a-zA-Z0-9]{24}$/,
    description: 'Clé publique Stripe pour le frontend'
  },
  STRIPE_WEBHOOK: {
    name: 'STRIPE_WEBHOOK',
    required: true,
    pattern: /^whsec_[a-zA-Z0-9]{32,}$/,
    description: 'Secret webhook Stripe'
  },
  SEMRUSH: {
    name: 'SEMRUSH',
    required: false,
    pattern: /^[a-zA-Z0-9]{32}$/,
    description: 'Clé API SEMrush pour l\'analyse SEO'
  },
  GITHUB: {
    name: 'GITHUB',
    required: false,
    pattern: /^ghp_[a-zA-Z0-9]{36}$/,
    description: 'Token GitHub pour l\'authentification'
  },
  GITHUB_CLIENT_ID: {
    name: 'GITHUB_CLIENT_ID',
    required: false,
    description: 'Client ID GitHub OAuth'
  },
  GITHUB_CLIENT_SECRET: {
    name: 'GITHUB_CLIENT_SECRET',
    required: false,
    description: 'Client Secret GitHub OAuth'
  },
  GOOGLE_CLIENT_ID: {
    name: 'GOOGLE_CLIENT_ID',
    required: false,
    description: 'Client ID Google OAuth'
  },
  GOOGLE_CLIENT_SECRET: {
    name: 'GOOGLE_CLIENT_SECRET',
    required: false,
    description: 'Client Secret Google OAuth'
  },
  GOOGLE_SEARCH_CONSOLE: {
    name: 'GOOGLE_SEARCH_CONSOLE',
    required: false,
    description: 'Clé API Google Search Console'
  },
  MICROSOFT_CLARITY: {
    name: 'MICROSOFT_CLARITY',
    required: false,
    description: 'ID Microsoft Clarity pour l\'analytics'
  },
  RESEND: {
    name: 'RESEND',
    required: false,
    pattern: /^re_[a-zA-Z0-9]{32}$/,
    description: 'Clé API Resend pour l\'envoi d\'emails'
  },
  DATABASE_URL: {
    name: 'DATABASE_URL',
    required: true,
    pattern: /^postgresql:\/\/.+/,
    description: 'URL de connexion à la base de données PostgreSQL'
  },
  REDIS_URL: {
    name: 'REDIS_URL',
    required: false,
    pattern: /^redis:\/\/.+/,
    description: 'URL de connexion Redis'
  },
  NEXTAUTH_SECRET: {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'Secret pour NextAuth.js'
  },
  NEXTAUTH_URL: {
    name: 'NEXTAUTH_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'URL de base pour NextAuth.js'
  },
  SENTRY_DSN: {
    name: 'SENTRY_DSN',
    required: false,
    pattern: /^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+\/[0-9]+$/,
    description: 'DSN Sentry pour le monitoring d\'erreurs'
  },
  GOOGLE_ANALYTICS: {
    name: 'GOOGLE_ANALYTICS',
    required: false,
    pattern: /^G-[A-Z0-9]{10}$/,
    description: 'ID Google Analytics 4'
  },
  GOOGLE_TAG_MANAGER: {
    name: 'GOOGLE_TAG_MANAGER',
    required: false,
    pattern: /^GTM-[A-Z0-9]{6}$/,
    description: 'ID Google Tag Manager'
  },
  PAGESPEED_API_KEY: {
    name: 'PAGESPEED_API_KEY',
    required: false,
    description: 'Clé API PageSpeed Insights'
  },
  MOZILLA_OBSERVATORY: {
    name: 'MOZILLA_OBSERVATORY',
    required: false,
    description: 'Clé API Mozilla Observatory'
  },
  VERCEL_TOKEN: {
    name: 'VERCEL_TOKEN',
    required: false,
    description: 'Token Vercel pour le déploiement'
  },
  VERCEL_ORG_ID: {
    name: 'VERCEL_ORG_ID',
    required: false,
    description: 'ID d\'organisation Vercel'
  },
  VERCEL_PROJECT_ID: {
    name: 'VERCEL_PROJECT_ID',
    required: false,
    description: 'ID de projet Vercel'
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
  if (!key) return 'undefined';
  if (key.length <= 8) return '*'.repeat(key.length);
  return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
}

// Fonction pour obtenir un objet avec les clés masquées (pour les logs)
export function getMaskedApiKeys(): Record<string, string> {
  const masked: Record<string, string> = {};
  
  Object.keys(API_KEYS).forEach((key) => {
    masked[key] = maskApiKey(API_KEYS[key as ApiKeyName]);
  });
  
  return masked;
}

// Export par défaut pour faciliter l'import
export default API_KEYS;
